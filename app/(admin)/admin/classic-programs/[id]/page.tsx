import PageContainer from "@/components/admin/shared/PageContainer";
import ClassicProgramForm from "@/components/admin/classic-programs/ClassicProgramForm";
import { getAdminClassicProgram } from "@/lib/admin/queries";

export const dynamic = "force-dynamic";

type Props = {
  params: Promise<{ id: string }>;
};

export default async function EditClassicProgramPage({ params }: Props) {
  const { id } = await params;
  const program = await getAdminClassicProgram(id);

  if (!program) {
    return (
      <PageContainer title="Program not found" description="That id is missing.">
        <p>Id: {id}</p>
      </PageContainer>
    );
  }

  return (
    <PageContainer title="Edit classic program" description={program.title}>
      <ClassicProgramForm program={program} />
    </PageContainer>
  );
}
