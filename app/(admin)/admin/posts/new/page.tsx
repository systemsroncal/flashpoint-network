import PageContainer from "@/components/admin/shared/PageContainer";
import PostForm from "@/components/admin/posts/PostForm";
import { getAdminCategories } from "@/lib/admin/queries";
import { getSiteName, getSiteUrl } from "@/lib/env";

export const dynamic = "force-dynamic";

export default async function NewPostPage() {
  const categories = await getAdminCategories();
  return (
    <PageContainer title="New news" description="Create a publication">
      <PostForm
        categories={categories}
        siteName={getSiteName()}
        siteUrl={getSiteUrl()}
      />
    </PageContainer>
  );
}
