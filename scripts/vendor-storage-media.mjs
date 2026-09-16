#!/usr/bin/env node
/**
 * Download every object in the public Supabase `media` bucket into
 * `public/media/...` so the repo can render without Storage or fptn.com.
 *
 * Usage: npm run vendor:media
 */
import { createClient } from "@supabase/supabase-js";
import {
  existsSync,
  mkdirSync,
  readFileSync,
  writeFileSync,
} from "node:fs";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = resolve(__dirname, "..");
const BUCKET = "media";
const OUT_ROOT = resolve(ROOT, "public", "media");
const STORAGE_PUBLIC = "/storage/v1/object/public/media/";

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

function toLocalPath(url) {
  if (!url || typeof url !== "string") return url;
  const idx = url.indexOf(STORAGE_PUBLIC);
  if (idx === -1) return url;
  return `/media/${url.slice(idx + STORAGE_PUBLIC.length)}`;
}

async function listRecursive(supabase, prefix = "") {
  const { data, error } = await supabase.storage.from(BUCKET).list(prefix, {
    limit: 1000,
    sortBy: { column: "name", order: "asc" },
  });
  if (error) throw error;
  const files = [];
  for (const entry of data ?? []) {
    const path = prefix ? `${prefix}/${entry.name}` : entry.name;
    const isFolder = !entry.id || entry.metadata == null;
    if (isFolder && !entry.metadata) {
      files.push(...(await listRecursive(supabase, path)));
    } else {
      files.push(path);
    }
  }
  return files;
}

async function download(url) {
  const res = await fetch(url, {
    headers: {
      "User-Agent": "FPN-VendorMedia/1.0",
      Accept: "image/*,application/pdf,*/*",
    },
    redirect: "follow",
  });
  if (!res.ok) throw new Error(`GET ${url} → ${res.status}`);
  return Buffer.from(await res.arrayBuffer());
}

function rewriteSeedFile(filename) {
  const path = resolve(ROOT, "scripts/data", filename);
  if (!existsSync(path)) return 0;
  const rows = JSON.parse(readFileSync(path, "utf8"));
  let changed = 0;
  for (const row of rows) {
    const next = toLocalPath(row.featured_image_url);
    if (next !== row.featured_image_url) {
      row.featured_image_url = next;
      changed += 1;
    }
  }
  writeFileSync(path, `${JSON.stringify(rows, null, 2)}\n`);
  return changed;
}

async function main() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key =
    process.env.SUPABASE_SERVICE_ROLE_KEY ||
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ||
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY;
  if (!url || !key) throw new Error("Missing Supabase env");

  const supabase = createClient(url, key, {
    auth: { autoRefreshToken: false, persistSession: false },
  });

  const objects = await listRecursive(supabase, "");
  console.log(`Found ${objects.length} objects in bucket ${BUCKET}`);

  let ok = 0;
  let failed = 0;
  for (const objectPath of objects) {
    const { data: pub } = supabase.storage.from(BUCKET).getPublicUrl(objectPath);
    const dest = resolve(OUT_ROOT, objectPath);
    try {
      mkdirSync(dirname(dest), { recursive: true });
      const buf = await download(pub.publicUrl);
      writeFileSync(dest, buf);
      ok += 1;
      console.log(`↓ ${objectPath} (${buf.length} bytes)`);
    } catch (err) {
      failed += 1;
      console.error(`✗ ${objectPath}:`, err?.message || err);
    }
  }

  const classic = rewriteSeedFile("classic-programs-seed.json");
  const ministry = rewriteSeedFile("ministry-programs-seed.json");

  console.log(
    JSON.stringify(
      { downloaded: ok, failed, seedLocalClassic: classic, seedLocalMinistry: ministry },
      null,
      2,
    ),
  );
  if (failed) process.exitCode = 1;
}

main().catch((err) => {
  console.error(err?.message || err);
  process.exit(1);
});
