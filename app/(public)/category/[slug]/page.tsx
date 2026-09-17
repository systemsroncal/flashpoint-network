import { notFound } from "next/navigation";
import CategoryView from "@/components/public/CategoryView";
import { getBannerWidgetsBySlots } from "@/lib/data/banners";
import {
  getArticleSidebar,
  getCategoryBySlug,
  getPostsByCategorySlug,
} from "@/lib/data/home";

export const dynamic = "force-dynamic";

type Props = {
  params: Promise<{ slug: string }>;
};

export async function generateMetadata({ params }: Props) {
  const { slug } = await params;
  const category = await getCategoryBySlug(slug);
  if (!category) return { title: "Category not found" };
  return {
    title: category.name,
    description:
      category.description ?? `${category.name} coverage from Flash Point Network`,
  };
}

export default async function CategoryPage({ params }: Props) {
  const { slug } = await params;
  const category = await getCategoryBySlug(slug);
  if (!category) notFound();

  const [posts, sidebar, banners] = await Promise.all([
    getPostsByCategorySlug(slug, 24),
    getArticleSidebar(),
    getBannerWidgetsBySlots(["category_above_popular"]),
  ]);

  return (
    <CategoryView
      category={category}
      posts={posts}
      podcasts={sidebar.podcasts}
      latest={sidebar.latest}
      popular={sidebar.popular.slice(0, 5)}
      banners={banners}
    />
  );
}
