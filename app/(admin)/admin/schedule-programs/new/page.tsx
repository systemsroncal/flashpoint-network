import PageContainer from "@/components/admin/shared/PageContainer";
import ScheduleEntryForm from "@/components/admin/schedule-programs/ScheduleEntryForm";

type Props = {
  searchParams: Promise<{ date?: string }>;
};

export default async function NewScheduleEntryPage({ searchParams }: Props) {
  const sp = await searchParams;
  return (
    <PageContainer title="New schedule entry" description="Add a timed broadcast slot">
      <ScheduleEntryForm defaultDate={sp.date} />
    </PageContainer>
  );
}
