import { notFound } from "next/navigation";
import PageContainer from "@/components/admin/shared/PageContainer";
import AdvertiseInquiryDetail from "@/components/admin/forms/AdvertiseInquiryDetail";
import { getAdminAdvertiseInquiry } from "@/lib/admin/queries";

export const dynamic = "force-dynamic";

type Props = {
  params: Promise<{ id: string }>;
};

export default async function AdminAdvertiseEntryPage({ params }: Props) {
  const { id } = await params;
  const inquiry = await getAdminAdvertiseInquiry(id);
  if (!inquiry) notFound();

  return (
    <PageContainer title="Advertising inquiry" description="Submission details">
      <AdvertiseInquiryDetail inquiry={inquiry} />
    </PageContainer>
  );
}
