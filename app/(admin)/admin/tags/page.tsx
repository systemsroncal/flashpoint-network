import PageContainer from "@/components/admin/shared/PageContainer";
import TagsManager from "@/components/admin/tags/TagsManager";
import { getAdminTags } from "@/lib/admin/queries";

export const dynamic = "force-dynamic";

export default async function AdminTagsPage() {
  const tags = await getAdminTags();
  return (
    <PageContainer title="Tags" description="Editorial tags">
      <TagsManager tags={tags} />
    </PageContainer>
  );
}
