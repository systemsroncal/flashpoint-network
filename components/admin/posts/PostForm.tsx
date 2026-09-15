"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useRef, useState } from "react";
import {
  Alert,
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
import AiWritingAssistant from "@/components/admin/posts/AiWritingAssistant";
import SeoPanel, { type SeoValues } from "@/components/admin/posts/SeoPanel";
import TitlePermalinkField from "@/components/admin/posts/TitlePermalinkField";
import { deletePostAction, upsertPostAction } from "@/lib/admin/actions";
import { slugify } from "@/lib/slug";
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
  siteName: string;
  siteUrl: string;
};

export default function PostForm({
  post,
  categories,
  siteName,
  siteUrl,
}: Props) {
  const router = useRouter();
  const formRef = useRef<HTMLFormElement>(null);
  const isEdit = Boolean(post?.id);
  const [postId, setPostId] = useState(post?.id ?? "");
  const [title, setTitle] = useState(post?.title ?? "");
  const [slug, setSlug] = useState(post?.slug ?? "");
  // New posts auto-slug from title until the editor locks it (WP behavior).
  // Existing posts start locked so renaming the title won't rewrite the URL.
  const [autoSlug, setAutoSlug] = useState(!post?.slug);
  const [excerpt, setExcerpt] = useState(post?.excerpt ?? "");
  const [featuredImageUrl, setFeaturedImageUrl] = useState(
    post?.featured_image_url ?? "",
  );
  const [seo, setSeo] = useState<SeoValues>({
    seo_title: post?.seo_title ?? "",
    seo_description: post?.seo_description ?? "",
    seo_keywords: post?.seo_keywords ?? "",
    og_title: post?.og_title ?? "",
    og_description: post?.og_description ?? "",
  });
  const [forceHtml, setForceHtml] = useState<string | null>(null);
  const [forceToken, setForceToken] = useState(0);
  const [previewBusy, setPreviewBusy] = useState(false);
  const [previewError, setPreviewError] = useState<string | null>(null);
  const [status, setStatus] = useState<PostStatus>(post?.status ?? "draft");

  const onPreview = async () => {
    setPreviewError(null);
    if (!title.trim()) {
      setPreviewError("Add a title before previewing.");
      return;
    }
    const form = formRef.current;
    if (!form) return;

    const fd = new FormData(form);
    const payload: Record<string, unknown> = {
      id: postId || undefined,
      title,
      slug: slug || slugify(title),
      excerpt,
      body: String(fd.get("body") || ""),
      status,
      category_id: String(fd.get("category_id") || ""),
      featured_image_url: featuredImageUrl,
      video_url: String(fd.get("video_url") || ""),
      reading_time_minutes: Number(fd.get("reading_time_minutes") || 5),
      published_at: String(fd.get("published_at") || ""),
      is_featured: fd.get("is_featured") === "on",
      is_premium: fd.get("is_premium") === "on",
      is_video: fd.get("is_video") === "on",
      is_podcast: fd.get("is_podcast") === "on",
      seo_title: seo.seo_title,
      seo_description: seo.seo_description,
      seo_keywords: seo.seo_keywords,
      og_title: seo.og_title,
      og_description: seo.og_description,
    };

    setPreviewBusy(true);
    try {
      const res = await fetch("/api/admin/posts/preview", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const data = (await res.json()) as {
        error?: string;
        id?: string;
        slug?: string;
        previewUrl?: string;
        publicUrl?: string | null;
      };
      if (!res.ok || !data.previewUrl || !data.id) {
        throw new Error(data.error || "Preview failed");
      }
      if (data.slug) setSlug(data.slug);
      if (!postId) {
        setPostId(data.id);
        // Stay on the edit URL after first preview-save (like WP draft autosave)
        router.replace(`/admin/posts/${data.id}`);
      }
      window.open(data.previewUrl, "_blank", "noopener,noreferrer");
    } catch (err) {
      setPreviewError(err instanceof Error ? err.message : "Preview failed");
    } finally {
      setPreviewBusy(false);
    }
  };

  return (
    <DashboardCard
      title={isEdit || postId ? "Edit news" : "New news"}
      subtitle={
        isEdit || postId
          ? "Changes appear on the public site after you save or publish"
          : "Create a story that can power home sections"
      }
      action={
        status === "published" && slug ? (
          <Button
            component={Link}
            href={`/news/${slug}`}
            target="_blank"
            rel="noopener noreferrer"
          >
            View public page
          </Button>
        ) : null
      }
    >
      <Box component="form" ref={formRef} action={upsertPostAction}>
        {postId ? <input type="hidden" name="id" value={postId} /> : null}
        <Stack spacing={2.5}>
          <TitlePermalinkField
            siteUrl={siteUrl}
            title={title}
            slug={slug}
            autoSlug={autoSlug}
            onTitleChange={setTitle}
            onSlugChange={setSlug}
            onAutoSlugChange={setAutoSlug}
            onPreview={() => void onPreview()}
            previewBusy={previewBusy}
            canViewPublic={status === "published" && Boolean(slug)}
            publicHref={slug ? `/news/${slug}` : undefined}
          />

          {previewError ? <Alert severity="error">{previewError}</Alert> : null}

          <TextField
            name="excerpt"
            label="Excerpt"
            fullWidth
            multiline
            minRows={2}
            value={excerpt}
            onChange={(e) => setExcerpt(e.target.value)}
          />

          <AiWritingAssistant
            titleBlank={!title.trim()}
            excerptBlank={!excerpt.trim()}
            onGenerated={(result) => {
              if (result.title && !title.trim()) {
                setTitle(result.title);
                if (autoSlug) setSlug(slugify(result.title));
              }
              if (result.excerpt && !excerpt.trim()) setExcerpt(result.excerpt);
              setForceHtml(result.bodyHtml);
              setForceToken((n) => n + 1);
            }}
          />

          <RichTextEditor
            name="body"
            label="Body"
            placeholder="Write the article…"
            minHeight={320}
            initialHtml={post?.body ?? ""}
            forceHtml={forceHtml}
            forceToken={forceToken}
          />
          <Stack direction={{ xs: "column", md: "row" }} spacing={2}>
            <TextField
              select
              name="status"
              label="Status"
              fullWidth
              value={status}
              onChange={(e) => setStatus(e.target.value as PostStatus)}
            >
              {STATUSES.map((s) => (
                <MenuItem key={s} value={s}>
                  {s}
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
            defaultValue={featuredImageUrl}
            onUrlChange={setFeaturedImageUrl}
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

          <SeoPanel
            siteName={siteName}
            siteUrl={siteUrl}
            title={title}
            slug={slug}
            excerpt={excerpt}
            featuredImageUrl={featuredImageUrl}
            values={seo}
            onChange={(patch) => setSeo((s) => ({ ...s, ...patch }))}
          />

          <Stack direction="row" spacing={1.5} flexWrap="wrap">
            <Button type="submit" variant="contained">
              {postId ? "Save changes" : "Create news"}
            </Button>
            <Button
              type="button"
              variant="outlined"
              onClick={() => void onPreview()}
              disabled={previewBusy}
            >
              {previewBusy ? "Saving preview…" : "Preview changes"}
            </Button>
            <Button component={Link} href="/admin/posts" variant="text">
              Cancel
            </Button>
          </Stack>
        </Stack>
      </Box>

      {postId ? (
        <Box
          component="form"
          action={deletePostAction}
          sx={{ mt: 4, pt: 3, borderTop: "1px solid", borderColor: "divider" }}
        >
          <input type="hidden" name="id" value={postId} />
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
