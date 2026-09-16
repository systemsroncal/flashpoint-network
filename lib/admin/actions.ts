"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createAdminClient } from "@/lib/supabase/admin";
import { slugify } from "@/lib/slug";
import type { PostStatus } from "@/lib/types/cms";
import { getCurrentProfile, getSessionUser } from "@/lib/auth/session";
import {
  PROGRAM_MODULES_SETTING,
  isProgramModulesOwnerEmail,
} from "@/lib/features/program-modules";
import { getProgramModules } from "@/lib/features/program-modules-server";

function boolFromForm(value: FormDataEntryValue | null): boolean {
  return value === "on" || value === "true" || value === "1";
}

/** True when the form sent an explicit true/false/on (hidden + checkbox pattern). */
function hasExplicitBool(formData: FormData, key: string): boolean {
  const raw = formData.get(key);
  if (raw == null) return false;
  const v = String(raw).toLowerCase();
  return v === "true" || v === "false" || v === "on" || v === "1" || v === "0";
}

function explicitBool(formData: FormData, key: string, fallback: boolean): boolean {
  if (!hasExplicitBool(formData, key)) return fallback;
  const v = String(formData.get(key)).toLowerCase();
  if (v === "false" || v === "0") return false;
  return boolFromForm(formData.get(key));
}

type PlacementFields = {
  is_featured: boolean;
  is_premium: boolean;
  is_video: boolean;
  is_podcast: boolean;
  is_popular: boolean;
  published_at: string | null;
  category_id: string | null;
  author_id: string | null;
};

function requireAdmin() {
  const client = createAdminClient();
  if (!client) throw new Error("Supabase admin client is not configured");
  return client;
}

async function requireProgramModulesOwner() {
  const [user, profile] = await Promise.all([
    getSessionUser(),
    getCurrentProfile(),
  ]);
  if (
    !isProgramModulesOwnerEmail(user?.email) &&
    !isProgramModulesOwnerEmail(profile?.email)
  ) {
    throw new Error("Forbidden");
  }
}

async function assertClassicProgramsEnabled() {
  const modules = await getProgramModules();
  if (!modules.classic) redirect("/admin");
}

async function assertScheduleProgramsEnabled() {
  const modules = await getProgramModules();
  if (!modules.schedule) redirect("/admin");
}

export async function upsertPostAction(formData: FormData) {
  const supabase = requireAdmin();
  const id = String(formData.get("id") || "");
  const title = String(formData.get("title") || "").trim();
  if (!title) throw new Error("Title is required");

  let slug = String(formData.get("slug") || "").trim() || slugify(title);
  slug = slugify(slug) || "untitled";

  const status = (String(formData.get("status") || "draft") as PostStatus) || "draft";
  const categoryId = String(formData.get("category_id") || "") || null;
  const excerpt = String(formData.get("excerpt") || "");
  const body = String(formData.get("body") || "");
  const featuredImageUrl = String(formData.get("featured_image_url") || "") || null;
  const videoUrl = String(formData.get("video_url") || "") || null;
  const seoTitle = String(formData.get("seo_title") || "").trim() || null;
  const seoDescription =
    String(formData.get("seo_description") || "").trim() || null;
  const seoKeywords = String(formData.get("seo_keywords") || "").trim() || null;
  const ogTitle = String(formData.get("og_title") || "").trim() || null;
  const ogDescription =
    String(formData.get("og_description") || "").trim() || null;
  const readingTime = Number(formData.get("reading_time_minutes") || 5);
  const publishedAtRaw = String(formData.get("published_at") || "");

  // Default author: seeded FPN desk editor (creates only)
  const defaultAuthorId = "f1000000-0000-4000-8000-000000000001";

  let existing: PlacementFields | null = null;
  if (id) {
    const { data, error } = await supabase
      .from("posts")
      .select(
        "is_featured, is_premium, is_video, is_podcast, is_popular, published_at, category_id, author_id",
      )
      .eq("id", id)
      .maybeSingle();
    if (error) throw new Error(error.message);
    existing = (data as PlacementFields | null) ?? null;
  }

  // Preserve published_at on edit when the datetime field is empty (do not bump to "now").
  let publishedAt: string | null;
  if (publishedAtRaw) {
    const parsed = new Date(publishedAtRaw);
    publishedAt = Number.isNaN(parsed.getTime())
      ? (existing?.published_at ?? null)
      : parsed.toISOString();
  } else if (existing?.published_at) {
    publishedAt = existing.published_at;
  } else if (status === "published") {
    publishedAt = new Date().toISOString();
  } else {
    publishedAt = null;
  }

  // Placement flags: prefer explicit form values; if a field is missing from FormData
  // (e.g. unchecked MUI checkbox never serializes), keep the existing DB value on update.
  const isFeatured = explicitBool(
    formData,
    "is_featured",
    existing?.is_featured ?? false,
  );
  const isPremium = explicitBool(
    formData,
    "is_premium",
    existing?.is_premium ?? false,
  );
  const isVideo = explicitBool(formData, "is_video", existing?.is_video ?? false);
  const isPodcast = explicitBool(
    formData,
    "is_podcast",
    existing?.is_podcast ?? false,
  );
  const isPopular = explicitBool(
    formData,
    "is_popular",
    existing?.is_popular ?? false,
  );

  const payload = {
    title,
    slug,
    excerpt,
    body,
    status,
    category_id: categoryId,
    author_id: existing?.author_id ?? defaultAuthorId,
    featured_image_url: featuredImageUrl,
    video_url: videoUrl,
    seo_title: seoTitle,
    seo_description: seoDescription,
    seo_keywords: seoKeywords,
    og_title: ogTitle,
    og_description: ogDescription,
    // Meta / social image is always the featured image
    og_image_url: featuredImageUrl,
    is_featured: isFeatured,
    is_premium: isPremium,
    is_video: isVideo,
    is_podcast: isPodcast,
    is_popular: isPopular,
    reading_time_minutes: Number.isFinite(readingTime) ? readingTime : 5,
    published_at: publishedAt,
  };

  if (id) {
    const { error } = await supabase.from("posts").update(payload).eq("id", id);
    if (error) throw new Error(error.message);
  } else {
    const { data, error } = await supabase
      .from("posts")
      .insert(payload)
      .select("id")
      .single();
    if (error) throw new Error(error.message);
    revalidatePath("/");
    revalidatePath("/admin");
    revalidatePath("/admin/posts");
    redirect(`/admin/posts/${data.id}`);
  }

  revalidatePath("/");
  revalidatePath(`/news/${slug}`);
  revalidatePath("/admin");
  revalidatePath("/admin/posts");
  revalidatePath(`/admin/posts/${id}`);
  redirect(`/admin/posts/${id}`);
}

export async function deletePostAction(formData: FormData) {
  const supabase = requireAdmin();
  const id = String(formData.get("id") || "");
  if (!id) throw new Error("Missing post id");
  const { error } = await supabase.from("posts").delete().eq("id", id);
  if (error) throw new Error(error.message);
  revalidatePath("/");
  revalidatePath("/admin");
  revalidatePath("/admin/posts");
  redirect("/admin/posts");
}

export async function upsertCategoryAction(formData: FormData) {
  const supabase = requireAdmin();
  const id = String(formData.get("id") || "");
  const name = String(formData.get("name") || "").trim();
  if (!name) throw new Error("Name is required");
  const slug = slugify(String(formData.get("slug") || name));
  const description = String(formData.get("description") || "");
  const sortOrder = Number(formData.get("sort_order") || 0);
  const payload = {
    name,
    slug,
    description,
    sort_order: Number.isFinite(sortOrder) ? sortOrder : 0,
  };
  if (id) {
    const { error } = await supabase.from("categories").update(payload).eq("id", id);
    if (error) throw new Error(error.message);
  } else {
    const { error } = await supabase.from("categories").insert(payload);
    if (error) throw new Error(error.message);
  }
  revalidatePath("/");
  revalidatePath("/admin/categories");
}

export async function deleteCategoryAction(formData: FormData) {
  const supabase = requireAdmin();
  const id = String(formData.get("id") || "");
  const { error } = await supabase.from("categories").delete().eq("id", id);
  if (error) throw new Error(error.message);
  revalidatePath("/");
  revalidatePath("/admin/categories");
}

export async function upsertTagAction(formData: FormData) {
  const supabase = requireAdmin();
  const id = String(formData.get("id") || "");
  const name = String(formData.get("name") || "").trim();
  if (!name) throw new Error("Name is required");
  const slug = slugify(String(formData.get("slug") || name));
  const payload = { name, slug };
  if (id) {
    const { error } = await supabase.from("tags").update(payload).eq("id", id);
    if (error) throw new Error(error.message);
  } else {
    const { error } = await supabase.from("tags").insert(payload);
    if (error) throw new Error(error.message);
  }
  revalidatePath("/admin/tags");
}

export async function deleteTagAction(formData: FormData) {
  const supabase = requireAdmin();
  const id = String(formData.get("id") || "");
  const { error } = await supabase.from("tags").delete().eq("id", id);
  if (error) throw new Error(error.message);
  revalidatePath("/admin/tags");
}

export async function upsertEventAction(formData: FormData) {
  const supabase = requireAdmin();
  const id = String(formData.get("id") || "");
  const title = String(formData.get("title") || "").trim();
  if (!title) throw new Error("Title is required");
  const slug = slugify(String(formData.get("slug") || title));
  const description = String(formData.get("description") || "");
  const body = String(formData.get("body") || "");
  const format = String(formData.get("format") || "video") === "text" ? "text" : "video";
  const videoUrl = String(formData.get("video_url") || "") || null;
  const hostName = String(formData.get("host_name") || "") || null;
  const thumbnailUrl = String(formData.get("thumbnail_url") || "") || null;
  const startsAtRaw = String(formData.get("starts_at") || "");
  const endsAtRaw = String(formData.get("ends_at") || "");

  const payload = {
    title,
    slug,
    description,
    body,
    format,
    video_url: videoUrl,
    host_name: hostName,
    thumbnail_url: thumbnailUrl,
    starts_at: startsAtRaw ? new Date(startsAtRaw).toISOString() : null,
    ends_at: endsAtRaw ? new Date(endsAtRaw).toISOString() : null,
    is_live: boolFromForm(formData.get("is_live")),
    show_on_home: boolFromForm(formData.get("show_on_home")),
  };

  if (id) {
    const { error } = await supabase.from("events").update(payload).eq("id", id);
    if (error) throw new Error(error.message);
  } else {
    const { data, error } = await supabase
      .from("events")
      .insert(payload)
      .select("id")
      .single();
    if (error) throw new Error(error.message);
    revalidatePath("/");
    revalidatePath("/admin/events");
    redirect(`/admin/events/${data.id}`);
  }

  revalidatePath("/");
  revalidatePath(`/events/${slug}`);
  revalidatePath("/admin/events");
  revalidatePath(`/admin/events/${id}`);
  redirect(`/admin/events/${id}`);
}

export async function deleteEventAction(formData: FormData) {
  const supabase = requireAdmin();
  const id = String(formData.get("id") || "");
  const { error } = await supabase.from("events").delete().eq("id", id);
  if (error) throw new Error(error.message);
  revalidatePath("/");
  revalidatePath("/admin/events");
  redirect("/admin/events");
}

export async function upsertEmailTemplateAction(formData: FormData) {
  const supabase = requireAdmin();
  const id = String(formData.get("id") || "");
  const name = String(formData.get("name") || "").trim();
  const slug = slugify(String(formData.get("slug") || name));
  const subject = String(formData.get("subject") || "");
  const bodyHtml = String(formData.get("body_html") || "");
  const headerBgColor =
    String(formData.get("header_bg_color") || "").trim() || "#1b2a64";
  const footerBgColor =
    String(formData.get("footer_bg_color") || "").trim() || "#111111";
  const logoUrl = String(formData.get("logo_url") || "").trim() || null;
  const logoAlignRaw = String(formData.get("logo_align") || "center").trim();
  const logoAlign =
    logoAlignRaw === "left" || logoAlignRaw === "right" ? logoAlignRaw : "center";
  const maxWidthRaw = Number(formData.get("max_width") || 600);
  const maxWidth = Number.isFinite(maxWidthRaw)
    ? Math.min(Math.max(maxWidthRaw, 320), 900)
    : 600;
  if (!name || !subject) throw new Error("Name and subject are required");
  const payload = {
    name,
    slug,
    subject,
    body_html: bodyHtml,
    header_bg_color: headerBgColor,
    footer_bg_color: footerBgColor,
    logo_url: logoUrl,
    logo_align: logoAlign,
    max_width: maxWidth,
  };
  if (id) {
    const { error } = await supabase.from("email_templates").update(payload).eq("id", id);
    if (error) throw new Error(error.message);
  } else {
    const { error } = await supabase.from("email_templates").insert(payload);
    if (error) throw new Error(error.message);
  }
  revalidatePath("/admin/email-templates");
}

export async function upsertSiteSettingAction(formData: FormData) {
  const supabase = requireAdmin();
  const key = String(formData.get("key") || "").trim();
  const valueRaw = String(formData.get("value") || "").trim();
  if (!key) throw new Error("Key is required");
  if (key === PROGRAM_MODULES_SETTING) {
    await requireProgramModulesOwner();
  }
  let value: unknown = valueRaw;
  try {
    value = JSON.parse(valueRaw);
  } catch {
    value = valueRaw;
  }
  const { error } = await supabase.from("site_settings").upsert({
    key,
    value,
  });
  if (error) throw new Error(error.message);
  revalidatePath("/");
  revalidatePath("/admin/settings");
  revalidatePath("/ads.txt");
}

export async function savePaywallSettingsAction(formData: FormData) {
  const supabase = requireAdmin();
  const enabled = formData.get("enabled") === "on" || formData.get("enabled") === "true";
  const freeArticleLimit = Math.max(
    0,
    Number(formData.get("free_article_limit") || 3) || 3,
  );
  const modalTitle =
    String(formData.get("modal_title") || "").trim() || "Don't stop here";
  const modalBody =
    String(formData.get("modal_body") || "").trim() ||
    "Create your FPN All Access account for free to keep reading and join the conversation.";

  const { error } = await supabase.from("site_settings").upsert({
    key: "paywall",
    value: {
      enabled,
      free_article_limit: freeArticleLimit,
      modal_title: modalTitle,
      modal_body: modalBody,
    },
  });
  if (error) throw new Error(error.message);
  revalidatePath("/");
  revalidatePath("/admin/settings");
  revalidatePath("/news");
}

export async function saveAdSenseSettingsAction(formData: FormData) {
  const supabase = requireAdmin();
  const enabled = formData.get("enabled") === "on" || formData.get("enabled") === "true";
  const clientId = String(formData.get("client_id") || "").trim();
  const adsTxt = String(formData.get("ads_txt") || "").trim();

  const { error: adsenseError } = await supabase.from("site_settings").upsert({
    key: "adsense",
    value: {
      enabled,
      client_id: clientId,
    },
  });
  if (adsenseError) throw new Error(adsenseError.message);

  const { error: adsTxtError } = await supabase.from("site_settings").upsert({
    key: "ads_txt",
    value: adsTxt,
  });
  if (adsTxtError) throw new Error(adsTxtError.message);

  revalidatePath("/");
  revalidatePath("/admin/settings");
  revalidatePath("/ads.txt");
}

export async function saveMaintenanceSettingsAction(formData: FormData) {
  const supabase = requireAdmin();
  const enabled =
    formData.get("enabled") === "on" || formData.get("enabled") === "true";
  const message = String(formData.get("message") || "").trim();

  const { error } = await supabase.from("site_settings").upsert({
    key: "maintenance",
    value: {
      enabled,
      message,
    },
  });
  if (error) throw new Error(error.message);
  revalidatePath("/");
  revalidatePath("/news");
  revalidatePath("/events");
  revalidatePath("/category");
  revalidatePath("/classic-programs");
  revalidatePath("/network-programs");
  revalidatePath("/schedule-programs");
  revalidatePath("/admin/settings");
}

export async function saveProgramModulesAction(formData: FormData) {
  await requireProgramModulesOwner();
  const supabase = requireAdmin();
  const classic =
    formData.get("classic") === "on" || formData.get("classic") === "true";
  const schedule =
    formData.get("schedule") === "on" || formData.get("schedule") === "true";

  const { error } = await supabase.from("site_settings").upsert({
    key: "program_modules",
    value: { classic, schedule },
  });
  if (error) throw new Error(error.message);
  revalidatePath("/");
  revalidatePath("/classic-programs");
  revalidatePath("/network-programs");
  revalidatePath("/schedule-programs");
  revalidatePath("/admin");
  revalidatePath("/admin/classic-programs");
  revalidatePath("/admin/schedule-programs");
  revalidatePath("/admin/settings");
}

export async function upsertClassicProgramAction(formData: FormData) {
  await assertClassicProgramsEnabled();
  const supabase = requireAdmin();
  const id = String(formData.get("id") || "");
  const title = String(formData.get("title") || "").trim();
  if (!title) throw new Error("Title is required");
  let slug = slugify(String(formData.get("slug") || "").trim() || title) || "program";
  const status = (String(formData.get("status") || "published") ||
    "published") as "draft" | "published" | "archived";
  const sortOrder = Number(formData.get("sort_order") || 0);

  const payload = {
    title,
    slug,
    excerpt: String(formData.get("excerpt") || "").trim() || null,
    description: String(formData.get("description") || "").trim() || null,
    body: String(formData.get("body") || "").trim() || null,
    featured_image_url:
      String(formData.get("featured_image_url") || "").trim() || null,
    external_url: null,
    schedule_note: String(formData.get("schedule_note") || "").trim() || null,
    genre: String(formData.get("genre") || "").trim() || null,
    genres_label: String(formData.get("genres_label") || "").trim() || null,
    schedule_line: String(formData.get("schedule_line") || "").trim() || null,
    sort_order: Number.isFinite(sortOrder) ? sortOrder : 0,
    status,
    source_url: null,
  };

  if (id) {
    const { error } = await supabase
      .from("classic_programs")
      .update(payload)
      .eq("id", id);
    if (error) throw new Error(error.message);
  } else {
    const { data, error } = await supabase
      .from("classic_programs")
      .insert(payload)
      .select("id")
      .single();
    if (error) throw new Error(error.message);
    revalidatePath("/classic-programs");
    revalidatePath("/admin/classic-programs");
    redirect(`/admin/classic-programs/${data.id}`);
  }

  revalidatePath("/classic-programs");
  revalidatePath(`/classic-programs/${slug}`);
  revalidatePath("/admin/classic-programs");
  revalidatePath(`/admin/classic-programs/${id}`);
  redirect(`/admin/classic-programs/${id}`);
}

export async function deleteClassicProgramAction(formData: FormData) {
  await assertClassicProgramsEnabled();
  const supabase = requireAdmin();
  const id = String(formData.get("id") || "");
  if (!id) throw new Error("Missing id");
  const { error } = await supabase.from("classic_programs").delete().eq("id", id);
  if (error) throw new Error(error.message);
  revalidatePath("/classic-programs");
  revalidatePath("/admin/classic-programs");
  redirect("/admin/classic-programs");
}

export async function saveClassicProgramsSortAction(formData: FormData) {
  await assertClassicProgramsEnabled();
  const supabase = requireAdmin();
  const mode = String(formData.get("sort_mode") || "manual").trim();
  const allowed = ["manual", "a_z", "z_a", "random", "newest"];
  const value = allowed.includes(mode) ? mode : "manual";
  const { error } = await supabase.from("site_settings").upsert({
    key: "classic_programs_sort",
    value,
  });
  if (error) throw new Error(error.message);
  revalidatePath("/classic-programs");
  revalidatePath("/admin/classic-programs");
}

export async function upsertMinistryProgramAction(formData: FormData) {
  const supabase = requireAdmin();
  const id = String(formData.get("id") || "");
  const title = String(formData.get("title") || "").trim();
  if (!title) throw new Error("Title is required");
  let slug = slugify(String(formData.get("slug") || "").trim() || title) || "program";
  const status = (String(formData.get("status") || "published") ||
    "published") as "draft" | "published" | "archived";
  const sortOrder = Number(formData.get("sort_order") || 0);

  const payload = {
    title,
    slug,
    excerpt: String(formData.get("excerpt") || "").trim() || null,
    description: String(formData.get("description") || "").trim() || null,
    body: String(formData.get("body") || "").trim() || null,
    featured_image_url:
      String(formData.get("featured_image_url") || "").trim() || null,
    external_url: null,
    schedule_note: String(formData.get("schedule_note") || "").trim() || null,
    sort_order: Number.isFinite(sortOrder) ? sortOrder : 0,
    status,
    source_url: null,
  };

  if (id) {
    const { error } = await supabase
      .from("ministry_programs")
      .update(payload)
      .eq("id", id);
    if (error) throw new Error(error.message);
  } else {
    const { data, error } = await supabase
      .from("ministry_programs")
      .insert(payload)
      .select("id")
      .single();
    if (error) throw new Error(error.message);
    revalidatePath("/network-programs");
    revalidatePath("/admin/network-programs");
    redirect(`/admin/network-programs/${data.id}`);
  }

  revalidatePath("/network-programs");
  revalidatePath(`/network-programs/${slug}`);
  revalidatePath("/admin/network-programs");
  revalidatePath(`/admin/network-programs/${id}`);
  redirect(`/admin/network-programs/${id}`);
}

export async function deleteMinistryProgramAction(formData: FormData) {
  const supabase = requireAdmin();
  const id = String(formData.get("id") || "");
  if (!id) throw new Error("Missing id");
  const { error } = await supabase.from("ministry_programs").delete().eq("id", id);
  if (error) throw new Error(error.message);
  revalidatePath("/network-programs");
  revalidatePath("/admin/network-programs");
  redirect("/admin/network-programs");
}

export async function saveMinistryProgramsSortAction(formData: FormData) {
  const supabase = requireAdmin();
  const mode = String(formData.get("sort_mode") || "manual").trim();
  const allowed = ["manual", "a_z", "z_a", "random", "newest"];
  const value = allowed.includes(mode) ? mode : "manual";
  const { error } = await supabase.from("site_settings").upsert({
    key: "ministry_programs_sort",
    value,
  });
  if (error) throw new Error(error.message);
  revalidatePath("/network-programs");
  revalidatePath("/admin/network-programs");
}

export async function upsertScheduleEntryAction(formData: FormData) {
  await assertScheduleProgramsEnabled();
  const supabase = requireAdmin();
  const id = String(formData.get("id") || "");
  const title = String(formData.get("title") || "").trim();
  const airDate = String(formData.get("air_date") || "").trim();
  const startTime = String(formData.get("start_time") || "").trim();
  if (!title || !airDate || !startTime) {
    throw new Error("Title, date, and start time are required");
  }
  const endRaw = String(formData.get("end_time") || "").trim();
  const payload = {
    title,
    air_date: airDate,
    start_time: startTime.length === 5 ? `${startTime}:00` : startTime,
    end_time: endRaw
      ? endRaw.length === 5
        ? `${endRaw}:00`
        : endRaw
      : null,
    description: String(formData.get("description") || "").trim() || null,
    category: String(formData.get("category") || "").trim() || null,
    color: String(formData.get("color") || "").trim() || null,
  };

  if (id) {
    const { error } = await supabase
      .from("schedule_entries")
      .update(payload)
      .eq("id", id);
    if (error) throw new Error(error.message);
  } else {
    const { data, error } = await supabase
      .from("schedule_entries")
      .insert(payload)
      .select("id")
      .single();
    if (error) throw new Error(error.message);
    revalidatePath("/schedule-programs");
    revalidatePath("/admin/schedule-programs");
    redirect(`/admin/schedule-programs/${data.id}`);
  }

  revalidatePath("/schedule-programs");
  revalidatePath("/admin/schedule-programs");
  revalidatePath(`/admin/schedule-programs/${id}`);
  redirect(`/admin/schedule-programs/${id}`);
}

export async function deleteScheduleEntryAction(formData: FormData) {
  await assertScheduleProgramsEnabled();
  const supabase = requireAdmin();
  const id = String(formData.get("id") || "");
  if (!id) throw new Error("Missing id");
  const { error } = await supabase.from("schedule_entries").delete().eq("id", id);
  if (error) throw new Error(error.message);
  revalidatePath("/schedule-programs");
  revalidatePath("/admin/schedule-programs");
  redirect("/admin/schedule-programs");
}

export async function saveScheduleDisplayModeAction(formData: FormData) {
  await assertScheduleProgramsEnabled();
  const supabase = requireAdmin();
  const mode = String(formData.get("display_mode") || "dynamic").trim();
  const value = ["dynamic", "pdf", "both"].includes(mode) ? mode : "dynamic";
  const { error } = await supabase.from("site_settings").upsert({
    key: "schedule_display_mode",
    value,
  });
  if (error) throw new Error(error.message);
  revalidatePath("/schedule-programs");
  revalidatePath("/admin/schedule-programs");
}

export async function saveScheduleLayoutTemplateAction(formData: FormData) {
  await assertScheduleProgramsEnabled();
  const supabase = requireAdmin();
  const raw = String(formData.get("layout_template") || "template_1").trim();
  const value = raw === "template_2" ? "template_2" : "template_1";
  const { error } = await supabase.from("site_settings").upsert({
    key: "schedule_layout_template",
    value,
  });
  if (error) throw new Error(error.message);
  revalidatePath("/schedule-programs");
  revalidatePath("/admin/schedule-programs");
}

export async function saveSchedulePdfAction(formData: FormData) {
  await assertScheduleProgramsEnabled();
  const supabase = requireAdmin();
  const year = Number(formData.get("year") || 2026);
  const month = Number(formData.get("month") || 9);
  const title = String(formData.get("title") || "").trim() || `Schedule ${year}-${month}`;
  const pdfUrl = String(formData.get("pdf_url") || "").trim();
  if (!pdfUrl) throw new Error("PDF URL is required");
  const { error } = await supabase.from("schedule_pdfs").upsert(
    { year, month, title, pdf_url: pdfUrl },
    { onConflict: "year,month" },
  );
  if (error) throw new Error(error.message);
  revalidatePath("/schedule-programs");
  revalidatePath("/admin/schedule-programs");
}
