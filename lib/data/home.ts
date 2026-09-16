import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import type { Category, EventItem, HomePayload, Post } from "@/lib/types/cms";

const POST_SELECT = `
  id, title, slug, excerpt, body, status, category_id, author_id,
  featured_image_url, video_url, seo_title, seo_description, seo_keywords,
  og_title, og_description, og_image_url,
  is_featured, is_premium, is_video, is_podcast,
  reading_time_minutes, view_count, published_at,
  category:categories ( id, name, slug, description, sort_order ),
  author:profiles ( id, email, full_name, first_name, last_name, role, avatar_url )
`;

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

export async function getHomePayload(): Promise<HomePayload> {
  const empty: HomePayload = {
    categories: [],
    liveEvent: null,
    tickerEvents: [],
    featured: null,
    secondary: [],
    podcasts: [],
    grid: [],
    latest: [],
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
    featuredRes,
    publishedRes,
    podcastsRes,
    mustWatchRes,
    electionsRes,
    exclusivesRes,
    popularRes,
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
      .limit(30),
    supabase
      .from("posts")
      .select(POST_SELECT)
      .eq("status", "published")
      .eq("is_featured", true)
      .order("published_at", { ascending: false })
      .limit(1),
    supabase
      .from("posts")
      .select(POST_SELECT)
      .eq("status", "published")
      .eq("is_podcast", false)
      .eq("is_video", false)
      .eq("is_premium", false)
      .order("published_at", { ascending: false })
      .limit(16),
    supabase
      .from("posts")
      .select(POST_SELECT)
      .eq("status", "published")
      .eq("is_podcast", true)
      .order("published_at", { ascending: false })
      .limit(4),
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
      .eq("category_id", "b1000000-0000-4000-8000-00000000000a")
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
      .order("view_count", { ascending: false })
      .limit(5),
  ]);

  const featured = asPosts(featuredRes.data)[0] ?? null;
  const published = asPosts(publishedRes.data).filter((p) => p.id !== featured?.id);

  return {
    categories: (categoriesRes.data as Category[]) ?? [],
    liveEvent: ((eventsRes.data as EventItem[]) ?? [])[0] ?? null,
    tickerEvents: (tickerEventsRes.data as EventItem[]) ?? [],
    featured,
    secondary: published.slice(0, 2),
    podcasts: asPosts(podcastsRes.data),
    grid: published.slice(2, 8),
    latest: published.slice(0, 4),
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
    .order("published_at", { ascending: false })
    .limit(5);
  if (excludeId) latestQ = latestQ.neq("id", excludeId);

  const [latestRes, podcastsRes, popularRes, neighborsRes] = await Promise.all([
    latestQ,
    supabase
      .from("posts")
      .select(POST_SELECT)
      .eq("status", "published")
      .eq("is_podcast", true)
      .order("published_at", { ascending: false })
      .limit(4),
    supabase
      .from("posts")
      .select(POST_SELECT)
      .eq("status", "published")
      .order("view_count", { ascending: false })
      .limit(3),
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
    podcasts: asPosts(podcastsRes.data),
    popular: asPosts(popularRes.data).filter((p) => p.id !== excludeId).slice(0, 3),
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
