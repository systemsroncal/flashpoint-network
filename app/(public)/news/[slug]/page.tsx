import type { Metadata } from "next";
import { notFound } from "next/navigation";
import JsonLd from "@/components/seo/JsonLd";
import NewsArticleView from "@/components/public/NewsArticleView";
import { recordPostView } from "@/lib/analytics/record-view";
import { getCurrentProfile, isStaffRole } from "@/lib/auth/session";
import { getBannerWidgetsBySlots } from "@/lib/data/banners";
import { getArticleSidebar, getPostBySlug } from "@/lib/data/home";
import { absoluteMediaUrl } from "@/lib/media/public-url";
import { youtubeThumbnailUrl } from "@/lib/media/youtube";
import { getPaywallSettings } from "@/lib/paywall/settings";
import { buildArticleJsonLdGraph } from "@/lib/seo/article-json-ld";
import { absoluteSiteUrl } from "@/lib/seo/urls";
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
  if (!post) return { title: "Not found", robots: { index: false, follow: false } };

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
  const ogImage =
    absoluteMediaUrl(post.og_image_url)?.trim() ||
    absoluteMediaUrl(post.featured_image_url)?.trim() ||
    youtubeThumbnailUrl(post.video_url) ||
    absoluteMediaUrl(identity.defaultFeaturedImageUrl) ||
    undefined;
  const url = absoluteSiteUrl(`/news/${post.slug}`);

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
      images: ogImage ? [{ url: ogImage, alt: title }] : undefined,
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

  const jsonLd = buildArticleJsonLdGraph(post, identity, {
    updatedAt: post.updated_at,
  });

  return (
    <>
      <JsonLd data={jsonLd} />
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
