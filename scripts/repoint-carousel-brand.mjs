import { createClient } from "@supabase/supabase-js";
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

loadEnvLocal();
const s = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY,
);

const files = readdirSync(resolve("public/brand/home/carousel"));
const { data: programs, error } = await s
  .from("ministry_programs")
  .select("id,slug,title,carousel_image_url,status")
  .eq("status", "published");

if (error) {
  console.error(error);
  process.exit(1);
}

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
  const { error: upErr } = await s
    .from("ministry_programs")
    .update({ carousel_image_url: url })
    .eq("id", p.id);
  if (upErr) console.error(p.slug, upErr.message);
  else console.log(p.slug, "→", url);
}
