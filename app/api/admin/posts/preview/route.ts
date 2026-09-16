import { NextResponse } from "next/server";
import { revalidatePath } from "next/cache";
import { requireStaffProfile } from "@/lib/auth/session";
import { createAdminClient } from "@/lib/supabase/admin";
import { getSiteUrl } from "@/lib/env";
import { slugify } from "@/lib/slug";
import type { PostStatus } from "@/lib/types/cms";
import { resolvePublishedAt } from "@/lib/admin/published-at";
import {
  POST_EXISTING_SELECT,
  buildCandidateFromFormValues,
  diffPostPatch,
  type PostExistingRow,
} from "@/lib/admin/post-patch";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

function boolFrom(value: unknown): boolean {
  return value === true || value === "on" || value === "true" || value === "1";
}

function explicitBool(
  body: Record<string, unknown>,
  key: string,
  fallback: boolean,
): boolean {
  if (!(key in body) || body[key] === undefined || body[key] === null || body[key] === "") {
    return fallback;
  }
  const v = body[key];
  if (v === false || v === "false" || v === "0") return false;
  return boolFrom(v);
}

/**
 * Save current News form fields as a draft (or keep status) and return a
 * staff-only preview URL — WordPress-style "Preview Changes".
 * On update of an existing post: patch only dirty fields (no published_at /
 * placement rewrites unless the editor changed them).
 */
export async function POST(request: Request) {
  const profile = await requireStaffProfile();
  if (!profile) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const supabase = createAdminClient();
  if (!supabase) {
    return NextResponse.json({ error: "Supabase not configured" }, { status: 500 });
  }

  let body: Record<string, unknown>;
  try {
    body = (await request.json()) as Record<string, unknown>;
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const title = String(body.title || "").trim();
  if (!title) {
    return NextResponse.json({ error: "Title is required to preview." }, { status: 400 });
  }

  let slug = slugify(String(body.slug || "").trim() || title) || "untitled";
  const id = String(body.id || "").trim();
  const statusRaw = String(body.status || "draft") as PostStatus;
  // Keep published if already published; otherwise save as draft for preview
  const status: PostStatus =
    statusRaw === "published" ? "published" : statusRaw || "draft";

  const featuredImageUrl = String(body.featured_image_url || "").trim() || null;
  const publishedAtRaw = String(body.published_at || "");
  const publishedAtDisplay = String(body.published_at_display || "");
  const publishedAtOriginal =
    String(body.published_at_original || "").trim() || null;

  let existing: PostExistingRow | null = null;
  if (id) {
    const { data } = await supabase
      .from("posts")
      .select(POST_EXISTING_SELECT)
      .eq("id", id)
      .maybeSingle();
    existing = (data as PostExistingRow | null) ?? null;
  }

  const publishedAtInput = {
    submittedRaw: publishedAtRaw,
    displayInitial: publishedAtDisplay,
    originalIso: publishedAtOriginal ?? existing?.published_at ?? null,
  };

  const publishedAt = resolvePublishedAt({
    ...publishedAtInput,
    existingIso: existing?.published_at ?? null,
    status,
  });

  const candidate = buildCandidateFromFormValues({
    title,
    slug,
    excerpt: String(body.excerpt || ""),
    body: String(body.body || ""),
    status,
    categoryId: String(body.category_id || "") || null,
    featuredImageUrl,
    videoUrl: String(body.video_url || "").trim() || null,
    seoTitle: String(body.seo_title || "").trim() || null,
    seoDescription: String(body.seo_description || "").trim() || null,
    seoKeywords: String(body.seo_keywords || "").trim() || null,
    ogTitle: String(body.og_title || "").trim() || null,
    ogDescription: String(body.og_description || "").trim() || null,
    isFeatured: explicitBool(body, "is_featured", existing?.is_featured ?? false),
    isPremium: explicitBool(body, "is_premium", existing?.is_premium ?? false),
    isVideo: explicitBool(body, "is_video", existing?.is_video ?? false),
    isPodcast: explicitBool(body, "is_podcast", existing?.is_podcast ?? false),
    isPopular: explicitBool(body, "is_popular", existing?.is_popular ?? false),
    showFeaturedImage: explicitBool(
      body,
      "show_featured_image",
      existing?.show_featured_image ?? true,
    ),
    readingTime: Number(body.reading_time_minutes) || 5,
    publishedAt,
  });

  async function ensureUniqueSlug(candidateSlug: string, excludeId?: string) {
    let next = candidateSlug;
    for (let i = 0; i < 20; i++) {
      let q = supabase!
        .from("posts")
        .select("id")
        .eq("slug", next)
        .limit(1);
      if (excludeId) q = q.neq("id", excludeId);
      const { data } = await q.maybeSingle();
      if (!data) return next;
      next = `${candidateSlug}-${i + 2}`;
    }
    return `${candidateSlug}-${Date.now()}`;
  }

  let postId = id;
  let savedSlug = candidate.slug;
  let savedStatus = candidate.status;
  try {
    if (id) {
      if (!existing) {
        return NextResponse.json({ error: "Post not found" }, { status: 404 });
      }
      const patch = diffPostPatch(candidate, existing, publishedAtInput);
      if (patch.slug) {
        patch.slug = await ensureUniqueSlug(patch.slug, id);
      }
      if (Object.keys(patch).length > 0) {
        const { error } = await supabase.from("posts").update(patch).eq("id", id);
        if (error) throw error;
      }
      savedSlug = patch.slug ?? existing.slug;
      savedStatus = patch.status ?? existing.status;
    } else {
      savedSlug = await ensureUniqueSlug(candidate.slug);
      const { data, error } = await supabase
        .from("posts")
        .insert({
          ...candidate,
          slug: savedSlug,
          author_id: profile.id,
        })
        .select("id")
        .single();
      if (error) throw error;
      postId = data.id;
    }
  } catch (err) {
    const message = err instanceof Error ? err.message : "Save failed";
    return NextResponse.json({ error: message }, { status: 500 });
  }

  revalidatePath("/admin/posts");
  revalidatePath(`/admin/posts/${postId}`);
  if (savedStatus === "published") {
    revalidatePath(`/news/${savedSlug}`);
    revalidatePath("/");
  }

  const origin = getSiteUrl().replace(/\/$/, "");
  const previewUrl = `${origin}/preview/news/${postId}`;
  const publicUrl =
    savedStatus === "published" ? `${origin}/news/${savedSlug}` : null;

  return NextResponse.json({
    id: postId,
    slug: savedSlug,
    status: savedStatus,
    previewUrl,
    publicUrl,
  });
}
