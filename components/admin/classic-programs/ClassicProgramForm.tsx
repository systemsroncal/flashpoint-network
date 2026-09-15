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
import ImageUploadField from "@/components/admin/shared/ImageUploadField";
import RichTextEditor from "@/components/admin/shared/RichTextEditor";
import {
  deleteClassicProgramAction,
  upsertClassicProgramAction,
} from "@/lib/admin/actions";
import type { ClassicProgram, ClassicProgramStatus } from "@/lib/types/cms";

const STATUSES: ClassicProgramStatus[] = ["draft", "published", "archived"];

export default function ClassicProgramForm({
  program,
}: {
  program?: ClassicProgram | null;
}) {
  const isEdit = Boolean(program?.id);

  return (
    <DashboardCard
      title={isEdit ? "Edit program" : "New classic program"}
      subtitle="Shown on the public Classic Programs grid when published"
      action={
        isEdit && program?.slug ? (
          <Button
            component={Link}
            href={`/classic-programs/${program.slug}`}
            target="_blank"
            rel="noopener noreferrer"
          >
            Open public page
          </Button>
        ) : null
      }
    >
      <Box component="form" action={upsertClassicProgramAction}>
        {program?.id ? <input type="hidden" name="id" value={program.id} /> : null}
        <Stack spacing={2.5}>
          <TextField
            name="title"
            label="Title"
            required
            fullWidth
            defaultValue={program?.title ?? ""}
          />
          <TextField
            name="slug"
            label="Slug"
            fullWidth
            helperText="Used in /classic-programs/[slug]"
            defaultValue={program?.slug ?? ""}
          />
          <Stack direction={{ xs: "column", md: "row" }} spacing={2}>
            <TextField
              select
              name="status"
              label="Status"
              fullWidth
              defaultValue={program?.status ?? "published"}
            >
              {STATUSES.map((s) => (
                <MenuItem key={s} value={s}>
                  {s}
                </MenuItem>
              ))}
            </TextField>
            <TextField
              name="sort_order"
              label="Sort order"
              type="number"
              fullWidth
              helperText="Lower numbers appear first in manual mode"
              defaultValue={program?.sort_order ?? 0}
            />
          </Stack>
          <TextField
            name="schedule_note"
            label="Schedule note"
            fullWidth
            placeholder="Monday through Friday at 2:30PM (ET)"
            defaultValue={program?.schedule_note ?? ""}
          />
          <TextField
            name="excerpt"
            label="Excerpt"
            fullWidth
            multiline
            minRows={2}
            defaultValue={program?.excerpt ?? ""}
          />
          <TextField
            name="description"
            label="Short description"
            fullWidth
            multiline
            minRows={2}
            defaultValue={program?.description ?? ""}
          />
          <ImageUploadField
            name="featured_image_url"
            label="Featured image"
            defaultValue={program?.featured_image_url ?? ""}
          />
          <RichTextEditor
            name="body"
            label="Body (optional)"
            placeholder="Longer program notes…"
            minHeight={200}
            initialHtml={program?.body ?? ""}
          />
          <Stack direction="row" spacing={1.5}>
            <Button type="submit" variant="contained">
              {isEdit ? "Save changes" : "Create program"}
            </Button>
            <Button component={Link} href="/admin/classic-programs" variant="outlined">
              Cancel
            </Button>
          </Stack>
        </Stack>
      </Box>

      {isEdit && program?.id ? (
        <Box
          component="form"
          action={deleteClassicProgramAction}
          sx={{ mt: 4, pt: 3, borderTop: "1px solid", borderColor: "divider" }}
        >
          <input type="hidden" name="id" value={program.id} />
          <Typography variant="subtitle2" color="error" mb={1}>
            Danger zone
          </Typography>
          <Button type="submit" color="error" variant="outlined">
            Delete program
          </Button>
        </Box>
      ) : null}
    </DashboardCard>
  );
}
