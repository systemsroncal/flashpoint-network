import PageContainer from "@/components/admin/shared/PageContainer";
import MediaGrid from "@/components/admin/media/MediaGrid";

export const dynamic = "force-dynamic";

export default function AdminMediaPage() {
  return (
    <PageContainer
      title="Media"
      description="Uploads on the server — browse by month, search, and copy URLs"
    >
      <MediaGrid />
    </PageContainer>
  );
}
