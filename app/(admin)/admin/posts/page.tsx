import PageContainer from "@/components/admin/shared/PageContainer";
import PostsTable from "@/components/admin/posts/PostsTable";
import { getAdminPosts } from "@/lib/admin/queries";

export const dynamic = "force-dynamic";

export default async function AdminPostsPage() {
  const posts = await getAdminPosts();
  return (
    <PageContainer title="Posts" description="Manage FP Network articles">
      <PostsTable posts={posts} />
    </PageContainer>
  );
}
