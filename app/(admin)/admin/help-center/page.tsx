import PageContainer from "@/components/admin/shared/PageContainer";
import HelpCenterSubmissionsTable from "@/components/admin/help-center/HelpCenterSubmissionsTable";
import { getAdminHelpCenterSubmissions } from "@/lib/admin/queries";

export const dynamic = "force-dynamic";

export default async function AdminHelpCenterPage() {
  const submissions = await getAdminHelpCenterSubmissions();
  return (
    <PageContainer
      title="Help Center"
      description="Contact form submissions from the public Help Center"
    >
      <HelpCenterSubmissionsTable submissions={submissions} />
    </PageContainer>
  );
}
