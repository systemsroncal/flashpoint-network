"use client";

import {
  Box,
  Button,
  MenuItem,
  Stack,
  TextField,
  Typography,
} from "@mui/material";
import DashboardCard from "@/components/admin/shared/DashboardCard";
import { flattenCategoriesHierarchy, getRootCategories } from "@/lib/categories/hierarchy";
import {
  deleteCategoryAction,
  upsertCategoryAction,
} from "@/lib/admin/actions";
import type { Category } from "@/lib/types/cms";

function ParentField({
  categories,
  categoryId,
  defaultParentId,
}: {
  categories: Category[];
  categoryId?: string;
  defaultParentId?: string | null;
}) {
  const roots = getRootCategories(categories).filter(
    (c) => c.id !== categoryId,
  );
  return (
    <TextField
      select
      name="parent_id"
      label="Parent category"
      size="small"
      fullWidth
      defaultValue={defaultParentId ?? ""}
      helperText="Leave empty for a top-level category"
    >
      <MenuItem value="">— Top level —</MenuItem>
      {roots.map((root) => (
        <MenuItem key={root.id} value={root.id}>
          {root.name}
        </MenuItem>
      ))}
    </TextField>
  );
}

export default function CategoriesManager({
  categories,
}: {
  categories: Category[];
}) {
  const ordered = flattenCategoriesHierarchy(categories);

  return (
    <Stack spacing={3}>
      <DashboardCard title="Add category">
        <Box component="form" action={upsertCategoryAction}>
          <Stack spacing={2}>
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
            </Stack>
            <Stack direction={{ xs: "column", md: "row" }} spacing={2}>
              <ParentField categories={categories} />
              <TextField name="description" label="Description" fullWidth />
            </Stack>
            <Button type="submit" variant="contained" sx={{ alignSelf: "flex-start" }}>
              Add
            </Button>
          </Stack>
        </Box>
      </DashboardCard>

      <DashboardCard title="Categories" subtitle={`${categories.length} total`}>
        <Stack spacing={2}>
          {ordered.map((category) => {
            const isSub = Boolean(category.parent_id);
            return (
              <Box
                key={category.id}
                sx={{
                  border: "1px solid",
                  borderColor: "divider",
                  p: 2,
                  borderRadius: 1,
                  ml: isSub ? 3 : 0,
                  borderLeftWidth: isSub ? 3 : 1,
                  borderLeftColor: isSub ? "primary.main" : "divider",
                }}
              >
                {isSub ? (
                  <Typography variant="caption" color="textSecondary" sx={{ mb: 1, display: "block" }}>
                    Subcategory of{" "}
                    {categories.find((c) => c.id === category.parent_id)?.name ??
                      "—"}
                  </Typography>
                ) : null}
                <Box
                  component="form"
                  action={upsertCategoryAction}
                  sx={{
                    display: "grid",
                    gap: 1.5,
                    gridTemplateColumns: { md: "1.2fr 1fr 100px 1fr 1fr auto" },
                    alignItems: "start",
                  }}
                >
                  <input type="hidden" name="id" value={category.id} />
                  <TextField
                    name="name"
                    size="small"
                    defaultValue={category.name}
                    required
                  />
                  <TextField name="slug" size="small" defaultValue={category.slug} />
                  <TextField
                    name="sort_order"
                    size="small"
                    type="number"
                    defaultValue={category.sort_order}
                  />
                  <ParentField
                    categories={categories}
                    categoryId={category.id}
                    defaultParentId={category.parent_id}
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
            );
          })}
          {categories.length === 0 ? (
            <Typography color="textSecondary">No categories yet.</Typography>
          ) : null}
        </Stack>
      </DashboardCard>
    </Stack>
  );
}
