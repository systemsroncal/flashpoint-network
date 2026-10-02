import type { Metadata } from "next";
import { absoluteMediaUrl } from "@/lib/media/public-url";
import { youtubeThumbnailUrl } from "@/lib/media/youtube";
import { resolvePostMetaDescription } from "@/lib/seo/post-description";
import { plainTextFromHtml } from "@/lib/seo/plain-text";
import { absoluteSiteUrl } from "@/lib/seo/urls";
import type { SiteIdentity } from "@/lib/site-identity/constants";
import type { Post } from "@/lib/types/cms";

export function buildNewsPostMetadata(
  post: Post,
  identity: SiteIdentity,
): Metadata {
  const title = post.seo_title?.trim() || post.title;
  const description = resolvePostMetaDescription(post);

  const keywords = post.seo_keywords
    ?.split(",")
    .map((k) => k.trim())
    .filter(Boolean);

  const ogTitle = post.og_title?.trim() || title;
  const ogDescription =
    post.og_description?.trim() || description || undefined;

  const ogImage =
    absoluteMediaUrl(post.og_image_url)?.trim() ||
    absoluteMediaUrl(post.featured_image_url)?.trim() ||
    youtubeThumbnailUrl(post.video_url) ||
    absoluteMediaUrl(identity.defaultFeaturedImageUrl)?.trim() ||
    undefined;

  const url = absoluteSiteUrl(`/news/${post.slug}`);
  const imageEntry = ogImage
    ? [{ url: ogImage, width: 1200, height: 630, alt: ogTitle }]
    : undefined;

  return {
    title,
    description,
    keywords: keywords?.length ? keywords : undefined,
    alternates: { canonical: url },
    robots: { index: true, follow: true },
    openGraph: {
      type: "article",
      locale: "en_US",
      siteName: identity.siteName,
      title: ogTitle,
      description: ogDescription,
      url,
      publishedTime: post.published_at || undefined,
      modifiedTime: post.updated_at || post.published_at || undefined,
      section: post.category?.name || undefined,
      tags: keywords?.length ? keywords : undefined,
      images: imageEntry,
    },
    twitter: {
      card: ogImage ? "summary_large_image" : "summary",
      title: ogTitle,
      description: ogDescription,
      images: ogImage ? [ogImage] : undefined,
    },
  };
}

/** Text pre-filled in X intent / share UI (card still comes from page OG tags). */
export function newsShareComposeText(post: Post): string {
  const excerpt = plainTextFromHtml(post.excerpt);
  if (excerpt) return excerpt;
  return post.seo_title?.trim() || post.title;
}
