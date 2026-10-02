import type { Metadata } from "next";
import StaticWebPageJsonLd from "@/components/seo/StaticWebPageJsonLd";
import ScheduleProgramsView from "@/components/public/ScheduleProgramsView";
import ScheduleWeeklyGridView from "@/components/public/ScheduleWeeklyGridView";
import {
  getScheduleDisplayMode,
  getScheduleEntriesForMonth,
  getScheduleLayoutTemplate,
  getSchedulePdf,
} from "@/lib/data/schedule-programs";
import { getSiteName } from "@/lib/env";
import { buildStaticPageMetadata } from "@/lib/seo/metadata";

export const dynamic = "force-dynamic";

const TITLE = "Schedule / Programs";
const DESCRIPTION =
  "FlashPoint Television Network broadcast schedule — Eastern Time.";

export async function generateMetadata(): Promise<Metadata> {
  return buildStaticPageMetadata({
    title: TITLE,
    description: DESCRIPTION,
    path: "/schedule-programs",
  });
}

type Props = {
  searchParams: Promise<{ year?: string; month?: string }>;
};

function resolveSchedulePeriod(
  sp: { year?: string; month?: string },
  now: Date,
): { year: number; month: number } {
  const parsedYear = sp.year ? Number(sp.year) : NaN;
  const parsedMonth = sp.month ? Number(sp.month) : NaN;
  let year = Number.isFinite(parsedYear) ? parsedYear : now.getFullYear();
  let month = Number.isFinite(parsedMonth) ? parsedMonth : now.getMonth() + 1;
  if (!Number.isFinite(year) || year < 2020 || year > 2100) {
    year = now.getFullYear();
  }
  if (!Number.isFinite(month) || month < 1 || month > 12) {
    month = now.getMonth() + 1;
  }
  return { year, month };
}

export default async function ScheduleProgramsPage({ searchParams }: Props) {
  const sp = await searchParams;
  const now = new Date();
  const { year, month } = resolveSchedulePeriod(sp, now);

  const [entries, displayMode, layoutTemplate, pdf, siteName] = await Promise.all([
    getScheduleEntriesForMonth(year, month),
    getScheduleDisplayMode(),
    getScheduleLayoutTemplate(),
    getSchedulePdf(year, month),
    Promise.resolve(getSiteName()),
  ]);

  const jsonLd = (
    <StaticWebPageJsonLd
      title={TITLE}
      description={DESCRIPTION}
      path="/schedule-programs"
    />
  );

  if (layoutTemplate === "template_2") {
    return (
      <>
        {jsonLd}
        <ScheduleWeeklyGridView year={year} month={month} entries={entries} />
      </>
    );
  }

  const effectiveDisplayMode =
    displayMode === "pdf" ? "dynamic" : displayMode;

  return (
    <>
      {jsonLd}
      <ScheduleProgramsView
        year={year}
        month={month}
        entries={entries}
        displayMode={effectiveDisplayMode}
        pdf={pdf}
        siteName={siteName}
      />
    </>
  );
}
