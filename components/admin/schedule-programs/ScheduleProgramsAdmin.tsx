"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useRef, useState } from "react";
import {
  Alert,
  Button,
  Chip,
  MenuItem,
  Stack,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  TextField,
  Typography,
} from "@mui/material";
import DashboardCard from "@/components/admin/shared/DashboardCard";
import { adminFormStackSx, adminSelectFieldSx } from "@/components/admin/shared/adminFormStyles";
import {
  saveScheduleDisplayModeAction,
  saveScheduleLayoutTemplateAction,
  saveSchedulePdfAction,
} from "@/lib/admin/actions";
import type {
  ScheduleDisplayMode,
  ScheduleEntry,
  ScheduleLayoutTemplate,
  SchedulePdf,
} from "@/lib/types/cms";

const MODES: { value: ScheduleDisplayMode; label: string }[] = [
  { value: "dynamic", label: "Dynamic grid only" },
  { value: "pdf", label: "PDF only" },
  { value: "both", label: "Both dynamic + PDF" },
];

const MONTH_LABELS = [
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

const TEMPLATES: {
  value: ScheduleLayoutTemplate;
  label: string;
  hint: string;
}[] = [
  {
    value: "template_1",
    label: "Template 1",
    hint: "Current public page: month nav + day picker + timed list",
  },
  {
    value: "template_2",
    label: "Template 2",
    hint: "Figma weekly grid: AM/PM tables, Sun–Sat, print/download",
  },
];

export default function ScheduleProgramsAdmin({
  year,
  month,
  entries,
  displayMode,
  layoutTemplate,
  pdf,
  importDefaultYear,
  importDefaultMonth,
  currentCalendarYear,
}: {
  year: number;
  month: number;
  entries: ScheduleEntry[];
  displayMode: ScheduleDisplayMode;
  layoutTemplate: ScheduleLayoutTemplate;
  pdf: SchedulePdf | null;
  importDefaultYear: number;
  importDefaultMonth: number;
  currentCalendarYear: number;
}) {
  const router = useRouter();
  const fileRef = useRef<HTMLInputElement>(null);
  const [importYear, setImportYear] = useState(
    importDefaultYear === currentCalendarYear
      ? currentCalendarYear
      : importDefaultYear,
  );
  const [importMonth, setImportMonth] = useState(importDefaultMonth);
  const [importBusy, setImportBusy] = useState(false);
  const [importMessage, setImportMessage] = useState<string | null>(null);
  const [importError, setImportError] = useState<string | null>(null);

  const yearOptions = Array.from({ length: 5 }, (_, i) => currentCalendarYear - 1 + i);

  const onImportFile = async (file: File) => {
    setImportBusy(true);
    setImportMessage(null);
    setImportError(null);
    try {
      const body = new FormData();
      body.set("file", file);
      body.set("year", String(importYear));
      body.set("month", String(importMonth));
      const res = await fetch("/api/admin/schedule-programs/import", {
        method: "POST",
        body,
      });
      const json = (await res.json()) as {
        ok?: boolean;
        inserted?: number;
        error?: string;
        year?: number;
        month?: number;
      };
      if (!res.ok || json.error) {
        throw new Error(json.error || "Import failed.");
      }
      setImportMessage(
        `Imported ${json.inserted ?? 0} entries for ${json.year}-${String(json.month).padStart(2, "0")}.`,
      );
      router.push(
        `/admin/schedule-programs?year=${json.year}&month=${json.month}`,
      );
      router.refresh();
    } catch (err) {
      setImportError(err instanceof Error ? err.message : "Import failed.");
    } finally {
      setImportBusy(false);
      if (fileRef.current) fileRef.current.value = "";
    }
  };

  const prev =
    month === 1
      ? { year: year - 1, month: 12 }
      : { year, month: month - 1 };
  const next =
    month === 12
      ? { year: year + 1, month: 1 }
      : { year, month: month + 1 };

  return (
    <Stack spacing={3}>
      <DashboardCard
        title="Import from Excel"
        subtitle="Weekly Sun–Sat grid (30-minute rows). Replaces all entries for the selected month."
      >
        <Stack spacing={2} sx={adminFormStackSx}>
          <Typography variant="body2" color="text.secondary">
            Default month is the next one after the latest uploaded schedule
            (e.g. after September → October). Use the same layout as the
            broadcast workbook: row 1 = days, column A = times.
          </Typography>
          {importMessage ? (
            <Alert severity="success">{importMessage}</Alert>
          ) : null}
          {importError ? <Alert severity="error">{importError}</Alert> : null}
          <Stack
            direction={{ xs: "column", sm: "row" }}
            spacing={2}
            sx={adminFormStackSx}
          >
            <TextField
              select
              label="Year"
              value={importYear}
              onChange={(e) => setImportYear(Number(e.target.value))}
              fullWidth
              sx={adminSelectFieldSx}
            >
              {yearOptions.map((y) => (
                <MenuItem key={y} value={y}>
                  {y}
                </MenuItem>
              ))}
            </TextField>
            <TextField
              select
              label="Month"
              value={importMonth}
              onChange={(e) => setImportMonth(Number(e.target.value))}
              fullWidth
              sx={adminSelectFieldSx}
            >
              {MONTH_LABELS.map((label, idx) => (
                <MenuItem key={label} value={idx + 1}>
                  {label}
                </MenuItem>
              ))}
            </TextField>
          </Stack>
          <Stack direction={{ xs: "column", sm: "row" }} spacing={1}>
            <Button
              variant="contained"
              disabled={importBusy}
              onClick={() => fileRef.current?.click()}
              sx={{ alignSelf: { sm: "flex-start" } }}
            >
              {importBusy ? "Importing…" : "Choose Excel & import"}
            </Button>
            <input
              ref={fileRef}
              type="file"
              accept=".xlsx,.xlsm,application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
              hidden
              onChange={(e) => {
                const file = e.target.files?.[0];
                if (file) void onImportFile(file);
              }}
            />
          </Stack>
        </Stack>
      </DashboardCard>

      <DashboardCard
        title="Display mode"
        subtitle="Controls /schedule-programs public presentation"
      >
        <Stack
          component="form"
          action={saveScheduleDisplayModeAction}
          direction={{ xs: "column", sm: "row" }}
          spacing={2}
          alignItems={{ sm: "center" }}
          sx={adminFormStackSx}
        >
          <TextField
            select
            name="display_mode"
            label="Mode"
            defaultValue={displayMode}
            fullWidth
            sx={adminSelectFieldSx}
          >
            {MODES.map((m) => (
              <MenuItem key={m.value} value={m.value}>
                {m.label}
              </MenuItem>
            ))}
          </TextField>
          <Button type="submit" variant="contained">
            Save mode
          </Button>
          <Button
            component={Link}
            href={`/schedule-programs?year=${year}&month=${month}`}
            target="_blank"
            variant="outlined"
          >
            View public page
          </Button>
        </Stack>
      </DashboardCard>

      <DashboardCard
        title="Public template"
        subtitle="Layout used on /schedule-programs when the dynamic grid is shown"
      >
        <Stack
          component="form"
          action={saveScheduleLayoutTemplateAction}
          spacing={2}
          sx={adminFormStackSx}
        >
          <TextField
            select
            name="layout_template"
            label="Template"
            defaultValue={layoutTemplate}
            fullWidth
            sx={{ maxWidth: { md: 480 } }}
          >
            {TEMPLATES.map((t) => (
              <MenuItem key={t.value} value={t.value}>
                {t.label} — {t.hint}
              </MenuItem>
            ))}
          </TextField>
          <Typography variant="body2" color="text.secondary">
            Template 1 keeps the existing day-by-day lineup. Template 2 uses the
            Figma weekly broadcast grid (navy card, colored titles, print).
          </Typography>
          <Button type="submit" variant="contained" sx={{ alignSelf: "flex-start" }}>
            Save template
          </Button>
        </Stack>
      </DashboardCard>

      <DashboardCard title="Monthly PDF" subtitle={`${year}-${String(month).padStart(2, "0")}`}>
        <Stack
          component="form"
          action={saveSchedulePdfAction}
          spacing={2}
          sx={adminFormStackSx}
        >
          <input type="hidden" name="year" value={year} />
          <input type="hidden" name="month" value={month} />
          <TextField
            name="title"
            label="Title"
            fullWidth
            defaultValue={pdf?.title ?? `Broadcast schedule — ${year}-${month}`}
          />
          <TextField
            name="pdf_url"
            label="PDF URL"
            fullWidth
            defaultValue={
              pdf?.pdf_url ??
              "https://img1.wsimg.com/blobby/go/d0b3ddce-59df-44df-ae95-8ef1cdbe6a2e/September%202026.pdf"
            }
            helperText="Remote CDN or Storage URL"
          />
          <Button type="submit" variant="contained" sx={{ alignSelf: "flex-start" }}>
            Save PDF link
          </Button>
        </Stack>
      </DashboardCard>

      <DashboardCard
        title="Schedule entries"
        subtitle={`${entries.length} in this month`}
        action={
          <Stack direction="row" spacing={1}>
            <Button
              component={Link}
              href={`/admin/schedule-programs?year=${prev.year}&month=${prev.month}`}
              variant="outlined"
              size="small"
            >
              Prev
            </Button>
            <Button
              component={Link}
              href={`/admin/schedule-programs?year=${next.year}&month=${next.month}`}
              variant="outlined"
              size="small"
            >
              Next
            </Button>
            <Button
              component={Link}
              href={`/admin/schedule-programs/new?date=${year}-${String(month).padStart(2, "0")}-01`}
              variant="contained"
              size="small"
            >
              New entry
            </Button>
          </Stack>
        }
      >
        <Typography variant="subtitle1" mb={1}>
          {year}-{String(month).padStart(2, "0")}
        </Typography>
        <Table size="small">
          <TableHead>
            <TableRow>
              <TableCell>Date</TableCell>
              <TableCell>Start</TableCell>
              <TableCell>Title</TableCell>
              <TableCell>Category</TableCell>
              <TableCell align="right">Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {entries.slice(0, 200).map((entry) => (
              <TableRow key={entry.id} hover>
                <TableCell>{entry.air_date}</TableCell>
                <TableCell>{String(entry.start_time).slice(0, 5)}</TableCell>
                <TableCell>
                  <Typography variant="subtitle2">{entry.title}</Typography>
                </TableCell>
                <TableCell>
                  {entry.category ? (
                    <Chip size="small" label={entry.category} />
                  ) : (
                    "—"
                  )}
                </TableCell>
                <TableCell align="right">
                  <Button
                    component={Link}
                    href={`/admin/schedule-programs/${entry.id}`}
                    size="small"
                    variant="outlined"
                  >
                    Edit
                  </Button>
                </TableCell>
              </TableRow>
            ))}
            {entries.length > 200 ? (
              <TableRow>
                <TableCell colSpan={5}>
                  <Typography color="textSecondary" sx={{ py: 1 }}>
                    Showing first 200 of {entries.length}. Use filters by editing
                    individual days or re-seed the month.
                  </Typography>
                </TableCell>
              </TableRow>
            ) : null}
            {entries.length === 0 ? (
              <TableRow>
                <TableCell colSpan={5}>
                  <Typography color="textSecondary" sx={{ py: 2 }}>
                    No entries. Use Import from Excel above or create one
                    manually.
                  </Typography>
                </TableCell>
              </TableRow>
            ) : null}
          </TableBody>
        </Table>
      </DashboardCard>
    </Stack>
  );
}
