import PageContainer from "@/components/admin/shared/PageContainer";
import ScheduleEntryForm from "@/components/admin/schedule-programs/ScheduleEntryForm";
import { getAdminScheduleEntry } from "@/lib/admin/queries";

export const dynamic = "force-dynamic";

type Props = {
  params: Promise<{ id: string }>;
};

export default async function EditScheduleEntryPage({ params }: Props) {
  const { id } = await params;
  const entry = await getAdminScheduleEntry(id);

  if (!entry) {
    return (
      <PageContainer title="Entry not found" description="That id is missing.">
        <p>Id: {id}</p>
      </PageContainer>
    );
  }

  return (
    <PageContainer title="Edit schedule entry" description={entry.title}>
      <ScheduleEntryForm entry={entry} />
    </PageContainer>
  );
}
