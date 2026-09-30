import Link from "next/link";
import { Button, Stack } from "@mui/material";
import PageContainer from "@/components/admin/shared/PageContainer";
import HelpCenterSubmissionsTable from "@/components/admin/help-center/HelpCenterSubmissionsTable";
import { getAdminHelpCenterSubmissions } from "@/lib/admin/queries";

export const dynamic = "force-dynamic";

export default async function AdminHelpCenterFormEntriesPage() {
  const submissions = await getAdminHelpCenterSubmissions();

  return (
    <PageContainer
      title="Help Center"
      description="Entries from the public Help Center form"
    >
      <Stack spacing={2}>
        <Button component={Link} href="/admin/forms" variant="text" sx={{ alignSelf: "flex-start" }}>
          ← All forms
        </Button>
        <HelpCenterSubmissionsTable submissions={submissions} />
      </Stack>
    </PageContainer>
  );
}
