import type { Metadata } from "next";
import ClassicProgramsView from "@/components/public/ClassicProgramsView";
import {
  getPublicClassicProgramsSortMode,
  getPublishedClassicPrograms,
} from "@/lib/data/classic-programs";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Classic Programs",
  description:
    "Weekday classic television favorites on FlashPoint Television Network.",
};

export default async function ClassicProgramsPage() {
  const [programs, sortMode] = await Promise.all([
    getPublishedClassicPrograms(),
    getPublicClassicProgramsSortMode(),
  ]);

  return <ClassicProgramsView programs={programs} sortMode={sortMode} />;
}
