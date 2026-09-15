import type { Metadata } from "next";
import ScheduleProgramsView from "@/components/public/ScheduleProgramsView";
import {
  getScheduleDisplayMode,
  getScheduleEntriesForMonth,
  getSchedulePdf,
} from "@/lib/data/schedule-programs";
import { getSiteName } from "@/lib/env";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Schedule / Programs",
  description:
    "FlashPoint Television Network broadcast schedule — Eastern Time.",
};

type Props = {
  searchParams: Promise<{ year?: string; month?: string }>;
};

export default async function ScheduleProgramsPage({ searchParams }: Props) {
  const sp = await searchParams;
  const now = new Date();
  let year = Number(sp.year) || 2026;
  let month = Number(sp.month) || 9;
  if (!Number.isFinite(year) || year < 2020 || year > 2100) {
    year = now.getFullYear();
  }
  if (!Number.isFinite(month) || month < 1 || month > 12) {
    month = now.getMonth() + 1;
  }

  const [entries, displayMode, pdf, siteName] = await Promise.all([
    getScheduleEntriesForMonth(year, month),
    getScheduleDisplayMode(),
    getSchedulePdf(year, month),
    Promise.resolve(getSiteName()),
  ]);

  return (
    <ScheduleProgramsView
      year={year}
      month={month}
      entries={entries}
      displayMode={displayMode}
      pdf={pdf}
      siteName={siteName}
    />
  );
}
