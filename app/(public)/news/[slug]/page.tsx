import type { Metadata } from "next";
import { notFound } from "next/navigation";
import JsonLd from "@/components/seo/JsonLd";
import NewsArticleView from "@/components/public/NewsArticleView";
import { recordPostView } from "@/lib/analytics/record-view";
import { getCurrentProfile, isStaffRole } from "@/lib/auth/session";
import { getBannerWidgetsBySlots } from "@/lib/data/banners";
import { getPostComments } from "@/lib/data/post-comments";
import { getArticleSidebar, getPostBySlug } from "@/lib/data/home";
import { getPaywallSettings } from "@/lib/paywall/settings";
import { buildArticleJsonLdGraph } from "@/lib/seo/article-json-ld";
import { buildNewsPostMetadata } from "@/lib/seo/post-metadata";
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

  return buildNewsPostMetadata(post, identity);
}

export default async function NewsArticlePage({ params }: Props) {
  const { slug } = await params;
  const post = await getPostBySlug(slug);
  if (!post) notFound();

  const [sidebar, paywall, profile, banners, identity, comments] = await Promise.all([
    getArticleSidebar(post.id),
    getPaywallSettings(),
    getCurrentProfile(),
    getBannerWidgetsBySlots([
      "article_above_latest_patriot",
      "article_above_latest_ofc",
    ]),
    getSiteIdentity(),
    getPostComments(post.id),
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
        comments={comments}
        isLoggedIn={Boolean(profile)}
        commentViewerProfile={profile}
        canEditInAdmin={Boolean(profile && isStaffRole(profile.role))}
      />
    </>
  );
}
