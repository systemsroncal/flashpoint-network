import type { Metadata } from "next";
import MinistryProgramsView from "@/components/public/MinistryProgramsView";
import {
  getPublicMinistryProgramsSortMode,
  getPublishedMinistryPrograms,
} from "@/lib/data/ministry-programs";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Ministry Programs",
  description:
    "Gospel-centered ministry broadcasts on FlashPoint Television Network.",
};

export default async function MinistryProgramsPage() {
  const [programs, sortMode] = await Promise.all([
    getPublishedMinistryPrograms(),
    getPublicMinistryProgramsSortMode(),
  ]);

  return <MinistryProgramsView programs={programs} sortMode={sortMode} />;
}
