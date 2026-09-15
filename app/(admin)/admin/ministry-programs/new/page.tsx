import PageContainer from "@/components/admin/shared/PageContainer";
import MinistryProgramForm from "@/components/admin/ministry-programs/MinistryProgramForm";

export default function NewMinistryProgramPage() {
  return (
    <PageContainer title="New ministry program" description="Add a gospel broadcast listing">
      <MinistryProgramForm />
    </PageContainer>
  );
}
