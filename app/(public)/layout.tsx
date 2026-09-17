import AdSenseScript from "@/components/public/AdSenseScript";
import MaintenanceWithProgramException from "@/components/public/MaintenanceWithProgramException";
import SiteFooter from "@/components/public/SiteFooter";
import SiteHeader from "@/components/public/SiteHeader";
import TrustedHtmlInject from "@/components/public/TrustedHtmlInject";
import { TimezoneProvider } from "@/components/timezone/TimezoneProvider";
import { getCurrentProfile, isAdminRole, isStaffRole } from "@/lib/auth/session";
import { getCustomHtmlSettings } from "@/lib/custom-html/settings";
import { getSiteName } from "@/lib/env";
import { getProgramModules } from "@/lib/features/program-modules-server";
import { getMaintenanceSettings } from "@/lib/maintenance/settings";
import { getSiteTimezone } from "@/lib/timezone/settings";

export const dynamic = "force-dynamic";

export default async function PublicLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [maintenance, profile, modules, timeZone, customHtml] =
    await Promise.all([
      getMaintenanceSettings(),
      getCurrentProfile(),
      getProgramModules(),
      getSiteTimezone(),
      getCustomHtmlSettings(),
    ]);

  // Only admin / superadmin bypass Coming Soon on the public site.
  const adminBypass = Boolean(profile && isAdminRole(profile.role));

  const htmlInjects = (
    <>
      <TrustedHtmlInject html={customHtml.head} placement="head" />
      <TrustedHtmlInject html={customHtml.body} placement="body" />
    </>
  );
  const htmlFooter = (
    <TrustedHtmlInject html={customHtml.footer} placement="footer" />
  );

  if (maintenance.enabled && !adminBypass) {
    return (
      <TimezoneProvider timeZone={timeZone}>
        {htmlInjects}
        <MaintenanceWithProgramException message={maintenance.message}>
          {children}
        </MaintenanceWithProgramException>
        {htmlFooter}
      </TimezoneProvider>
    );
  }

  const siteName = getSiteName();
  return (
    <TimezoneProvider timeZone={timeZone}>
      {htmlInjects}
      {maintenance.enabled && adminBypass ? (
        <div className="bg-amber-500 px-4 py-2 text-center text-sm font-semibold text-black">
          Maintenance mode is ON — you are viewing the live site as admin.{" "}
          Everyone else sees the Coming Soon page.
        </div>
      ) : null}
      <AdSenseScript />
      <SiteHeader
        modules={modules}
        isLoggedIn={Boolean(profile)}
        isStaff={Boolean(profile && isStaffRole(profile.role))}
      />
      <main className="flex-1">{children}</main>
      <SiteFooter siteName={siteName} modules={modules} />
      {htmlFooter}
    </TimezoneProvider>
  );
}
