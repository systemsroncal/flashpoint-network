import { notFound } from "next/navigation";
import NewsArticleView from "@/components/public/NewsArticleView";
import { getArticleSidebar, getPostBySlug } from "@/lib/data/home";

export const dynamic = "force-dynamic";

type Props = {
  params: Promise<{ slug: string }>;
};

export async function generateMetadata({ params }: Props) {
  const { slug } = await params;
  const post = await getPostBySlug(slug);
  if (!post) return { title: "Not found" };
  return {
    title: post.title,
    description: post.excerpt ?? undefined,
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
