import type { Metadata } from "next";
import MinistryProgramsView from "@/components/public/MinistryProgramsView";
import { getPublishedMinistryPrograms } from "@/lib/data/ministry-programs";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Network Programs",
  description:
    "Gospel-centered teaching and ministry broadcasts on FlashPoint Television Network.",
};

export default async function MinistryProgramsPage() {
  const programs = await getPublishedMinistryPrograms();
  return <MinistryProgramsView programs={programs} />;
}
