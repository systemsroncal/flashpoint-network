#!/usr/bin/env node
/**
 * Apply video_url migration, fix broken featured images, set FlashPoint YouTube URLs,
 * and ensure the public `media` storage bucket exists.
 */
import { createClient } from "@supabase/supabase-js";
import { Client } from "pg";
import { readFileSync, existsSync } from "node:fs";
import { resolve, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = resolve(__dirname, "..");

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

loadEnvFile(resolve(ROOT, ".env.local"));

const IMAGE_MAP = {
  "photo-1555848962-6e79363cc5cb": "photo-1540910419892-4a36d2c3266c",
  "photo-1504711337284-a5f755aa76f2": "photo-1504711434969-e33886168f5c",
  "photo-1492619372924-fb1b1d0c3c4a": "photo-1574717024653-61fd2cf4d44d",
  "photo-1494172961521-33799ddd918b": "photo-1529107386315-e1a2ed48a620",
  "photo-1569025690938-a007629cce3f": "photo-1586339949916-3e9457bef6d3",
  "photo-1464467543994-fcd083f12a40": "photo-1454165804606-c3d57bc86b40",
  "photo-1598550476437-484ba68d3d0d": "photo-1611162616475-46b635cb6868",
};

const YT = {
  live: "https://www.youtube.com/watch?v=una0oMq_oco",
  election: "https://www.youtube.com/watch?v=Wlwq68AnrdQ",
  world: "https://www.youtube.com/watch?v=MXPa62I9wiY",
  must: [
    "https://www.youtube.com/watch?v=una0oMq_oco",
    "https://www.youtube.com/watch?v=-v4tTVtNW4M",
    "https://www.youtube.com/watch?v=MXPa62I9wiY",
    "https://www.youtube.com/watch?v=rn3nVESk9ag",
    "https://www.youtube.com/watch?v=N8IYeaDUJ9I",
  ],
  elections: "https://www.youtube.com/watch?v=Jhz623HVN3A",
  videoFallback: "https://www.youtube.com/watch?v=ro3XhGvcag4",
  podcast: "https://www.youtube.com/watch?v=FN-Pec2eVy4",
};

function rewriteUrl(url) {
  if (!url) return url;
  let next = url;
  for (const [from, to] of Object.entries(IMAGE_MAP)) {
    if (next.includes(from)) next = next.replaceAll(from, to);
  }
  return next;
}

function projectRef() {
  return new URL(process.env.NEXT_PUBLIC_SUPABASE_URL).hostname.split(".")[0];
}

async function runSql(sql) {
  const password = process.env.SUPABASE_DB_PASSWORD;
  const databaseUrl =
    process.env.DATABASE_URL ||
    process.env.SUPABASE_DB_URL ||
    (password
      ? `postgresql://postgres.${projectRef()}:${encodeURIComponent(password)}@aws-0-us-west-2.pooler.supabase.com:6543/postgres`
      : null);
  if (!databaseUrl) throw new Error("No DATABASE_URL / SUPABASE_DB_PASSWORD");
  const client = new Client({
    connectionString: databaseUrl,
    ssl: { rejectUnauthorized: false },
  });
  await client.connect();
  try {
    await client.query(sql);
  } finally {
    await client.end();
  }
}

async function main() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !key) throw new Error("Missing Supabase env");

  const migration = readFileSync(
    resolve(ROOT, "supabase/migrations/20260315000003_posts_video_and_media_bucket.sql"),
    "utf8",
  );
  console.log("Applying migration…");
  await runSql(migration);
  console.log("Migration OK");

  const supabase = createClient(url, key, {
    auth: { autoRefreshToken: false, persistSession: false },
  });

  const { data: posts, error: postsErr } = await supabase
    .from("posts")
    .select("id, slug, featured_image_url, is_video, is_podcast, video_url");
  if (postsErr) throw postsErr;

  let imageFixes = 0;
  for (const post of posts) {
    const next = rewriteUrl(post.featured_image_url);
    if (next && next !== post.featured_image_url) {
      const { error } = await supabase
        .from("posts")
        .update({ featured_image_url: next })
        .eq("id", post.id);
      if (error) throw error;
      imageFixes += 1;
    }
  }
  console.log("Fixed post images:", imageFixes);

  const { data: events, error: eventsErr } = await supabase
    .from("events")
    .select("id, slug, thumbnail_url, video_url, format");
  if (eventsErr) throw eventsErr;

  for (const event of events) {
    const patch = {};
    const thumb = rewriteUrl(event.thumbnail_url);
    if (thumb && thumb !== event.thumbnail_url) patch.thumbnail_url = thumb;
    if (event.slug === "flashpoint-live-army-secretary") patch.video_url = YT.live;
    if (event.slug === "election-night-desk") {
      patch.video_url = YT.election;
      patch.format = "video";
    }
    if (event.slug === "world-briefing-markets") patch.video_url = YT.world;
    if (Object.keys(patch).length) {
      const { error } = await supabase.from("events").update(patch).eq("id", event.id);
      if (error) throw error;
    }
  }
  console.log("Updated events videos/thumbs");

  const must = posts
    .filter((p) => p.slug?.startsWith("must-watch"))
    .sort((a, b) => a.slug.localeCompare(b.slug));
  for (let i = 0; i < must.length; i++) {
    const video_url = YT.must[i] || YT.videoFallback;
    await supabase.from("posts").update({ video_url }).eq("id", must[i].id);
  }

  for (const post of posts) {
    if (post.slug?.startsWith("must-watch")) continue;
    let video_url = post.video_url;
    if (post.is_podcast) video_url = YT.podcast;
    else if (post.is_video && post.slug?.startsWith("elections-")) video_url = YT.elections;
    else if (post.is_video) video_url = YT.videoFallback;
    else if (post.slug === "outgoing-army-secretary-breaks-silence") video_url = YT.live;
    if (video_url && video_url !== post.video_url) {
      await supabase.from("posts").update({ video_url }).eq("id", post.id);
    }
  }
  console.log("Assigned YouTube video_url on posts");

  const { data: buckets } = await supabase.storage.listBuckets();
  if (!buckets?.some((b) => b.name === "media" || b.id === "media")) {
    const { error } = await supabase.storage.createBucket("media", {
      public: true,
      fileSizeLimit: 10485760,
      allowedMimeTypes: [
        "image/jpeg",
        "image/png",
        "image/webp",
        "image/gif",
        "image/avif",
      ],
    });
    if (error) console.warn("createBucket:", error.message);
    else console.log("Created media bucket");
  } else {
    console.log("media bucket exists");
  }

  console.log("Done");
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
