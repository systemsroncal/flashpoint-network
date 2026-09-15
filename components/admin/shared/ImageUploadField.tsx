"use client";

import { useRef, useState, useTransition } from "react";
import {
  Box,
  Button,
  CircularProgress,
  Stack,
  TextField,
  Typography,
} from "@mui/material";
import { uploadMediaAction } from "@/lib/admin/upload";

type Props = {
  name?: string;
  label?: string;
  defaultValue?: string | null;
  onUrlChange?: (url: string) => void;
};

export default function ImageUploadField({
  name = "featured_image_url",
  label = "Featured image",
  defaultValue = "",
  onUrlChange,
}: Props) {
  const [url, setUrl] = useState(defaultValue ?? "");
  const [error, setError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();
  const inputRef = useRef<HTMLInputElement>(null);

  const setAndNotify = (next: string) => {
    setUrl(next);
    onUrlChange?.(next);
  };

  const onFile = (file: File | null) => {
    if (!file) return;
    setError(null);
    const fd = new FormData();
    fd.set("file", file);
    startTransition(async () => {
      const result = await uploadMediaAction(fd);
      if (!result.ok) {
        setError(result.error);
        return;
      }
      setAndNotify(result.url);
    });
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
            accept="image/jpeg,image/png,image/webp,image/gif,image/avif"
            onChange={(e) => onFile(e.target.files?.[0] ?? null)}
          />
        </Button>
        <Typography variant="caption" color="text.secondary" sx={{ pt: 1 }}>
          Sharp → WebP → project Storage (`media`). Prefer upload over pasting remote URLs.
        </Typography>
      </Stack>
      <TextField
        name={name}
        label="Image URL"
        fullWidth
        value={url}
        onChange={(e) => setAndNotify(e.target.value)}
          helperText={error ?? "Hosted on this project’s media Storage."}
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
