import AdSenseScript from "@/components/public/AdSenseScript";
import MaintenanceWithProgramException from "@/components/public/MaintenanceWithProgramException";
import SiteFooter from "@/components/public/SiteFooter";
import SiteHeader from "@/components/public/SiteHeader";
import { getCurrentProfile, isAdminRole } from "@/lib/auth/session";
import { getSiteName } from "@/lib/env";
import { getProgramModules } from "@/lib/features/program-modules-server";
import { getMaintenanceSettings } from "@/lib/maintenance/settings";

export const dynamic = "force-dynamic";

export default async function PublicLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [maintenance, profile, modules] = await Promise.all([
    getMaintenanceSettings(),
    getCurrentProfile(),
    getProgramModules(),
  ]);

  // Only admin / superadmin bypass Coming Soon on the public site.
  const adminBypass = Boolean(profile && isAdminRole(profile.role));

  if (maintenance.enabled && !adminBypass) {
    return (
      <MaintenanceWithProgramException message={maintenance.message}>
        {children}
      </MaintenanceWithProgramException>
    );
  }

  const siteName = getSiteName();
  return (
    <>
      {maintenance.enabled && adminBypass ? (
        <div className="bg-amber-500 px-4 py-2 text-center text-sm font-semibold text-black">
          Maintenance mode is ON — you are viewing the live site as admin.{" "}
          Everyone else sees the Coming Soon page.
        </div>
      ) : null}
      <AdSenseScript />
      <SiteHeader modules={modules} />
      <main className="flex-1">{children}</main>
      <SiteFooter siteName={siteName} modules={modules} />
    </>
  );
}
