#!/usr/bin/env node
/**
 * One-time / idempotent scrape of https://fptn.com/ministry-programs
 * Public HTML / rendered DOM only. Upserts into ministry_programs via service role.
 *
 * Usage: node scripts/scrape-ministry-programs.mjs
 */
import { createClient } from "@supabase/supabase-js";
import { readFileSync, writeFileSync, existsSync, mkdirSync } from "node:fs";
import { resolve, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = resolve(__dirname, "..");
const SOURCE = "https://fptn.com/ministry-programs";

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

function decodeHtml(s) {
  return String(s || "")
    .replace(/&#39;/g, "'")
    .replace(/&amp;/g, "&")
    .replace(/&quot;/g, '"')
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">");
}

function parseCaption(text) {
  const raw = decodeHtml(text).replace(/\u00a0/g, " ").trim();
  const lines = raw
    .split(/\n+/)
    .map((l) => l.trim())
    .filter(Boolean);

  let title = lines[0] || "Ministry Program";
  let schedule = lines.slice(1).join(" ").trim() || null;

  // Single-line captions: "Title with Host every/on Day…"
  if (!schedule && lines.length === 1) {
    const m = title.match(
      /^(.+?)(?:,|\.)?\s+(?:every\s+)?((?:Monday|Tuesday|Wednesday|Thursday|Friday|Saturday|Sunday).+)$/i,
    );
    if (m) {
      title = m[1].replace(/\s+with\s+.+$/i, (w) => w).trim();
      // Prefer keeping host in title when present; split schedule only
      const m2 = lines[0].match(
        /^(.+?)\s+((?:every\s+)?(?:Monday|Tuesday|Wednesday|Thursday|Friday|Saturday|Sunday).+)$/i,
      );
      if (m2) {
        title = m2[1].replace(/,\s*$/, "").trim();
        schedule = m2[2].replace(/\.$/, "").trim();
      }
    }
    // "FlashPoint Television brings you \"Ministry Specials\" starting at…"
    const special = lines[0].match(/"([^"]+)"\s+starting at\s+(.+)$/i);
    if (special) {
      title = special[1];
      schedule = `Starting at ${special[2]}`.replace(/\.$/, "");
    }
  }

  // Clean trailing punctuation on title
  title = title.replace(/[.,]\s*$/, "").trim();
  if (schedule) schedule = schedule.replace(/\.$/, "").trim();

  return { title, schedule_note: schedule, description: raw };
}

async function fetchCards() {
  const enrichedPath = "/tmp/ministry-programs-scraped.json";
  if (existsSync(enrichedPath)) {
    try {
      const parsed = JSON.parse(readFileSync(enrichedPath, "utf8"));
      if (parsed.cards?.length) {
        return parsed.cards.map((c, i) => {
          const { title, schedule_note, description } = parseCaption(c.text || c.alt);
          const img = c.src?.startsWith("//") ? `https:${c.src}` : c.src;
          return {
            title,
            featured_image_url: img,
            schedule_note,
            description: decodeHtml(c.alt) || description,
            sort_order: (i + 1) * 10,
          };
        });
      }
    } catch {
      /* fall through */
    }
  }

  const res = await fetch(SOURCE, {
    headers: {
      "User-Agent": "FPN-SeedBot/1.0 (+ministry-programs seed; public HTML)",
      Accept: "text/html",
    },
  });
  if (!res.ok) throw new Error(`Fetch failed: ${res.status}`);
  const html = await res.text();
  const imgRe =
    /<img\b[^>]*src=["']([^"']*isteam\/ip\/[^"']+)["'][^>]*(?:alt=["']([^"']*)["'])?/gi;
  const cards = [];
  let m;
  while ((m = imgRe.exec(html))) {
    const src = m[1];
    if (/favicon|FP_NET_LOGO|transparent_placeholder/i.test(src)) continue;
    cards.push({ src, alt: m[2] || "" });
  }
  const seen = new Set();
  const uniq = [];
  for (const c of cards) {
    const key = c.src.split("/:/")[0];
    if (seen.has(key)) continue;
    seen.add(key);
    uniq.push(c);
  }
  return uniq.map((c, i) => {
    const img = c.src.startsWith("//") ? `https:${c.src}` : c.src;
    const fromAlt = decodeHtml(c.alt);
    const title =
      fromAlt.match(/promoting\s+['"](.+?)['"]/i)?.[1] ||
      fromAlt.match(/hosted by\s+(.+?)\.?$/i)?.[1] ||
      `Ministry Program ${i + 1}`;
    return {
      title,
      featured_image_url: img.startsWith("http") ? img : `https:${img}`,
      schedule_note: null,
      description: fromAlt || null,
      sort_order: (i + 1) * 10,
    };
  });
}

async function main() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !key) throw new Error("Missing Supabase env");

  const cards = await fetchCards();
  if (!cards.length) throw new Error("No ministry programs scraped");

  const rows = cards.map((c) => {
    const slug = slugify(c.title) || `ministry-${c.sort_order}`;
    const excerpt = c.schedule_note
      ? `${c.title} — ${c.schedule_note}.`
      : `Ministry program on FlashPoint Television Network: ${c.title}.`;
    return {
      title: c.title,
      slug,
      excerpt,
      description: c.description || excerpt,
      body: null,
      featured_image_url: c.featured_image_url,
      external_url: null,
      schedule_note: c.schedule_note,
      sort_order: c.sort_order,
      status: "published",
      source_url: null,
    };
  });

  const snapshot = resolve(ROOT, "scripts/data/ministry-programs-seed.json");
  mkdirSync(dirname(snapshot), { recursive: true });
  writeFileSync(snapshot, JSON.stringify(rows, null, 2));
  console.log(`Wrote ${rows.length} rows → ${snapshot}`);

  const admin = createClient(url, key, {
    auth: { autoRefreshToken: false, persistSession: false },
  });

  for (const row of rows) {
    const { error } = await admin.from("ministry_programs").upsert(row, {
      onConflict: "slug",
    });
    if (error) throw error;
    console.log(`Upserted: ${row.title}`);
  }

  await admin.from("site_settings").upsert({
    key: "ministry_programs_sort",
    value: "manual",
  });

  console.log("Done.");
}

main().catch((err) => {
  console.error(err?.message || err);
  process.exit(1);
});
