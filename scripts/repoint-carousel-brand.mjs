/**
 * Point published ministry_programs.carousel_image_url at /brand/home/carousel/*.png
 * (Node 20+ safe — uses PostgREST fetch, no @supabase/supabase-js / WebSocket).
 *
 * Usage: node scripts/repoint-carousel-brand.mjs
 */
import { existsSync, readFileSync, readdirSync } from "node:fs";
import { resolve } from "node:path";

function loadEnvLocal() {
  const p = resolve(process.cwd(), ".env.local");
  if (!existsSync(p)) return;
  for (const line of readFileSync(p, "utf8").split(/\r?\n/)) {
    const m = line.match(/^([A-Z0-9_]+)=(.*)$/);
    if (!m) continue;
    let v = m[2].trim();
    if (
      (v.startsWith('"') && v.endsWith('"')) ||
      (v.startsWith("'") && v.endsWith("'"))
    ) {
      v = v.slice(1, -1);
    }
    if (!process.env[m[1]]) process.env[m[1]] = v;
  }
}

function restHeaders(key) {
  return {
    apikey: key,
    Authorization: `Bearer ${key}`,
    "Content-Type": "application/json",
  };
}

loadEnvLocal();

const baseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL?.replace(/\/$/, "");
const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!baseUrl || !serviceKey) {
  console.error("Missing NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY in .env.local");
  process.exit(1);
}

const listRes = await fetch(
  `${baseUrl}/rest/v1/ministry_programs?status=eq.published&select=id,slug,title,carousel_image_url,status`,
  { headers: restHeaders(serviceKey) },
);

if (!listRes.ok) {
  console.error("list failed:", listRes.status, await listRes.text());
  process.exit(1);
}

const programs = await listRes.json();
const files = readdirSync(resolve("public/brand/home/carousel"));

const special = {
  "daily-faith": "daily-faith-with-philip-cameron.png",
  "disturbing-the-peace": "disturbing-the-peace-with-john-amanchukwu.png",
};

for (const p of programs || []) {
  let file =
    special[p.slug] && files.includes(special[p.slug])
      ? special[p.slug]
      : files.find((f) => f === `${p.slug}.png` || f.startsWith(`${p.slug}.`));

  if (!file && p.carousel_image_url) {
    const base = p.carousel_image_url.split("/").pop();
    if (base && files.includes(base)) file = base;
  }

  if (!file) {
    console.warn("skip", p.slug);
    continue;
  }

  const url = `/brand/home/carousel/${file}`;
  const patchRes = await fetch(
    `${baseUrl}/rest/v1/ministry_programs?id=eq.${encodeURIComponent(p.id)}`,
    {
      method: "PATCH",
      headers: {
        ...restHeaders(serviceKey),
        Prefer: "return=minimal",
      },
      body: JSON.stringify({ carousel_image_url: url }),
    },
  );

  if (!patchRes.ok) {
    console.error(p.slug, patchRes.status, await patchRes.text());
  } else {
    console.log(p.slug, "→", url);
  }
}
