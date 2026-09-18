import AdSenseScript from "@/components/public/AdSenseScript";
import GlobalLivePip from "@/components/public/GlobalLivePip";
import MaintenanceWithProgramException from "@/components/public/MaintenanceWithProgramException";
import SiteFooter from "@/components/public/SiteFooter";
import SiteHeader from "@/components/public/SiteHeader";
import TopHeaderBanner from "@/components/public/TopHeaderBanner";
import TrustedHtmlInject from "@/components/public/TrustedHtmlInject";
import { TimezoneProvider } from "@/components/timezone/TimezoneProvider";
import { getCurrentProfile, isAdminRole, isStaffRole } from "@/lib/auth/session";
import { getCustomHtmlSettings } from "@/lib/custom-html/settings";
import { getProgramModules } from "@/lib/features/program-modules-server";
import { getMaintenanceSettings } from "@/lib/maintenance/settings";
import {
  getTopHeaderBannerSettings,
  topHeaderBannerIsRenderable,
} from "@/lib/top-banner/settings";
import { getSiteTimezone } from "@/lib/timezone/settings";

export const dynamic = "force-dynamic";

export default async function PublicLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [maintenance, profile, modules, timeZone, customHtml, topHeaderBanner] =
    await Promise.all([
      getMaintenanceSettings(),
      getCurrentProfile(),
      getProgramModules(),
      getSiteTimezone(),
      getCustomHtmlSettings(),
      getTopHeaderBannerSettings(),
    ]);
  const showTopHeaderBanner = topHeaderBannerIsRenderable(topHeaderBanner);

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
      <div className="flex min-h-0 w-full max-w-none flex-1 flex-col bg-white">
        {showTopHeaderBanner ? (
          <TopHeaderBanner settings={topHeaderBanner} />
        ) : null}
        <SiteHeader
          modules={modules}
          isLoggedIn={Boolean(profile)}
          isStaff={Boolean(profile && isStaffRole(profile.role))}
          user={
            profile?.email
              ? {
                  email: profile.email,
                  displayName:
                    profile.full_name?.trim() ||
                    [profile.first_name, profile.last_name]
                      .filter(Boolean)
                      .join(" ") ||
                    profile.email,
                  isStaff: isStaffRole(profile.role),
                }
              : null
          }
        />
        <main className="w-full max-w-none flex-1">{children}</main>
        <SiteFooter modules={modules} />
        <GlobalLivePip />
      </div>
      {htmlFooter}
    </TimezoneProvider>
  );
}
