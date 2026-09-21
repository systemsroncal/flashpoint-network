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

  const [entries, displayMode, layoutTemplate, pdf, siteName] = await Promise.all([
    getScheduleEntriesForMonth(year, month),
    getScheduleDisplayMode(),
    getScheduleLayoutTemplate(),
    getSchedulePdf(year, month),
    Promise.resolve(getSiteName()),
  ]);

  const localPdf =
    month === 9 && year === 2026 ? "/schedules/september-2026.pdf" : null;
  const pdfHref = pdf?.pdf_url || localPdf;
  const monthNames = [
    "January",
    "February",
    "March",
    "April",
    "May",
    "June",
    "July",
    "August",
    "September",
    "October",
    "November",
    "December",
  ];

  const jsonLd = (
    <StaticWebPageJsonLd
      title={TITLE}
      description={DESCRIPTION}
      path="/schedule-programs"
    />
  );

  if (layoutTemplate === "template_2" && displayMode !== "pdf") {
    return (
      <>
        {jsonLd}
      <ScheduleWeeklyGridView
        year={year}
        month={month}
        entries={entries}
        pdfHref={pdfHref}
        pdfTitle={pdf?.title || `${monthNames[month - 1]} ${year} broadcast grid`}
      />
      </>
    );
  }

  return (
    <>
      {jsonLd}
    <ScheduleProgramsView
      year={year}
      month={month}
      entries={entries}
      displayMode={displayMode}
      pdf={pdf}
      siteName={siteName}
    />
    </>
  );
}
