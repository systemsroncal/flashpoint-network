import { createAdminClient } from "@/lib/supabase/admin";
import type {
  Category,
  ClassicProgram,
  ClassicProgramsSortMode,
  EventItem,
  MinistryProgram,
  MinistryProgramsSortMode,
  Post,
  Profile,
  ScheduleDisplayMode,
  ScheduleLayoutTemplate,
  ScheduleEntry,
  SchedulePdf,
  Tag,
} from "@/lib/types/cms";

const POST_SELECT = `
  id, title, slug, excerpt, body, status, category_id, author_id,
  featured_image_url, video_url, seo_title, seo_description, seo_keywords,
  og_title, og_description, og_image_url,
  is_featured, is_premium, is_video, is_podcast, is_popular,
  show_featured_image,
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
  const result = await getAdminPostsPage({});
  return result.posts;
}

export type AdminPostsQuery = {
  q?: string;
  categoryId?: string;
  tagId?: string;
  page?: number;
  pageSize?: number;
};

export type AdminPostsPageResult = {
  posts: Post[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
};

const DEFAULT_PAGE_SIZE = 20;

export async function getAdminPostsPage(
  query: AdminPostsQuery = {},
): Promise<AdminPostsPageResult> {
  const supabase = requireAdmin();
  const pageSize = Math.min(Math.max(query.pageSize ?? DEFAULT_PAGE_SIZE, 5), 100);
  const page = Math.max(query.page ?? 1, 1);
  const q = (query.q ?? "").trim();
  const categoryId = (query.categoryId ?? "").trim();
  const tagId = (query.tagId ?? "").trim();

  let postIdFilter: string[] | null = null;
  if (tagId) {
    const { data: links, error: tagErr } = await supabase
      .from("post_tags")
      .select("post_id")
      .eq("tag_id", tagId);
    if (tagErr) throw new Error(tagErr.message);
    postIdFilter = (links ?? []).map((row) => row.post_id as string);
    if (postIdFilter.length === 0) {
      return { posts: [], total: 0, page, pageSize, totalPages: 0 };
    }
  }

  // Sort by publish time (same as home). Do not use updated_at — edits would
  // reshuffle the News list even when published_at is unchanged.
  let builder = supabase
    .from("posts")
    .select(POST_SELECT, { count: "exact" })
    .order("published_at", { ascending: false, nullsFirst: false });

  if (categoryId) {
    builder = builder.eq("category_id", categoryId);
  }
  if (postIdFilter) {
    builder = builder.in("id", postIdFilter);
  }
  if (q) {
    const safe = q.replace(/[%_",]/g, "").slice(0, 120).trim();
    if (safe) {
      const pattern = `%${safe}%`;
      // Quoted values so spaces don't break PostgREST `or`
      builder = builder.or(
        `title.ilike."${pattern}",slug.ilike."${pattern}",excerpt.ilike."${pattern}",body.ilike."${pattern}"`,
      );
    }
  }

  const from = (page - 1) * pageSize;
  const to = from + pageSize - 1;
  const { data, error, count } = await builder.range(from, to);
  if (error) throw new Error(error.message);

  const total = count ?? 0;
  return {
    posts: ((data as unknown[]) ?? []).map(normalizePost),
    total,
    page,
    pageSize,
    totalPages: total === 0 ? 0 : Math.ceil(total / pageSize),
  };
}

/** True when slug is free (or belongs to excludeId). */
export async function isAdminPostSlugAvailable(
  slug: string,
  excludeId?: string | null,
): Promise<boolean> {
  const normalized = slug.trim();
  if (!normalized) return false;
  const supabase = requireAdmin();
  let q = supabase.from("posts").select("id").eq("slug", normalized).limit(1);
  if (excludeId) q = q.neq("id", excludeId);
  const { data, error } = await q.maybeSingle();
  if (error && error.code !== "PGRST116") throw new Error(error.message);
  return !data;
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

export async function getAdminPostTagIds(postId: string): Promise<string[]> {
  const supabase = requireAdmin();
  const { data, error } = await supabase
    .from("post_tags")
    .select("tag_id")
    .eq("post_id", postId);
  if (error) throw new Error(error.message);
  return (data ?? []).map((row) => row.tag_id as string);
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

const CLASSIC_SELECT =
  "id, title, slug, excerpt, description, body, featured_image_url, external_url, schedule_note, genre, genres_label, schedule_line, sort_order, status, source_url, created_at, updated_at";

const MINISTRY_SELECT =
  "id, title, slug, excerpt, description, body, featured_image_url, external_url, schedule_note, sort_order, status, source_url, created_at, updated_at";

export async function getAdminClassicPrograms(): Promise<ClassicProgram[]> {
  const supabase = requireAdmin();
  const { data, error } = await supabase
    .from("classic_programs")
    .select(CLASSIC_SELECT)
    .order("sort_order", { ascending: true })
    .order("title", { ascending: true });
  if (error) throw new Error(error.message);
  return (data as ClassicProgram[]) ?? [];
}

export async function getAdminClassicProgram(
  id: string,
): Promise<ClassicProgram | null> {
  const supabase = requireAdmin();
  const { data, error } = await supabase
    .from("classic_programs")
    .select(CLASSIC_SELECT)
    .eq("id", id)
    .maybeSingle();
  if (error) throw new Error(error.message);
  return (data as ClassicProgram) ?? null;
}

export async function getClassicProgramsSortMode(): Promise<ClassicProgramsSortMode> {
  const supabase = requireAdmin();
  const { data } = await supabase
    .from("site_settings")
    .select("value")
    .eq("key", "classic_programs_sort")
    .maybeSingle();
  const raw = data?.value;
  const mode = typeof raw === "string" ? raw : String(raw ?? "manual").replace(/"/g, "");
  if (["manual", "a_z", "z_a", "random", "newest"].includes(mode)) {
    return mode as ClassicProgramsSortMode;
  }
  return "manual";
}

export async function getAdminMinistryPrograms(): Promise<MinistryProgram[]> {
  const supabase = requireAdmin();
  const { data, error } = await supabase
    .from("ministry_programs")
    .select(MINISTRY_SELECT)
    .order("sort_order", { ascending: true })
    .order("title", { ascending: true });
  if (error) throw new Error(error.message);
  return (data as MinistryProgram[]) ?? [];
}

export async function getAdminMinistryProgram(
  id: string,
): Promise<MinistryProgram | null> {
  const supabase = requireAdmin();
  const { data, error } = await supabase
    .from("ministry_programs")
    .select(MINISTRY_SELECT)
    .eq("id", id)
    .maybeSingle();
  if (error) throw new Error(error.message);
  return (data as MinistryProgram) ?? null;
}

export async function getMinistryProgramsSortMode(): Promise<MinistryProgramsSortMode> {
  const supabase = requireAdmin();
  const { data } = await supabase
    .from("site_settings")
    .select("value")
    .eq("key", "ministry_programs_sort")
    .maybeSingle();
  const raw = data?.value;
  const mode = typeof raw === "string" ? raw : String(raw ?? "manual").replace(/"/g, "");
  if (["manual", "a_z", "z_a", "random", "newest"].includes(mode)) {
    return mode as MinistryProgramsSortMode;
  }
  return "manual";
}

export async function getAdminScheduleEntries(
  year: number,
  month: number,
): Promise<ScheduleEntry[]> {
  const supabase = requireAdmin();
  const from = `${year}-${String(month).padStart(2, "0")}-01`;
  const lastDay = new Date(year, month, 0).getDate();
  const to = `${year}-${String(month).padStart(2, "0")}-${String(lastDay).padStart(2, "0")}`;
  const { data, error } = await supabase
    .from("schedule_entries")
    .select(
      "id, air_date, start_time, end_time, title, description, category, color, created_at, updated_at",
    )
    .gte("air_date", from)
    .lte("air_date", to)
    .order("air_date", { ascending: true })
    .order("start_time", { ascending: true });
  if (error) throw new Error(error.message);
  return (data as ScheduleEntry[]) ?? [];
}

export async function getAdminScheduleEntry(
  id: string,
): Promise<ScheduleEntry | null> {
  const supabase = requireAdmin();
  const { data, error } = await supabase
    .from("schedule_entries")
    .select(
      "id, air_date, start_time, end_time, title, description, category, color, created_at, updated_at",
    )
    .eq("id", id)
    .maybeSingle();
  if (error) throw new Error(error.message);
  return (data as ScheduleEntry) ?? null;
}

export async function getAdminSchedulePdf(
  year: number,
  month: number,
): Promise<SchedulePdf | null> {
  const supabase = requireAdmin();
  const { data } = await supabase
    .from("schedule_pdfs")
    .select("id, year, month, title, pdf_url, created_at, updated_at")
    .eq("year", year)
    .eq("month", month)
    .maybeSingle();
  return (data as SchedulePdf) ?? null;
}

export async function getAdminScheduleDisplayMode(): Promise<ScheduleDisplayMode> {
  const supabase = requireAdmin();
  const { data } = await supabase
    .from("site_settings")
    .select("value")
    .eq("key", "schedule_display_mode")
    .maybeSingle();
  const raw = data?.value;
  const mode =
    typeof raw === "string" ? raw.replace(/^"|"$/g, "") : String(raw ?? "dynamic").replace(/"/g, "");
  if (mode === "pdf" || mode === "both" || mode === "dynamic") {
    return mode;
  }
  return "dynamic";
}

export async function getAdminScheduleLayoutTemplate(): Promise<ScheduleLayoutTemplate> {
  const supabase = requireAdmin();
  const { data } = await supabase
    .from("site_settings")
    .select("value")
    .eq("key", "schedule_layout_template")
    .maybeSingle();
  const raw = data?.value;
  const mode =
    typeof raw === "string"
      ? raw.replace(/^"|"$/g, "")
      : String(raw ?? "template_1").replace(/"/g, "");
  return mode === "template_2" ? "template_2" : "template_1";
}
