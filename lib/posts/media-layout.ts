import type { Post } from "@/lib/types/cms";

type MediaHints = {
  is_video?: boolean | null;
  is_podcast?: boolean | null;
  category?: { slug?: string | null; name?: string | null } | null;
  category_id?: string | null;
};

const VIDEO_CATEGORY_ID = "b1000000-0000-4000-8000-00000000000b";

function categoryLooksMedia(category: MediaHints["category"]): boolean {
  const slug = (category?.slug ?? "").trim().toLowerCase();
  const name = (category?.name ?? "").trim().toLowerCase();
  return (
    slug === "video" ||
    slug === "podcast" ||
    slug === "podcasts" ||
    name === "video" ||
    name === "podcast" ||
    name === "podcasts"
  );
}

/** Video/Podcast via placement flags or category name/slug. */
export function isVideoOrPodcastPost(post: MediaHints): boolean {
  if (post.is_video || post.is_podcast) return true;
  if (post.category_id === VIDEO_CATEGORY_ID) return true;
  return categoryLooksMedia(post.category ?? null);
}

/**
 * Article-page hero only.
 *
 * `show_featured_image` controls whether NewsArticleView renders the featured
 * image in the single-post hero (when false + video_url, the player occupies
 * that slot). It must NOT gate:
 * - Home grids / PostCards / category lists / podcasts rail thumbs
 * - SEO / Open Graph / Twitter / JSON-LD (always use featured_image_url / og_image)
 *
 * Explicit column wins; otherwise default hide for video/podcast.
 */
export function shouldShowFeaturedImageInArticleHero(
  post: Pick<Post, "show_featured_image"> & MediaHints,
): boolean {
  if (typeof post.show_featured_image === "boolean") {
    return post.show_featured_image;
  }
  return !isVideoOrPodcastPost(post);
}

/** @deprecated Use shouldShowFeaturedImageInArticleHero — name clarifies scope. */
export const shouldShowFeaturedImage = shouldShowFeaturedImageInArticleHero;

/** Default for a new/edited form when category or flags become media. */
export function defaultShowFeaturedImage(hints: MediaHints): boolean {
  return !isVideoOrPodcastPost(hints);
}
