import { redirect } from "next/navigation";

type Props = {
  params: Promise<{ id: string }>;
};

export default async function AdminHelpCenterLegacyDetailPage({ params }: Props) {
  const { id } = await params;
  redirect(`/admin/forms/help-center/${id}`);
}
