"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { Box, Button, Stack, TextField, Typography } from "@mui/material";
import { slugify } from "@/lib/slug";
import { normalizePublicUrl } from "@/lib/env";

type Props = {
  siteUrl: string;
  title: string;
  slug: string;
  /** When true, title changes auto-update the slug */
  autoSlug: boolean;
  /** Current post id — excluded from uniqueness checks */
  excludeId?: string;
  onTitleChange: (title: string) => void;
  onSlugChange: (slug: string) => void;
  onAutoSlugChange: (auto: boolean) => void;
  /** Called when availability changes (true = unique / ok to save) */
  onSlugValidChange?: (valid: boolean) => void;
  onPreview: () => void;
  previewBusy?: boolean;
  canViewPublic?: boolean;
  publicHref?: string;
};

type CheckResult = {
  available: boolean;
  error: string | null;
};

export default function TitlePermalinkField({
  siteUrl,
  title,
  slug,
  autoSlug,
  excludeId,
  onTitleChange,
  onSlugChange,
  onAutoSlugChange,
  onSlugValidChange,
  onPreview,
  previewBusy,
  canViewPublic,
  publicHref,
}: Props) {
  const [editing, setEditing] = useState(false);
  const [draftSlug, setDraftSlug] = useState(slug);
  const [slugError, setSlugError] = useState<string | null>(null);
  const [checking, setChecking] = useState(false);
  const checkSeq = useRef(0);

  useEffect(() => {
    if (!editing) setDraftSlug(slug);
  }, [slug, editing]);

  const origin = useMemo(
    () => normalizePublicUrl(siteUrl, "http://127.0.0.1:43125"),
    [siteUrl],
  );

  const base = `${origin}/news/`;
  const displaySlug = slug || "slug";

  const runCheck = async (raw: string) => {
    const normalized = slugify(raw);
    if (!normalized) {
      setSlugError("Slug is required.");
      onSlugValidChange?.(false);
      return { available: false, error: "Slug is required." } satisfies CheckResult;
    }

    const seq = ++checkSeq.current;
    setChecking(true);
    try {
      const params = new URLSearchParams({ slug: normalized });
      if (excludeId) params.set("excludeId", excludeId);
      const res = await fetch(`/api/admin/posts/slug-check?${params}`);
      const data = (await res.json()) as {
        available?: boolean;
        error?: string | null;
      };
      if (seq !== checkSeq.current) return { available: true, error: null };

      const available = Boolean(data.available);
      const error = available
        ? null
        : data.error ||
          "This slug is already used by another post. Choose a different permalink.";
      setSlugError(error);
      onSlugValidChange?.(available);
      return { available, error } satisfies CheckResult;
    } catch {
      if (seq !== checkSeq.current) return { available: true, error: null };
      const error = "Could not verify slug uniqueness. Try again.";
      setSlugError(error);
      onSlugValidChange?.(false);
      return { available: false, error } satisfies CheckResult;
    } finally {
      if (seq === checkSeq.current) setChecking(false);
    }
  };

  // Debounced uniqueness check whenever the committed slug changes
  useEffect(() => {
    const normalized = slugify(slug);
    if (!normalized) {
      setSlugError(slug.trim() ? "Slug is required." : null);
      onSlugValidChange?.(false);
      return;
    }

    const timer = window.setTimeout(() => {
      void runCheck(normalized);
    }, 400);
    return () => window.clearTimeout(timer);
    // excludeId + slug drive the check; onSlugValidChange is stable enough via parent
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [slug, excludeId]);

  const startEdit = () => {
    setDraftSlug(slug || slugify(title) || "");
    setEditing(true);
  };

  const confirmEdit = async () => {
    const next = slugify(draftSlug) || slugify(title) || "untitled";
    const result = await runCheck(next);
    onSlugChange(next);
    onAutoSlugChange(false);
    if (result.available) {
      setEditing(false);
    }
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
              <Box
                component="strong"
                sx={{
                  fontWeight: 700,
                  color: slugError ? "error.main" : "inherit",
                }}
              >
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
              error={Boolean(slugError)}
              helperText={slugError || (checking ? "Checking…" : undefined)}
              onChange={(e) => {
                setDraftSlug(e.target.value);
                if (slugError) setSlugError(null);
              }}
              onBlur={() => {
                void runCheck(draftSlug);
              }}
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  e.preventDefault();
                  void confirmEdit();
                }
                if (e.key === "Escape") cancelEdit();
              }}
              inputProps={{ "aria-label": "Edit slug" }}
              sx={{ minWidth: { xs: "100%", sm: 220 } }}
            />
            {/* Hidden field stays in sync for form submit while editing */}
            <input type="hidden" name="slug" value={slug} />
            <Button
              size="small"
              variant="contained"
              onClick={() => void confirmEdit()}
              disabled={checking}
            >
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

      {!editing && slugError ? (
        <Typography variant="caption" color="error" sx={{ mt: 0.5, display: "block" }}>
          {slugError}
        </Typography>
      ) : null}

      {!autoSlug && !slugError ? (
        <Typography variant="caption" color="text.secondary" sx={{ mt: 0.5, display: "block" }}>
          Slug locked — won&apos;t auto-update from the title. Edit to change.
        </Typography>
      ) : null}
    </Box>
  );
}
