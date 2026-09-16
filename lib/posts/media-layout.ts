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
 * Whether the public single should render the featured image in the hero.
 * Explicit column wins; otherwise default hide for video/podcast.
 */
export function shouldShowFeaturedImage(
  post: Pick<Post, "show_featured_image"> & MediaHints,
): boolean {
  if (typeof post.show_featured_image === "boolean") {
    return post.show_featured_image;
  }
  return !isVideoOrPodcastPost(post);
}

/** Default for a new/edited form when category or flags become media. */
export function defaultShowFeaturedImage(hints: MediaHints): boolean {
  return !isVideoOrPodcastPost(hints);
}
