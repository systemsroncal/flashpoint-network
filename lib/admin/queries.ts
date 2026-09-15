import { createAdminClient } from "@/lib/supabase/admin";
import type { Category, EventItem, Post, Profile, Tag } from "@/lib/types/cms";

const POST_SELECT = `
  id, title, slug, excerpt, body, status, category_id, author_id,
  featured_image_url, video_url, seo_title, seo_description, seo_keywords,
  og_title, og_description, og_image_url,
  is_featured, is_premium, is_video, is_podcast,
  reading_time_minutes, view_count, published_at, created_at, updated_at,
  category:categories ( id, name, slug, description, sort_order ),
  author:profiles ( id, email, full_name, first_name, last_name, role, avatar_url )
`;

function requireAdmin() {
  const client = createAdminClient();
  if (!client) throw new Error("Supabase admin client is not configured");
  return client;
}

function normalizePost(p: unknown): Post {
  const row = p as Post & {
    category?: Category | Category[] | null;
    author?: Profile | Profile[] | null;
  };
  return {
    ...(row as Post),
    category: Array.isArray(row.category) ? row.category[0] ?? null : row.category,
    author: Array.isArray(row.author) ? row.author[0] ?? null : row.author,
  };
}

export async function getAdminStats() {
  const supabase = requireAdmin();
  const [posts, published, events, categories, tags, users, views] =
    await Promise.all([
      supabase.from("posts").select("*", { count: "exact", head: true }),
      supabase
        .from("posts")
        .select("*", { count: "exact", head: true })
        .eq("status", "published"),
      supabase.from("events").select("*", { count: "exact", head: true }),
      supabase.from("categories").select("*", { count: "exact", head: true }),
      supabase.from("tags").select("*", { count: "exact", head: true }),
      supabase.from("profiles").select("*", { count: "exact", head: true }),
      supabase.from("posts").select("view_count"),
    ]);

  const totalViews = (views.data ?? []).reduce(
    (sum, row) => sum + (row.view_count ?? 0),
    0,
  );

  return {
    posts: posts.count ?? 0,
    published: published.count ?? 0,
    events: events.count ?? 0,
    categories: categories.count ?? 0,
    tags: tags.count ?? 0,
    users: users.count ?? 0,
    totalViews,
  };
}

export async function getAdminPosts(): Promise<Post[]> {
  const supabase = requireAdmin();
  const { data, error } = await supabase
    .from("posts")
    .select(POST_SELECT)
    .order("updated_at", { ascending: false });
  if (error) throw new Error(error.message);
  return ((data as unknown[]) ?? []).map(normalizePost);
}

export async function getAdminPost(id: string): Promise<Post | null> {
  const supabase = requireAdmin();
  const { data, error } = await supabase
    .from("posts")
    .select(POST_SELECT)
    .eq("id", id)
    .maybeSingle();
  if (error) throw new Error(error.message);
  return data ? normalizePost(data) : null;
}

export async function getAdminCategories(): Promise<Category[]> {
  const supabase = requireAdmin();
  const { data, error } = await supabase
    .from("categories")
    .select("id, name, slug, description, sort_order")
    .order("sort_order", { ascending: true });
  if (error) throw new Error(error.message);
  return (data as Category[]) ?? [];
}

export async function getAdminTags(): Promise<Tag[]> {
  const supabase = requireAdmin();
  const { data, error } = await supabase
    .from("tags")
    .select("id, name, slug")
    .order("name", { ascending: true });
  if (error) throw new Error(error.message);
  return (data as Tag[]) ?? [];
}

export async function getAdminEvents(): Promise<EventItem[]> {
  const supabase = requireAdmin();
  const { data, error } = await supabase
    .from("events")
    .select("*")
    .order("starts_at", { ascending: false });
  if (error) throw new Error(error.message);
  return (data as EventItem[]) ?? [];
}

export async function getAdminEvent(id: string): Promise<EventItem | null> {
  const supabase = requireAdmin();
  const { data, error } = await supabase
    .from("events")
    .select("*")
    .eq("id", id)
    .maybeSingle();
  if (error) throw new Error(error.message);
  return (data as EventItem) ?? null;
}

export async function getAdminProfiles(): Promise<Profile[]> {
  const supabase = requireAdmin();
  const { data, error } = await supabase
    .from("profiles")
    .select("id, email, full_name, first_name, last_name, role, avatar_url")
    .order("created_at", { ascending: false });
  if (error) throw new Error(error.message);
  return (data as Profile[]) ?? [];
}

export async function getAdminEmailTemplates() {
  const supabase = requireAdmin();
  const { data, error } = await supabase
    .from("email_templates")
    .select(
      "id, name, slug, subject, body_html, header_bg_color, footer_bg_color, logo_url, logo_align, max_width, updated_at",
    )
    .order("name", { ascending: true });
  if (error) throw new Error(error.message);
  return data ?? [];
}

export async function getAdminSettings() {
  const supabase = requireAdmin();
  const { data, error } = await supabase
    .from("site_settings")
    .select("key, value, updated_at")
    .order("key", { ascending: true });
  if (error) throw new Error(error.message);
  return data ?? [];
}

export async function getAdminMedia() {
  const supabase = requireAdmin();
  const { data, error } = await supabase
    .from("posts")
    .select("id, title, slug, featured_image_url, updated_at")
    .not("featured_image_url", "is", null)
    .order("updated_at", { ascending: false });
  if (error) throw new Error(error.message);
  return data ?? [];
}

export async function getRecentAdminPosts(limit = 8): Promise<Post[]> {
  const supabase = requireAdmin();
  const { data, error } = await supabase
    .from("posts")
    .select(POST_SELECT)
    .order("updated_at", { ascending: false })
    .limit(limit);
  if (error) throw new Error(error.message);
  return ((data as unknown[]) ?? []).map(normalizePost);
}
