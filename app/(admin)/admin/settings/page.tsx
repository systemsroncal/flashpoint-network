import PageContainer from "@/components/admin/shared/PageContainer";
import SettingsManager from "@/components/admin/settings/SettingsManager";
import { getAdminSettings } from "@/lib/admin/queries";
import { getAiProviderStatus } from "@/lib/ai/keys";

export const dynamic = "force-dynamic";

export default async function AdminSettingsPage() {
  const [settings, aiProviders] = await Promise.all([
    getAdminSettings(),
    getAiProviderStatus(),
  ]);
  return (
    <PageContainer
      title="Settings"
      description="Site settings and AI provider API keys"
    >
      <SettingsManager settings={settings} aiProviders={aiProviders} />
    </PageContainer>
  );
}
