"use client";

import Link from "next/link";
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
import DashboardCard from "@/components/admin/shared/DashboardCard";
import ImageUploadField from "@/components/admin/shared/ImageUploadField";
import RichTextEditor from "@/components/admin/shared/RichTextEditor";
import { deletePostAction, upsertPostAction } from "@/lib/admin/actions";
import type { Category, Post, PostStatus } from "@/lib/types/cms";

const STATUSES: PostStatus[] = [
  "draft",
  "pending_review",
  "scheduled",
  "published",
  "archived",
  "trash",
];

function toLocalInput(value: string | null | undefined) {
  if (!value) return "";
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return "";
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
}

type Props = {
  post?: Post | null;
  categories: Category[];
};

export default function PostForm({ post, categories }: Props) {
  const isEdit = Boolean(post?.id);

  return (
    <DashboardCard
      title={isEdit ? "Edit news" : "New news"}
      subtitle={
        isEdit
          ? "Changes appear on the public home after save"
          : "Create a story that can power home sections"
      }
      action={
        isEdit && post?.status === "published" ? (
          <Button component={Link} href={`/news/${post.slug}`} target="_blank">
            Open public page
          </Button>
        ) : null
      }
    >
      <Box component="form" action={upsertPostAction}>
        {post?.id ? <input type="hidden" name="id" value={post.id} /> : null}
        <Stack spacing={2.5}>
          <TextField
            name="title"
            label="Title"
            required
            fullWidth
            defaultValue={post?.title ?? ""}
          />
          <TextField
            name="slug"
            label="Slug"
            fullWidth
            helperText="Used in /news/[slug]"
            defaultValue={post?.slug ?? ""}
          />
          <TextField
            name="excerpt"
            label="Excerpt"
            fullWidth
            multiline
            minRows={2}
            defaultValue={post?.excerpt ?? ""}
          />
          <RichTextEditor
            name="body"
            label="Body"
            placeholder="Write the article…"
            minHeight={320}
            initialHtml={post?.body ?? ""}
          />
          <Stack direction={{ xs: "column", md: "row" }} spacing={2}>
            <TextField
              select
              name="status"
              label="Status"
              fullWidth
              defaultValue={post?.status ?? "draft"}
            >
              {STATUSES.map((status) => (
                <MenuItem key={status} value={status}>
                  {status}
                </MenuItem>
              ))}
            </TextField>
            <TextField
              select
              name="category_id"
              label="Category"
              fullWidth
              defaultValue={post?.category_id ?? ""}
            >
              <MenuItem value="">— None —</MenuItem>
              {categories.map((category) => (
                <MenuItem key={category.id} value={category.id}>
                  {category.name}
                </MenuItem>
              ))}
            </TextField>
            <TextField
              name="reading_time_minutes"
              label="Reading time (min)"
              type="number"
              fullWidth
              defaultValue={post?.reading_time_minutes ?? 5}
            />
          </Stack>
          <ImageUploadField
            name="featured_image_url"
            label="Featured image"
            defaultValue={post?.featured_image_url ?? ""}
          />
          <TextField
            name="video_url"
            label="Video URL (YouTube)"
            fullWidth
            helperText="Used by Must-Watch / video embeds (Plyr)"
            defaultValue={post?.video_url ?? ""}
          />
          <TextField
            name="published_at"
            label="Published at"
            type="datetime-local"
            fullWidth
            InputLabelProps={{ shrink: true }}
            defaultValue={toLocalInput(post?.published_at)}
          />
          <Stack direction="row" spacing={1} flexWrap="wrap">
            <FormControlLabel
              control={
                <Checkbox name="is_featured" defaultChecked={post?.is_featured} />
              }
              label="Featured"
            />
            <FormControlLabel
              control={
                <Checkbox name="is_premium" defaultChecked={post?.is_premium} />
              }
              label="Premium / Exclusive"
            />
            <FormControlLabel
              control={<Checkbox name="is_video" defaultChecked={post?.is_video} />}
              label="Video"
            />
            <FormControlLabel
              control={
                <Checkbox name="is_podcast" defaultChecked={post?.is_podcast} />
              }
              label="Podcast"
            />
          </Stack>
          <Stack direction="row" spacing={1.5}>
            <Button type="submit" variant="contained">
              {isEdit ? "Save changes" : "Create news"}
            </Button>
            <Button component={Link} href="/admin/posts" variant="outlined">
              Cancel
            </Button>
          </Stack>
        </Stack>
      </Box>

      {isEdit && post?.id ? (
        <Box
          component="form"
          action={deletePostAction}
          sx={{ mt: 4, pt: 3, borderTop: "1px solid", borderColor: "divider" }}
        >
          <input type="hidden" name="id" value={post.id} />
          <Typography variant="subtitle2" color="error" mb={1}>
            Danger zone
          </Typography>
          <Button type="submit" color="error" variant="outlined">
            Delete news
          </Button>
        </Box>
      ) : null}
    </DashboardCard>
  );
}
