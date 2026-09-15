import PageContainer from "@/components/admin/shared/PageContainer";
import EmailTemplatesManager from "@/components/admin/email/EmailTemplatesManager";
import { getAdminEmailTemplates } from "@/lib/admin/queries";

export const dynamic = "force-dynamic";

export default async function AdminEmailTemplatesPage() {
  const templates = await getAdminEmailTemplates();
  return (
    <PageContainer title="Email templates" description="Transactional email stubs">
      <EmailTemplatesManager templates={templates as never} />
    </PageContainer>
  );
}
