#!/usr/bin/env node
/**
 * Download remote classic/ministry program images → Sharp WebP → Supabase Storage,
 * then update featured_image_url and clear source_url / external_url.
 *
 * Usage: node scripts/migrate-program-images.mjs
 */
import { createClient } from "@supabase/supabase-js";
import { createHash, randomUUID } from "node:crypto";
import { readFileSync, writeFileSync, existsSync, mkdirSync } from "node:fs";
import { resolve, dirname } from "node:path";
import { fileURLToPath } from "node:url";
import sharp from "sharp";

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = resolve(__dirname, "..");
const BUCKET = "media";
const TABLES = ["classic_programs", "ministry_programs"];

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

function isExternalImage(url) {
  if (!url) return false;
  try {
    const host = new URL(url).hostname.toLowerCase();
    if (host.includes("supabase.co")) return false;
    return true;
  } catch {
    return false;
  }
}

async function ensureBucket(supabase) {
  const { data: buckets } = await supabase.storage.listBuckets();
  if (!buckets?.some((b) => b.id === BUCKET || b.name === BUCKET)) {
    const { error } = await supabase.storage.createBucket(BUCKET, {
      public: true,
      fileSizeLimit: 10 * 1024 * 1024,
      allowedMimeTypes: [
        "image/jpeg",
        "image/png",
        "image/webp",
        "image/gif",
        "image/avif",
      ],
    });
    if (error) throw error;
    console.log("Created media bucket");
  }
}

async function optimize(buffer) {
  const { data, info } = await sharp(buffer, { failOn: "none" })
    .rotate()
    .resize({ width: 1200, withoutEnlargement: true, fit: "inside" })
    .webp({ quality: 82 })
    .toBuffer({ resolveWithObject: true });
  return { buffer: data, width: info.width, height: info.height };
}

async function download(url) {
  const res = await fetch(url, {
    headers: {
      "User-Agent": "FPN-MediaMigrate/1.0 (+local storage seed)",
      Accept: "image/*,*/*",
    },
    redirect: "follow",
  });
  if (!res.ok) throw new Error(`GET ${url} → ${res.status}`);
  const ab = await res.arrayBuffer();
  return Buffer.from(ab);
}

async function migrateTable(supabase, table) {
  const { data: rows, error } = await supabase
    .from(table)
    .select("id, slug, featured_image_url, external_url, source_url");
  if (error) throw error;

  const report = [];
  for (const row of rows ?? []) {
    let nextUrl = row.featured_image_url;
    if (isExternalImage(row.featured_image_url)) {
      try {
        const raw = await download(row.featured_image_url);
        const optimized = await optimize(raw);
        const hash = createHash("sha1")
          .update(row.featured_image_url)
          .digest("hex")
          .slice(0, 12);
        const path = `programs/${table}/${row.slug || row.id}-${hash}.webp`;
        const { error: upErr } = await supabase.storage
          .from(BUCKET)
          .upload(path, optimized.buffer, {
            contentType: "image/webp",
            upsert: true,
            cacheControl: "31536000",
          });
        if (upErr) throw upErr;
        const { data: pub } = supabase.storage.from(BUCKET).getPublicUrl(path);
        nextUrl = pub.publicUrl;
        console.log(`↑ ${table}/${row.slug} → ${path}`);
      } catch (err) {
        console.error(`✗ ${table}/${row.slug}:`, err?.message || err);
        report.push({
          table,
          slug: row.slug,
          error: String(err?.message || err),
        });
        // still clear provenance fields below
      }
    }

    const { error: updErr } = await supabase
      .from(table)
      .update({
        featured_image_url: nextUrl,
        external_url: null,
        source_url: null,
      })
      .eq("id", row.id);
    if (updErr) throw updErr;
  }
  return report;
}

async function refreshSeedSnapshots(supabase) {
  for (const table of TABLES) {
    const { data, error } = await supabase
      .from(table)
      .select(
        "title, slug, excerpt, description, body, featured_image_url, external_url, schedule_note, sort_order, status, source_url",
      )
      .order("sort_order", { ascending: true });
    if (error) throw error;
    const name =
      table === "classic_programs"
        ? "classic-programs-seed.json"
        : "ministry-programs-seed.json";
    const out = resolve(ROOT, "scripts/data", name);
    mkdirSync(dirname(out), { recursive: true });
    writeFileSync(out, JSON.stringify(data, null, 2));
    console.log(`Wrote ${data.length} rows → ${out}`);
  }
}

async function assertNoExternal(supabase) {
  const leftovers = [];
  for (const table of TABLES) {
    const { data, error } = await supabase
      .from(table)
      .select("slug, featured_image_url, external_url, source_url");
    if (error) throw error;
    for (const row of data ?? []) {
      if (isExternalImage(row.featured_image_url)) {
        leftovers.push({ table, slug: row.slug, url: row.featured_image_url });
      }
      if (row.external_url || row.source_url) {
        leftovers.push({
          table,
          slug: row.slug,
          provenance: { external_url: row.external_url, source_url: row.source_url },
        });
      }
    }
  }
  return leftovers;
}

async function main() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !key) throw new Error("Missing Supabase env");

  const supabase = createClient(url, key, {
    auth: { autoRefreshToken: false, persistSession: false },
  });

  await ensureBucket(supabase);
  const errors = [];
  for (const table of TABLES) {
    errors.push(...(await migrateTable(supabase, table)));
  }
  await refreshSeedSnapshots(supabase);
  const leftovers = await assertNoExternal(supabase);
  console.log(
    JSON.stringify(
      {
        migrateErrors: errors.length,
        leftovers: leftovers.length,
        leftoverSample: leftovers.slice(0, 5),
      },
      null,
      2,
    ),
  );
  if (leftovers.length) process.exitCode = 1;
  else console.log("All program images are project-hosted.");
}

main().catch((err) => {
  console.error(err?.message || err);
  process.exit(1);
});
