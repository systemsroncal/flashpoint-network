"use client";

import {
  Box,
  Button,
  Checkbox,
  FormControlLabel,
  MenuItem,
  Stack,
  TextField,
  Typography,
} from "@mui/material";
import Link from "next/link";
import DashboardCard from "@/components/admin/shared/DashboardCard";
import RichTextEditor from "@/components/admin/shared/RichTextEditor";
import { useTimezone } from "@/components/timezone/TimezoneProvider";
import { deleteEventAction, upsertEventAction } from "@/lib/admin/actions";
import { isoToDatetimeLocal } from "@/lib/timezone/datetime";
import type { EventItem } from "@/lib/types/cms";

export default function EventForm({ event }: { event?: EventItem | null }) {
  const isEdit = Boolean(event?.id);
  const timeZone = useTimezone();

  return (
    <DashboardCard
      title={isEdit ? "Edit event" : "New event"}
      subtitle="Events with show_on_home appear in the public hero"
      action={
        isEdit ? (
          <Button component={Link} href={`/events/${event?.slug}`} target="_blank">
            Open public page
          </Button>
        ) : null
      }
    >
      <Box component="form" action={upsertEventAction}>
        {event?.id ? <input type="hidden" name="id" value={event.id} /> : null}
        <Stack spacing={2.5}>
          <TextField name="title" label="Title" required fullWidth defaultValue={event?.title ?? ""} />
          <TextField name="slug" label="Slug" fullWidth defaultValue={event?.slug ?? ""} />
          <TextField
            name="description"
            label="Description"
            fullWidth
            multiline
            minRows={2}
            defaultValue={event?.description ?? ""}
          />
          <RichTextEditor
            name="body"
            label="Body"
            placeholder="Event details…"
            minHeight={260}
            initialHtml={event?.body ?? ""}
          />
          <Stack direction={{ xs: "column", md: "row" }} spacing={2}>
            <TextField select name="format" label="Format" fullWidth defaultValue={event?.format ?? "video"}>
              <MenuItem value="video">video</MenuItem>
              <MenuItem value="text">text</MenuItem>
            </TextField>
            <TextField name="host_name" label="Host" fullWidth defaultValue={event?.host_name ?? ""} />
          </Stack>
          <TextField name="video_url" label="Video URL" fullWidth defaultValue={event?.video_url ?? ""} />
          <TextField
            name="thumbnail_url"
            label="Thumbnail URL"
            fullWidth
            defaultValue={event?.thumbnail_url ?? ""}
          />
          <Stack direction={{ xs: "column", md: "row" }} spacing={2}>
            <TextField
              name="starts_at"
              label="Starts at"
              type="datetime-local"
              fullWidth
              InputLabelProps={{ shrink: true }}
              defaultValue={isoToDatetimeLocal(event?.starts_at, timeZone)}
              helperText="Site timezone (Settings → System timezone)"
            />
            <TextField
              name="ends_at"
              label="Ends at"
              type="datetime-local"
              fullWidth
              InputLabelProps={{ shrink: true }}
              defaultValue={isoToDatetimeLocal(event?.ends_at, timeZone)}
            />
          </Stack>
          <Stack direction="row" spacing={1}>
            <FormControlLabel
              control={<Checkbox name="is_live" defaultChecked={event?.is_live} />}
              label="Live"
            />
            <FormControlLabel
              control={<Checkbox name="show_on_home" defaultChecked={event?.show_on_home} />}
              label="Show on home"
            />
          </Stack>
          <Stack direction="row" spacing={1.5}>
            <Button type="submit" variant="contained">
              {isEdit ? "Save changes" : "Create event"}
            </Button>
            <Button component={Link} href="/admin/events" variant="outlined">
              Cancel
            </Button>
          </Stack>
        </Stack>
      </Box>

      {isEdit && event?.id ? (
        <Box
          component="form"
          action={deleteEventAction}
          sx={{ mt: 4, pt: 3, borderTop: "1px solid", borderColor: "divider" }}
        >
          <input type="hidden" name="id" value={event.id} />
          <Typography variant="subtitle2" color="error" mb={1}>
            Danger zone
          </Typography>
          <Button type="submit" color="error" variant="outlined">
            Delete event
          </Button>
        </Box>
      ) : null}
    </DashboardCard>
  );
}
