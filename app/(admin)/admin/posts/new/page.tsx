import PageContainer from "@/components/admin/shared/PageContainer";
import PostForm from "@/components/admin/posts/PostForm";
import { getAdminCategories, getAdminTags } from "@/lib/admin/queries";
import { getSiteName, getSiteUrl } from "@/lib/env";

export const dynamic = "force-dynamic";

export default async function NewPostPage() {
  const [categories, tags] = await Promise.all([
    getAdminCategories(),
    getAdminTags(),
  ]);
  return (
    <PageContainer title="New news" description="Create a publication">
      <PostForm
        categories={categories}
        tags={tags}
        siteName={getSiteName()}
        siteUrl={getSiteUrl()}
      />
    </PageContainer>
  );
}
