/**
 * Expand published post bodies with multi-paragraph HTML for fuller single-post pages.
 * Usage: node scripts/expand-post-bodies.mjs
 * Reads credentials from store supabase.env (or workspace .env.local).
 */
import fs from "node:fs";
import { createClient } from "@supabase/supabase-js";

function loadEnv() {
  const paths = [
    "/cursor/stores/bc-4a455162-0030-4de5-96cf-ad19ed4659ba/internal/supabase.env",
    "/workspace/.env.local",
  ];
  const env = { ...process.env };
  for (const p of paths) {
    if (!fs.existsSync(p)) continue;
    for (const line of fs.readFileSync(p, "utf8").split(/\n/)) {
      const m = line.match(/^([A-Z0-9_]+)=(.*)$/);
      if (!m) continue;
      env[m[1]] = m[2].replace(/^"|"$/g, "");
    }
  }
  return env;
}

/** Shared long-form HTML used by seed.sql and live updates. */
export const FULL_ARTICLE_BODY = [
  "<p>Flash Point Network reporters spent the day tracking developments as officials offered their first unfiltered comments since the resignation landed on Capitol desks. The remarks, delivered without a prepared teleprompter script, immediately reset the tone of the afternoon briefing cycle.</p>",
  "<p>According to people familiar with the sequence, the outgoing secretary chose to speak after weeks of private consultations with career staff and outside advisers. Those conversations, sources said, focused on the timing of any public statement and how much detail could be shared without compromising ongoing reviews.</p>",
  "<p>Inside the department, the reaction was mixed but measured. Mid-level managers described a surge of internal messages seeking clarity on transition plans, while senior aides emphasized continuity of operations. Several desk officers said the priority overnight was keeping routine briefings on schedule.</p>",
  "<p>On the Hill, lawmakers from both parties framed the moment as a test of institutional stamina rather than a single personality drama. Committee staffers noted that hearing calendars already under pressure would likely absorb additional oversight requests in the coming weeks.</p>",
  "<p>Outside analysts pointed to three questions that will dominate the next news cycle: who assumes acting authority, which pending decisions freeze until a successor is confirmed, and how allied counterparts interpret the change. Each carries implications for budget negotiations and overseas coordination.</p>",
  "<p>Veterans of previous transitions cautioned against reading the first public comments as a complete narrative. \"Early statements are often designed to stabilize markets and messaging,\" one former official told FPN. \"The fuller record tends to emerge in documents released later.\"</p>",
  "<p>Meanwhile, advocacy groups and service organizations pressed for clearer timelines on personnel decisions that affect families and contractors. Their statements, circulated late in the day, urged the White House and department leadership to publish a written transition outline.</p>",
  "<p>Flash Point Live will continue covering the fallout with extended analysis, including reactions from statehouse leaders and international desks. Readers can follow updates on FPN digital channels and in tonight's broadcast window.</p>",
  "<p>As night fell in Washington, aides were still refining talking points for morning shows. The working consensus among reporters who covered the briefings is that the story has moved from rumor to record — and that the next chapter will be written in confirmation hearings and paper trails.</p>",
  "<p>For now, the public has a clearer sense of why the resignation unfolded when it did, even as many operational details remain under review. FPN will update this report as additional documents and on-the-record responses become available.</p>",
].join("");

const PARAS = FULL_ARTICLE_BODY.match(/<p>[\s\S]*?<\/p>/g) || [];

function bodyForSlug(slug) {
  // Rotate starting paragraph so posts are not byte-identical while staying long.
  let hash = 0;
  for (let i = 0; i < slug.length; i++) hash = (hash + slug.charCodeAt(i) * (i + 1)) % PARAS.length;
  const rotated = [...PARAS.slice(hash), ...PARAS.slice(0, hash)];
  // Keep 8–10 paragraphs
  const count = 8 + (hash % 3);
  return rotated.slice(0, count).join("");
}

async function main() {
  const env = loadEnv();
  const url = env.NEXT_PUBLIC_SUPABASE_URL || env.SUPABASE_URL;
  const key = env.SUPABASE_SERVICE_ROLE_KEY || env.SUPABASE_SECRET_KEY;
  if (!url || !key) throw new Error("Missing Supabase URL or service role key");

  const supabase = createClient(url, key);
  const { data: posts, error } = await supabase
    .from("posts")
    .select("id, slug, status")
    .eq("status", "published");
  if (error) throw error;

  let updated = 0;
  for (const post of posts || []) {
    const body = bodyForSlug(post.slug);
    const { error: uerr } = await supabase
      .from("posts")
      .update({ body })
      .eq("id", post.id);
    if (uerr) throw uerr;
    updated += 1;
  }

  console.log(`Updated ${updated} published posts with expanded HTML bodies.`);
  console.log(`Sample paragraph count: ${(bodyForSlug("sample").match(/<p>/g) || []).length}`);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
