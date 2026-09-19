#!/usr/bin/env node
/**
 * Schema-only: ADD COLUMN carousel_image_url (no content DML).
 */
import { createClient } from "@supabase/supabase-js";
import { Client } from "pg";
import { readFileSync, existsSync } from "node:fs";
import { resolve, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), "..");

function loadEnvFile(path) {
  if (!existsSync(path)) return;
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

loadEnvFile(resolve(ROOT, ".env.local"));

const sql =
  "alter table public.ministry_programs add column if not exists carousel_image_url text";

async function viaPg() {
  const ref = new URL(process.env.NEXT_PUBLIC_SUPABASE_URL).hostname.split(
    ".",
  )[0];
  const password = process.env.SUPABASE_DB_PASSWORD;
  if (!password) throw new Error("Missing SUPABASE_DB_PASSWORD");
  const url =
    process.env.DATABASE_URL ||
    process.env.SUPABASE_DB_URL ||
    `postgresql://postgres.${ref}:${encodeURIComponent(password)}@aws-0-us-west-2.pooler.supabase.com:6543/postgres`;
  const client = new Client({
    connectionString: url,
    ssl: { rejectUnauthorized: false },
  });
  await client.connect();
  await client.query(sql);
  await client.end();
  console.log("OK: carousel_image_url column ensured via pg");
}

viaPg().catch((err) => {
  console.error(err.message || err);
  process.exit(1);
});
