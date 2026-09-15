import type { Metadata } from "next";
import { notFound } from "next/navigation";
import NewsArticleView from "@/components/public/NewsArticleView";
import { getArticleSidebar, getPostBySlug } from "@/lib/data/home";
import { getSiteName, getSiteUrl } from "@/lib/env";

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
  // Social / meta image is always the featured image
  const ogImage = post.featured_image_url?.trim() || undefined;
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

  const sidebar = await getArticleSidebar(post.id);

  return (
    <NewsArticleView
      post={post}
      latest={sidebar.latest}
      podcasts={sidebar.podcasts}
      popular={sidebar.popular}
      previous={sidebar.previous}
      next={sidebar.next}
    />
  );
}
