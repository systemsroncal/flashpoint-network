import PageContainer from "@/components/admin/shared/PageContainer";
import ScheduleProgramsAdmin from "@/components/admin/schedule-programs/ScheduleProgramsAdmin";
import {
  getAdminScheduleDisplayMode,
  getAdminScheduleEntries,
  getAdminScheduleLayoutTemplate,
  getAdminSchedulePdf,
} from "@/lib/admin/queries";

export const dynamic = "force-dynamic";

type Props = {
  searchParams: Promise<{ year?: string; month?: string }>;
};

export default async function AdminScheduleProgramsPage({ searchParams }: Props) {
  const sp = await searchParams;
  const year = Number(sp.year) || 2026;
  const month = Number(sp.month) || 9;
  const [entries, displayMode, layoutTemplate, pdf] = await Promise.all([
    getAdminScheduleEntries(year, month),
    getAdminScheduleDisplayMode(),
    getAdminScheduleLayoutTemplate(),
    getAdminSchedulePdf(year, month),
  ]);

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
      />
    </PageContainer>
  );
}
