import { NextResponse } from "next/server";
import { revalidatePath } from "next/cache";
import { requireStaffProfile } from "@/lib/auth/session";
import { createAdminClient } from "@/lib/supabase/admin";
import { getSiteUrl } from "@/lib/env";
import { slugify } from "@/lib/slug";
import type { PostStatus } from "@/lib/types/cms";
import { resolvePublishedAt } from "@/lib/admin/published-at";

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
 * On update, preserves home-placement flags and published_at when omitted.
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

  type Existing = {
    is_featured: boolean;
    is_premium: boolean;
    is_video: boolean;
    is_podcast: boolean;
    is_popular: boolean;
    published_at: string | null;
    author_id: string | null;
  };

  let existing: Existing | null = null;
  if (id) {
    const { data } = await supabase
      .from("posts")
      .select(
        "is_featured, is_premium, is_video, is_podcast, is_popular, published_at, author_id",
      )
      .eq("id", id)
      .maybeSingle();
    existing = (data as Existing | null) ?? null;
  }

  const publishedAt = resolvePublishedAt({
    submittedRaw: publishedAtRaw,
    displayInitial: publishedAtDisplay,
    originalIso: publishedAtOriginal ?? existing?.published_at ?? null,
    existingIso: existing?.published_at ?? null,
    status,
  });

  const payload = {
    title,
    slug,
    excerpt: String(body.excerpt || ""),
    body: String(body.body || ""),
    status,
    category_id: String(body.category_id || "") || null,
    author_id: existing?.author_id ?? profile.id,
    featured_image_url: featuredImageUrl,
    video_url: String(body.video_url || "").trim() || null,
    seo_title: String(body.seo_title || "").trim() || null,
    seo_description: String(body.seo_description || "").trim() || null,
    seo_keywords: String(body.seo_keywords || "").trim() || null,
    og_title: String(body.og_title || "").trim() || null,
    og_description: String(body.og_description || "").trim() || null,
    og_image_url: featuredImageUrl,
    is_featured: explicitBool(body, "is_featured", existing?.is_featured ?? false),
    is_premium: explicitBool(body, "is_premium", existing?.is_premium ?? false),
    is_video: explicitBool(body, "is_video", existing?.is_video ?? false),
    is_podcast: explicitBool(body, "is_podcast", existing?.is_podcast ?? false),
    is_popular: explicitBool(body, "is_popular", existing?.is_popular ?? false),
    reading_time_minutes: Number(body.reading_time_minutes) || 5,
    published_at: publishedAt,
  };

  async function ensureUniqueSlug(candidate: string, excludeId?: string) {
    let next = candidate;
    for (let i = 0; i < 20; i++) {
      let q = supabase!
        .from("posts")
        .select("id")
        .eq("slug", next)
        .limit(1);
      if (excludeId) q = q.neq("id", excludeId);
      const { data } = await q.maybeSingle();
      if (!data) return next;
      next = `${candidate}-${i + 2}`;
    }
    return `${candidate}-${Date.now()}`;
  }

  let postId = id;
  try {
    if (id) {
      slug = await ensureUniqueSlug(slug, id);
      payload.slug = slug;
      const { error } = await supabase.from("posts").update(payload).eq("id", id);
      if (error) throw error;
    } else {
      slug = await ensureUniqueSlug(slug);
      payload.slug = slug;
      const { data, error } = await supabase
        .from("posts")
        .insert(payload)
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
  if (status === "published") {
    revalidatePath(`/news/${slug}`);
    revalidatePath("/");
  }

  const origin = getSiteUrl().replace(/\/$/, "");
  const previewUrl = `${origin}/preview/news/${postId}`;
  const publicUrl =
    status === "published" ? `${origin}/news/${slug}` : null;

  return NextResponse.json({
    id: postId,
    slug,
    status,
    previewUrl,
    publicUrl,
  });
}
