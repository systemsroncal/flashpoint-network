import type { Metadata } from "next";
import { notFound } from "next/navigation";
import JsonLd from "@/components/seo/JsonLd";
import CategoryView from "@/components/public/CategoryView";
import { buildCollectionPageJsonLd } from "@/lib/seo/web-page-json-ld";
import { buildPublicPageMetadata } from "@/lib/seo/metadata";
import { getSiteIdentity } from "@/lib/site-identity/settings";
import { getBannerWidgetsBySlots } from "@/lib/data/banners";
import {
  getArticleSidebar,
  getCategoryBySlug,
  getPostsByCategorySlug,
  getSubcategoriesForCategory,
} from "@/lib/data/home";

export const dynamic = "force-dynamic";

type Props = {
  params: Promise<{ slug: string }>;
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const [category, identity] = await Promise.all([
    getCategoryBySlug(slug),
    getSiteIdentity(),
  ]);
  if (!category) return { title: "Category not found" };
  const description =
    category.description ??
    `${category.name} coverage from FlashPoint Television Network`;
  return buildPublicPageMetadata({
    title: category.name,
    description,
    path: `/category/${slug}`,
    siteName: identity.siteName,
  });
}

export default async function CategoryPage({ params }: Props) {
  const { slug } = await params;
  const category = await getCategoryBySlug(slug);
  if (!category) notFound();

  const [posts, subcategories, sidebar, banners] = await Promise.all([
    getPostsByCategorySlug(slug, 24),
    getSubcategoriesForCategory(category.id),
    getArticleSidebar(),
    getBannerWidgetsBySlots([
      "article_above_latest_patriot",
      "article_above_latest_ofc",
      "category_above_popular",
    ]),
  ]);

  const description =
    category.description ??
    `${category.name} coverage from FlashPoint Television Network`;

  return (
    <>
      <JsonLd
        data={buildCollectionPageJsonLd({
          title: category.name,
          description,
          path: `/category/${slug}`,
        })}
      />
      <CategoryView
        category={category}
        subcategories={subcategories}
        posts={posts}
        podcasts={sidebar.podcasts}
        latest={sidebar.latest}
        popular={sidebar.popular.slice(0, 5)}
        banners={banners}
      />
    </>
  );
}
