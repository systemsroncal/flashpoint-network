"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createAdminClient } from "@/lib/supabase/admin";
import { slugify } from "@/lib/slug";
import { wouldCreateCategoryCycle } from "@/lib/categories/hierarchy";
import type { Category, PostStatus, UserRole } from "@/lib/types/cms";
import {
  getCurrentProfile,
  getSessionUser,
  isAdminRole,
  requireStaffProfile,
} from "@/lib/auth/session";
import { CUSTOM_HTML_SETTING } from "@/lib/custom-html/constants";
import { TOP_HEADER_BANNER_SETTING } from "@/lib/top-banner/constants";
import { sanitizeBannerMaxWidth } from "@/lib/top-banner/max-width";
import {
  PROGRAM_MODULES_SETTING,
  isProgramModulesOwnerEmail,
} from "@/lib/features/program-modules";
import { getProgramModules } from "@/lib/features/program-modules-server";
import { isAdminPostSlugAvailable } from "@/lib/admin/queries";
import { resolvePublishedAt } from "@/lib/admin/published-at";
import {
  POST_EXISTING_SELECT,
  buildCandidateFromFormValues,
  diffPostPatch,
  type PostExistingRow,
} from "@/lib/admin/post-patch";
import {
  DEFAULT_SITE_TIMEZONE,
  isValidIanaTimezone,
  SITE_TIMEZONE_SETTING,
} from "@/lib/timezone/constants";
import { datetimeLocalToIso } from "@/lib/timezone/datetime";
import { getSiteTimezone } from "@/lib/timezone/settings";
import { normalizeExternalUrl } from "@/lib/events/upcoming";
import { normalizeStoredMediaUrl } from "@/lib/media/public-url";
import { getSiteName } from "@/lib/env";
import { SITE_IDENTITY_SETTING } from "@/lib/site-identity/constants";
import {
  DEFAULT_FOOTER_LOGO_MAX,
  DEFAULT_HEADER_LOGO_MAX,
  parseResponsiveLogoMaxWidth,
  sanitizeLogoClassName,
} from "@/lib/site-identity/logo-layout";

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

function parseHomeFirstSlot(
  raw: FormDataEntryValue | null,
  fallback: 1 | 2 | 3 | null,
): 1 | 2 | 3 | null {
  if (raw == null) return fallback;
  const text = String(raw).trim();
  // Explicit empty / none from the select
  if (text === "" || text === "0" || text.toLowerCase() === "none") return null;
  const n = Number(text);
  if (n === 1 || n === 2 || n === 3) return n;
  return fallback;
}

/** Clear any other post occupying this First Section slot. */
async function claimHomeFirstSlot(
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  supabase: any,
  slot: 1 | 2 | 3,
  keepPostId?: string,
) {
  let q = supabase
    .from("posts")
    .update({ home_first_slot: null })
    .eq("home_first_slot", slot);
  if (keepPostId) q = q.neq("id", keepPostId);
  const { error } = await q;
  if (error) throw new Error(error.message);
}

function parseTagIds(formData: FormData): string[] | null {
  // Only sync when the Tags UI was rendered (sentinel).
  if (String(formData.get("tags_present") || "") !== "1") return null;
  const ids = formData
    .getAll("tag_ids")
    .map((v) => String(v || "").trim())
    .filter(Boolean);
  return Array.from(new Set(ids));
}

async function syncPostTags(
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  supabase: any,
  postId: string,
  formData: FormData,
) {
  const tagIds = parseTagIds(formData);
  if (tagIds == null) return;

  const { error: delErr } = await supabase
    .from("post_tags")
    .delete()
    .eq("post_id", postId);
  if (delErr) throw new Error(delErr.message);

  if (tagIds.length === 0) return;
  const rows = tagIds.map((tag_id) => ({ post_id: postId, tag_id }));
  const { error: insErr } = await supabase.from("post_tags").insert(rows);
  if (insErr) throw new Error(insErr.message);
}

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
  const bodyRaw = String(formData.get("body") || "");
  const featuredImageRaw = String(formData.get("featured_image_url") || "") || null;
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
  const publishedAtDisplay = String(
    formData.get("published_at_display") || "",
  );
  const publishedAtOriginal =
    String(formData.get("published_at_original") || "").trim() || null;

  // Default author: seeded FPTN desk editor (creates only)
  const defaultAuthorId = "f1000000-0000-4000-8000-000000000001";

  let existing: PostExistingRow | null = null;
  if (id) {
    const { data, error } = await supabase
      .from("posts")
      .select(POST_EXISTING_SELECT)
      .eq("id", id)
      .maybeSingle();
    if (error) throw new Error(error.message);
    existing = (data as PostExistingRow | null) ?? null;
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
  const showFeaturedImage = explicitBool(
    formData,
    "show_featured_image",
    existing?.show_featured_image ?? true,
  );
  const homeFirstSlot = parseHomeFirstSlot(
    formData.get("home_first_slot"),
    // When the field is missing on update, keep existing; on create default none.
    existing ? (existing.home_first_slot ?? null) : null,
  );

  const timeZone = await getSiteTimezone();
  const publishedAtInput = {
    submittedRaw: publishedAtRaw,
    displayInitial: publishedAtDisplay,
    originalIso: publishedAtOriginal ?? existing?.published_at ?? null,
  };

  // Candidate published_at for create / first-publish; updates omit it unless dirty.
  const publishedAt = resolvePublishedAt({
    ...publishedAtInput,
    existingIso: existing?.published_at ?? null,
    status,
    timeZone,
  });

  const candidate = buildCandidateFromFormValues({
    title,
    slug,
    excerpt,
    body: bodyRaw,
    status,
    categoryId,
    featuredImageUrl: featuredImageRaw,
    videoUrl,
    seoTitle,
    seoDescription,
    seoKeywords,
    ogTitle,
    ogDescription,
    isFeatured,
    isPremium,
    isVideo,
    isPodcast,
    isPopular,
    showFeaturedImage,
    homeFirstSlot,
    readingTime: Number.isFinite(readingTime) ? readingTime : 5,
    publishedAt,
  });

  if (id) {
    if (!existing) throw new Error("Post not found");

    const patch = diffPostPatch(candidate, existing, publishedAtInput);

    // Slug uniqueness only when the permalink actually changes.
    if (patch.slug) {
      const slugFree = await isAdminPostSlugAvailable(patch.slug, id);
      if (!slugFree) {
        throw new Error(
          "This slug is already used by another post. Choose a different permalink.",
        );
      }
    }

    // Claim slot before write so the unique index stays happy.
    if (patch.home_first_slot === 1 || patch.home_first_slot === 2 || patch.home_first_slot === 3) {
      await claimHomeFirstSlot(supabase, patch.home_first_slot, id);
    }

    // Existing posts: write only dirty fields. Empty patch → no UPDATE (avoids
    // bumping updated_at / rewriting published_at / placement side-effects).
    if (Object.keys(patch).length > 0) {
      const { error } = await supabase.from("posts").update(patch).eq("id", id);
      if (error) {
        if (error.code === "23505" || /duplicate key|unique/i.test(error.message)) {
          throw new Error(
            "This slug is already used by another post. Choose a different permalink.",
          );
        }
        throw new Error(error.message);
      }
    }

    await syncPostTags(supabase, id, formData);

    const publicSlug = patch.slug ?? existing.slug;
    revalidatePath("/");
    revalidatePath(`/news/${publicSlug}`);
    revalidatePath("/admin");
    revalidatePath("/admin/posts");
    revalidatePath(`/admin/posts/${id}`);
    redirect(`/admin/posts/${id}`);
  }

  const slugFree = await isAdminPostSlugAvailable(candidate.slug, null);
  if (!slugFree) {
    throw new Error(
      "This slug is already used by another post. Choose a different permalink.",
    );
  }

  if (candidate.home_first_slot === 1 || candidate.home_first_slot === 2 || candidate.home_first_slot === 3) {
    await claimHomeFirstSlot(supabase, candidate.home_first_slot);
  }

  const { data, error } = await supabase
    .from("posts")
    .insert({
      ...candidate,
      author_id: defaultAuthorId,
    })
    .select("id")
    .single();
  if (error) {
    if (error.code === "23505" || /duplicate key|unique/i.test(error.message)) {
      throw new Error(
        "This slug is already used by another post. Choose a different permalink.",
      );
    }
    throw new Error(error.message);
  }
  await syncPostTags(supabase, data.id, formData);
  revalidatePath("/");
  revalidatePath("/admin");
  revalidatePath("/admin/posts");
  redirect(`/admin/posts/${data.id}`);
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
  const parentRaw = String(formData.get("parent_id") || "").trim();
  const parent_id = parentRaw || null;

  if (id && parent_id === id) {
    throw new Error("A category cannot be its own parent.");
  }

  if (parent_id) {
    const { data: allRows } = await supabase
      .from("categories")
      .select("id, name, slug, description, sort_order, parent_id");
    const categories = (allRows ?? []) as Category[];
    if (id && wouldCreateCategoryCycle(categories, id, parent_id)) {
      throw new Error("Invalid parent: would create a circular hierarchy.");
    }
    const parent = categories.find((c) => c.id === parent_id);
    if (!parent) throw new Error("Parent category not found.");
    if (parent.parent_id) {
      throw new Error("Subcategories can only be nested one level deep.");
    }
  }

  const payload = {
    name,
    slug,
    description,
    sort_order: Number.isFinite(sortOrder) ? sortOrder : 0,
    parent_id,
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
  const { count, error: childError } = await supabase
    .from("categories")
    .select("*", { count: "exact", head: true })
    .eq("parent_id", id);
  if (childError) throw new Error(childError.message);
  if ((count ?? 0) > 0) {
    throw new Error("Remove or reassign subcategories before deleting this category.");
  }
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
  const externalUrl = normalizeExternalUrl(
    String(formData.get("external_url") || ""),
  );
  const startsAtRaw = String(formData.get("starts_at") || "");
  const endsAtRaw = String(formData.get("ends_at") || "");
  const timeZone = await getSiteTimezone();

  const payload = {
    title,
    slug,
    description,
    body,
    format,
    video_url: videoUrl,
    host_name: hostName,
    thumbnail_url: thumbnailUrl,
    external_url: externalUrl,
    starts_at: startsAtRaw
      ? datetimeLocalToIso(startsAtRaw, timeZone)
      : null,
    ends_at: endsAtRaw ? datetimeLocalToIso(endsAtRaw, timeZone) : null,
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
    "Create your FPTN All Access account for free to keep reading and join the conversation.";

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

export async function saveSiteIdentitySettingsAction(formData: FormData) {
  const supabase = requireAdmin();
  const siteName =
    String(formData.get("site_name") || "").trim() || getSiteName();
  const headerLogoUrl =
    normalizeStoredMediaUrl(String(formData.get("header_logo_url") || "").trim()) ??
    null;
  const footerLogoUrl = normalizeStoredMediaUrl(
    String(formData.get("footer_logo_url") || "").trim(),
  );
  const authLogoUrl = normalizeStoredMediaUrl(
    String(formData.get("auth_logo_url") || "").trim(),
  );
  const faviconUrl = normalizeStoredMediaUrl(
    String(formData.get("favicon_url") || "").trim(),
  );
  const defaultFeaturedImageUrl = normalizeStoredMediaUrl(
    String(formData.get("default_featured_image_url") || "").trim(),
  );

  const headerLogoMaxWidth = {
    phone: formData.get("header_logo_max_phone"),
    tablet: formData.get("header_logo_max_tablet"),
    laptop: formData.get("header_logo_max_laptop"),
    desktop: formData.get("header_logo_max_desktop"),
  };
  const footerLogoMaxWidth = {
    phone: formData.get("footer_logo_max_phone"),
    tablet: formData.get("footer_logo_max_tablet"),
    laptop: formData.get("footer_logo_max_laptop"),
    desktop: formData.get("footer_logo_max_desktop"),
  };

  const { error } = await supabase.from("site_settings").upsert({
    key: SITE_IDENTITY_SETTING,
    value: {
      site_name: siteName,
      header_logo_url: headerLogoUrl,
      footer_logo_url: footerLogoUrl,
      header_logo_max_width: parseResponsiveLogoMaxWidth(
        headerLogoMaxWidth,
        DEFAULT_HEADER_LOGO_MAX,
      ),
      footer_logo_max_width: parseResponsiveLogoMaxWidth(
        footerLogoMaxWidth,
        DEFAULT_FOOTER_LOGO_MAX,
      ),
      header_logo_class_name: sanitizeLogoClassName(
        formData.get("header_logo_class_name"),
      ),
      footer_logo_class_name: sanitizeLogoClassName(
        formData.get("footer_logo_class_name"),
      ),
      auth_logo_url: authLogoUrl,
      favicon_url: faviconUrl,
      default_featured_image_url: defaultFeaturedImageUrl,
    },
  });
  if (error) throw new Error(error.message);
  revalidatePath("/");
  revalidatePath("/admin");
  revalidatePath("/admin/settings");
  revalidatePath("/news");
  revalidatePath("/login");
  revalidatePath("/register");
  revalidatePath("/forgot-password");
  revalidatePath("/update-password");
  revalidatePath("/favicon.ico");
  revalidatePath("/icon");
  revalidatePath("/apple-icon");
  revalidatePath("/api/site/favicon");
}

export async function saveTopHeaderBannerSettingsAction(formData: FormData) {
  const supabase = requireAdmin();
  const active =
    formData.get("active") === "on" || formData.get("active") === "true";
  const openInNewTab =
    formData.get("open_in_new_tab") === "on" ||
    formData.get("open_in_new_tab") === "true";
  const href = String(formData.get("href") || "").trim();
  const desktopImageUrl =
    String(formData.get("desktop_image_url") || "").trim() || null;
  const mobileImageUrl =
    String(formData.get("mobile_image_url") || "").trim() || null;
  const desktopMaxWidth = sanitizeBannerMaxWidth(
    formData.get("desktop_max_width"),
    "900px",
  );
  const mobileMaxWidth = sanitizeBannerMaxWidth(
    formData.get("mobile_max_width"),
    "100%",
  );

  const { error } = await supabase.from("site_settings").upsert({
    key: TOP_HEADER_BANNER_SETTING,
    value: {
      active,
      href,
      desktop_image_url: desktopImageUrl,
      mobile_image_url: mobileImageUrl,
      desktop_max_width: desktopMaxWidth,
      mobile_max_width: mobileMaxWidth,
      open_in_new_tab: openInNewTab,
    },
  });
  if (error) throw new Error(error.message);
  revalidatePath("/");
  revalidatePath("/news");
  revalidatePath("/category");
  revalidatePath("/admin/settings");
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

export async function saveTimezoneSettingsAction(formData: FormData) {
  const supabase = requireAdmin();
  const raw = String(formData.get("timezone") || "").trim();
  const timezone = isValidIanaTimezone(raw) ? raw : DEFAULT_SITE_TIMEZONE;

  const { error } = await supabase.from("site_settings").upsert({
    key: SITE_TIMEZONE_SETTING,
    value: timezone,
  });
  if (error) throw new Error(error.message);
  revalidatePath("/");
  revalidatePath("/news");
  revalidatePath("/events");
  revalidatePath("/category");
  revalidatePath("/admin");
  revalidatePath("/admin/settings");
  revalidatePath("/admin/posts");
  revalidatePath("/admin/events");
}

/**
 * Persist trusted third-party HTML (head / body / footer).
 * Admin and superadmin only — these snippets execute on every public page.
 */
export async function saveCustomHtmlSettingsAction(formData: FormData) {
  const profile = await getCurrentProfile();
  if (!profile || !isAdminRole(profile.role)) {
    throw new Error("Only admins can edit custom HTML scripts");
  }
  const supabase = requireAdmin();
  const head = String(formData.get("head") || "");
  const body = String(formData.get("body") || "");
  const footer = String(formData.get("footer") || "");

  const { error } = await supabase.from("site_settings").upsert({
    key: CUSTOM_HTML_SETTING,
    value: { head, body, footer },
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
    genre: String(formData.get("genre") || "").trim() || null,
    genres_label: String(formData.get("genres_label") || "").trim() || null,
    schedule_line: String(formData.get("schedule_line") || "").trim() || null,
    host_name: String(formData.get("host_name") || "").trim() || null,
    schedule_detail: String(formData.get("schedule_detail") || "").trim() || null,
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

const ASSIGNABLE_ROLES: UserRole[] = [
  "subscriber",
  "guest",
  "journalist",
  "editor",
  "admin",
  "superadmin",
];

function parseAssignableRole(raw: FormDataEntryValue | null): UserRole {
  const role = String(raw || "").trim() as UserRole;
  if (ASSIGNABLE_ROLES.includes(role)) return role;
  return "subscriber";
}

function usersRedirect(params: Record<string, string>): never {
  const qs = new URLSearchParams(params);
  redirect(`/admin/users?${qs.toString()}`);
}

/**
 * Staff-only: create Auth user + profiles row (trigger + upsert for role/name).
 */
export async function createAdminUserAction(formData: FormData) {
  const staff = await requireStaffProfile();
  if (!staff) {
    usersRedirect({ error: "Unauthorized — staff login required." });
  }

  const name = String(formData.get("name") || "").trim();
  const email = String(formData.get("email") || "").trim().toLowerCase();
  const password = String(formData.get("password") || "");
  const role = parseAssignableRole(formData.get("role"));

  if (!name) usersRedirect({ error: "Name is required." });
  if (!email || !email.includes("@")) {
    usersRedirect({ error: "A valid email is required." });
  }
  if (password.length < 8) {
    usersRedirect({ error: "Password must be at least 8 characters." });
  }

  const parts = name.split(/\s+/).filter(Boolean);
  const firstName = parts[0] ?? name;
  const lastName = parts.length > 1 ? parts.slice(1).join(" ") : "";
  const fullName = name;

  const supabase = requireAdmin();
  const { data, error } = await supabase.auth.admin.createUser({
    email,
    password,
    email_confirm: true,
    user_metadata: {
      first_name: firstName,
      last_name: lastName || null,
      full_name: fullName,
      role,
    },
  });

  if (error || !data.user) {
    usersRedirect({
      error: error?.message || "Could not create the auth user.",
    });
  }

  // Trigger inserts profile from metadata; upsert ensures role/name stick
  // even if the conflict path only refreshed email.
  const { error: profileError } = await supabase.from("profiles").upsert(
    {
      id: data.user.id,
      email,
      full_name: fullName,
      first_name: firstName,
      last_name: lastName || null,
      role,
    },
    { onConflict: "id" },
  );

  if (profileError) {
    usersRedirect({
      error: `Auth user created, but profile failed: ${profileError.message}`,
    });
  }

  revalidatePath("/admin/users");
  usersRedirect({ created: "1", email });
}

function bannersRedirect(params: Record<string, string>): never {
  const qs = new URLSearchParams(params);
  redirect(`/admin/banners?${qs.toString()}`);
}

/**
 * Staff: update a banner widget slot. Requires at least one image (desktop or mobile).
 */
export async function upsertBannerWidgetAction(formData: FormData) {
  const staff = await requireStaffProfile();
  if (!staff) {
    bannersRedirect({ error: "Unauthorized — staff login required." });
  }

  const id = String(formData.get("id") || "").trim();
  if (!id) bannersRedirect({ error: "Missing banner id." });

  const label = String(formData.get("label") || "").trim();
  const href = String(formData.get("href") || "").trim();
  const desktop = String(formData.get("desktop_image_url") || "").trim();
  const mobile = String(formData.get("mobile_image_url") || "").trim();
  const openInNewTab = String(formData.get("open_in_new_tab") || "") !== "false";
  const enabled = String(formData.get("enabled") || "") !== "false";

  if (!desktop && !mobile) {
    bannersRedirect({
      error:
        "Save blocked: add a Desktop banner image and/or a Responsive (mobile) banner image.",
    });
  }

  const supabase = requireAdmin();
  const { error } = await supabase
    .from("banner_widgets")
    .update({
      label: label || "Banner",
      href,
      desktop_image_url: desktop || null,
      mobile_image_url: mobile || null,
      open_in_new_tab: openInNewTab,
      enabled,
    })
    .eq("id", id);

  if (error) {
    bannersRedirect({ error: error.message });
  }

  revalidatePath("/");
  revalidatePath("/admin/banners");
  revalidatePath("/news");
  revalidatePath("/category");
  bannersRedirect({ saved: "1" });
}
