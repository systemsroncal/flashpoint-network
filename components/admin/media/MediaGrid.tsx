"use client";

import Link from "next/link";
import { useState, useTransition } from "react";
import {
  Alert,
  Box,
  Button,
  Card,
  CardContent,
  CardMedia,
  CircularProgress,
  Grid,
  Stack,
  Typography,
} from "@mui/material";
import DashboardCard from "@/components/admin/shared/DashboardCard";
import { uploadMediaAction } from "@/lib/admin/upload";

type MediaItem = {
  id: string;
  title: string;
  slug: string;
  featured_image_url: string | null;
};

export default function MediaGrid({ items }: { items: MediaItem[] }) {
  const [uploadedUrl, setUploadedUrl] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  const onFile = (file: File | null) => {
    if (!file) return;
    setError(null);
    setUploadedUrl(null);
    const fd = new FormData();
    fd.set("file", file);
    startTransition(async () => {
      const result = await uploadMediaAction(fd);
      if (!result.ok) {
        setError(result.error);
        return;
      }
      setUploadedUrl(result.url);
    });
  };

  return (
    <DashboardCard
      title="Media"
      subtitle={`${items.length} featured images currently used by news`}
    >
      <Stack spacing={2} mb={3}>
        <Typography variant="body2" color="text.secondary">
          Upload optimizes with Sharp (WebP) and saves on the server under{" "}
          <code>public/uploads/</code> (public URL <code>/uploads/…</code>).
          Paste the URL into a News featured image field. Existing Supabase
          Storage URLs keep working as-is.
        </Typography>
        <Button
          variant="contained"
          component="label"
          disabled={pending}
          sx={{ alignSelf: "flex-start" }}
          startIcon={pending ? <CircularProgress size={16} color="inherit" /> : undefined}
        >
          {pending ? "Uploading…" : "Upload image"}
          <input
            hidden
            type="file"
            accept="image/jpeg,image/png,image/webp,image/gif,image/avif"
            onChange={(e) => onFile(e.target.files?.[0] ?? null)}
          />
        </Button>
        {error ? <Alert severity="error">{error}</Alert> : null}
        {uploadedUrl ? (
          <Alert severity="success">
            Uploaded — copy URL:{" "}
            <Box component="span" sx={{ wordBreak: "break-all" }}>
              {uploadedUrl}
            </Box>
          </Alert>
        ) : null}
      </Stack>

      <Grid container spacing={2}>
        {items.map((item) => (
          <Grid key={item.id} size={{ xs: 12, sm: 6, md: 4 }}>
            <Card variant="outlined">
              {item.featured_image_url ? (
                <CardMedia
                  component="img"
                  height="160"
                  image={item.featured_image_url}
                  alt={item.title}
                />
              ) : null}
              <CardContent>
                <Typography variant="subtitle2" noWrap>
                  {item.title}
                </Typography>
                <Typography
                  variant="caption"
                  color="textSecondary"
                  display="block"
                  noWrap
                >
                  {item.featured_image_url}
                </Typography>
                <Box mt={1.5}>
                  <Button
                    component={Link}
                    href={`/admin/posts/${item.id}`}
                    size="small"
                    variant="outlined"
                  >
                    Edit news
                  </Button>
                </Box>
              </CardContent>
            </Card>
          </Grid>
        ))}
        {items.length === 0 ? (
          <Grid size={12}>
            <Typography color="textSecondary">
              No featured images found. Add image URLs on news.
            </Typography>
          </Grid>
        ) : null}
      </Grid>
    </DashboardCard>
  );
}
