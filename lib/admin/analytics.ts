import "server-only";

import { createAdminClient } from "@/lib/supabase/admin";

export type AnalyticsRange = 7 | 30;

export type DailyViewsPoint = {
  date: string; // YYYY-MM-DD
  label: string; // M/D
  views: number;
};

export type TopPostViews = {
  id: string;
  title: string;
  slug: string;
  views: number;
} | null;

export type AnalyticsOverview = {
  rangeDays: AnalyticsRange;
  totalViews: number;
  uniqueVisitors: number;
  topPost: TopPostViews;
  publishedPosts: number;
  performanceScore: number | null;
  daily: DailyViewsPoint[];
  insight: {
    text: string;
    highlight?: string;
    empty: boolean;
  };
  seeded: boolean;
};

type ViewRow = {
  post_id: string;
  viewer_id: string | null;
  viewer_ip: string | null;
  viewed_at: string;
};

function requireAdmin() {
  const client = createAdminClient();
  if (!client) throw new Error("Supabase admin client is not configured");
  return client;
}

function startOfUtcDay(d: Date) {
  return new Date(
    Date.UTC(d.getUTCFullYear(), d.getUTCMonth(), d.getUTCDate()),
  );
}

function formatDayKey(d: Date) {
  return d.toISOString().slice(0, 10);
}

function formatDayLabel(d: Date) {
  return `${d.getUTCMonth() + 1}/${d.getUTCDate()}`;
}

function weekdayName(d: Date) {
  return [
    "Sunday",
    "Monday",
    "Tuesday",
    "Wednesday",
    "Thursday",
    "Friday",
    "Saturday",
  ][d.getUTCDay()];
}

/**
 * If post_views is empty but posts have view_count, distribute a sample of
 * those views across the last 30 days so the dashboard has real-shaped data.
 */
export async function ensurePostViewsSeed(): Promise<boolean> {
  const supabase = requireAdmin();
  const { count } = await supabase
    .from("post_views")
    .select("*", { count: "exact", head: true });
  if ((count ?? 0) > 0) return false;

  const { data: posts, error } = await supabase
    .from("posts")
    .select("id, view_count")
    .eq("status", "published")
    .gt("view_count", 0)
    .order("view_count", { ascending: false })
    .limit(25);
  if (error) throw new Error(error.message);
  if (!posts?.length) return false;

  const rows: {
    post_id: string;
    viewer_ip: string;
    viewed_at: string;
  }[] = [];

  const now = Date.now();
  for (const post of posts) {
    // Cap seed volume so inserts stay small (~proportional to view_count).
    const samples = Math.min(
      120,
      Math.max(8, Math.round((post.view_count ?? 0) / 80)),
    );
    for (let i = 0; i < samples; i++) {
      const daysAgo = Math.floor(Math.random() * 30);
      const hour = Math.floor(Math.random() * 24);
      const minute = Math.floor(Math.random() * 60);
      const viewed = new Date(now - daysAgo * 86400000);
      viewed.setUTCHours(hour, minute, Math.floor(Math.random() * 60), 0);
      rows.push({
        post_id: post.id,
        viewer_ip: `seed-${post.id.slice(0, 8)}-${i}`,
        viewed_at: viewed.toISOString(),
      });
    }
  }

  // Insert in chunks
  for (let i = 0; i < rows.length; i += 200) {
    const chunk = rows.slice(i, i + 200);
    const { error: insertError } = await supabase
      .from("post_views")
      .insert(chunk);
    if (insertError) throw new Error(insertError.message);
  }

  return true;
}

function buildDailySeries(
  rows: ViewRow[],
  rangeDays: AnalyticsRange,
): DailyViewsPoint[] {
  const end = startOfUtcDay(new Date());
  const map = new Map<string, number>();
  for (let i = rangeDays - 1; i >= 0; i--) {
    const d = new Date(end.getTime() - i * 86400000);
    map.set(formatDayKey(d), 0);
  }
  for (const row of rows) {
    const key = row.viewed_at.slice(0, 10);
    if (map.has(key)) map.set(key, (map.get(key) ?? 0) + 1);
  }
  return [...map.entries()].map(([date, views]) => {
    const d = new Date(`${date}T00:00:00.000Z`);
    return { date, label: formatDayLabel(d), views };
  });
}

function computeInsight(daily: DailyViewsPoint[]): AnalyticsOverview["insight"] {
  if (!daily.length || daily.every((d) => d.views === 0)) {
    return {
      empty: true,
      text: "No view data in this range yet. Publish news and share links to start tracking performance.",
    };
  }

  const total = daily.reduce((s, d) => s + d.views, 0);
  const avg = total / daily.length;
  let best = daily[0];
  for (const d of daily) {
    if (d.views > best.views) best = d;
  }

  if (avg <= 0 || best.views <= 0) {
    return {
      empty: true,
      text: "No view data in this range yet. Publish news and share links to start tracking performance.",
    };
  }

  const lift = Math.round(((best.views - avg) / avg) * 100);
  const day = weekdayName(new Date(`${best.date}T00:00:00.000Z`));

  if (lift <= 5) {
    return {
      empty: false,
      text: `Traffic stayed steady across the period — about ${Math.round(avg)} views per day. Keep publishing to grow the trend.`,
    };
  }

  const highlight = `${lift}%`;
  return {
    empty: false,
    highlight,
    text: `Your site visitors were up ${highlight} on ${day} compared to your typical day in this range — great work! Let's keep the momentum going.`,
  };
}

function performanceScore(
  totalViews: number,
  uniqueVisitors: number,
  publishedPosts: number,
): number | null {
  if (totalViews <= 0 && uniqueVisitors <= 0) return null;
  // Simple 0–100 score from volume + engagement mix.
  const volume = Math.min(70, Math.round(Math.log10(totalViews + 1) * 28));
  const uniqueness =
    totalViews > 0
      ? Math.min(20, Math.round((uniqueVisitors / totalViews) * 40))
      : 0;
  const catalog = Math.min(10, publishedPosts);
  return Math.min(100, volume + uniqueness + catalog);
}

export async function getAnalyticsOverview(
  rangeDays: AnalyticsRange = 30,
): Promise<AnalyticsOverview> {
  const supabase = requireAdmin();
  const seeded = await ensurePostViewsSeed();

  const since = new Date();
  since.setUTCDate(since.getUTCDate() - (rangeDays - 1));
  since.setUTCHours(0, 0, 0, 0);

  const [{ data: views, error: viewsError }, published] = await Promise.all([
    supabase
      .from("post_views")
      .select("post_id, viewer_id, viewer_ip, viewed_at")
      .gte("viewed_at", since.toISOString())
      .order("viewed_at", { ascending: true }),
    supabase
      .from("posts")
      .select("*", { count: "exact", head: true })
      .eq("status", "published"),
  ]);

  if (viewsError) throw new Error(viewsError.message);

  const rows = (views ?? []) as ViewRow[];
  const totalViews = rows.length;

  const uniqueKeys = new Set<string>();
  for (const row of rows) {
    if (row.viewer_id) uniqueKeys.add(`u:${row.viewer_id}`);
    else if (row.viewer_ip) uniqueKeys.add(`ip:${row.viewer_ip}`);
    else uniqueKeys.add(`anon:${row.viewed_at}:${row.post_id}`);
  }
  const uniqueVisitors = uniqueKeys.size;

  const byPost = new Map<string, number>();
  for (const row of rows) {
    byPost.set(row.post_id, (byPost.get(row.post_id) ?? 0) + 1);
  }

  let topPostId: string | null = null;
  let topViews = 0;
  for (const [id, count] of byPost) {
    if (count > topViews) {
      topPostId = id;
      topViews = count;
    }
  }

  let topPost: TopPostViews = null;
  if (topPostId) {
    const { data: post } = await supabase
      .from("posts")
      .select("id, title, slug")
      .eq("id", topPostId)
      .maybeSingle();
    if (post) {
      topPost = {
        id: post.id,
        title: post.title,
        slug: post.slug,
        views: topViews,
      };
    }
  }

  const daily = buildDailySeries(rows, rangeDays);
  const publishedPosts = published.count ?? 0;
  const score = performanceScore(totalViews, uniqueVisitors, publishedPosts);

  return {
    rangeDays,
    totalViews,
    uniqueVisitors,
    topPost,
    publishedPosts,
    performanceScore: score,
    daily,
    insight: computeInsight(daily),
    seeded,
  };
}
