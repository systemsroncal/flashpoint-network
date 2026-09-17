/**
 * Upsert FPTN Shows catalog from scripts/data/ministry-programs-figma-seed.json
 * Run after db:apply: node scripts/sync-ministry-figma-seed.mjs
 */
import { createClient } from "@supabase/supabase-js";
import { existsSync, readFileSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const SEED = resolve(ROOT, "scripts/data/ministry-programs-figma-seed.json");

function loadEnvFile(path) {
  if (!path || !existsSync(path)) return;
  const text = readFileSync(path, "utf8");
  for (const line of text.split("\n")) {
    const m = line.match(/^\s*([A-Za-z_][A-Za-z0-9_]*)\s*=\s*(.*)\s*$/);
    if (!m) continue;
    const key = m[1];
    let val = m[2];
    if (
      (val.startsWith('"') && val.endsWith('"')) ||
      (val.startsWith("'") && val.endsWith("'"))
    ) {
      val = val.slice(1, -1);
    }
    if (!process.env[key]) process.env[key] = val;
  }
}

loadEnvFile(process.env.SUPABASE_ENV_FILE);
loadEnvFile(resolve(ROOT, ".env.local"));

const url = process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.SUPABASE_URL;
const key = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!url || !key) {
  console.error("Missing SUPABASE_URL / SUPABASE_SERVICE_ROLE_KEY");
  process.exit(1);
}

const raw = JSON.parse(readFileSync(SEED, "utf8"));
const slugs = raw.map((r) => r.slug);

const admin = createClient(url, key, {
  auth: { autoRefreshToken: false, persistSession: false },
});

async function main() {
  const { data: published, error: listErr } = await admin
    .from("ministry_programs")
    .select("id, slug")
    .eq("status", "published");
  if (listErr) throw listErr;
  const slugSet = new Set(slugs);
  for (const row of published ?? []) {
    if (!slugSet.has(row.slug)) {
      const { error } = await admin
        .from("ministry_programs")
        .update({ status: "archived" })
        .eq("id", row.id);
      if (error) throw error;
      console.log(`Archived legacy: ${row.slug}`);
    }
  }

  for (const c of raw) {
    const excerpt = c.schedule_note || `${c.title} on FlashPoint Television Network.`;
    const row = {
      title: c.title,
      slug: c.slug,
      excerpt,
      description: c.description || excerpt,
      body: null,
      featured_image_url: c.featured_image_url || null,
      external_url: null,
      schedule_note: c.schedule_note || null,
      schedule_line: c.schedule_line || null,
      host_name: c.host_name || null,
      schedule_detail: c.schedule_detail || null,
      genre: c.genre || null,
      genres_label: c.genres_label || null,
      sort_order: c.sort_order ?? 0,
      status: "published",
      source_url: null,
    };
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
