import { redirect } from "next/navigation";
import AdminShell from "@/components/admin/AdminShell";
import AdminThemeProvider from "@/components/admin/AdminThemeProvider";
import { TimezoneProvider } from "@/components/timezone/TimezoneProvider";
import { requireStaffProfile } from "@/lib/auth/session";
import { withPublicAuthAccess } from "@/lib/auth/public-auth-gate";
import { getProgramModules } from "@/lib/features/program-modules-server";
import { getSiteTimezone } from "@/lib/timezone/settings";
import { getSiteIdentity } from "@/lib/site-identity/settings";
import { DEFAULT_FOOTER_MARK_URL } from "@/lib/site-identity/constants";

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [profile, modules, timeZone, identity] = await Promise.all([
    requireStaffProfile(),
    getProgramModules(),
    getSiteTimezone(),
    getSiteIdentity(),
  ]);
  const headerLogoSrc = identity.headerLogoUrl || DEFAULT_FOOTER_MARK_URL;
  if (!profile) {
    redirect(withPublicAuthAccess("/login?next=/admin"));
  }

  return (
    <AdminThemeProvider>
      <TimezoneProvider timeZone={timeZone}>
        <AdminShell
          profile={profile}
          modules={modules}
          headerLogoSrc={headerLogoSrc}
          siteName={identity.siteName}
        >
          {children}
        </AdminShell>
      </TimezoneProvider>
    </AdminThemeProvider>
  );
}
