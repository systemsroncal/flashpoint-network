import PageContainer from "@/components/admin/shared/PageContainer";
import ClassicProgramsTable from "@/components/admin/classic-programs/ClassicProgramsTable";
import {
  getAdminClassicPrograms,
  getClassicProgramsSortMode,
} from "@/lib/admin/queries";

export const dynamic = "force-dynamic";

export default async function AdminClassicProgramsPage() {
  const [programs, sortMode] = await Promise.all([
    getAdminClassicPrograms(),
    getClassicProgramsSortMode(),
  ]);
  return (
    <PageContainer
      title="Family Classics"
      description="Timeless FPTN favorites — grid order and listings"
    >
      <ClassicProgramsTable programs={programs} sortMode={sortMode} />
    </PageContainer>
  );
}
