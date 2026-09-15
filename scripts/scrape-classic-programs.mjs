#!/usr/bin/env node
/**
 * One-time / idempotent scrape of https://fptn.com/classic-programs
 * Public HTML only. Upserts into classic_programs via service role.
 *
 * Usage: node scripts/scrape-classic-programs.mjs
 */
import { createClient } from "@supabase/supabase-js";
import { readFileSync, writeFileSync, existsSync, mkdirSync } from "node:fs";
import { resolve, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = resolve(__dirname, "..");
const SOURCE = "https://fptn.com/classic-programs";

function loadEnvFile(path) {
  if (!path || !existsSync(path)) return;
  for (const line of readFileSync(path, "utf8").split("\n")) {
    const m = line.match(/^\s*([A-Za-z_][A-Za-z0-9_]*)\s*=\s*(.*)\s*$/);
    if (!m) continue;
    let val = m[2];
    if (
      (val.startsWith('"') && val.endsWith('"')) ||
      (val.startsWith("'") && val.endsWith("'"))
    ) {
      val = val.slice(1, -1);
    }
    if (!process.env[m[1]]) process.env[m[1]] = val;
  }
}

loadEnvFile(process.env.SUPABASE_ENV_FILE);
loadEnvFile(resolve(ROOT, ".env.local"));
loadEnvFile(
  "/cursor/stores/bc-4a455162-0030-4de5-96cf-ad19ed4659ba/internal/supabase.env",
);

function slugify(input) {
  return input
    .toLowerCase()
    .trim()
    .normalize("NFKD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "")
    .slice(0, 120);
}

function titleFromAlt(alt) {
  if (!alt) return null;
  // "… for The Mickey Rooney Show, Hey Mulligan."
  let m = alt.match(/\bfor\s+(.+?)\.?$/i);
  if (m) {
    let t = m[1]
      .replace(/\s+with\s+.+$/i, "")
      .replace(/\s+starring\s+.+$/i, "")
      .replace(/^the cast of\s+/i, "")
      .trim();
    // "The Mickey Rooney Show, Hey Mulligan" → keep both
    return t;
  }
  m = alt.match(/\bof\s+(.+?)\.?$/i);
  if (m) return m[1].replace(/^the cast of\s+/i, "").trim();
  return null;
}

/** Manual IDs for empty-alt posters identified visually from scraped images */
const FALLBACK_TITLES = {
  5: "I Married Joan",
  6: "Petticoat Junction",
  7: "My Little Margie",
  8: "Dragnet",
};

/** Schedule captions in gallery order from the public page */
const SCHEDULES = [
  "Monday through Friday at 2:30PM (ET)",
  "Monday through Friday at 1:00PM (ET)",
  "Monday through Friday at 3:00PM (ET)",
  "Monday through Friday at 5:00PM (ET)",
  "Monday through Friday at 1:30PM (ET)",
  "Monday through Friday at 2:00PM (ET)",
  "Monday through Friday at 4:00PM (ET)",
  "Monday through Friday at 3:30PM (ET)",
  "Monday through Friday at 10:30PM (ET)",
];

async function fetchCards() {
  const res = await fetch(SOURCE, {
    headers: {
      "User-Agent": "FPN-SeedBot/1.0 (+classic-programs seed; public HTML)",
      Accept: "text/html",
    },
  });
  if (!res.ok) throw new Error(`Fetch failed: ${res.status}`);
  const html = await res.text();

  // Prefer Playwright-enriched JSON if present from a prior scrape
  const enrichedPath = "/tmp/classic-programs-scraped.json";
  let playwrightCards = null;
  if (existsSync(enrichedPath)) {
    try {
      playwrightCards = JSON.parse(readFileSync(enrichedPath, "utf8")).cards;
    } catch {
      /* ignore */
    }
  }

  if (playwrightCards?.length) {
    return playwrightCards.map((c, i) => {
      const title =
        titleFromAlt(c.alt) ||
        FALLBACK_TITLES[c.idx] ||
        FALLBACK_TITLES[i] ||
        `Classic Program ${i + 1}`;
      return {
        title,
        featured_image_url: c.img?.startsWith("//")
          ? `https:${c.img}`
          : c.img,
        schedule_note: SCHEDULES[i] || c.schedule || null,
        sort_order: (i + 1) * 10,
        alt: c.alt || "",
      };
    });
  }

  // HTML fallback: gallery imgs with alts
  const imgRe =
    /<img\b[^>]*src=["']([^"']*isteam\/ip\/[^"']+)["'][^>]*(?:alt=["']([^"']*)["'])?/gi;
  const cards = [];
  let m;
  while ((m = imgRe.exec(html))) {
    const src = m[1];
    if (/favicon|FP_NET_LOGO/i.test(src)) continue;
    const alt = m[2] || "";
    cards.push({ src, alt });
  }
  // dedupe by base path
  const seen = new Set();
  const uniq = [];
  for (const c of cards) {
    const key = c.src.split("/:/")[0];
    if (seen.has(key)) continue;
    seen.add(key);
    uniq.push(c);
  }
  return uniq.map((c, i) => {
    const title =
      titleFromAlt(c.alt) ||
      FALLBACK_TITLES[i] ||
      `Classic Program ${i + 1}`;
    const img = c.src.startsWith("//") ? `https:${c.src}` : c.src;
    return {
      title,
      featured_image_url: img.startsWith("http") ? img : `https:${img}`,
      schedule_note: SCHEDULES[i] || null,
      sort_order: (i + 1) * 10,
      alt: c.alt,
    };
  });
}

async function main() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !key) throw new Error("Missing Supabase env");

  const cards = await fetchCards();
  if (!cards.length) throw new Error("No classic programs scraped");

  const rows = cards.map((c) => {
    const slug = slugify(c.title);
    const excerpt = c.schedule_note
      ? `${c.title} airs ${c.schedule_note.replace(/^Monday through Friday at /i, "").replace(/\s*\(ET\)\s*$/i, " ET")}.`
      : `Classic program on FlashPoint Television Network: ${c.title}.`;
    return {
      title: c.title,
      slug,
      excerpt,
      description: c.alt || excerpt,
      body: null,
      featured_image_url: c.featured_image_url,
      external_url: null,
      schedule_note: c.schedule_note,
      sort_order: c.sort_order,
      status: "published",
      source_url: null,
    };
  });

  const outDir = resolve(
    "/cursor/stores/bc-4a455162-0030-4de5-96cf-ad19ed4659ba/internal",
  );
  mkdirSync(outDir, { recursive: true });
  const snapshot = resolve(ROOT, "scripts/data/classic-programs-seed.json");
  mkdirSync(dirname(snapshot), { recursive: true });
  writeFileSync(snapshot, JSON.stringify(rows, null, 2));
  console.log(`Wrote ${rows.length} rows → ${snapshot}`);

  const admin = createClient(url, key, {
    auth: { autoRefreshToken: false, persistSession: false },
  });

  for (const row of rows) {
    const { error } = await admin.from("classic_programs").upsert(row, {
      onConflict: "slug",
    });
    if (error) throw error;
    console.log(`Upserted: ${row.title}`);
  }

  await admin.from("site_settings").upsert({
    key: "classic_programs_sort",
    value: "manual",
  });

  console.log("Done.");
}

main().catch((err) => {
  console.error(err?.message || err);
  process.exit(1);
});
