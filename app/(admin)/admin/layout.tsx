import { redirect } from "next/navigation";
import AdminShell from "@/components/admin/AdminShell";
import AdminThemeProvider from "@/components/admin/AdminThemeProvider";
import { requireStaffProfile } from "@/lib/auth/session";

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const profile = await requireStaffProfile();
  if (!profile) {
    redirect("/login?next=/admin");
  }

  return (
    <AdminThemeProvider>
      <AdminShell profile={profile}>{children}</AdminShell>
    </AdminThemeProvider>
  );
}
