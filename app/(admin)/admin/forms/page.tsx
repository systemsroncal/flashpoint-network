import PageContainer from "@/components/admin/shared/PageContainer";
import SiteFormsList from "@/components/admin/forms/SiteFormsList";
import { getAdminSiteFormEntryCounts } from "@/lib/admin/queries";
import { SITE_FORMS } from "@/lib/admin/site-forms";

export const dynamic = "force-dynamic";

export default async function AdminFormsPage() {
  const counts = await getAdminSiteFormEntryCounts();

  return (
    <PageContainer
      title="Forms"
      description="Public site forms and their submissions"
    >
      <SiteFormsList forms={SITE_FORMS} counts={counts} />
    </PageContainer>
  );
}
