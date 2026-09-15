"use client";

import { Box, Button, Stack, TextField, Typography } from "@mui/material";
import DashboardCard from "@/components/admin/shared/DashboardCard";
import { deleteTagAction, upsertTagAction } from "@/lib/admin/actions";
import type { Tag } from "@/lib/types/cms";

export default function TagsManager({ tags }: { tags: Tag[] }) {
  return (
    <Stack spacing={3}>
      <DashboardCard title="Add tag">
        <Box component="form" action={upsertTagAction}>
          <Stack direction={{ xs: "column", md: "row" }} spacing={2}>
            <TextField name="name" label="Name" required fullWidth />
            <TextField name="slug" label="Slug" fullWidth />
            <Button type="submit" variant="contained">
              Add
            </Button>
          </Stack>
        </Box>
      </DashboardCard>

      <DashboardCard title="Tags" subtitle={`${tags.length} total`}>
        <Stack spacing={2}>
          {tags.map((tag) => (
            <Box
              key={tag.id}
              sx={{ border: "1px solid", borderColor: "divider", p: 2, borderRadius: 1 }}
            >
              <Box
                component="form"
                action={upsertTagAction}
                sx={{
                  display: "grid",
                  gap: 1.5,
                  gridTemplateColumns: { md: "1fr 1fr auto" },
                  alignItems: "center",
                }}
              >
                <input type="hidden" name="id" value={tag.id} />
                <TextField name="name" size="small" defaultValue={tag.name} required />
                <TextField name="slug" size="small" defaultValue={tag.slug} />
                <Button type="submit" size="small" variant="outlined">
                  Save
                </Button>
              </Box>
              <Box component="form" action={deleteTagAction} sx={{ mt: 1 }}>
                <input type="hidden" name="id" value={tag.id} />
                <Button type="submit" size="small" color="error">
                  Delete
                </Button>
              </Box>
            </Box>
          ))}
          {tags.length === 0 ? (
            <Typography color="textSecondary">No tags yet.</Typography>
          ) : null}
        </Stack>
      </DashboardCard>
    </Stack>
  );
}
