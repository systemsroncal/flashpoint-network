import PageContainer from "@/components/admin/shared/PageContainer";
import ClassicProgramForm from "@/components/admin/classic-programs/ClassicProgramForm";

export const dynamic = "force-dynamic";

export default function NewClassicProgramPage() {
  return (
    <PageContainer title="New classic program" description="Add a program to the public grid">
      <ClassicProgramForm />
    </PageContainer>
  );
}
