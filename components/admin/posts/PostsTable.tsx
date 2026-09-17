"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useMemo, useState, useTransition } from "react";
import {
  Box,
  Button,
  Chip,
  MenuItem,
  Pagination,
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
import type { Category, Post, Tag } from "@/lib/types/cms";

const statusColor: Record<
  string,
  "default" | "success" | "warning" | "info" | "error"
> = {
  draft: "default",
  pending_review: "warning",
  scheduled: "info",
  published: "success",
  archived: "default",
  trash: "error",
};

type Props = {
  posts: Post[];
  categories: Category[];
  tags: Tag[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
  filters: {
    q: string;
    categoryId: string;
    tagId: string;
  };
};

function buildHref(filters: Props["filters"], page: number) {
  const params = new URLSearchParams();
  if (filters.q.trim()) params.set("q", filters.q.trim());
  if (filters.categoryId) params.set("category", filters.categoryId);
  if (filters.tagId) params.set("tag", filters.tagId);
  if (page > 1) params.set("page", String(page));
  const qs = params.toString();
  return qs ? `/admin/posts?${qs}` : "/admin/posts";
}

export default function PostsTable({
  posts,
  categories,
  tags,
  total,
  page,
  pageSize,
  totalPages,
  filters,
}: Props) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [q, setQ] = useState(filters.q);
  const [categoryId, setCategoryId] = useState(filters.categoryId);
  const [tagId, setTagId] = useState(filters.tagId);

  const rangeLabel = useMemo(() => {
    if (total === 0) return "0 results";
    const from = (page - 1) * pageSize + 1;
    const to = Math.min(page * pageSize, total);
    return `${from}–${to} of ${total}`;
  }, [page, pageSize, total]);

  const applyFilters = (nextPage = 1) => {
    startTransition(() => {
      router.push(
        buildHref(
          { q, categoryId, tagId },
          nextPage,
        ),
      );
    });
  };

  const clearFilters = () => {
    setQ("");
    setCategoryId("");
    setTagId("");
    startTransition(() => {
      router.push("/admin/posts");
    });
  };

  return (
    <DashboardCard
      title="News"
      subtitle={`${rangeLabel} — edits update the public home immediately`}
      action={
        <Button component={Link} href="/admin/posts/new" variant="contained">
          New news
        </Button>
      }
    >
      <Stack
        component="form"
        spacing={2}
        mb={2.5}
        onSubmit={(e) => {
          e.preventDefault();
          applyFilters(1);
        }}
      >
        <Stack
          direction={{ xs: "column", md: "row" }}
          spacing={1.5}
          alignItems={{ md: "center" }}
        >
          <TextField
            size="small"
            label="Search"
            placeholder="Title, slug, or content…"
            value={q}
            onChange={(e) => setQ(e.target.value)}
            fullWidth
            sx={{ flex: 2 }}
          />
          <TextField
            select
            size="small"
            label="Category"
            value={categoryId}
            onChange={(e) => setCategoryId(e.target.value)}
            sx={{ minWidth: { md: 180 }, flex: 1 }}
          >
            <MenuItem value="">All categories</MenuItem>
            {categories.map((c) => (
              <MenuItem key={c.id} value={c.id}>
                {c.name}
              </MenuItem>
            ))}
          </TextField>
          <TextField
            select
            size="small"
            label="Tag"
            value={tagId}
            onChange={(e) => setTagId(e.target.value)}
            sx={{ minWidth: { md: 160 }, flex: 1 }}
          >
            <MenuItem value="">All tags</MenuItem>
            {tags.map((t) => (
              <MenuItem key={t.id} value={t.id}>
                {t.name}
              </MenuItem>
            ))}
          </TextField>
          <Stack direction="row" spacing={1} flexShrink={0}>
            <Button type="submit" variant="contained" disabled={pending}>
              {pending ? "Filtering…" : "Filter"}
            </Button>
            <Button
              type="button"
              variant="outlined"
              disabled={pending}
              onClick={clearFilters}
            >
              Clear
            </Button>
          </Stack>
        </Stack>
      </Stack>

      <Box sx={{ overflowX: "auto" }}>
        <Table size="small">
          <TableHead>
            <TableRow>
              <TableCell>Title</TableCell>
              <TableCell>Category</TableCell>
              <TableCell>Status</TableCell>
              <TableCell>Flags</TableCell>
              <TableCell>Views</TableCell>
              <TableCell align="right">Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {posts.map((post) => (
              <TableRow key={post.id} hover>
                <TableCell>
                  <Typography variant="subtitle2">{post.title}</Typography>
                  <Typography variant="caption" color="textSecondary">
                    /news/{post.slug}
                  </Typography>
                </TableCell>
                <TableCell>{post.category?.name ?? "—"}</TableCell>
                <TableCell>
                  <Chip
                    size="small"
                    label={post.status}
                    color={statusColor[post.status] ?? "default"}
                  />
                </TableCell>
                <TableCell>
                  <Stack direction="row" spacing={0.5} flexWrap="wrap" useFlexGap>
                    {post.is_featured ? <Chip size="small" label="Featured" /> : null}
                    {post.is_premium ? (
                      <Chip size="small" label="Premium" color="warning" />
                    ) : null}
                    {post.is_video ? (
                      <Chip size="small" label="Video" color="info" />
                    ) : null}
                    {post.is_podcast ? <Chip size="small" label="Podcast" /> : null}
                    {post.is_popular ? (
                      <Chip size="small" label="Popular" color="secondary" />
                    ) : null}
                  </Stack>
                </TableCell>
                <TableCell>{post.view_count}</TableCell>
                <TableCell align="right">
                  <Stack direction="row" spacing={1} justifyContent="flex-end">
                    <Button
                      component={Link}
                      href={`/admin/posts/${post.id}`}
                      size="small"
                      variant="outlined"
                    >
                      Edit
                    </Button>
                    {post.status === "published" ? (
                      <Button
                        component={Link}
                        href={`/news/${post.slug}`}
                        size="small"
                        target="_blank"
                      >
                        View
                      </Button>
                    ) : null}
                  </Stack>
                </TableCell>
              </TableRow>
            ))}
            {posts.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6}>
                  <Typography color="textSecondary">
                    No news matched these filters.
                  </Typography>
                </TableCell>
              </TableRow>
            ) : null}
          </TableBody>
        </Table>
      </Box>

      {totalPages > 1 ? (
        <Stack alignItems="center" mt={2.5}>
          <Pagination
            color="primary"
            page={page}
            count={totalPages}
            disabled={pending}
            onChange={(_, next) => {
              startTransition(() => {
                router.push(buildHref(filters, next));
              });
            }}
          />
        </Stack>
      ) : null}
    </DashboardCard>
  );
}
