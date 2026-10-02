import PageContainer from "@/components/admin/shared/PageContainer";
import ChildrenProgramForm from "@/components/admin/children-programs/ChildrenProgramForm";
import { getAdminChildrenProgram } from "@/lib/admin/queries";

export const dynamic = "force-dynamic";

type Props = {
  params: Promise<{ id: string }>;
};

export default async function EditChildrenProgramPage({ params }: Props) {
  const { id } = await params;
  const program = await getAdminChildrenProgram(id);

  if (!program) {
    return (
      <PageContainer title="Program not found" description="That id is missing.">
        <p>Id: {id}</p>
      </PageContainer>
    );
  }

  return (
    <PageContainer title="Edit children program" description={program.title}>
      <ChildrenProgramForm program={program} />
    </PageContainer>
  );
}
