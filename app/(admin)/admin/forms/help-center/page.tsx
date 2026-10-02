import PageContainer from "@/components/admin/shared/PageContainer";
import FormEntriesPageChrome from "@/components/admin/forms/FormEntriesPageChrome";
import HelpCenterSubmissionsTable from "@/components/admin/help-center/HelpCenterSubmissionsTable";
import {
  getAdminFormSubmissionsSchemaReady,
  getAdminHelpCenterSubmissions,
} from "@/lib/admin/queries";

export const dynamic = "force-dynamic";

const HELP_CENTER_SCHEMA_WARNING =
  "The Help Center submissions table is not available on this database. Run npm run db:apply (migration 20260918193000_help_center_submissions.sql) on production.";

export default async function AdminHelpCenterFormEntriesPage() {
  const [submissions, schema] = await Promise.all([
    getAdminHelpCenterSubmissions(),
    getAdminFormSubmissionsSchemaReady(),
  ]);

  return (
    <PageContainer
      title="Help Center"
      description="Entries from the public Help Center form"
    >
      <FormEntriesPageChrome
        backHref="/admin/forms"
        schemaWarning={schema.helpCenter ? null : HELP_CENTER_SCHEMA_WARNING}
      />
      <HelpCenterSubmissionsTable submissions={submissions} />
    </PageContainer>
  );
}
