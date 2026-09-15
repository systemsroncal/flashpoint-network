"use client";

import Link from "next/link";
import {
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
import {
  saveScheduleDisplayModeAction,
  saveSchedulePdfAction,
} from "@/lib/admin/actions";
import type {
  ScheduleDisplayMode,
  ScheduleEntry,
  SchedulePdf,
} from "@/lib/types/cms";

const MODES: { value: ScheduleDisplayMode; label: string }[] = [
  { value: "dynamic", label: "Dynamic grid only" },
  { value: "pdf", label: "PDF only" },
  { value: "both", label: "Both dynamic + PDF" },
];

export default function ScheduleProgramsAdmin({
  year,
  month,
  entries,
  displayMode,
  pdf,
}: {
  year: number;
  month: number;
  entries: ScheduleEntry[];
  displayMode: ScheduleDisplayMode;
  pdf: SchedulePdf | null;
}) {
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
        title="Display mode"
        subtitle="Controls /schedule-programs public presentation"
      >
        <Stack
          component="form"
          action={saveScheduleDisplayModeAction}
          direction={{ xs: "column", sm: "row" }}
          spacing={2}
          alignItems={{ sm: "center" }}
        >
          <TextField
            select
            name="display_mode"
            label="Mode"
            defaultValue={displayMode}
            sx={{ minWidth: 240 }}
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

      <DashboardCard title="Monthly PDF" subtitle={`${year}-${String(month).padStart(2, "0")}`}>
        <Stack
          component="form"
          action={saveSchedulePdfAction}
          spacing={2}
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
                    No entries. Run{" "}
                    <code>node scripts/seed-schedule-programs.mjs</code> or
                    create one.
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
