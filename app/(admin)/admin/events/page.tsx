import PageContainer from "@/components/admin/shared/PageContainer";
import EventsTable from "@/components/admin/events/EventsTable";
import { getAdminEvents } from "@/lib/admin/queries";

export const dynamic = "force-dynamic";

export default async function AdminEventsPage() {
  const events = await getAdminEvents();
  return (
    <PageContainer title="Events" description="Manage live and scheduled events">
      <EventsTable events={events} />
    </PageContainer>
  );
}
