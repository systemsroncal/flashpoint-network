import PageContainer from "@/components/admin/shared/PageContainer";
import PublicPagesTable from "@/components/admin/pages/PublicPagesTable";
import { listPublicPagesForAdmin } from "@/lib/public-pages/seo-store";

export const dynamic = "force-dynamic";

export default async function AdminPagesSeoListPage() {
  const pages = await listPublicPagesForAdmin();

  return (
    <PageContainer
      title="Pages"
      description="SEO meta title, description, and social images for public routes"
    >
      <PublicPagesTable pages={pages} />
    </PageContainer>
  );
}
