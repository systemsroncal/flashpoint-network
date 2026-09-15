import { NextResponse } from "next/server";
import { revalidatePath } from "next/cache";
import { requireStaffProfile } from "@/lib/auth/session";
import { createAdminClient } from "@/lib/supabase/admin";
import { getSiteUrl } from "@/lib/env";
import { slugify } from "@/lib/slug";
import type { PostStatus } from "@/lib/types/cms";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

function boolFrom(value: unknown): boolean {
  return value === true || value === "on" || value === "true" || value === "1";
}

/**
 * Save current News form fields as a draft (or keep status) and return a
 * staff-only preview URL — WordPress-style "Preview Changes".
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
  const publishedAt = publishedAtRaw
    ? new Date(publishedAtRaw).toISOString()
    : status === "published"
      ? new Date().toISOString()
      : null;

  const payload = {
    title,
    slug,
    excerpt: String(body.excerpt || ""),
    body: String(body.body || ""),
    status,
    category_id: String(body.category_id || "") || null,
    author_id: profile.id,
    featured_image_url: featuredImageUrl,
    video_url: String(body.video_url || "").trim() || null,
    seo_title: String(body.seo_title || "").trim() || null,
    seo_description: String(body.seo_description || "").trim() || null,
    seo_keywords: String(body.seo_keywords || "").trim() || null,
    og_title: String(body.og_title || "").trim() || null,
    og_description: String(body.og_description || "").trim() || null,
    og_image_url: featuredImageUrl,
    is_featured: boolFrom(body.is_featured),
    is_premium: boolFrom(body.is_premium),
    is_video: boolFrom(body.is_video),
    is_podcast: boolFrom(body.is_podcast),
    reading_time_minutes: Number(body.reading_time_minutes) || 5,
    published_at: publishedAt,
  };

  // Ensure unique slug on create/update collision
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
