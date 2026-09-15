import PageContainer from "@/components/admin/shared/PageContainer";
import MediaGrid from "@/components/admin/media/MediaGrid";
import { getAdminMedia } from "@/lib/admin/queries";

export const dynamic = "force-dynamic";

export default async function AdminMediaPage() {
  const items = await getAdminMedia();
  return (
    <PageContainer title="Media" description="Images attached to posts">
      <MediaGrid items={items} />
    </PageContainer>
  );
}
