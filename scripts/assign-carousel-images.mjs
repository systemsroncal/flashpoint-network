/**
 * Copy Original Live Shows carousel art into public/uploads and set
 * ministry_programs.carousel_image_url by fuzzy title/host match.
 *
 * Source: C:\computer-files\WEBSITES\fp-network\New folder\programs\programs-imgs
 * Usage:  node scripts/assign-carousel-images.mjs
 */
import { createClient } from "@supabase/supabase-js";
import {
  copyFileSync,
  existsSync,
  mkdirSync,
  readFileSync,
  readdirSync,
} from "node:fs";
import { basename, extname, join, resolve } from "node:path";

const SOURCE_DIR =
  process.env.CAROUSEL_SRC ||
  "C:\\computer-files\\WEBSITES\\fp-network\\New folder\\programs\\programs-imgs";

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

function norm(s) {
  return String(s || "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, " ")
    .trim();
}

/** filename token → keywords to match against title + host */
const FILE_MATCHERS = [
  { file: "i-got-questions", keys: ["i got questions"] },
  { file: "maria", keys: ["maria", "voices in the wilderness"] },
  { file: "tony-suarez", keys: ["tony suarez", "revivalmakers"] },
  { file: "joanne", keys: ["joanne", "joanne ramsey", "make the word alive"] },
  { file: "didio", keys: ["didio", "revival nation"] },
  { file: "hans", keys: ["hans hess", "hans"] },
  { file: "larry-reece", keys: ["larry reece", "cape henry"] },
  { file: "billy-graham", keys: ["billy graham"] },
  { file: "philip", keys: ["philip cameron", "daily faith"] },
  { file: "john-a", keys: ["john amanchukwu", "disturbing the peace"] },
  { file: "NATE", keys: ["nate", "wake up church"] },
  { file: "landon", keys: ["landon", "mercy culture"] },
  { file: "stephen", keys: ["stephen", "living room"] },
  { file: "brian", keys: ["in the word", "brian rogers"] },
  { file: "brandy", keys: ["brandy", "walking in the word"] },
  { file: "flashpoint-tv-network", keys: ["network specials"] },
  { file: "revival-radio", keys: ["revival radio"] },
  { file: "gene-bailey", keys: ["flashpoint show", "the flashpoint show"] },
  { file: "joseph-z", keys: ["joseph z", "voice of god"] },
  { file: "kingston", keys: ["kinston", "kingston"] },
];

loadEnvLocal();

const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
const key =
  process.env.SUPABASE_SERVICE_ROLE_KEY ||
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
if (!url || !key) {
  console.error("Missing Supabase env");
  process.exit(1);
}
if (!existsSync(SOURCE_DIR)) {
  console.error("Source folder missing:", SOURCE_DIR);
  process.exit(1);
}

const day = new Date().toISOString().slice(0, 10);
const destDir = resolve(process.cwd(), "public", "uploads", day, "carousel");
mkdirSync(destDir, { recursive: true });

const files = readdirSync(SOURCE_DIR).filter((f) =>
  /\.(png|jpe?g|webp)$/i.test(f),
);

function resolveFile(token) {
  const lower = token.toLowerCase();
  return files.find((f) => {
    const base = basename(f, extname(f))
      .replace(/^card-hulu-originals-?/i, "")
      .replace(/^\./, "");
    return base.toLowerCase() === lower;
  });
}

const supabase = createClient(url, key);
const { data: programs, error } = await supabase
  .from("ministry_programs")
  .select("id,title,slug,host_name,status")
  .order("sort_order", { ascending: true });

if (error) {
  console.error(error);
  process.exit(1);
}

const usedProgramIds = new Set();
const results = [];

for (const matcher of FILE_MATCHERS) {
  const fileName = resolveFile(matcher.file);
  if (!fileName) {
    console.warn("No file for", matcher.file);
    continue;
  }

  const haystacks = (programs || [])
    .filter((p) => p.status === "published" && !usedProgramIds.has(p.id))
    .map((p) => ({
      program: p,
      text: norm(`${p.title} ${p.host_name || ""} ${p.slug}`),
    }));

  let best = null;
  for (const key of matcher.keys) {
    const k = norm(key);
    const hit = haystacks.find((h) => h.text.includes(k));
    if (hit) {
      best = hit.program;
      break;
    }
  }
  if (!best) {
    console.warn("No program match for", matcher.file, matcher.keys);
    continue;
  }

  const destName = `${best.slug}${extname(fileName).toLowerCase()}`;
  const destPath = join(destDir, destName);
  copyFileSync(join(SOURCE_DIR, fileName), destPath);
  const publicUrl = `/uploads/${day}/carousel/${destName}`;

  const { error: upErr } = await supabase
    .from("ministry_programs")
    .update({ carousel_image_url: publicUrl })
    .eq("id", best.id);

  if (upErr) {
    console.error("Update failed", best.title, upErr.message);
    continue;
  }

  usedProgramIds.add(best.id);
  results.push({ file: fileName, title: best.title, url: publicUrl });
  console.log("OK", best.title, "←", fileName);
}

console.log(`\nAssigned ${results.length} carousel images → ${destDir}`);
