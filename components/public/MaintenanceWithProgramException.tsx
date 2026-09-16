"use client";

import { usePathname } from "next/navigation";
import MaintenanceView from "@/components/public/MaintenanceView";

/** During site-wide Coming Soon, still let disabled program routes 404. */
export default function MaintenanceWithProgramException({
  message,
  children,
}: {
  message: string;
  children: React.ReactNode;
}) {
  const path = usePathname() || "";
  if (
    path === "/classic-programs" ||
    path.startsWith("/classic-programs/") ||
    path === "/schedule-programs" ||
    path.startsWith("/schedule-programs/")
  ) {
    return <>{children}</>;
  }
  return <MaintenanceView message={message} />;
}
