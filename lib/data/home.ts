import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { pickNextUpcomingEvent } from "@/lib/events/upcoming";
import type { Category, EventItem, HomePayload, Post } from "@/lib/types/cms";

const POST_SELECT = `
  id, title, slug, excerpt, body, status, category_id, author_id,
  featured_image_url, video_url, seo_title, seo_description, seo_keywords,
  og_title, og_description, og_image_url,
  is_featured, is_premium, is_video, is_podcast, is_popular,
  show_featured_image, home_first_slot,
  reading_time_minutes, view_count, published_at,
  category:categories ( id, name, slug, description, sort_order ),
  author:profiles ( id, email, full_name, first_name, last_name, role, avatar_url )
`;

const POLITICS_ID = "b1000000-0000-4000-8000-000000000002";
const WORLD_ID = "b1000000-0000-4000-8000-000000000003";
const ELECTIONS_ID = "b1000000-0000-4000-8000-00000000000a";

/** Home / feed rail “Beyond the Broadcast”. Accepts old slug while the tag is renamed. */
export const BROADCAST_TAG_SLUGS = ["broadcast", "podcast"] as const;

type DbClient = NonNullable<Awaited<ReturnType<typeof db>>>;

async function getPostIdsByTagSlugs(
  supabase: DbClient,
  slugs: readonly string[],
): Promise<string[]> {
  const { data: tags } = await supabase
    .from("tags")
    .select("id")
    .in("slug", [...slugs]);
  const tagIds = (tags ?? []).map((row) => row.id as string);
  if (tagIds.length === 0) return [];
  const { data: links } = await supabase
    .from("post_tags")
    .select("post_id")
    .in("tag_id", tagIds);
  return [...new Set((links ?? []).map((row) => row.post_id as string))];
}

async function getBroadcastPosts(
  supabase: DbClient,
  limit: number,
): Promise<Post[]> {
  const taggedIds = await getPostIdsByTagSlugs(supabase, BROADCAST_TAG_SLUGS);
  if (taggedIds.length > 0) {
    const { data } = await supabase
      .from("posts")
      .select(POST_SELECT)
      .eq("status", "published")
      .in("id", taggedIds)
      .order("published_at", { ascending: false })
      .limit(limit);
    return asPosts(data);
  }
  const { data } = await supabase
    .from("posts")
    .select(POST_SELECT)
    .eq("status", "published")
    .eq("is_podcast", true)
    .order("published_at", { ascending: false })
    .limit(limit);
  return asPosts(data);
}

async function db() {
  return (await createClient()) ?? createAdminClient();
}

function asPosts(data: unknown): Post[] {
  return ((data as Post[]) ?? []).map((p) => ({
    ...p,
    category: Array.isArray(p.category) ? p.category[0] ?? null : p.category,
    author: Array.isArray(p.author) ? p.author[0] ?? null : p.author,
  }));
}

export type FeedKind =
  | "latest"
  | "podcasts"
  | "videos"
  | "premium"
  | "popular";

export async function getFeedPosts(
  kind: FeedKind,
  limit = 40,
): Promise<Post[]> {
  const supabase = await db();
  if (!supabase) return [];

  let q = supabase
    .from("posts")
    .select(POST_SELECT)
    .eq("status", "published")
    .order("published_at", { ascending: false })
    .limit(limit);

  if (kind === "podcasts") return getBroadcastPosts(supabase, limit);
  if (kind === "videos") q = q.eq("is_video", true);
  else if (kind === "premium") q = q.eq("is_premium", true);
  else if (kind === "popular") q = q.eq("is_popular", true);
  else {
    // latest: regular news feed (exclude podcast/video rails)
    q = q.eq("is_podcast", false).eq("is_video", false);
  }

  const { data } = await q;
  return asPosts(data);
}

export async function getHomePayload(): Promise<HomePayload> {
  const empty: HomePayload = {
    categories: [],
    liveEvent: null,
    tickerEvents: [],
    nextUpcomingEvent: null,
    featured: null,
    secondary: [],
    podcasts: [],
    grid: [],
    latest: [],
    politics: [],
    world: [],
    mustWatch: [],
    elections: [],
    exclusives: [],
    popular: [],
  };

  const supabase = await db();
  if (!supabase) return empty;

  const [
    categoriesRes,
    eventsRes,
    tickerEventsRes,
    latestPoolRes,
    firstSectionRes,
    podcasts,
    mustWatchRes,
    electionsRes,
    exclusivesRes,
    popularRes,
    politicsRes,
    worldRes,
  ] = await Promise.all([
    supabase
      .from("categories")
      .select("id, name, slug, description, sort_order")
      .order("sort_order", { ascending: true }),
    supabase
      .from("events")
      .select("*")
      .eq("show_on_home", true)
      .order("is_live", { ascending: false })
      .order("starts_at", { ascending: false })
      .limit(1),
    supabase
      .from("events")
      .select("*")
      .order("is_live", { ascending: false })
      .order("starts_at", { ascending: true })
      .limit(40),
    // Truly latest news pool (~12 so we can fill empty First Section slots + Latest rail)
    supabase
      .from("posts")
      .select(POST_SELECT)
      .eq("status", "published")
      .eq("is_podcast", false)
      .eq("is_video", false)
      .order("published_at", { ascending: false })
      .limit(12),
    // Explicit First Section pins (1 large + 2 stacked)
    supabase
      .from("posts")
      .select(POST_SELECT)
      .eq("status", "published")
      .in("home_first_slot", [1, 2, 3])
      .order("home_first_slot", { ascending: true }),
    getBroadcastPosts(supabase, 4),
    supabase
      .from("posts")
      .select(POST_SELECT)
      .eq("status", "published")
      .eq("is_video", true)
      .order("published_at", { ascending: false })
      .limit(5),
    supabase
      .from("posts")
      .select(POST_SELECT)
      .eq("status", "published")
      .eq("category_id", ELECTIONS_ID)
      .order("published_at", { ascending: false })
      .limit(8),
    supabase
      .from("posts")
      .select(POST_SELECT)
      .eq("status", "published")
      .eq("is_premium", true)
      .order("published_at", { ascending: false })
      .limit(9),
    supabase
      .from("posts")
      .select(POST_SELECT)
      .eq("status", "published")
      .eq("is_popular", true)
      .order("published_at", { ascending: false })
      .limit(5),
    supabase
      .from("posts")
      .select(POST_SELECT)
      .eq("status", "published")
      .eq("category_id", POLITICS_ID)
      .eq("is_podcast", false)
      .eq("is_video", false)
      .order("published_at", { ascending: false })
      .limit(8),
    supabase
      .from("posts")
      .select(POST_SELECT)
      .eq("status", "published")
      .eq("category_id", WORLD_ID)
      .eq("is_podcast", false)
      .eq("is_video", false)
      .order("published_at", { ascending: false })
      .limit(8),
  ]);

  const latestPool = asPosts(latestPoolRes.data);
  const pinned = asPosts(firstSectionRes.data);
  const bySlot = new Map<number, (typeof pinned)[number]>();
  for (const p of pinned) {
    const slot = p.home_first_slot;
    if (slot === 1 || slot === 2 || slot === 3) bySlot.set(slot, p);
  }

  // First Section: slot 1 = large left, 2–3 = stacked. Empty slots fall back to Latest chronology.
  const usedIds = new Set<string>();
  const takeChrono = () => {
    const next = latestPool.find((p) => !usedIds.has(p.id));
    if (next) usedIds.add(next.id);
    return next ?? null;
  };

  const featured =
    (bySlot.get(1) ? (usedIds.add(bySlot.get(1)!.id), bySlot.get(1)!) : null) ??
    takeChrono();
  const secondary: typeof pinned = [];
  for (const slot of [2, 3] as const) {
    const pinnedPost = bySlot.get(slot);
    if (pinnedPost) {
      usedIds.add(pinnedPost.id);
      secondary.push(pinnedPost);
    } else {
      const fill = takeChrono();
      if (fill) secondary.push(fill);
    }
  }

  // Latest rail + Politics/World exclude First Section pins/fills.
  // Second band under hero: exactly 3 Politics + 3 World by category (not Latest mix).
  const usedInTop = usedIds;
  const politics = asPosts(politicsRes.data)
    .filter((p) => !usedInTop.has(p.id))
    .slice(0, 3);
  const world = asPosts(worldRes.data)
    .filter((p) => !usedInTop.has(p.id))
    .slice(0, 3);
  const latestRail = latestPool.filter((p) => !usedInTop.has(p.id)).slice(0, 4);

  const tickerEvents = (tickerEventsRes.data as EventItem[]) ?? [];
  const nextUpcomingEvent = pickNextUpcomingEvent(tickerEvents, new Date());

  return {
    categories: (categoriesRes.data as Category[]) ?? [],
    liveEvent: ((eventsRes.data as EventItem[]) ?? [])[0] ?? null,
    tickerEvents,
    nextUpcomingEvent,
    featured,
    secondary,
    podcasts,
    grid: [...politics, ...world],
    latest: latestRail,
    politics,
    world,
    mustWatch: asPosts(mustWatchRes.data),
    elections: asPosts(electionsRes.data),
    exclusives: asPosts(exclusivesRes.data),
    popular: asPosts(popularRes.data),
  };
}

export async function getPostBySlug(slug: string): Promise<Post | null> {
  const supabase = await db();
  if (!supabase) return null;
  const { data } = await supabase
    .from("posts")
    .select(POST_SELECT)
    .eq("slug", slug)
    .eq("status", "published")
    .maybeSingle();
  return asPosts(data ? [data] : [])[0] ?? null;
}

/** Case-insensitive title/excerpt search for published posts. */
export async function searchPosts(query: string, limit = 40): Promise<Post[]> {
  const q = query.trim().slice(0, 120);
  if (!q) return [];
  const supabase = await db();
  if (!supabase) return [];

  const pattern = `%${q.replace(/[%_]/g, "")}%`;
  if (pattern === "%%") return [];

  const [titleRes, excerptRes] = await Promise.all([
    supabase
      .from("posts")
      .select(POST_SELECT)
      .eq("status", "published")
      .ilike("title", pattern)
      .order("published_at", { ascending: false })
      .limit(limit),
    supabase
      .from("posts")
      .select(POST_SELECT)
      .eq("status", "published")
      .ilike("excerpt", pattern)
      .order("published_at", { ascending: false })
      .limit(limit),
  ]);

  const byId = new Map<string, Post>();
  for (const post of [...asPosts(titleRes.data), ...asPosts(excerptRes.data)]) {
    byId.set(post.id, post);
  }
  return Array.from(byId.values())
    .sort((a, b) => {
      const ta = a.published_at ? Date.parse(a.published_at) : 0;
      const tb = b.published_at ? Date.parse(b.published_at) : 0;
      return tb - ta;
    })
    .slice(0, limit);
}

export async function getArticleSidebar(excludeId?: string): Promise<{
  latest: Post[];
  podcasts: Post[];
  popular: Post[];
  previous: Post | null;
  next: Post | null;
}> {
  const empty = {
    latest: [] as Post[],
    podcasts: [] as Post[],
    popular: [] as Post[],
    previous: null as Post | null,
    next: null as Post | null,
  };
  const supabase = await db();
  if (!supabase) return empty;

  let latestQ = supabase
    .from("posts")
    .select(POST_SELECT)
    .eq("status", "published")
    .eq("is_podcast", false)
    .eq("is_video", false)
    .order("published_at", { ascending: false })
    .limit(5);
  if (excludeId) latestQ = latestQ.neq("id", excludeId);

  const [latestRes, podcasts, popularRes, neighborsRes] = await Promise.all([
    latestQ,
    getBroadcastPosts(supabase, 4),
    supabase
      .from("posts")
      .select(POST_SELECT)
      .eq("status", "published")
      .eq("is_popular", true)
      .order("published_at", { ascending: false })
      .limit(5),
    excludeId
      ? supabase
          .from("posts")
          .select(POST_SELECT)
          .eq("status", "published")
          .order("published_at", { ascending: false })
          .limit(40)
      : Promise.resolve({ data: [] }),
  ]);

  const neighbors = asPosts(neighborsRes.data);
  const idx = excludeId ? neighbors.findIndex((p) => p.id === excludeId) : -1;
  const previous = idx > 0 ? neighbors[idx - 1] : null;
  const next = idx >= 0 && idx < neighbors.length - 1 ? neighbors[idx + 1] : null;

  return {
    latest: asPosts(latestRes.data).slice(0, 4),
    podcasts,
    popular: asPosts(popularRes.data).filter((p) => p.id !== excludeId).slice(0, 5),
    previous,
    next,
  };
}

export async function getEventBySlug(slug: string): Promise<EventItem | null> {
  const supabase = await db();
  if (!supabase) return null;
  const { data } = await supabase
    .from("events")
    .select("*")
    .eq("slug", slug)
    .maybeSingle();
  return (data as EventItem) ?? null;
}

export async function getPublicEvents(limit = 40): Promise<EventItem[]> {
  const supabase = await db();
  if (!supabase) return [];
  const { data } = await supabase
    .from("events")
    .select("*")
    .order("is_live", { ascending: false })
    .order("starts_at", { ascending: false })
    .limit(limit);
  return (data as EventItem[]) ?? [];
}

export async function getNavCategories(): Promise<Category[]> {
  const supabase = await db();
  if (!supabase) return [];
  const { data } = await supabase
    .from("categories")
    .select("id, name, slug, description, sort_order")
    .order("sort_order", { ascending: true });
  return (data as Category[]) ?? [];
}

/** Top categories by published post count (for mobile menu). */
export async function getTopCategoriesByPostCount(
  limit = 5,
): Promise<Category[]> {
  const supabase = await db();
  if (!supabase) return [];

  const { data: categories } = await supabase
    .from("categories")
    .select("id, name, slug, description, sort_order");

  const rows = (categories as Category[]) ?? [];
  if (rows.length === 0) return [];

  const { data: posts } = await supabase
    .from("posts")
    .select("category_id")
    .eq("status", "published");

  const counts = new Map<string, number>();
  for (const row of posts ?? []) {
    const id = row.category_id as string | null;
    if (!id) continue;
    counts.set(id, (counts.get(id) ?? 0) + 1);
  }

  return rows
    .filter((c) => c.slug !== "video")
    .sort((a, b) => (counts.get(b.id) ?? 0) - (counts.get(a.id) ?? 0))
    .slice(0, limit);
}

export async function getCategoryBySlug(slug: string): Promise<Category | null> {
  const supabase = await db();
  if (!supabase) return null;
  const { data } = await supabase
    .from("categories")
    .select("id, name, slug, description, sort_order")
    .eq("slug", slug)
    .maybeSingle();
  return (data as Category) ?? null;
}

export async function getPostsByCategorySlug(
  slug: string,
  limit = 24,
): Promise<Post[]> {
  const supabase = await db();
  if (!supabase) return [];
  const category = await getCategoryBySlug(slug);
  if (!category) return [];
  const { data } = await supabase
    .from("posts")
    .select(POST_SELECT)
    .eq("status", "published")
    .eq("category_id", category.id)
    .order("published_at", { ascending: false })
    .limit(limit);
  return asPosts(data);
}

/** @deprecated use getNavCategories */
export const getNavCategoriesAlias = getNavCategories;
