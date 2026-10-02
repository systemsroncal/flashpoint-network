"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useMemo, useState, useTransition } from "react";
import {
  Box,
  Button,
  IconButton,
  ListItemIcon,
  ListItemText,
  Menu,
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
import {
  IconCalendar,
  IconCheck,
  IconDotsVertical,
  IconEdit,
  IconExternalLink,
  IconFileText,
} from "@tabler/icons-react";
import DashboardCard from "@/components/admin/shared/DashboardCard";
import {
  adminFilterRowSx,
  adminSelectFieldSx,
} from "@/components/admin/shared/adminFormStyles";
import { categoryOptionLabel, flattenCategoriesHierarchy } from "@/lib/categories/hierarchy";
import { categoryPillStyle } from "@/lib/admin/category-pill";
import type { Category, Post, Tag } from "@/lib/types/cms";

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
    status: string;
  };
};

function buildHref(filters: Props["filters"], page: number) {
  const params = new URLSearchParams();
  if (filters.q.trim()) params.set("q", filters.q.trim());
  if (filters.categoryId) params.set("category", filters.categoryId);
  if (filters.tagId) params.set("tag", filters.tagId);
  if (filters.status) params.set("status", filters.status);
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
  const [status, setStatus] = useState(filters.status);
  const [menuAnchor, setMenuAnchor] = useState<null | HTMLElement>(null);
  const [menuPost, setMenuPost] = useState<Post | null>(null);

  const categoriesOrdered = useMemo(
    () => flattenCategoriesHierarchy(categories),
    [categories],
  );

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
          { q, categoryId, tagId, status },
          nextPage,
        ),
      );
    });
  };

  const clearFilters = () => {
    setQ("");
    setCategoryId("");
    setTagId("");
    setStatus("");
    startTransition(() => {
      router.push("/admin/posts");
    });
  };

  const showDraftsOnly = () => {
    setStatus("draft_scheduled");
    startTransition(() => {
      router.push(buildHref({ q, categoryId, tagId, status: "draft_scheduled" }, 1));
    });
  };

  return (
    <DashboardCard
      title="News"
      subtitle={`${rangeLabel} — edits update the public home immediately`}
      action={
        <Stack
          direction={{ xs: "column", sm: "row" }}
          spacing={1}
          useFlexGap
          sx={{ width: { xs: "100%", md: "auto" } }}
        >
          <Button
            type="button"
            variant="outlined"
            onClick={showDraftsOnly}
            disabled={pending}
            fullWidth
            sx={{ width: { sm: "auto" } }}
          >
            Drafts &amp; scheduled
          </Button>
          <Button
            component={Link}
            href="/admin/posts/new"
            variant="contained"
            fullWidth
            sx={{ width: { sm: "auto" } }}
          >
            Create News
          </Button>
        </Stack>
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
          sx={adminFilterRowSx}
        >
          <TextField
            size="small"
            label="Search"
            placeholder="Title, slug, or content…"
            value={q}
            onChange={(e) => setQ(e.target.value)}
            fullWidth
            sx={{ flex: { md: 2 }, ...adminSelectFieldSx }}
          />
          <TextField
            select
            size="small"
            label="Category"
            value={categoryId}
            onChange={(e) => setCategoryId(e.target.value)}
            fullWidth
            sx={adminSelectFieldSx}
          >
            <MenuItem value="">All categories</MenuItem>
            {categoriesOrdered.map((c) => (
              <MenuItem key={c.id} value={c.id}>
                {categoryOptionLabel(c, categories)}
              </MenuItem>
            ))}
          </TextField>
          <TextField
            select
            size="small"
            label="Tag"
            value={tagId}
            onChange={(e) => setTagId(e.target.value)}
            fullWidth
            sx={adminSelectFieldSx}
          >
            <MenuItem value="">All tags</MenuItem>
            {tags.map((t) => (
              <MenuItem key={t.id} value={t.id}>
                {t.name}
              </MenuItem>
            ))}
          </TextField>
          <TextField
            select
            size="small"
            label="Status"
            value={status}
            onChange={(e) => setStatus(e.target.value)}
            fullWidth
            sx={adminSelectFieldSx}
          >
            <MenuItem value="">All (drafts on top)</MenuItem>
            <MenuItem value="draft_scheduled">Draft &amp; scheduled</MenuItem>
            <MenuItem value="draft">Draft only</MenuItem>
            <MenuItem value="scheduled">Scheduled only</MenuItem>
          </TextField>
          <Stack
            direction={{ xs: "column", sm: "row" }}
            spacing={1}
            sx={{ width: { xs: "100%", md: "auto" }, flexShrink: 0 }}
          >
            <Button
              type="submit"
              variant="contained"
              disabled={pending}
              fullWidth
              sx={{ width: { sm: "auto" } }}
            >
              {pending ? "Filtering…" : "Filter"}
            </Button>
            <Button
              type="button"
              variant="outlined"
              disabled={pending}
              onClick={clearFilters}
              fullWidth
              sx={{ width: { sm: "auto" } }}
            >
              Clear
            </Button>
          </Stack>
        </Stack>
      </Stack>

      <Box sx={{ overflowX: "auto" }}>
        <Table size="small" sx={{ "& .MuiTableCell-root": { borderBottom: "1px solid", borderColor: "divider", py: 1.5 } }}>
          <TableHead sx={{ display: { xs: "none", sm: "table-header-group" } }}>
            <TableRow>
              <TableCell>Story</TableCell>
              <TableCell width={120}>Stats</TableCell>
              <TableCell align="right" width={56} />
            </TableRow>
          </TableHead>
          <TableBody>
            {posts.map((post) => {
              const catSlug = post.category?.slug ?? post.category?.name ?? "";
              const pill = categoryPillStyle(catSlug);
              const isPublished = post.status === "published";
              const isScheduled = post.status === "scheduled";
              const isDraft =
                post.status === "draft" ||
                post.status === "pending_review" ||
                post.status === "archived" ||
                post.status === "trash";
              return (
                <TableRow key={post.id} hover>
                  <TableCell>
                    <Typography variant="subtitle2" sx={{ fontWeight: 600, lineHeight: 1.35 }}>
                      {post.title}
                    </Typography>
                    {post.category?.name ? (
                      <Typography
                        component="span"
                        variant="caption"
                        sx={{
                          display: "inline-block",
                          mt: 0.75,
                          px: 1,
                          py: 0.25,
                          borderRadius: 1,
                          fontWeight: 600,
                          fontSize: "0.7rem",
                          ...pill,
                        }}
                      >
                        {post.category.name}
                      </Typography>
                    ) : (
                      <Typography variant="caption" color="text.secondary" display="block" mt={0.5}>
                        Uncategorized
                      </Typography>
                    )}
                  </TableCell>
                  <TableCell>
                    <Typography variant="body2" fontWeight={600}>
                      {post.view_count ?? 0}
                    </Typography>
                    <Stack direction="row" alignItems="center" spacing={0.5} mt={0.5}>
                      {isPublished ? (
                        <IconCheck size={18} stroke={2.5} color="#16a34a" aria-label="Published" />
                      ) : null}
                      {isScheduled ? (
                        <IconCalendar size={17} stroke={1.8} color="#2563eb" aria-label="Scheduled" />
                      ) : null}
                      {isDraft && !isScheduled ? (
                        <IconFileText size={17} stroke={1.8} color="#6b7280" aria-label="Draft" />
                      ) : null}
                    </Stack>
                  </TableCell>
                  <TableCell align="right">
                    <IconButton
                      size="small"
                      aria-label="Post actions"
                      onClick={(e) => {
                        setMenuAnchor(e.currentTarget);
                        setMenuPost(post);
                      }}
                    >
                      <IconDotsVertical size={18} />
                    </IconButton>
                  </TableCell>
                </TableRow>
              );
            })}
            {posts.length === 0 ? (
              <TableRow>
                <TableCell colSpan={3}>
                  <Typography color="textSecondary">
                    No news matched these filters.
                  </Typography>
                </TableCell>
              </TableRow>
            ) : null}
          </TableBody>
        </Table>
      </Box>

      <Menu
        anchorEl={menuAnchor}
        open={Boolean(menuAnchor)}
        onClose={() => {
          setMenuAnchor(null);
          setMenuPost(null);
        }}
      >
        {menuPost ? (
          <>
            <MenuItem
              component={Link}
              href={`/admin/posts/${menuPost.id}`}
              onClick={() => setMenuAnchor(null)}
            >
              <ListItemIcon>
                <IconEdit size={18} />
              </ListItemIcon>
              <ListItemText>Edit</ListItemText>
            </MenuItem>
            {menuPost.status === "published" && menuPost.slug ? (
              <MenuItem
                component="a"
                href={`/news/${menuPost.slug}`}
                target="_blank"
                rel="noopener noreferrer"
                onClick={() => setMenuAnchor(null)}
              >
                <ListItemIcon>
                  <IconExternalLink size={18} />
                </ListItemIcon>
                <ListItemText>View</ListItemText>
              </MenuItem>
            ) : null}
          </>
        ) : null}
      </Menu>

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
