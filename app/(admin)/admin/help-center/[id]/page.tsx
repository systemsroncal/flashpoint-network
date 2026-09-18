import { notFound } from "next/navigation";
import PageContainer from "@/components/admin/shared/PageContainer";
import HelpCenterSubmissionDetail from "@/components/admin/help-center/HelpCenterSubmissionDetail";
import {
  getAdminHelpCenterSubmission,
} from "@/lib/admin/queries";
import { createAdminClient } from "@/lib/supabase/admin";

export const dynamic = "force-dynamic";

type Props = { params: Promise<{ id: string }> };

export default async function AdminHelpCenterDetailPage({ params }: Props) {
  const { id } = await params;
  const submission = await getAdminHelpCenterSubmission(id);
  if (!submission) notFound();

  if (!submission.read_at) {
    const admin = createAdminClient();
    if (admin) {
      await admin
        .from("help_center_submissions")
        .update({ read_at: new Date().toISOString() })
        .eq("id", id);
    }
  }

  return (
    <PageContainer title="Help Center request" description="Submission details">
      <HelpCenterSubmissionDetail submission={submission} />
    </PageContainer>
  );
}
