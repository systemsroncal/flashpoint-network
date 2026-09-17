"use client";

import { useRef, useState } from "react";
import {
  Box,
  Button,
  CircularProgress,
  Stack,
  TextField,
  Typography,
} from "@mui/material";

type Props = {
  name?: string;
  label?: string;
  defaultValue?: string | null;
  onUrlChange?: (url: string) => void;
  accept?: string;
};

type UploadResponse =
  | { ok: true; url: string; absoluteUrl?: string }
  | { ok: false; error: string };

export default function ImageUploadField({
  name = "featured_image_url",
  label = "Featured image",
  defaultValue = "",
  onUrlChange,
  accept = "image/jpeg,image/png,image/webp,image/gif,image/avif",
}: Props) {
  const [url, setUrl] = useState(defaultValue ?? "");
  const [error, setError] = useState<string | null>(null);
  const [pending, setPending] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const setAndNotify = (next: string) => {
    setUrl(next);
    onUrlChange?.(next);
  };

  const onFile = async (file: File | null) => {
    if (!file) return;
    setError(null);
    setPending(true);
    try {
      const fd = new FormData();
      fd.set("file", file);
      const res = await fetch("/api/admin/media/upload", {
        method: "POST",
        body: fd,
        credentials: "same-origin",
      });
      let result: UploadResponse;
      try {
        result = (await res.json()) as UploadResponse;
      } catch {
        setError(
          res.status === 413
            ? "Image is too large for the server (max 10MB)."
            : `Upload failed (${res.status}).`,
        );
        return;
      }
      if (!result.ok) {
        setError(result.error || `Upload failed (${res.status}).`);
        return;
      }
      // Prefer absolute URL for form value / previews; relative still works same-origin.
      setAndNotify(result.absoluteUrl || result.url);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Upload failed");
    } finally {
      setPending(false);
      if (inputRef.current) inputRef.current.value = "";
    }
  };

  return (
    <Stack spacing={1.5}>
      <Typography variant="subtitle2">{label}</Typography>
      <Stack direction={{ xs: "column", sm: "row" }} spacing={1.5} alignItems="flex-start">
        <Button
          variant="outlined"
          component="label"
          disabled={pending}
          startIcon={pending ? <CircularProgress size={16} /> : undefined}
        >
          {pending ? "Uploading…" : "Upload image"}
          <input
            ref={inputRef}
            hidden
            type="file"
            accept={accept}
            onChange={(e) => void onFile(e.target.files?.[0] ?? null)}
          />
        </Button>
        <Typography variant="caption" color="text.secondary" sx={{ pt: 1 }}>
          Auto-resizes to max 1920px wide (height scales), converts to WebP on
          disk (`/uploads/…`).
        </Typography>
      </Stack>
      <TextField
        name={name}
        label="Image URL"
        fullWidth
        value={url}
        onChange={(e) => setAndNotify(e.target.value)}
        helperText={
          error ??
          "Saved on the VPS under public/uploads (public URL /uploads/…). Older Supabase Storage URLs still work."
        }
        error={Boolean(error)}
      />
      {url ? (
        <Box
          component="img"
          src={url}
          alt=""
          sx={{
            maxWidth: 320,
            maxHeight: 180,
            objectFit: "cover",
            borderRadius: 1,
            border: "1px solid",
            borderColor: "divider",
          }}
        />
      ) : null}
    </Stack>
  );
}
