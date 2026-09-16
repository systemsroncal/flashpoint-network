import { redirect } from "next/navigation";
import AdminShell from "@/components/admin/AdminShell";
import AdminThemeProvider from "@/components/admin/AdminThemeProvider";
import { requireStaffProfile } from "@/lib/auth/session";
import { getProgramModules } from "@/lib/features/program-modules-server";

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [profile, modules] = await Promise.all([
    requireStaffProfile(),
    getProgramModules(),
  ]);
  if (!profile) {
    redirect("/login?next=/admin");
  }

  return (
    <AdminThemeProvider>
      <AdminShell profile={profile} modules={modules}>
        {children}
      </AdminShell>
    </AdminThemeProvider>
  );
}
