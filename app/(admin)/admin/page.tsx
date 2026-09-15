import AdminDashboard from "@/components/admin/dashboard/AdminDashboard";
import { getAdminStats, getRecentAdminPosts } from "@/lib/admin/queries";

export const dynamic = "force-dynamic";

export default async function AdminPage() {
  const [stats, recent] = await Promise.all([
    getAdminStats(),
    getRecentAdminPosts(8),
  ]);

  return <AdminDashboard stats={stats} recent={recent} />;
}
