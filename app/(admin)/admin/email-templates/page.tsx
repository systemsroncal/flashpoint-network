import PageContainer from "@/components/admin/shared/PageContainer";
import EmailTemplatesManager from "@/components/admin/email/EmailTemplatesManager";
import { getAdminEmailTemplates } from "@/lib/admin/queries";
import { getSiteName } from "@/lib/env";

export const dynamic = "force-dynamic";

export default async function AdminEmailTemplatesPage() {
  const templates = await getAdminEmailTemplates();
  return (
    <PageContainer title="Email templates" description="Transactional email design and shortcodes">
      <EmailTemplatesManager
        templates={templates as never}
        siteName={getSiteName()}
      />
    </PageContainer>
  );
}
