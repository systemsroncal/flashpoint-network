import { notFound } from "next/navigation";
import PageContainer from "@/components/admin/shared/PageContainer";
import HelpCenterSubmissionDetail from "@/components/admin/help-center/HelpCenterSubmissionDetail";
import { getAdminHelpCenterSubmission } from "@/lib/admin/queries";

export const dynamic = "force-dynamic";

type Props = {
  params: Promise<{ id: string }>;
};

export default async function AdminHelpCenterEntryPage({ params }: Props) {
  const { id } = await params;
  const submission = await getAdminHelpCenterSubmission(id);
  if (!submission) notFound();

  return (
    <PageContainer title="Help Center entry" description="Submission details">
      <HelpCenterSubmissionDetail submission={submission} />
    </PageContainer>
  );
}
