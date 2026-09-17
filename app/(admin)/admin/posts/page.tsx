import PageContainer from "@/components/admin/shared/PageContainer";
import PostsTable from "@/components/admin/posts/PostsTable";
import {
  getAdminCategories,
  getAdminPostsPage,
  getAdminTags,
} from "@/lib/admin/queries";

export const dynamic = "force-dynamic";

type Props = {
  searchParams: Promise<{
    q?: string;
    category?: string;
    tag?: string;
    page?: string;
  }>;
};

export default async function AdminPostsPage({ searchParams }: Props) {
  const sp = await searchParams;
  const q = (sp.q || "").trim();
  const categoryId = (sp.category || "").trim();
  const tagId = (sp.tag || "").trim();
  const page = Math.max(1, Number(sp.page || 1) || 1);

  const [result, categories, tags] = await Promise.all([
    getAdminPostsPage({ q, categoryId, tagId, page, pageSize: 20 }),
    getAdminCategories(),
    getAdminTags(),
  ]);

  return (
    <PageContainer title="News" description="Manage FP Network articles">
      <PostsTable
        posts={result.posts}
        categories={categories}
        tags={tags}
        total={result.total}
        page={result.page}
        pageSize={result.pageSize}
        totalPages={result.totalPages}
        filters={{ q, categoryId, tagId }}
      />
    </PageContainer>
  );
}
