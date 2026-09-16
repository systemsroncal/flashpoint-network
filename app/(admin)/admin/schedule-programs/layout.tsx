import { redirect } from "next/navigation";
import { getProgramModules } from "@/lib/features/program-modules-server";

export default async function ScheduleProgramsAdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const modules = await getProgramModules();
  if (!modules.schedule) redirect("/admin");
  return children;
}
