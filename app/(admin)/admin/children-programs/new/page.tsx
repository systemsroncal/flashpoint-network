import PageContainer from "@/components/admin/shared/PageContainer";
import ChildrenProgramForm from "@/components/admin/children-programs/ChildrenProgramForm";

export const dynamic = "force-dynamic";

export default function NewChildrenProgramPage() {
  return (
    <PageContainer title="New classic program" description="Add a program to the public grid">
      <ChildrenProgramForm />
    </PageContainer>
  );
}
