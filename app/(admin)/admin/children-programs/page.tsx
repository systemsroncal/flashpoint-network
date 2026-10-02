import PageContainer from "@/components/admin/shared/PageContainer";
import ChildrenProgramsTable from "@/components/admin/children-programs/ChildrenProgramsTable";
import {
  getAdminChildrenPrograms,
  getChildrenProgramsSortMode,
} from "@/lib/admin/queries";

export const dynamic = "force-dynamic";

export default async function AdminChildrenProgramsPage() {
  const [programs, sortMode] = await Promise.all([
    getAdminChildrenPrograms(),
    getChildrenProgramsSortMode(),
  ]);
  return (
    <PageContainer
      title="Children Programs"
      description="Timeless FPTN favorites — grid order and listings"
    >
      <ChildrenProgramsTable programs={programs} sortMode={sortMode} />
    </PageContainer>
  );
}
