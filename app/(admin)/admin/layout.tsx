import { redirect } from "next/navigation";
import AdminShell from "@/components/admin/AdminShell";
import AdminThemeProvider from "@/components/admin/AdminThemeProvider";
import { TimezoneProvider } from "@/components/timezone/TimezoneProvider";
import { requireStaffProfile } from "@/lib/auth/session";
import { withPublicAuthAccess } from "@/lib/auth/public-auth-gate";
import { getProgramModules } from "@/lib/features/program-modules-server";
import { getSiteTimezone } from "@/lib/timezone/settings";

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [profile, modules, timeZone] = await Promise.all([
    requireStaffProfile(),
    getProgramModules(),
    getSiteTimezone(),
  ]);
  if (!profile) {
    redirect(withPublicAuthAccess("/login?next=/admin"));
  }

  return (
    <AdminThemeProvider>
      <TimezoneProvider timeZone={timeZone}>
        <AdminShell profile={profile} modules={modules}>
          {children}
        </AdminShell>
      </TimezoneProvider>
    </AdminThemeProvider>
  );
}
