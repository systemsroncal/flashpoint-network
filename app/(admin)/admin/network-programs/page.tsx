import PageContainer from "@/components/admin/shared/PageContainer";
import MinistryProgramsTable from "@/components/admin/network-programs/MinistryProgramsTable";
import {
  getAdminMinistryPrograms,
  getMinistryProgramsSortMode,
} from "@/lib/admin/queries";

export const dynamic = "force-dynamic";

export default async function AdminMinistryProgramsPage() {
  const [programs, sortMode] = await Promise.all([
    getAdminMinistryPrograms(),
    getMinistryProgramsSortMode(),
  ]);
  return (
    <PageContainer
      title="Network Programs"
      description="Gospel broadcasts — grid order and listings"
    >
      <MinistryProgramsTable programs={programs} sortMode={sortMode} />
    </PageContainer>
  );
}
