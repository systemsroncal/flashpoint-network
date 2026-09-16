import PageContainer from "@/components/admin/shared/PageContainer";
import MinistryProgramForm from "@/components/admin/network-programs/MinistryProgramForm";
import { getAdminMinistryProgram } from "@/lib/admin/queries";

export const dynamic = "force-dynamic";

type Props = {
  params: Promise<{ id: string }>;
};

export default async function EditMinistryProgramPage({ params }: Props) {
  const { id } = await params;
  const program = await getAdminMinistryProgram(id);

  if (!program) {
    return (
      <PageContainer title="Program not found" description="That id is missing.">
        <p>Id: {id}</p>
      </PageContainer>
    );
  }

  return (
    <PageContainer title="Edit network program" description={program.title}>
      <MinistryProgramForm program={program} />
    </PageContainer>
  );
}
