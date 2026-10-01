import { redirect } from "next/navigation";
import PageContainer from "@/components/admin/shared/PageContainer";
import ScheduleProgramsAdmin from "@/components/admin/schedule-programs/ScheduleProgramsAdmin";
import { nextScheduleMonthAfterLatest } from "@/lib/admin/schedule-month-utils";
import {
  getAdminScheduleDisplayMode,
  getAdminScheduleEntries,
  getAdminScheduleLatestUploadedMonth,
  getAdminScheduleLayoutTemplate,
  getAdminSchedulePdf,
} from "@/lib/admin/queries";

export const dynamic = "force-dynamic";

type Props = {
  searchParams: Promise<{ year?: string; month?: string }>;
};

export default async function AdminScheduleProgramsPage({ searchParams }: Props) {
  const sp = await searchParams;
  const hasPeriod = Boolean(sp.year && sp.month);

  const [latestMonth, displayMode, layoutTemplate] = await Promise.all([
    getAdminScheduleLatestUploadedMonth(),
    getAdminScheduleDisplayMode(),
    getAdminScheduleLayoutTemplate(),
  ]);

  const suggestedPeriod = nextScheduleMonthAfterLatest(latestMonth);

  if (!hasPeriod) {
    redirect(
      `/admin/schedule-programs?year=${suggestedPeriod.year}&month=${suggestedPeriod.month}`,
    );
  }

  const year = Number(sp.year) || suggestedPeriod.year;
  const month = Number(sp.month) || suggestedPeriod.month;

  const [entries, pdf] = await Promise.all([
    getAdminScheduleEntries(year, month),
    getAdminSchedulePdf(year, month),
  ]);

  const currentCalendarYear = new Date().getFullYear();

  return (
    <PageContainer
      title="Schedule Programs"
      description="Broadcast grid + monthly PDF display"
    >
      <ScheduleProgramsAdmin
        year={year}
        month={month}
        entries={entries}
        displayMode={displayMode}
        layoutTemplate={layoutTemplate}
        pdf={pdf}
        importDefaultYear={suggestedPeriod.year}
        importDefaultMonth={suggestedPeriod.month}
        currentCalendarYear={currentCalendarYear}
      />
    </PageContainer>
  );
}
