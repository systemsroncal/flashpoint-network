import type { Metadata } from "next";
import ClassicProgramsView from "@/components/public/ClassicProgramsView";
import { getPublishedClassicPrograms } from "@/lib/data/classic-programs";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Family Classics",
  description:
    "Weekday family classic television favorites on FlashPoint Television Network.",
};

export default async function ClassicProgramsPage() {
  const programs = await getPublishedClassicPrograms();
  return <ClassicProgramsView programs={programs} />;
}
