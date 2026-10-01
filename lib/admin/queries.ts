import { createAdminClient } from "@/lib/supabase/admin";
import { isMissingRelationError } from "@/lib/admin/form-submissions-db";
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
  HelpCenterSubmission,
  AdvertiseInquiry,
} from "@/lib/types/cms";

const POST_SELECT = `
  id, title, slug, excerpt, body, status, category_id, author_id,
  featured_image_url, video_url, seo_title, seo_description, seo_keywords,
  og_title, og_description, og_image_url,
  is_featured, is_premium, is_video, is_podcast, is_popular,
  show_featured_image, home_first_slot,
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
  const [posts, published, events, categories, tags, users, views, helpCenter, advertise] =
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
      supabase
        .from("help_center_submissions")
        .select("*", { count: "exact", head: true }),
      supabase
        .from("advertise_inquiries")
        .select("*", { count: "exact", head: true }),
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
    helpCenterSubmissions: helpCenter.error ? 0 : (helpCenter.count ?? 0),
    advertiseInquiries: advertise.error ? 0 : (advertise.count ?? 0),
  };
}

function normalizeHelpCenterRow(row: unknown): HelpCenterSubmission {
  const r = row as HelpCenterSubmission & { attachment_paths?: unknown };
  const paths = Array.isArray(r.attachment_paths)
    ? r.attachment_paths.filter((p): p is string => typeof p === "string")
    : [];
  return { ...r, attachment_paths: paths };
}

export async function getAdminHelpCenterSubmissions(): Promise<
  HelpCenterSubmission[]
> {
  const supabase = requireAdmin();
  const { data, error } = await supabase
    .from("help_center_submissions")
    .select(
      "id, created_at, email, help_area, journalism_issue, subject, description, attachment_paths, read_at",
    )
    .order("created_at", { ascending: false });
  if (error) {
    if (isMissingRelationError(error.message)) return [];
    console.error("[admin] help_center_submissions list", error.message);
    return [];
  }
  return (data ?? []).map(normalizeHelpCenterRow);
}

export async function getAdminFormSubmissionsSchemaReady(): Promise<{
  helpCenter: boolean;
  advertise: boolean;
}> {
  const supabase = requireAdmin();
  const [help, advertise] = await Promise.all([
    supabase
      .from("help_center_submissions")
      .select("id", { head: true, count: "exact" }),
    supabase
      .from("advertise_inquiries")
      .select("id", { head: true, count: "exact" }),
  ]);
  return {
    helpCenter: !help.error || !isMissingRelationError(help.error.message),
    advertise:
      !advertise.error || !isMissingRelationError(advertise.error.message),
  };
}

export async function getAdminSiteFormEntryCounts(): Promise<
  Record<string, number>
> {
  const supabase = requireAdmin();
  const [help, advertise] = await Promise.all([
    supabase
      .from("help_center_submissions")
      .select("*", { count: "exact", head: true }),
    supabase
      .from("advertise_inquiries")
      .select("*", { count: "exact", head: true }),
  ]);
  const helpCount =
    help.error && isMissingRelationError(help.error.message)
      ? 0
      : (help.count ?? 0);
  const advertiseCount =
    advertise.error && isMissingRelationError(advertise.error.message)
      ? 0
      : advertise.error
        ? 0
        : (advertise.count ?? 0);

  return {
    "help-center": helpCount,
    advertise: advertiseCount,
  };
}

export async function getAdminAdvertiseInquiries(): Promise<AdvertiseInquiry[]> {
  const supabase = requireAdmin();
  const { data, error } = await supabase
    .from("advertise_inquiries")
    .select(
      "id, created_at, company, name, email, phone, message, read_at",
    )
    .order("created_at", { ascending: false });
  if (error) {
    if (isMissingRelationError(error.message)) return [];
    console.error("[admin] advertise_inquiries list", error.message);
    return [];
  }
  return (data ?? []) as AdvertiseInquiry[];
}

export async function getAdminAdvertiseInquiry(
  id: string,
): Promise<AdvertiseInquiry | null> {
  const supabase = requireAdmin();
  const { data, error } = await supabase
    .from("advertise_inquiries")
    .select(
      "id, created_at, company, name, email, phone, message, read_at",
    )
    .eq("id", id)
    .maybeSingle();
  if (error) {
    if (isMissingRelationError(error.message)) return null;
    console.error("[admin] advertise_inquiries detail", error.message);
    return null;
  }
  return (data as AdvertiseInquiry | null) ?? null;
}

export async function getAdminHelpCenterSubmission(
  id: string,
): Promise<HelpCenterSubmission | null> {
  const supabase = requireAdmin();
  const { data, error } = await supabase
    .from("help_center_submissions")
    .select(
      "id, created_at, email, help_area, journalism_issue, subject, description, attachment_paths, read_at",
    )
    .eq("id", id)
    .maybeSingle();
  if (error) {
    if (isMissingRelationError(error.message)) return null;
    console.error("[admin] help_center_submissions detail", error.message);
    return null;
  }
  if (!data) return null;
  return normalizeHelpCenterRow(data);
}

export async function getAdminPosts(): Promise<Post[]> {
  const result = await getAdminPostsPage({});
  return result.posts;
}

export type AdminPostsQuery = {
  q?: string;
  categoryId?: string;
  tagId?: string;
  /** draft | scheduled | draft_scheduled */
  status?: string;
  page?: number;
  pageSize?: number;
};

const ADMIN_POSTS_SORT_CAP = 3000;

function isDraftishStatus(status: string) {
  return status === "draft" || status === "scheduled";
}

/** News admin list: drafts/scheduled first, then home slots 1–3, then publish date. */
export function compareAdminPosts(a: Post, b: Post): number {
  const aDraft = isDraftishStatus(a.status);
  const bDraft = isDraftishStatus(b.status);
  if (aDraft && !bDraft) return -1;
  if (!aDraft && bDraft) return 1;
  if (aDraft && bDraft) {
    const ta = new Date(a.updated_at || 0).getTime();
    const tb = new Date(b.updated_at || 0).getTime();
    return tb - ta;
  }

  const slotRank = (slot: number | null | undefined) => {
    if (slot === 1) return 0;
    if (slot === 2) return 1;
    if (slot === 3) return 2;
    return 3;
  };
  const sa = slotRank(a.home_first_slot);
  const sb = slotRank(b.home_first_slot);
  if (sa !== sb) return sa - sb;

  const ta = new Date(a.published_at || a.updated_at || 0).getTime();
  const tb = new Date(b.published_at || b.updated_at || 0).getTime();
  return tb - ta;
}

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
  const statusFilter = (query.status ?? "").trim();

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

  let builder = supabase.from("posts").select(POST_SELECT, { count: "exact" });

  if (statusFilter === "draft") {
    builder = builder.eq("status", "draft");
  } else if (statusFilter === "scheduled") {
    builder = builder.eq("status", "scheduled");
  } else if (statusFilter === "draft_scheduled") {
    builder = builder.in("status", ["draft", "scheduled"]);
  }

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

  const { data, error, count } = await builder.limit(ADMIN_POSTS_SORT_CAP);
  if (error) throw new Error(error.message);

  const total = count ?? 0;
  const all = ((data as unknown[]) ?? []).map(normalizePost).sort(compareAdminPosts);
  const from = (page - 1) * pageSize;
  const posts = all.slice(from, from + pageSize);

  return {
    posts,
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
    .select("id, name, slug, description, sort_order, parent_id")
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

export async function getAdminBannerWidgets() {
  const supabase = requireAdmin();
  const { data, error } = await supabase
    .from("banner_widgets")
    .select(
      "id, slot, label, desktop_image_url, mobile_image_url, href, open_in_new_tab, enabled, sort_order, created_at, updated_at",
    )
    .order("sort_order", { ascending: true });
  if (error) throw new Error(error.message);
  return data ?? [];
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
  "id, title, slug, excerpt, description, body, featured_image_url, external_url, schedule_note, genre, genres_label, schedule_line, host_name, schedule_detail, sort_order, status, source_url, created_at, updated_at";

const MINISTRY_SELECT_WITH_CAROUSEL = `${MINISTRY_SELECT}, carousel_image_url`;

function isMissingCarouselColumn(error: { message?: string } | null): boolean {
  return /carousel_image_url/i.test(error?.message || "");
}

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
  const primary = await supabase
    .from("ministry_programs")
    .select(MINISTRY_SELECT_WITH_CAROUSEL)
    .order("sort_order", { ascending: true })
    .order("title", { ascending: true });
  if (!primary.error) {
    return (primary.data as MinistryProgram[]) ?? [];
  }
  if (!isMissingCarouselColumn(primary.error)) {
    throw new Error(primary.error.message);
  }
  const fallback = await supabase
    .from("ministry_programs")
    .select(MINISTRY_SELECT)
    .order("sort_order", { ascending: true })
    .order("title", { ascending: true });
  if (fallback.error) throw new Error(fallback.error.message);
  return ((fallback.data ?? []) as MinistryProgram[]).map((row) => ({
    ...row,
    carousel_image_url: row.carousel_image_url ?? null,
  }));
}

export async function getAdminMinistryProgram(
  id: string,
): Promise<MinistryProgram | null> {
  const supabase = requireAdmin();
  const primary = await supabase
    .from("ministry_programs")
    .select(MINISTRY_SELECT_WITH_CAROUSEL)
    .eq("id", id)
    .maybeSingle();
  if (!primary.error) {
    return (primary.data as MinistryProgram) ?? null;
  }
  if (!isMissingCarouselColumn(primary.error)) {
    throw new Error(primary.error.message);
  }
  const fallback = await supabase
    .from("ministry_programs")
    .select(MINISTRY_SELECT)
    .eq("id", id)
    .maybeSingle();
  if (fallback.error) throw new Error(fallback.error.message);
  if (!fallback.data) return null;
  const row = fallback.data as MinistryProgram;
  return { ...row, carousel_image_url: row.carousel_image_url ?? null };
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

export async function getAdminScheduleLatestUploadedMonth(): Promise<{
  year: number;
  month: number;
} | null> {
  const supabase = requireAdmin();
  const { data, error } = await supabase
    .from("schedule_entries")
    .select("air_date")
    .order("air_date", { ascending: false })
    .limit(1)
    .maybeSingle();
  if (error) throw new Error(error.message);
  if (!data?.air_date) return null;
  const [y, m] = String(data.air_date).split("-").map(Number);
  if (!y || !m) return null;
  return { year: y, month: m };
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
