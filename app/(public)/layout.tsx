import AdSenseScript from "@/components/public/AdSenseScript";
import MaintenanceView from "@/components/public/MaintenanceView";
import SiteFooter from "@/components/public/SiteFooter";
import SiteHeader from "@/components/public/SiteHeader";
import { getCurrentProfile, isStaffRole } from "@/lib/auth/session";
import { getSiteName } from "@/lib/env";
import { getMaintenanceSettings } from "@/lib/maintenance/settings";

export default async function PublicLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [maintenance, profile] = await Promise.all([
    getMaintenanceSettings(),
    getCurrentProfile(),
  ]);

  const staffBypass = Boolean(profile && isStaffRole(profile.role));

  if (maintenance.enabled && !staffBypass) {
    return <MaintenanceView message={maintenance.message} />;
  }

  const siteName = getSiteName();
  return (
    <>
      {maintenance.enabled && staffBypass ? (
        <div className="bg-amber-500 px-4 py-2 text-center text-sm font-semibold text-black">
          Maintenance mode is ON — you are viewing the live site as staff.{" "}
          Public visitors see the Coming Soon page.
        </div>
      ) : null}
      <AdSenseScript />
      <SiteHeader />
      <main className="flex-1">{children}</main>
      <SiteFooter siteName={siteName} />
    </>
  );
}
