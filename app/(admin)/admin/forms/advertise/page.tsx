import Link from "next/link";
import { Button, Stack } from "@mui/material";
import PageContainer from "@/components/admin/shared/PageContainer";
import AdvertiseInquiriesTable from "@/components/admin/forms/AdvertiseInquiriesTable";
import { getAdminAdvertiseInquiries } from "@/lib/admin/queries";

export const dynamic = "force-dynamic";

export default async function AdminAdvertiseFormEntriesPage() {
  const inquiries = await getAdminAdvertiseInquiries();

  return (
    <PageContainer
      title="Advertising inquiry"
      description="Entries from /advertise"
    >
      <Stack spacing={2}>
        <Button component={Link} href="/admin/forms" variant="text" sx={{ alignSelf: "flex-start" }}>
          ← All forms
        </Button>
        <AdvertiseInquiriesTable inquiries={inquiries} />
      </Stack>
    </PageContainer>
  );
}
