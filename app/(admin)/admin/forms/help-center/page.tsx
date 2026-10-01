import Link from "next/link";
import { Alert, Button, Stack } from "@mui/material";
import PageContainer from "@/components/admin/shared/PageContainer";
import HelpCenterSubmissionsTable from "@/components/admin/help-center/HelpCenterSubmissionsTable";
import {
  getAdminFormSubmissionsSchemaReady,
  getAdminHelpCenterSubmissions,
} from "@/lib/admin/queries";

export const dynamic = "force-dynamic";

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
      <Stack spacing={2}>
        <Button component={Link} href="/admin/forms" variant="text" sx={{ alignSelf: "flex-start" }}>
          ← All forms
        </Button>
        {!schema.helpCenter ? (
          <Alert severity="warning">
            The Help Center submissions table is not available on this database.
            Run <code>npm run db:apply</code> (migration{" "}
            <code>20260918193000_help_center_submissions.sql</code>) on production.
          </Alert>
        ) : null}
        <HelpCenterSubmissionsTable submissions={submissions} />
      </Stack>
    </PageContainer>
  );
}
