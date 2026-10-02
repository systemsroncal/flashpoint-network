import { notFound } from "next/navigation";
import { getProgramModules } from "@/lib/features/program-modules-server";

export default async function ChildrenProgramsPublicLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const modules = await getProgramModules();
  if (!modules.children) notFound();
  return children;
}
