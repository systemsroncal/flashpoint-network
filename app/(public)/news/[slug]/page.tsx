import type { Metadata } from "next";
import { notFound } from "next/navigation";
import NewsArticleView from "@/components/public/NewsArticleView";
import { recordPostView } from "@/lib/analytics/record-view";
import { getCurrentProfile, isStaffRole } from "@/lib/auth/session";
import { getBannerWidgetsBySlots } from "@/lib/data/banners";
import { getArticleSidebar, getPostBySlug } from "@/lib/data/home";
import { getSiteUrl } from "@/lib/env";
import { absoluteMediaUrl } from "@/lib/media/public-url";
import { youtubeThumbnailUrl } from "@/lib/media/youtube";
import { getPaywallSettings } from "@/lib/paywall/settings";
import { DEFAULT_FOOTER_MARK_URL } from "@/lib/site-identity/constants";
import { getSiteIdentity } from "@/lib/site-identity/settings";

export const dynamic = "force-dynamic";

type Props = {
  params: Promise<{ slug: string }>;
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const [post, identity] = await Promise.all([
    getPostBySlug(slug),
    getSiteIdentity(),
  ]);
  if (!post) return { title: "Not found" };

  const title = post.seo_title?.trim() || post.title;
  const description =
    post.seo_description?.trim() || post.excerpt || undefined;
  const keywords = post.seo_keywords
    ?.split(",")
    .map((k) => k.trim())
    .filter(Boolean);
  const ogTitle = post.og_title?.trim() || title;
  const ogDescription =
    post.og_description?.trim() || description || undefined;
  // Social / meta image ignores show_featured_image (article-hero switch only).
  const ogImage =
    absoluteMediaUrl(post.og_image_url)?.trim() ||
    absoluteMediaUrl(post.featured_image_url)?.trim() ||
    youtubeThumbnailUrl(post.video_url) ||
    absoluteMediaUrl(identity.defaultFeaturedImageUrl) ||
    undefined;
  const url = `${getSiteUrl().replace(/\/$/, "")}/news/${post.slug}`;

  return {
    title,
    description,
    keywords: keywords?.length ? keywords : undefined,
    alternates: { canonical: url },
    openGraph: {
      type: "article",
      siteName: identity.siteName,
      title: ogTitle,
      description: ogDescription,
      url,
      images: ogImage ? [{ url: ogImage }] : undefined,
    },
    twitter: {
      card: ogImage ? "summary_large_image" : "summary",
      title: ogTitle,
      description: ogDescription,
      images: ogImage ? [ogImage] : undefined,
    },
  };
}

export default async function NewsArticlePage({ params }: Props) {
  const { slug } = await params;
  const post = await getPostBySlug(slug);
  if (!post) notFound();

  const [sidebar, paywall, profile, banners, identity] = await Promise.all([
    getArticleSidebar(post.id),
    getPaywallSettings(),
    getCurrentProfile(),
    getBannerWidgetsBySlots([
      "article_above_latest_patriot",
      "article_above_latest_ofc",
    ]),
    getSiteIdentity(),
    recordPostView(post.id),
  ]);

  const paywallBypass = Boolean(
    profile &&
      (isStaffRole(profile.role) ||
        profile.role === "subscriber" ||
        profile.role === "guest"),
  );

  const siteUrl = getSiteUrl().replace(/\/$/, "");
  const url = `${siteUrl}/news/${post.slug}`;
  const authorName =
    post.author?.full_name ||
    [post.author?.first_name, post.author?.last_name].filter(Boolean).join(" ") ||
    identity.siteName;
  const publisherLogo =
    absoluteMediaUrl(identity.headerLogoUrl) ||
    `${siteUrl}${DEFAULT_FOOTER_MARK_URL}`;
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "NewsArticle",
    headline: post.seo_title?.trim() || post.title,
    description: post.seo_description?.trim() || post.excerpt || undefined,
    image: (() => {
      const img =
        absoluteMediaUrl(post.og_image_url) ||
        absoluteMediaUrl(post.featured_image_url) ||
        youtubeThumbnailUrl(post.video_url) ||
        absoluteMediaUrl(identity.defaultFeaturedImageUrl);
      return img ? [img] : undefined;
    })(),
    datePublished: post.published_at || undefined,
    author: {
      "@type": "Person",
      name: authorName,
    },
    publisher: {
      "@type": "Organization",
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
    articleSection: post.category?.name || undefined,
    isAccessibleForFree: !post.is_premium,
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <NewsArticleView
        post={post}
        latest={sidebar.latest}
        podcasts={sidebar.podcasts}
        popular={sidebar.popular}
        previous={sidebar.previous}
        next={sidebar.next}
        paywall={paywall}
        paywallBypass={paywallBypass}
        banners={banners}
      />
    </>
  );
}
