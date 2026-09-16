"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useMemo, useRef, useState, useTransition } from "react";
import {
  Alert,
  Box,
  Button,
  Checkbox,
  FormControlLabel,
  MenuItem,
  Stack,
  Switch,
  TextField,
  Typography,
} from "@mui/material";
import DashboardCard from "@/components/admin/shared/DashboardCard";
import ImageUploadField from "@/components/admin/shared/ImageUploadField";
import RichTextEditor from "@/components/admin/shared/RichTextEditor";
import AiWritingAssistant from "@/components/admin/posts/AiWritingAssistant";
import NewsCardPreview from "@/components/admin/posts/NewsCardPreview";
import SeoPanel, { type SeoValues } from "@/components/admin/posts/SeoPanel";
import TitlePermalinkField from "@/components/admin/posts/TitlePermalinkField";
import { deletePostAction, upsertPostAction } from "@/lib/admin/actions";
import {
  defaultShowFeaturedImage,
  isVideoOrPodcastPost,
} from "@/lib/posts/media-layout";
import { slugify } from "@/lib/slug";
import type { Category, Post, PostStatus, Tag } from "@/lib/types/cms";

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

function isNextRedirectError(err: unknown): boolean {
  if (!err || typeof err !== "object") return false;
  const digest = "digest" in err ? String((err as { digest?: unknown }).digest) : "";
  return digest.startsWith("NEXT_REDIRECT");
}

function isStaleServerActionError(err: unknown): boolean {
  const msg = err instanceof Error ? err.message : String(err ?? "");
  return /Failed to find Server Action|older or newer deployment/i.test(msg);
}

type Props = {
  post?: Post | null;
  categories: Category[];
  tags?: Tag[];
  /** Tag ids already linked to this post (edit). */
  initialTagIds?: string[];
  siteName: string;
  siteUrl: string;
};

export default function PostForm({
  post,
  categories,
  tags = [],
  initialTagIds = [],
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
  const [categoryId, setCategoryId] = useState(post?.category_id ?? "");
  const [selectedTagIds, setSelectedTagIds] = useState<string[]>(initialTagIds);
  const [isFeatured, setIsFeatured] = useState(Boolean(post?.is_featured));
  const [isPremium, setIsPremium] = useState(Boolean(post?.is_premium));
  const [isVideo, setIsVideo] = useState(Boolean(post?.is_video));
  const [isPodcast, setIsPodcast] = useState(Boolean(post?.is_podcast));
  const [isPopular, setIsPopular] = useState(Boolean(post?.is_popular));
  const [showFeaturedImage, setShowFeaturedImage] = useState(() => {
    if (typeof post?.show_featured_image === "boolean") {
      return post.show_featured_image;
    }
    return defaultShowFeaturedImage({
      is_video: post?.is_video,
      is_podcast: post?.is_podcast,
      category: post?.category,
      category_id: post?.category_id,
    });
  });
  const showFeaturedTouched = useRef(Boolean(post?.id));
  const [saveError, setSaveError] = useState<string | null>(null);
  const [staleDeploy, setStaleDeploy] = useState(false);
  const [slugValid, setSlugValid] = useState(true);
  const [saving, startSave] = useTransition();
  const pendingStatusRef = useRef<PostStatus | null>(null);
  const saveBlocked = !slugValid || !title.trim();

  // Exact ISO from DB + the datetime-local string we showed — used so save/preview
  // can keep published_at unchanged when the editor only edits title/body.
  const publishedAtOriginal = post?.published_at ?? "";
  const publishedAtDisplay = useMemo(
    () => toLocalInput(post?.published_at),
    [post?.published_at],
  );

  const categoryName = useMemo(() => {
    return categories.find((c) => c.id === categoryId)?.name ?? post?.category?.name ?? null;
  }, [categories, categoryId, post?.category?.name]);

  const selectedCategory = useMemo(
    () => categories.find((c) => c.id === categoryId) ?? post?.category ?? null,
    [categories, categoryId, post?.category],
  );

  const isMediaPost = useMemo(
    () =>
      isVideoOrPodcastPost({
        is_video: isVideo,
        is_podcast: isPodcast,
        category: selectedCategory,
        category_id: categoryId || null,
      }),
    [isVideo, isPodcast, selectedCategory, categoryId],
  );

  // New posts (or untouched switch): Video/Podcast default to hide featured image.
  useEffect(() => {
    if (showFeaturedTouched.current) return;
    setShowFeaturedImage(
      defaultShowFeaturedImage({
        is_video: isVideo,
        is_podcast: isPodcast,
        category: selectedCategory,
        category_id: categoryId || null,
      }),
    );
  }, [isVideo, isPodcast, selectedCategory, categoryId]);

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
      category_id: categoryId,
      featured_image_url: featuredImageUrl,
      video_url: String(fd.get("video_url") || ""),
      reading_time_minutes: Number(fd.get("reading_time_minutes") || 5),
      published_at: String(fd.get("published_at") || ""),
      published_at_display: publishedAtDisplay,
      published_at_original: publishedAtOriginal,
      is_featured: isFeatured,
      is_premium: isPremium,
      is_video: isVideo,
      is_podcast: isPodcast,
      is_popular: isPopular,
      show_featured_image: showFeaturedImage,
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

  const onSave = (formData: FormData) => {
    if (!slugValid) {
      setSaveError(
        "This slug is already used by another post. Choose a different permalink.",
      );
      return;
    }
    if (pendingStatusRef.current) {
      formData.set("status", pendingStatusRef.current);
      pendingStatusRef.current = null;
    }
    setSaveError(null);
    setStaleDeploy(false);
    startSave(async () => {
      try {
        await upsertPostAction(formData);
      } catch (err) {
        if (isNextRedirectError(err)) throw err;
        if (isStaleServerActionError(err)) {
          setStaleDeploy(true);
          setSaveError(
            "This admin page is from an older deploy. Reload the page, then save again.",
          );
          return;
        }
        const msg = err instanceof Error ? err.message : "Save failed";
        setSaveError(msg);
        if (/slug is already used/i.test(msg)) {
          setSlugValid(false);
        }
      }
    });
  };

  const submitWithStatus = (nextStatus: PostStatus) => {
    if (saveBlocked || saving) return;
    const form = formRef.current;
    if (!form) return;
    pendingStatusRef.current = nextStatus;
    setStatus(nextStatus);
    form.requestSubmit();
  };

  return (
    <DashboardCard
      title={isEdit || postId ? "Edit news" : "New news"}
      subtitle={
        isEdit || postId
          ? "Only fields you change are saved. Publish date, placement flags, and category stay put unless you edit them."
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
      <Box
        sx={{
          display: "grid",
          gap: 3,
          gridTemplateColumns: { xs: "1fr", lg: "minmax(0, 1fr) 320px" },
          alignItems: "start",
        }}
      >
        <Box component="form" ref={formRef} action={onSave}>
          {postId ? <input type="hidden" name="id" value={postId} /> : null}
          {/* Always submit explicit true/false so unchecked boxes cannot wipe placements */}
          <input type="hidden" name="is_featured" value={isFeatured ? "true" : "false"} />
          <input type="hidden" name="is_premium" value={isPremium ? "true" : "false"} />
          <input type="hidden" name="is_video" value={isVideo ? "true" : "false"} />
          <input type="hidden" name="is_podcast" value={isPodcast ? "true" : "false"} />
          <input type="hidden" name="is_popular" value={isPopular ? "true" : "false"} />
          <input
            type="hidden"
            name="show_featured_image"
            value={showFeaturedImage ? "true" : "false"}
          />

          <Stack spacing={2.5}>
            <TitlePermalinkField
              siteUrl={siteUrl}
              title={title}
              slug={slug}
              autoSlug={autoSlug}
              excludeId={postId || undefined}
              onTitleChange={setTitle}
              onSlugChange={setSlug}
              onAutoSlugChange={setAutoSlug}
              onSlugValidChange={setSlugValid}
              onPreview={() => void onPreview()}
              previewBusy={previewBusy}
              canViewPublic={status === "published" && Boolean(slug)}
              publicHref={slug ? `/news/${slug}` : undefined}
            />

            {previewError ? <Alert severity="error">{previewError}</Alert> : null}
            {staleDeploy ? (
              <Alert
                severity="warning"
                action={
                  <Button color="inherit" size="small" onClick={() => window.location.reload()}>
                    Reload page
                  </Button>
                }
              >
                {saveError}
              </Alert>
            ) : saveError ? (
              <Alert severity="error">{saveError}</Alert>
            ) : null}

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

                setSeo((prev) => ({
                  seo_title: prev.seo_title.trim()
                    ? prev.seo_title
                    : result.seoTitle || prev.seo_title,
                  seo_description: prev.seo_description.trim()
                    ? prev.seo_description
                    : result.seoDescription || prev.seo_description,
                  seo_keywords: prev.seo_keywords.trim()
                    ? prev.seo_keywords
                    : result.seoKeywords || prev.seo_keywords,
                  og_title: prev.og_title.trim()
                    ? prev.og_title
                    : result.ogTitle || prev.og_title,
                  og_description: prev.og_description.trim()
                    ? prev.og_description
                    : result.ogDescription || prev.og_description,
                }));

                if (!categoryId && result.categoryId) {
                  setCategoryId(result.categoryId);
                }
                if (result.tagIds && result.tagIds.length > 0) {
                  setSelectedTagIds((prev) => {
                    if (prev.length > 0) {
                      return Array.from(new Set([...prev, ...result.tagIds!]));
                    }
                    return result.tagIds!;
                  });
                }
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
                value={categoryId}
                onChange={(e) => setCategoryId(e.target.value)}
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
            {tags.length > 0 ? (
              <Box>
                <input type="hidden" name="tags_present" value="1" />
                <Typography variant="subtitle2" gutterBottom>
                  Tags
                </Typography>
                <Typography variant="caption" color="text.secondary" display="block" mb={1}>
                  AI may select matching tags. You can adjust before saving.
                </Typography>
                {selectedTagIds.map((id) => (
                  <input key={id} type="hidden" name="tag_ids" value={id} />
                ))}
                <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap>
                  {tags.map((tag) => {
                    const checked = selectedTagIds.includes(tag.id);
                    return (
                      <FormControlLabel
                        key={tag.id}
                        control={
                          <Checkbox
                            size="small"
                            checked={checked}
                            onChange={(e) => {
                              setSelectedTagIds((prev) =>
                                e.target.checked
                                  ? [...prev, tag.id]
                                  : prev.filter((x) => x !== tag.id),
                              );
                            }}
                          />
                        }
                        label={tag.name}
                      />
                    );
                  })}
                </Stack>
              </Box>
            ) : null}
            <ImageUploadField
              name="featured_image_url"
              label="Featured image"
              defaultValue={featuredImageUrl}
              onUrlChange={setFeaturedImageUrl}
            />
            <FormControlLabel
              control={
                <Switch
                  checked={showFeaturedImage}
                  onChange={(e) => {
                    showFeaturedTouched.current = true;
                    setShowFeaturedImage(e.target.checked);
                  }}
                  color="primary"
                />
              }
              label={
                showFeaturedImage ? "Show featured image" : "Hide featured image"
              }
            />
            <Typography variant="caption" color="text.secondary" display="block" mt={-1}>
              {isMediaPost
                ? "Video/Podcast default to hide — the player moves into the hero slot on the public page."
                : "When hidden on Video/Podcast posts, the player replaces the hero image."}
            </Typography>
            <TextField
              name="video_url"
              label="Video URL (YouTube)"
              fullWidth
              helperText="Used by Must-Watch / video embeds (Plyr). On Video/Podcast with featured image hidden, this plays in the hero."
              defaultValue={post?.video_url ?? ""}
            />
            <input
              type="hidden"
              name="published_at_original"
              value={publishedAtOriginal}
            />
            <input
              type="hidden"
              name="published_at_display"
              value={publishedAtDisplay}
            />
            <TextField
              name="published_at"
              label="Published at"
              type="datetime-local"
              fullWidth
              InputLabelProps={{ shrink: true }}
              defaultValue={publishedAtDisplay}
              helperText="Home and lists sort by this date. Leave unchanged (or blank) to keep the existing publish time — editing title/body alone will not reshuffle."
            />
            <Box>
              <Typography variant="subtitle2" gutterBottom>
                Home placement
              </Typography>
              <Typography variant="caption" color="text.secondary" display="block" mb={1}>
                These flags control which home sections show this story. Saving never clears them
                unless you toggle them here.
              </Typography>
              <Stack direction="row" spacing={1} flexWrap="wrap">
                <FormControlLabel
                  control={
                    <Checkbox
                      checked={isFeatured}
                      onChange={(e) => setIsFeatured(e.target.checked)}
                    />
                  }
                  label="Featured"
                />
                <FormControlLabel
                  control={
                    <Checkbox
                      checked={isPremium}
                      onChange={(e) => setIsPremium(e.target.checked)}
                    />
                  }
                  label="Premium / Exclusive"
                />
                <FormControlLabel
                  control={
                    <Checkbox
                      checked={isVideo}
                      onChange={(e) => setIsVideo(e.target.checked)}
                    />
                  }
                  label="Video"
                />
                <FormControlLabel
                  control={
                    <Checkbox
                      checked={isPodcast}
                      onChange={(e) => setIsPodcast(e.target.checked)}
                    />
                  }
                  label="Podcast"
                />
                <FormControlLabel
                  control={
                    <Checkbox
                      checked={isPopular}
                      onChange={(e) => setIsPopular(e.target.checked)}
                    />
                  }
                  label="Popular"
                />
              </Stack>
            </Box>

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

            <Stack direction="row" spacing={1.5} flexWrap="wrap" sx={{ pb: 10 }}>
              <Button
                type="button"
                variant="outlined"
                onClick={() => void onPreview()}
                disabled={previewBusy || saveBlocked}
              >
                {previewBusy ? "Saving preview…" : "Preview changes"}
              </Button>
              <Button component={Link} href="/admin/posts" variant="text">
                Cancel
              </Button>
            </Stack>
          </Stack>

          {/* Floating sticky publish bar — always reachable without scrolling */}
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
                {saveBlocked
                  ? slugValid
                    ? "Add a title to save."
                    : "Fix the permalink before saving."
                  : !postId || !slug.trim()
                    ? "Save Draft once to unlock Preview (needs a saved permalink)."
                    : status === "published"
                      ? "Live on the public site after save."
                      : "Ready to save as draft, preview, or publish."}
              </Typography>
              <Stack direction="row" spacing={1.25} flexWrap="wrap" useFlexGap>
                <Button
                  type="button"
                  variant="outlined"
                  disabled={saving || saveBlocked}
                  onClick={() => submitWithStatus("draft")}
                >
                  {saving && status === "draft" ? "Saving…" : "Save Draft"}
                </Button>
                <Button
                  type="button"
                  variant="contained"
                  color="primary"
                  disabled={saving || saveBlocked}
                  onClick={() => submitWithStatus("published")}
                >
                  {saving && status === "published" ? "Publishing…" : "Publish"}
                </Button>
                <Button
                  type="button"
                  variant="outlined"
                  disabled={
                    previewBusy ||
                    saving ||
                    !postId ||
                    !slug.trim() ||
                    !title.trim()
                  }
                  onClick={() => void onPreview()}
                  title={
                    !postId || !slug.trim()
                      ? "Save the post first so it has a permalink to preview."
                      : "Open draft/public preview in a new tab"
                  }
                >
                  {previewBusy ? "Opening…" : "Preview"}
                </Button>
              </Stack>
            </Stack>
          </Box>
        </Box>

        <NewsCardPreview
          title={title}
          slug={slug}
          excerpt={excerpt}
          featuredImageUrl={featuredImageUrl}
          categoryName={categoryName}
          status={status}
          isFeatured={isFeatured}
          isPremium={isPremium}
          isVideo={isVideo}
          isPodcast={isPodcast}
          isPopular={isPopular}
          siteUrl={siteUrl}
          publicHref={status === "published" && slug ? `/news/${slug}` : null}
        />
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
