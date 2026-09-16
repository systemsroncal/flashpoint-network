import type { Metadata } from "next";
import { notFound } from "next/navigation";
import NewsArticleView from "@/components/public/NewsArticleView";
import { recordPostView } from "@/lib/analytics/record-view";
import { getCurrentProfile, isStaffRole } from "@/lib/auth/session";
import { getArticleSidebar, getPostBySlug } from "@/lib/data/home";
import { getSiteName, getSiteUrl } from "@/lib/env";
import { absoluteMediaUrl } from "@/lib/media/public-url";
import { getPaywallSettings } from "@/lib/paywall/settings";

export const dynamic = "force-dynamic";

type Props = {
  params: Promise<{ slug: string }>;
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const post = await getPostBySlug(slug);
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
    undefined;
  const url = `${getSiteUrl().replace(/\/$/, "")}/news/${post.slug}`;

  return {
    title,
    description,
    keywords: keywords?.length ? keywords : undefined,
    alternates: { canonical: url },
    openGraph: {
      type: "article",
      siteName: getSiteName(),
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

  const [sidebar, paywall, profile] = await Promise.all([
    getArticleSidebar(post.id),
    getPaywallSettings(),
    getCurrentProfile(),
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
    getSiteName();
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "NewsArticle",
    headline: post.seo_title?.trim() || post.title,
    description: post.seo_description?.trim() || post.excerpt || undefined,
    image: (() => {
      const img =
        absoluteMediaUrl(post.og_image_url) ||
        absoluteMediaUrl(post.featured_image_url);
      return img ? [img] : undefined;
    })(),
    datePublished: post.published_at || undefined,
    author: {
      "@type": "Person",
      name: authorName,
    },
    publisher: {
      "@type": "Organization",
      name: getSiteName(),
      logo: {
        "@type": "ImageObject",
        url: `${siteUrl}/brand/fpn-logo-mark.svg`,
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
      />
    </>
  );
}
