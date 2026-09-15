"use client";

import Link from "next/link";
import {
  Box,
  Button,
  Chip,
  Stack,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  Typography,
} from "@mui/material";
import DashboardCard from "@/components/admin/shared/DashboardCard";
import type { Post } from "@/lib/types/cms";

const statusColor: Record<string, "default" | "success" | "warning" | "info" | "error"> = {
  draft: "default",
  pending_review: "warning",
  scheduled: "info",
  published: "success",
  archived: "default",
  trash: "error",
};

export default function PostsTable({ posts }: { posts: Post[] }) {
  return (
    <DashboardCard
      title="News"
      subtitle={`${posts.length} total — edits update the public home immediately`}
      action={
        <Button component={Link} href="/admin/posts/new" variant="contained">
          New news
        </Button>
      }
    >
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
                    {post.is_premium ? <Chip size="small" label="Premium" color="warning" /> : null}
                    {post.is_video ? <Chip size="small" label="Video" color="info" /> : null}
                    {post.is_podcast ? <Chip size="small" label="Podcast" /> : null}
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
                  <Typography color="textSecondary">No news yet.</Typography>
                </TableCell>
              </TableRow>
            ) : null}
          </TableBody>
        </Table>
      </Box>
    </DashboardCard>
  );
}
