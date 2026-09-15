import PageContainer from "@/components/admin/shared/PageContainer";
import CategoriesManager from "@/components/admin/categories/CategoriesManager";
import { getAdminCategories } from "@/lib/admin/queries";

export const dynamic = "force-dynamic";

export default async function AdminCategoriesPage() {
  const categories = await getAdminCategories();
  return (
    <PageContainer title="Categories" description="Home navigation categories">
      <CategoriesManager categories={categories} />
    </PageContainer>
  );
}
