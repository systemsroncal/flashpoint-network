import PageContainer from "@/components/admin/shared/PageContainer";
import SettingsManager from "@/components/admin/settings/SettingsManager";
import { getAdminSettings } from "@/lib/admin/queries";
import { getAiProviderStatus } from "@/lib/ai/keys";
import {
  getCurrentProfile,
  getSessionUser,
  isAdminRole,
} from "@/lib/auth/session";
import {
  PROGRAM_MODULES_SETTING,
  isProgramModulesOwnerEmail,
} from "@/lib/features/program-modules";

export const dynamic = "force-dynamic";

export default async function AdminSettingsPage() {
  const [settings, aiProviders, user, profile] = await Promise.all([
    getAdminSettings(),
    getAiProviderStatus(),
    getSessionUser(),
    getCurrentProfile(),
  ]);
  const canManageProgramModules =
    isProgramModulesOwnerEmail(user?.email) ||
    isProgramModulesOwnerEmail(profile?.email);
  const canEditCustomHtml = Boolean(profile && isAdminRole(profile.role));
  const settingsForClient = canManageProgramModules
    ? settings
    : settings.filter((s) => s.key !== PROGRAM_MODULES_SETTING);

  return (
    <PageContainer
      title="Settings"
      description="Site settings and AI provider API keys"
    >
      <SettingsManager
        settings={settingsForClient}
        aiProviders={aiProviders}
        canManageProgramModules={canManageProgramModules}
        canEditCustomHtml={canEditCustomHtml}
      />
    </PageContainer>
  );
}
