import { plainTextFromHtml } from "@/lib/seo/plain-text";
import type { Post } from "@/lib/types/cms";

/**
 * News posts: meta description (HTML, JSON-LD, OG/Twitter) defaults to Excerpt.
 */
export function resolvePostMetaDescription(post: Post): string | undefined {
  const custom = post.seo_description?.trim();
  if (custom) return custom;
  const fromExcerpt = plainTextFromHtml(post.excerpt);
  return fromExcerpt || undefined;
}
