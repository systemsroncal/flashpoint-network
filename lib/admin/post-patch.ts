import type { PostStatus } from "@/lib/types/cms";
import {
  normalizeHtmlMediaForStorage,
  normalizeStoredMediaUrl,
} from "@/lib/media/public-url";
import { resolvePublishedAt } from "@/lib/admin/published-at";

/** Columns the News editor may write. Never includes updated_at / created_at / view_count. */
export type PostWritable = {
  title: string;
  slug: string;
  excerpt: string;
  body: string;
  status: PostStatus;
  category_id: string | null;
  featured_image_url: string | null;
  video_url: string | null;
  seo_title: string | null;
  seo_description: string | null;
  seo_keywords: string | null;
  og_title: string | null;
  og_description: string | null;
  og_image_url: string | null;
  is_featured: boolean;
  is_premium: boolean;
  is_video: boolean;
  is_podcast: boolean;
  is_popular: boolean;
  reading_time_minutes: number;
  published_at: string | null;
};

export type PostExistingRow = PostWritable & {
  author_id: string | null;
};

export const POST_EXISTING_SELECT =
  "title, slug, excerpt, body, status, category_id, author_id, featured_image_url, video_url, seo_title, seo_description, seo_keywords, og_title, og_description, og_image_url, is_featured, is_premium, is_video, is_podcast, is_popular, reading_time_minutes, published_at";

export type PublishedAtInput = {
  submittedRaw: string;
  displayInitial: string;
  originalIso: string | null;
};

/** True when the editor changed the datetime-local control (not a TZ round-trip). */
export function didChangePublishedAtDisplay(input: PublishedAtInput): boolean {
  const submitted = input.submittedRaw.trim();
  const displayInitial = input.displayInitial.trim();
  if (!displayInitial && !submitted) return false;
  if (!submitted) {
    // Cleared the field while an original existed — treat as intentional clear only
    // if we later decide to allow clearing; for now blank means "keep" so not a change.
    return false;
  }
  return submitted !== displayInitial;
}

function normText(value: string | null | undefined): string {
  return (value ?? "").trim();
}

function sameNullableString(
  a: string | null | undefined,
  b: string | null | undefined,
): boolean {
  const left = a == null || a === "" ? null : a;
  const right = b == null || b === "" ? null : b;
  return left === right;
}

function sameBody(candidate: string, existing: string | null | undefined): boolean {
  const next = candidate ?? "";
  const prev = existing ?? "";
  if (next === prev) return true;
  // Avoid writing when only silent media-path re-normalization differs.
  return (
    normalizeHtmlMediaForStorage(next) === normalizeHtmlMediaForStorage(prev)
  );
}

/**
 * Diff candidate vs existing. Returns only keys whose values actually change.
 * Omits author_id always. Omits published_at unless the publish datetime control
 * changed, or this is the first publish (status → published and no existing date).
 */
export function diffPostPatch(
  candidate: PostWritable,
  existing: PostExistingRow,
  publishedAtInput: PublishedAtInput,
): Partial<PostWritable> {
  const patch: Partial<PostWritable> = {};

  if (candidate.title !== existing.title) patch.title = candidate.title;
  if (candidate.slug !== existing.slug) patch.slug = candidate.slug;
  if (normText(candidate.excerpt) !== normText(existing.excerpt)) {
    patch.excerpt = candidate.excerpt;
  }
  if (!sameBody(candidate.body, existing.body)) patch.body = candidate.body;
  if (candidate.status !== existing.status) patch.status = candidate.status;
  if (!sameNullableString(candidate.category_id, existing.category_id)) {
    patch.category_id = candidate.category_id;
  }
  if (
    !sameNullableString(
      candidate.featured_image_url,
      existing.featured_image_url,
    )
  ) {
    patch.featured_image_url = candidate.featured_image_url;
  }
  if (!sameNullableString(candidate.video_url, existing.video_url)) {
    patch.video_url = candidate.video_url;
  }
  if (!sameNullableString(candidate.seo_title, existing.seo_title)) {
    patch.seo_title = candidate.seo_title;
  }
  if (!sameNullableString(candidate.seo_description, existing.seo_description)) {
    patch.seo_description = candidate.seo_description;
  }
  if (!sameNullableString(candidate.seo_keywords, existing.seo_keywords)) {
    patch.seo_keywords = candidate.seo_keywords;
  }
  if (!sameNullableString(candidate.og_title, existing.og_title)) {
    patch.og_title = candidate.og_title;
  }
  if (!sameNullableString(candidate.og_description, existing.og_description)) {
    patch.og_description = candidate.og_description;
  }
  // og_image tracks featured image; only write when featured image changed or
  // og_image already drifted from featured.
  if (
    patch.featured_image_url !== undefined ||
    !sameNullableString(candidate.og_image_url, existing.og_image_url)
  ) {
    if (!sameNullableString(candidate.og_image_url, existing.og_image_url)) {
      patch.og_image_url = candidate.og_image_url;
    } else if (patch.featured_image_url !== undefined) {
      patch.og_image_url = candidate.og_image_url;
    }
  }
  if (candidate.is_featured !== Boolean(existing.is_featured)) {
    patch.is_featured = candidate.is_featured;
  }
  if (candidate.is_premium !== Boolean(existing.is_premium)) {
    patch.is_premium = candidate.is_premium;
  }
  if (candidate.is_video !== Boolean(existing.is_video)) {
    patch.is_video = candidate.is_video;
  }
  if (candidate.is_podcast !== Boolean(existing.is_podcast)) {
    patch.is_podcast = candidate.is_podcast;
  }
  if (candidate.is_popular !== Boolean(existing.is_popular)) {
    patch.is_popular = candidate.is_popular;
  }
  if (candidate.reading_time_minutes !== existing.reading_time_minutes) {
    patch.reading_time_minutes = candidate.reading_time_minutes;
  }

  const firstPublish =
    candidate.status === "published" &&
    !existing.published_at &&
    existing.status !== "published";

  const publishDateEdited = didChangePublishedAtDisplay(publishedAtInput);

  if (publishDateEdited || firstPublish) {
    const nextPublishedAt = resolvePublishedAt({
      submittedRaw: publishedAtInput.submittedRaw,
      displayInitial: publishedAtInput.displayInitial,
      originalIso: publishedAtInput.originalIso ?? existing.published_at,
      existingIso: existing.published_at,
      status: candidate.status,
    });
    if (!sameNullableString(nextPublishedAt, existing.published_at)) {
      patch.published_at = nextPublishedAt;
    }
  }

  return patch;
}

export function buildCandidateFromFormValues(input: {
  title: string;
  slug: string;
  excerpt: string;
  body: string;
  status: PostStatus;
  categoryId: string | null;
  featuredImageUrl: string | null;
  videoUrl: string | null;
  seoTitle: string | null;
  seoDescription: string | null;
  seoKeywords: string | null;
  ogTitle: string | null;
  ogDescription: string | null;
  isFeatured: boolean;
  isPremium: boolean;
  isVideo: boolean;
  isPodcast: boolean;
  isPopular: boolean;
  readingTime: number;
  publishedAt: string | null;
}): PostWritable {
  const featured = normalizeStoredMediaUrl(input.featuredImageUrl);
  return {
    title: input.title,
    slug: input.slug,
    excerpt: input.excerpt,
    body: normalizeHtmlMediaForStorage(input.body),
    status: input.status,
    category_id: input.categoryId,
    featured_image_url: featured,
    video_url: input.videoUrl,
    seo_title: input.seoTitle,
    seo_description: input.seoDescription,
    seo_keywords: input.seoKeywords,
    og_title: input.ogTitle,
    og_description: input.ogDescription,
    og_image_url: featured,
    is_featured: input.isFeatured,
    is_premium: input.isPremium,
    is_video: input.isVideo,
    is_podcast: input.isPodcast,
    is_popular: input.isPopular,
    reading_time_minutes: input.readingTime,
    published_at: input.publishedAt,
  };
}
