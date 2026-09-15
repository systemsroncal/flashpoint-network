import PageContainer from "@/components/admin/shared/PageContainer";
import EventForm from "@/components/admin/events/EventForm";

export const dynamic = "force-dynamic";

export default function NewEventPage() {
  return (
    <PageContainer title="New event" description="Create an event">
      <EventForm />
    </PageContainer>
  );
}
