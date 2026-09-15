#!/usr/bin/env node
/**
 * Ensure staff Auth users + profiles exist in live Supabase.
 * Passwords via env only — never log them.
 *
 * Usage:
 *   node scripts/ensure-staff-users.mjs
 *
 * Env (or supabase.env file):
 *   NEXT_PUBLIC_SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY
 *   STAFF_USER_1_PASSWORD, STAFF_USER_2_PASSWORD (optional overrides)
 */
import { createClient } from "@supabase/supabase-js";
import { readFileSync, existsSync } from "node:fs";
import { resolve, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = resolve(__dirname, "..");

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

const USERS = [
  {
    first_name: "Ricardo",
    last_name: "Diaz de la Vega",
    email: "ricardo.a@dreamsanimation.com",
    role: "superadmin",
    passwordEnv: "STAFF_USER_1_PASSWORD",
  },
  {
    first_name: "Nucha",
    last_name: "R",
    email: "nucha@dreamsanimation.com",
    role: "admin",
    passwordEnv: "STAFF_USER_2_PASSWORD",
  },
  {
    first_name: "Enrique",
    last_name: "Roncal",
    email: "development@dreamsanimation.com",
    role: "superadmin",
    passwordEnv: "STAFF_USER_3_PASSWORD",
  },
];

async function findUserByEmail(admin, email) {
  // Prefer listUsers scan (stable across key formats)
  for (let page = 1; page <= 20; page++) {
    const { data, error } = await admin.auth.admin.listUsers({
      page,
      perPage: 200,
    });
    if (error) throw error;
    const hit = data.users.find(
      (u) => u.email?.toLowerCase() === email.toLowerCase(),
    );
    if (hit) return hit;
    if (data.users.length < 200) break;
  }
  return null;
}

async function ensureUser(admin, spec, password) {
  const fullName = [spec.first_name, spec.last_name].filter(Boolean).join(" ");
  const existing = await findUserByEmail(admin, spec.email);

  let userId;
  if (existing) {
    userId = existing.id;
    const { error } = await admin.auth.admin.updateUserById(userId, {
      password,
      email_confirm: true,
      user_metadata: {
        first_name: spec.first_name,
        last_name: spec.last_name,
        full_name: fullName,
        role: spec.role,
      },
    });
    if (error) throw error;
    console.log(`Updated auth user: ${spec.email} (${spec.role})`);
  } else {
    const { data, error } = await admin.auth.admin.createUser({
      email: spec.email,
      password,
      email_confirm: true,
      user_metadata: {
        first_name: spec.first_name,
        last_name: spec.last_name,
        full_name: fullName,
        role: spec.role,
      },
    });
    if (error) throw error;
    userId = data.user.id;
    console.log(`Created auth user: ${spec.email} (${spec.role})`);
  }

  const { error: profileError } = await admin.from("profiles").upsert({
    id: userId,
    email: spec.email,
    first_name: spec.first_name,
    last_name: spec.last_name,
    full_name: fullName,
    role: spec.role,
  });
  if (profileError) throw profileError;
  console.log(`Upserted profile: ${spec.email} → ${spec.role}`);

  // Verify password sign-in with anon client (does not print password)
  const anonKey =
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ||
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY;
  if (anonKey) {
    const anon = createClient(required("NEXT_PUBLIC_SUPABASE_URL"), anonKey, {
      auth: { autoRefreshToken: false, persistSession: false },
    });
    const { data: signed, error: signError } =
      await anon.auth.signInWithPassword({
        email: spec.email,
        password,
      });
    if (signError) {
      console.error(`Sign-in FAILED for ${spec.email}: ${signError.message}`);
      throw signError;
    }
    console.log(
      `Sign-in OK for ${spec.email} (user ${signed.user?.id?.slice(0, 8)}…)`,
    );
    await anon.auth.signOut();
  }

  return userId;
}

async function ensureSiteSettings(admin) {
  const rows = [
    {
      key: "paywall",
      value: {
        enabled: true,
        free_article_limit: 3,
        modal_title: "Don't stop here",
        modal_body:
          "Create your FPN All Access account for free to keep reading and join the conversation.",
      },
    },
    {
      key: "adsense",
      value: { enabled: false, client_id: "" },
    },
    {
      key: "ads_txt",
      value: "google.com, pub-0000000000000000, DIRECT, f08c47fec0942fa0",
    },
  ];
  for (const row of rows) {
    const { data: existing } = await admin
      .from("site_settings")
      .select("key")
      .eq("key", row.key)
      .maybeSingle();
    if (existing) {
      console.log(`Setting exists: ${row.key}`);
      continue;
    }
    const { error } = await admin.from("site_settings").upsert(row);
    if (error) throw error;
    console.log(`Seeded setting: ${row.key}`);
  }
}

async function main() {
  const url = required("NEXT_PUBLIC_SUPABASE_URL");
  const serviceKey = required("SUPABASE_SERVICE_ROLE_KEY");
  const admin = createClient(url, serviceKey, {
    auth: { autoRefreshToken: false, persistSession: false },
  });

  // Prefer per-user env overrides; shared STAFF_DEFAULT_PASSWORD as fallback.
  // Do not print passwords.
  const fallback = process.env.STAFF_DEFAULT_PASSWORD || process.env.STAFF_USER_1_PASSWORD;
  const defaults = [
    process.env.STAFF_USER_1_PASSWORD || fallback,
    process.env.STAFF_USER_2_PASSWORD || fallback,
    process.env.STAFF_USER_3_PASSWORD || fallback,
  ];

  await ensureSiteSettings(admin);

  for (let i = 0; i < USERS.length; i++) {
    const spec = USERS[i];
    const password = process.env[spec.passwordEnv] || defaults[i];
    if (!password) {
      throw new Error(
        `Missing password for ${spec.email}. Set ${spec.passwordEnv} or STAFF_DEFAULT_PASSWORD.`,
      );
    }
    await ensureUser(admin, spec, password);
  }

  console.log("Done. Staff users ready (passwords not printed).");
}

main().catch((err) => {
  console.error(err?.message || err);
  process.exit(1);
});
