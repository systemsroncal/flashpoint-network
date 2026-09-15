import { notFound } from "next/navigation";
import PageContainer from "@/components/admin/shared/PageContainer";
import EventForm from "@/components/admin/events/EventForm";
import { getAdminEvent } from "@/lib/admin/queries";

export const dynamic = "force-dynamic";

type Props = {
  params: Promise<{ id: string }>;
};

export default async function EditEventPage({ params }: Props) {
  const { id } = await params;
  const event = await getAdminEvent(id);
  if (!event) notFound();

  return (
    <PageContainer title="Edit event" description={event.title}>
      <EventForm event={event} />
    </PageContainer>
  );
}
