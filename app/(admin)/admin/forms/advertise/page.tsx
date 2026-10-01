import Link from "next/link";
import { Alert, Button, Stack } from "@mui/material";
import PageContainer from "@/components/admin/shared/PageContainer";
import AdvertiseInquiriesTable from "@/components/admin/forms/AdvertiseInquiriesTable";
import {
  getAdminAdvertiseInquiries,
  getAdminFormSubmissionsSchemaReady,
} from "@/lib/admin/queries";

export const dynamic = "force-dynamic";

export default async function AdminAdvertiseFormEntriesPage() {
  const [inquiries, schema] = await Promise.all([
    getAdminAdvertiseInquiries(),
    getAdminFormSubmissionsSchemaReady(),
  ]);

  return (
    <PageContainer
      title="Advertising inquiry"
      description="Entries from /advertise"
    >
      <Stack spacing={2}>
        <Button component={Link} href="/admin/forms" variant="text" sx={{ alignSelf: "flex-start" }}>
          ← All forms
        </Button>
        {!schema.advertise ? (
          <Alert severity="warning">
            The advertising inquiries table is not available on this database.
            Run <code>npm run db:apply</code> (migration{" "}
            <code>20260930190000_advertise_inquiries.sql</code>) on production.
          </Alert>
        ) : null}
        <AdvertiseInquiriesTable inquiries={inquiries} />
      </Stack>
    </PageContainer>
  );
}
