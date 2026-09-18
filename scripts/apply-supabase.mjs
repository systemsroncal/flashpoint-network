#!/usr/bin/env node
/**
 * Apply FP Network Supabase migrations + seed to the live project.
 *
 * Run from your **local** machine only (see scripts/assert-local-db-apply.mjs).
 * The VPS deploy script does not run this — push migration files via git, apply locally.
 *
 * Auth for DDL (one of):
 *   - DATABASE_URL / SUPABASE_DB_URL
 *   - SUPABASE_DB_PASSWORD (+ project ref from NEXT_PUBLIC_SUPABASE_URL)
 *   - SUPABASE_ACCESS_TOKEN (Management API: /v1/projects/{ref}/database/query)
 *
 * Seed author is created via Auth Admin API using SUPABASE_SERVICE_ROLE_KEY.
 *
 * Secrets are read from env or from a path in SUPABASE_ENV_FILE (never printed).
 */
import { createClient } from "@supabase/supabase-js";
import { Client } from "pg";
import { readFileSync, readdirSync, existsSync } from "node:fs";
import { resolve, join, dirname } from "node:path";
import { fileURLToPath } from "node:url";
import { assertLocalDbApply } from "./assert-local-db-apply.mjs";

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = resolve(__dirname, "..");
const SEED_AUTHOR_ID = "f1000000-0000-4000-8000-000000000001";
const SEED_AUTHOR_EMAIL = "editor@fpnetwork.local";
const POOLER_HOST = "aws-0-us-west-2.pooler.supabase.com";

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
loadEnvFile(
  "/cursor/stores/bc-4a455162-0030-4de5-96cf-ad19ed4659ba/internal/supabase.env",
);

function required(name) {
  const v = process.env[name];
  if (!v) throw new Error(`Missing required env: ${name}`);
  return v;
}

function projectRef() {
  const url = required("NEXT_PUBLIC_SUPABASE_URL");
  return new URL(url).hostname.split(".")[0];
}

function splitSql(sql) {
  // Split on semicolons outside of dollar-quoted blocks and quotes.
  const parts = [];
  let buf = "";
  let i = 0;
  let inSingle = false;
  let dollarTag = null;
  while (i < sql.length) {
    const ch = sql[i];
    if (dollarTag) {
      const end = sql.indexOf(dollarTag, i);
      if (end === -1) {
        buf += sql.slice(i);
        break;
      }
      buf += sql.slice(i, end + dollarTag.length);
      i = end + dollarTag.length;
      dollarTag = null;
      continue;
    }
    if (inSingle) {
      buf += ch;
      if (ch === "'" && sql[i + 1] === "'") {
        buf += sql[++i];
      } else if (ch === "'") {
        inSingle = false;
      }
      i++;
      continue;
    }
    if (ch === "'") {
      inSingle = true;
      buf += ch;
      i++;
      continue;
    }
    if (ch === "$") {
      const m = sql.slice(i).match(/^\$[A-Za-z0-9_]*\$/);
      if (m) {
        dollarTag = m[0];
        buf += m[0];
        i += m[0].length;
        continue;
      }
    }
    if (ch === ";") {
      const stmt = buf.trim();
      if (stmt && !stmt.startsWith("--")) parts.push(stmt);
      buf = "";
      i++;
      continue;
    }
    // strip line comments when starting a line-ish
    if (ch === "-" && sql[i + 1] === "-" && (buf.endsWith("\n") || buf.trim() === "")) {
      const nl = sql.indexOf("\n", i);
      i = nl === -1 ? sql.length : nl + 1;
      continue;
    }
    buf += ch;
    i++;
  }
  const tail = buf.trim();
  if (tail) parts.push(tail);
  return parts.filter((stmt) => {
    const stripped = stmt
      .replace(/\/\*[\s\S]*?\*\//g, "")
      .replace(/--[^\n]*/g, "")
      .trim();
    return stripped.length > 0;
  });
}

async function runViaPg(sql) {
  const ref = projectRef();
  const password = process.env.SUPABASE_DB_PASSWORD;
  const databaseUrl =
    process.env.DATABASE_URL ||
    process.env.SUPABASE_DB_URL ||
    (password
      ? `postgresql://postgres.${ref}:${encodeURIComponent(password)}@${POOLER_HOST}:6543/postgres`
      : null);

  if (!databaseUrl) {
    return { ok: false, reason: "no_database_url" };
  }

  const client = new Client({
    connectionString: databaseUrl,
    ssl: { rejectUnauthorized: false },
    connectionTimeoutMillis: 15000,
  });
  await client.connect();
  try {
    const statements = splitSql(sql);
    for (const stmt of statements) {
      await client.query(stmt);
    }
    return { ok: true, mode: "pg", statements: statements.length };
  } finally {
    await client.end();
  }
}

async function runViaManagementApi(sql) {
  const token = process.env.SUPABASE_ACCESS_TOKEN;
  if (!token) return { ok: false, reason: "no_access_token" };

  const ref = projectRef();
  const statements = splitSql(sql);
  for (const stmt of statements) {
    const res = await fetch(
      `https://api.supabase.com/v1/projects/${ref}/database/query`,
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ query: stmt }),
      },
    );
    if (!res.ok) {
      const body = await res.text();
      throw new Error(`Management API ${res.status}: ${body.slice(0, 400)}`);
    }
  }
  return { ok: true, mode: "management_api", statements: statements.length };
}

async function execSql(sql, label) {
  console.log(`Applying ${label}...`);
  let result = await runViaPg(sql);
  if (!result.ok) {
    result = await runViaManagementApi(sql);
  }
  if (!result.ok) {
    throw new Error(
      "Cannot execute SQL: set SUPABASE_DB_PASSWORD (or DATABASE_URL) or SUPABASE_ACCESS_TOKEN. " +
        "Service role key alone cannot run DDL.",
    );
  }
  console.log(`OK ${label} via ${result.mode} (${result.statements} statements)`);
  return result;
}

async function ensureSeedAuthor() {
  const url = required("NEXT_PUBLIC_SUPABASE_URL");
  const serviceKey = required("SUPABASE_SERVICE_ROLE_KEY");
  const admin = createClient(url, serviceKey, {
    auth: { autoRefreshToken: false, persistSession: false },
  });

  const password =
    process.env.SEED_AUTHOR_PASSWORD ||
    `FPN-seed-${SEED_AUTHOR_ID.slice(0, 8)}!`;

  const { data: listed } = await admin.auth.admin.listUsers({
    page: 1,
    perPage: 200,
  });
  const existing = listed?.users?.find(
    (u) => u.id === SEED_AUTHOR_ID || u.email === SEED_AUTHOR_EMAIL,
  );

  let userId = existing?.id;
  if (!existing) {
    const { data, error } = await admin.auth.admin.createUser({
      id: SEED_AUTHOR_ID,
      email: SEED_AUTHOR_EMAIL,
      password,
      email_confirm: true,
      user_metadata: {
        full_name: "FPN Desk",
        first_name: "FPN",
        last_name: "Desk",
        role: "editor",
      },
    });
    if (error) throw error;
    userId = data.user.id;
    console.log("Created seed author user");
  } else {
    console.log("Seed author already exists");
  }

  // Ensure profile role is editor (trigger may have defaulted to subscriber)
  const { error: profileError } = await admin.from("profiles").upsert({
    id: userId,
    email: SEED_AUTHOR_EMAIL,
    full_name: "FPN Desk",
    first_name: "FPN",
    last_name: "Desk",
    role: "editor",
  });
  if (profileError) throw profileError;

  if (userId !== SEED_AUTHOR_ID) {
    throw new Error(
      `Seed author id mismatch: expected ${SEED_AUTHOR_ID}, got ${userId}`,
    );
  }
  return userId;
}

async function countRows() {
  const url = required("NEXT_PUBLIC_SUPABASE_URL");
  const serviceKey = required("SUPABASE_SERVICE_ROLE_KEY");
  const admin = createClient(url, serviceKey, {
    auth: { autoRefreshToken: false, persistSession: false },
  });

  async function count(table) {
    const { count, error } = await admin
      .from(table)
      .select("*", { count: "exact", head: true });
    if (error) throw error;
    return count ?? 0;
  }

  return {
    posts: await count("posts"),
    categories: await count("categories"),
    events: await count("events"),
    tags: await count("tags"),
    email_templates: await count("email_templates"),
    site_settings: await count("site_settings"),
  };
}

async function main() {
  assertLocalDbApply();

  const migrationsDir = join(ROOT, "supabase/migrations");
  const files = readdirSync(migrationsDir)
    .filter((f) => f.endsWith(".sql"))
    .sort();

  for (const file of files) {
    const sql = readFileSync(join(migrationsDir, file), "utf8");
    await execSql(sql, file);
  }

  try {
    const { spawnSync } = await import("node:child_process");
    const sync = spawnSync(process.execPath, ["scripts/sync-ministry-figma-seed.mjs"], {
      cwd: ROOT,
      stdio: "inherit",
      env: process.env,
    });
    if (sync.status !== 0) {
      console.warn("ministry figma seed sync skipped or failed (non-fatal)");
    }
  } catch {
    console.warn("ministry figma seed sync could not run");
  }

  await ensureSeedAuthor();

  const seedSql = readFileSync(join(ROOT, "supabase/seed.sql"), "utf8");
  await execSql(seedSql, "seed.sql");

  const counts = await countRows();
  console.log(JSON.stringify({ applied: true, counts }, null, 2));
}

main().catch((err) => {
  console.error(err.message || err);
  process.exit(1);
});
