"use client";

import { useEffect, useMemo, useState } from "react";
import { Box, Button, Stack, TextField, Typography } from "@mui/material";
import { slugify } from "@/lib/slug";

type Props = {
  siteUrl: string;
  title: string;
  slug: string;
  /** When true, title changes auto-update the slug */
  autoSlug: boolean;
  onTitleChange: (title: string) => void;
  onSlugChange: (slug: string) => void;
  onAutoSlugChange: (auto: boolean) => void;
  onPreview: () => void;
  previewBusy?: boolean;
  canViewPublic?: boolean;
  publicHref?: string;
};

export default function TitlePermalinkField({
  siteUrl,
  title,
  slug,
  autoSlug,
  onTitleChange,
  onSlugChange,
  onAutoSlugChange,
  onPreview,
  previewBusy,
  canViewPublic,
  publicHref,
}: Props) {
  const [editing, setEditing] = useState(false);
  const [draftSlug, setDraftSlug] = useState(slug);

  useEffect(() => {
    if (!editing) setDraftSlug(slug);
  }, [slug, editing]);

  const origin = useMemo(() => {
    try {
      return new URL(siteUrl).origin.replace(/\/$/, "");
    } catch {
      return siteUrl.replace(/\/$/, "") || "http://127.0.0.1:43125";
    }
  }, [siteUrl]);

  const base = `${origin}/news/`;
  const displaySlug = slug || "slug";

  const startEdit = () => {
    setDraftSlug(slug || slugify(title) || "");
    setEditing(true);
  };

  const confirmEdit = () => {
    const next = slugify(draftSlug) || slugify(title) || "untitled";
    onSlugChange(next);
    onAutoSlugChange(false);
    setEditing(false);
  };

  const cancelEdit = () => {
    setDraftSlug(slug);
    setEditing(false);
  };

  return (
    <Box>
      <TextField
        name="title"
        label="Title"
        required
        fullWidth
        placeholder="Add title"
        value={title}
        onChange={(e) => {
          const next = e.target.value;
          onTitleChange(next);
          if (autoSlug) {
            onSlugChange(slugify(next));
          }
        }}
        inputProps={{
          "aria-label": "News title",
        }}
      />

      <Stack
        direction={{ xs: "column", sm: "row" }}
        spacing={1}
        alignItems={{ sm: "center" }}
        flexWrap="wrap"
        sx={{ mt: 1.25, px: 0.25 }}
      >
        <Typography variant="body2" color="text.secondary" component="div">
          <Box component="span" fontWeight={600} color="text.primary">
            Permalink:
          </Box>{" "}
          <Box component="span" sx={{ wordBreak: "break-all" }}>
            {base}
            {editing ? null : (
              <Box component="strong" sx={{ fontWeight: 700 }}>
                {displaySlug}
              </Box>
            )}
          </Box>
        </Typography>

        {editing ? (
          <Stack direction="row" spacing={1} alignItems="center" flexWrap="wrap">
            <TextField
              size="small"
              value={draftSlug}
              onChange={(e) => setDraftSlug(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  e.preventDefault();
                  confirmEdit();
                }
                if (e.key === "Escape") cancelEdit();
              }}
              inputProps={{ "aria-label": "Edit slug" }}
              sx={{ minWidth: { xs: "100%", sm: 220 } }}
            />
            {/* Hidden field stays in sync for form submit while editing */}
            <input type="hidden" name="slug" value={slug} />
            <Button size="small" variant="contained" onClick={confirmEdit}>
              OK
            </Button>
            <Button size="small" variant="text" onClick={cancelEdit}>
              Cancel
            </Button>
          </Stack>
        ) : (
          <Stack direction="row" spacing={1} alignItems="center">
            <input type="hidden" name="slug" value={slug} />
            <Button size="small" variant="outlined" onClick={startEdit}>
              Edit
            </Button>
            <Button
              size="small"
              variant="outlined"
              onClick={onPreview}
              disabled={previewBusy}
            >
              {previewBusy ? "Saving…" : "Preview"}
            </Button>
            {canViewPublic && publicHref ? (
              <Button
                size="small"
                variant="text"
                href={publicHref}
                target="_blank"
                rel="noopener noreferrer"
              >
                View
              </Button>
            ) : null}
          </Stack>
        )}
      </Stack>

      {!autoSlug ? (
        <Typography variant="caption" color="text.secondary" sx={{ mt: 0.5, display: "block" }}>
          Slug locked — won&apos;t auto-update from the title. Edit to change.
        </Typography>
      ) : null}
    </Box>
  );
}
