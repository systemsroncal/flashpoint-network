import PageContainer from "@/components/admin/shared/PageContainer";
import MinistryProgramForm from "@/components/admin/network-programs/MinistryProgramForm";

export default function NewMinistryProgramPage() {
  return (
    <PageContainer title="New network program" description="Add a gospel broadcast listing">
      <MinistryProgramForm />
    </PageContainer>
  );
}
