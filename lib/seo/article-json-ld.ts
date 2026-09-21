import type { Post } from "@/lib/types/cms";
import type { SiteIdentity } from "@/lib/site-identity/constants";
import { DEFAULT_FOOTER_MARK_URL } from "@/lib/site-identity/constants";
import { absoluteMediaUrl } from "@/lib/media/public-url";
import { youtubeThumbnailUrl } from "@/lib/media/youtube";
import { compactJsonLd } from "@/lib/seo/json-ld";
import { absoluteSiteUrl } from "@/lib/seo/urls";

function authorName(post: Post, siteName: string): string {
  return (
    post.author?.full_name ||
    [post.author?.first_name, post.author?.last_name].filter(Boolean).join(" ") ||
    siteName
  );
}

function articleImages(post: Post, identity: SiteIdentity): string[] | undefined {
  const img =
    absoluteMediaUrl(post.og_image_url) ||
    absoluteMediaUrl(post.featured_image_url) ||
    youtubeThumbnailUrl(post.video_url) ||
    absoluteMediaUrl(identity.defaultFeaturedImageUrl);
  return img ? [img] : undefined;
}

export function buildNewsArticleJsonLd(
  post: Post,
  identity: SiteIdentity,
  options?: { updatedAt?: string | null },
) {
  const siteUrl = absoluteSiteUrl("");
  const url = absoluteSiteUrl(`/news/${post.slug}`);
  const headline = post.seo_title?.trim() || post.title;
  const description = post.seo_description?.trim() || post.excerpt || undefined;
  const publisherLogo =
    absoluteMediaUrl(identity.headerLogoUrl) ||
    `${siteUrl}${DEFAULT_FOOTER_MARK_URL}`;
  const dateModified =
    options?.updatedAt?.trim() || post.published_at || undefined;
  const keywords = post.seo_keywords
    ?.split(",")
    .map((k) => k.trim())
    .filter(Boolean);

  const author = authorName(post, identity.siteName);
  const authorId = post.author_id
    ? `${siteUrl}/#author-${post.author_id}`
    : undefined;

  const videoObject =
    post.video_url
      ? compactJsonLd({
          "@type": "VideoObject",
          name: headline,
          description,
          contentUrl: post.video_url,
          embedUrl: post.video_url,
          thumbnailUrl: articleImages(post, identity)?.[0],
          uploadDate: post.published_at || undefined,
        })
      : undefined;

  const article = compactJsonLd({
    "@context": "https://schema.org",
    "@type": "NewsArticle",
    "@id": `${url}#article`,
    headline,
    name: headline,
    description,
    image: articleImages(post, identity),
    datePublished: post.published_at || undefined,
    dateModified,
    author: {
      "@type": "Person",
      "@id": authorId,
      name: author,
    },
    publisher: {
      "@type": "Organization",
      "@id": `${siteUrl}/#organization`,
      name: identity.siteName,
      logo: {
        "@type": "ImageObject",
        url: publisherLogo,
      },
    },
    mainEntityOfPage: {
      "@type": "WebPage",
      "@id": url,
    },
    url,
    articleSection: post.category?.name || undefined,
    keywords: keywords?.length ? keywords.join(", ") : undefined,
    wordCount: post.reading_time_minutes
      ? Math.max(1, post.reading_time_minutes * 200)
      : undefined,
    timeRequired: post.reading_time_minutes
      ? `PT${post.reading_time_minutes}M`
      : undefined,
    isAccessibleForFree: !post.is_premium,
    inLanguage: "en-US",
    associatedMedia: videoObject,
  });

  return article;
}

export function buildArticleBreadcrumbJsonLd(post: Post) {
  const siteUrl = absoluteSiteUrl("");
  const url = absoluteSiteUrl(`/news/${post.slug}`);
  const items: { name: string; item?: string }[] = [
    { name: "Home", item: siteUrl },
    { name: "News", item: absoluteSiteUrl("/news") },
  ];
  if (post.category?.name && post.category.slug) {
    items.push({
      name: post.category.name,
      item: absoluteSiteUrl(`/category/${post.category.slug}`),
    });
  }
  items.push({ name: post.title, item: url });

  return compactJsonLd({
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: items.map((entry, index) =>
      compactJsonLd({
        "@type": "ListItem",
        position: index + 1,
        name: entry.name,
        item: entry.item,
      }),
    ),
  });
}

export function buildArticleJsonLdGraph(
  post: Post,
  identity: SiteIdentity,
  options?: { updatedAt?: string | null },
) {
  return [
    buildNewsArticleJsonLd(post, identity, options),
    buildArticleBreadcrumbJsonLd(post),
  ];
}
