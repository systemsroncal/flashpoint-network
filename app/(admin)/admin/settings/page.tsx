import PageContainer from "@/components/admin/shared/PageContainer";
import SettingsManager from "@/components/admin/settings/SettingsManager";
import { getAdminSettings } from "@/lib/admin/queries";

export const dynamic = "force-dynamic";

export default async function AdminSettingsPage() {
  const settings = await getAdminSettings();
  return (
    <PageContainer title="Settings" description="Site settings key/value store">
      <SettingsManager settings={settings} />
    </PageContainer>
  );
}
