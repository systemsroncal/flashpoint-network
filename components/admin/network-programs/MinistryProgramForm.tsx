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
import {
  deleteMinistryProgramAction,
  upsertMinistryProgramAction,
} from "@/lib/admin/actions";
import type { MinistryProgram, MinistryProgramStatus } from "@/lib/types/cms";

const STATUSES: MinistryProgramStatus[] = ["draft", "published", "archived"];

export default function MinistryProgramForm({
  program,
}: {
  program?: MinistryProgram | null;
}) {
  const isEdit = Boolean(program?.id);
  const formId = "network-program-form";

  return (
    <>
      <DashboardCard
        title={isEdit ? "Edit program" : "New network program"}
        subtitle="Fields match the public FPTN Shows grid card"
      >
        <Box
          id={formId}
          component="form"
          action={upsertMinistryProgramAction}
          sx={{ pb: 10 }}
        >
          {program?.id ? (
            <input type="hidden" name="id" value={program.id} />
          ) : null}
          <Stack spacing={2.5}>
            <TextField
              name="title"
              label="Title"
              required
              fullWidth
              defaultValue={program?.title ?? ""}
            />
            <TextField
              name="host_name"
              label="Host name"
              fullWidth
              placeholder="Jeff Seker"
              helperText="Shown under the title on the grid"
              defaultValue={program?.host_name ?? ""}
            />
            <TextField
              name="schedule_detail"
              label="Schedule"
              fullWidth
              multiline
              minRows={3}
              placeholder={"Monday – 9:00 AM ET\nTuesday – 12:00 PM ET"}
              helperText="One air time per line on the public grid"
              defaultValue={program?.schedule_detail ?? ""}
            />
            <ImageUploadField
              name="featured_image_url"
              label="Grid image"
              defaultValue={program?.featured_image_url ?? ""}
            />
            <ImageUploadField
              name="carousel_image_url"
              label="Home carousel image"
              defaultValue={program?.carousel_image_url ?? ""}
            />
            <Typography variant="caption" color="text.secondary">
              Carousel image is for the upcoming home design that lists Network
              Programs. It is separate from the grid card image.
            </Typography>
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
          </Stack>
        </Box>

        {isEdit && program?.id ? (
          <Box
            component="form"
            action={deleteMinistryProgramAction}
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

      <Box
        sx={{
          position: "fixed",
          left: { xs: 0, lg: 270 },
          right: 0,
          bottom: 0,
          zIndex: (theme) => theme.zIndex.appBar,
          bgcolor: "background.paper",
          borderTop: "1px solid",
          borderColor: "divider",
          boxShadow: "0 -4px 24px rgba(15, 23, 42, 0.08)",
          px: { xs: 2, md: 3 },
          py: 1.5,
        }}
      >
        <Stack
          direction={{ xs: "column", sm: "row" }}
          spacing={1.25}
          alignItems={{ sm: "center" }}
          justifyContent="space-between"
          maxWidth={1200}
          mx="auto"
        >
          <Typography variant="body2" color="text.secondary">
            {isEdit
              ? "Changes appear on /network-programs when published."
              : "Create a card for the public FPTN Shows grid."}
          </Typography>
          <Stack direction="row" spacing={1.25} flexWrap="wrap" useFlexGap>
            <Button component={Link} href="/admin/network-programs" variant="outlined">
              Cancel
            </Button>
            <Button type="submit" form={formId} variant="contained">
              {isEdit ? "Save changes" : "Create program"}
            </Button>
          </Stack>
        </Stack>
      </Box>
    </>
  );
}
