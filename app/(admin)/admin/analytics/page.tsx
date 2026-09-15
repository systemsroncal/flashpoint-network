import { redirect } from "next/navigation";
import { Suspense } from "react";
import AnalyticsDashboard from "@/components/admin/analytics/AnalyticsDashboard";
import {
  getAnalyticsOverview,
  type AnalyticsRange,
} from "@/lib/admin/analytics";
import { isAdminRole, requireStaffProfile } from "@/lib/auth/session";

export const dynamic = "force-dynamic";

type Props = {
  searchParams: Promise<{ range?: string }>;
};

export default async function AdminAnalyticsPage({ searchParams }: Props) {
  const profile = await requireStaffProfile();
  if (!profile || !isAdminRole(profile.role)) {
    redirect("/admin?admin_denied=1");
  }

  const params = await searchParams;
  const range: AnalyticsRange = params.range === "7" ? 7 : 30;
  const data = await getAnalyticsOverview(range);

  return (
    <Suspense fallback={null}>
      <AnalyticsDashboard data={data} />
    </Suspense>
  );
}
