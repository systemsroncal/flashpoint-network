import { createClient } from "@supabase/supabase-js";
import { existsSync, readFileSync } from "node:fs";
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

const day = "2026-09-21";
const fixes = [
  {
    pub: "daily-faith",
    arch: "daily-faith-with-philip-cameron",
    url: `/uploads/${day}/carousel/daily-faith-with-philip-cameron.png`,
  },
  {
    pub: "disturbing-the-peace",
    arch: "disturbing-the-peace-with-john-amanchukwu",
    url: `/uploads/${day}/carousel/disturbing-the-peace-with-john-amanchukwu.png`,
  },
];

for (const f of fixes) {
  const { data } = await s
    .from("ministry_programs")
    .select("id,slug,status")
    .in("slug", [f.pub, f.arch]);
  const pub = data?.find((d) => d.slug === f.pub);
  const arch = data?.find((d) => d.slug === f.arch);
  if (pub) {
    await s
      .from("ministry_programs")
      .update({ carousel_image_url: f.url })
      .eq("id", pub.id);
    console.log("set", f.pub, f.url);
  }
  if (arch) {
    await s
      .from("ministry_programs")
      .update({ carousel_image_url: null })
      .eq("id", arch.id);
    console.log("cleared archived", f.arch);
  }
}
