"use client";

import Link from "next/link";
import {
  Box,
  Button,
  MenuItem,
  Stack,
  TextField,
  Typography,
} from "@mui/material";
import DashboardCard from "@/components/admin/shared/DashboardCard";
import {
  deleteScheduleEntryAction,
  upsertScheduleEntryAction,
} from "@/lib/admin/actions";
import type { ScheduleEntry } from "@/lib/types/cms";

const CATEGORIES = [
  "ministry",
  "classic",
  "flashpoint",
  "news",
  "movie",
  "other",
];

export default function ScheduleEntryForm({
  entry,
  defaultDate,
}: {
  entry?: ScheduleEntry | null;
  defaultDate?: string;
}) {
  const isEdit = Boolean(entry?.id);

  return (
    <DashboardCard
      title={isEdit ? "Edit schedule entry" : "New schedule entry"}
      subtitle="Appears on the public /schedule-programs day list"
    >
      <Box component="form" action={upsertScheduleEntryAction}>
        {entry?.id ? <input type="hidden" name="id" value={entry.id} /> : null}
        <Stack spacing={2.5}>
          <TextField
            name="title"
            label="Program title"
            required
            fullWidth
            defaultValue={entry?.title ?? ""}
          />
          <Stack direction={{ xs: "column", md: "row" }} spacing={2}>
            <TextField
              name="air_date"
              label="Air date"
              type="date"
              required
              fullWidth
              InputLabelProps={{ shrink: true }}
              defaultValue={entry?.air_date ?? defaultDate ?? ""}
            />
            <TextField
              name="start_time"
              label="Start time"
              type="time"
              required
              fullWidth
              InputLabelProps={{ shrink: true }}
              defaultValue={
                entry?.start_time
                  ? String(entry.start_time).slice(0, 5)
                  : "12:00"
              }
            />
            <TextField
              name="end_time"
              label="End time"
              type="time"
              fullWidth
              InputLabelProps={{ shrink: true }}
              defaultValue={
                entry?.end_time ? String(entry.end_time).slice(0, 5) : ""
              }
            />
          </Stack>
          <Stack direction={{ xs: "column", md: "row" }} spacing={2}>
            <TextField
              select
              name="category"
              label="Category"
              fullWidth
              defaultValue={entry?.category ?? "ministry"}
            >
              {CATEGORIES.map((c) => (
                <MenuItem key={c} value={c}>
                  {c}
                </MenuItem>
              ))}
            </TextField>
            <TextField
              name="color"
              label="Color"
              fullWidth
              placeholder="#FF490D"
              defaultValue={entry?.color ?? "#FF490D"}
            />
          </Stack>
          <TextField
            name="description"
            label="Description"
            fullWidth
            multiline
            minRows={2}
            defaultValue={entry?.description ?? ""}
          />
          <Stack direction="row" spacing={1.5}>
            <Button type="submit" variant="contained">
              {isEdit ? "Save changes" : "Create entry"}
            </Button>
            <Button
              component={Link}
              href="/admin/schedule-programs"
              variant="outlined"
            >
              Cancel
            </Button>
          </Stack>
        </Stack>
      </Box>

      {isEdit && entry?.id ? (
        <Box
          component="form"
          action={deleteScheduleEntryAction}
          sx={{ mt: 4, pt: 3, borderTop: "1px solid", borderColor: "divider" }}
        >
          <input type="hidden" name="id" value={entry.id} />
          <Typography variant="subtitle2" color="error" mb={1}>
            Danger zone
          </Typography>
          <Button type="submit" color="error" variant="outlined">
            Delete entry
          </Button>
        </Box>
      ) : null}
    </DashboardCard>
  );
}
