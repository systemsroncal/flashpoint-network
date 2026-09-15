"use client";

import {
  Box,
  Button,
  Stack,
  TextField,
  Typography,
} from "@mui/material";
import DashboardCard from "@/components/admin/shared/DashboardCard";
import {
  deleteCategoryAction,
  upsertCategoryAction,
} from "@/lib/admin/actions";
import type { Category } from "@/lib/types/cms";

export default function CategoriesManager({
  categories,
}: {
  categories: Category[];
}) {
  return (
    <Stack spacing={3}>
      <DashboardCard title="Add category">
        <Box component="form" action={upsertCategoryAction}>
          <Stack direction={{ xs: "column", md: "row" }} spacing={2}>
            <TextField name="name" label="Name" required fullWidth />
            <TextField name="slug" label="Slug" fullWidth />
            <TextField
              name="sort_order"
              label="Sort"
              type="number"
              defaultValue={0}
              sx={{ minWidth: 120 }}
            />
            <TextField name="description" label="Description" fullWidth />
            <Button type="submit" variant="contained" sx={{ whiteSpace: "nowrap" }}>
              Add
            </Button>
          </Stack>
        </Box>
      </DashboardCard>

      <DashboardCard title="Categories" subtitle={`${categories.length} total`}>
        <Stack spacing={2}>
          {categories.map((category) => (
            <Box
              key={category.id}
              sx={{ border: "1px solid", borderColor: "divider", p: 2, borderRadius: 1 }}
            >
              <Box
                component="form"
                action={upsertCategoryAction}
                sx={{
                  display: "grid",
                  gap: 1.5,
                  gridTemplateColumns: { md: "1.2fr 1fr 100px 1.4fr auto" },
                  alignItems: "center",
                }}
              >
                <input type="hidden" name="id" value={category.id} />
                <TextField name="name" size="small" defaultValue={category.name} required />
                <TextField name="slug" size="small" defaultValue={category.slug} />
                <TextField
                  name="sort_order"
                  size="small"
                  type="number"
                  defaultValue={category.sort_order}
                />
                <TextField
                  name="description"
                  size="small"
                  defaultValue={category.description ?? ""}
                />
                <Button type="submit" size="small" variant="outlined">
                  Save
                </Button>
              </Box>
              <Box component="form" action={deleteCategoryAction} sx={{ mt: 1 }}>
                <input type="hidden" name="id" value={category.id} />
                <Button type="submit" size="small" color="error">
                  Delete
                </Button>
              </Box>
            </Box>
          ))}
          {categories.length === 0 ? (
            <Typography color="textSecondary">No categories yet.</Typography>
          ) : null}
        </Stack>
      </DashboardCard>
    </Stack>
  );
}
