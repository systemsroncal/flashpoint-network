import { redirect } from "next/navigation";
import { getProgramModules } from "@/lib/features/program-modules-server";

export default async function ClassicProgramsAdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const modules = await getProgramModules();
  if (!modules.classic) redirect("/admin");
  return children;
}
