"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
  Alert,
  Box,
  Button,
  Card,
  CardActions,
  CardContent,
  CardMedia,
  CircularProgress,
  Grid,
  List,
  ListItemButton,
  ListItemText,
  Stack,
  TextField,
  Typography,
} from "@mui/material";
import DashboardCard from "@/components/admin/shared/DashboardCard";

type UploadLibraryItem = {
  url: string;
  filename: string;
  day: string;
  year: number;
  month: number;
  size: number;
  modifiedAt: string;
};

type UploadLibraryMonth = {
  year: number;
  month: number;
  count: number;
  label: string;
};

type LibraryResponse =
  | {
      ok: true;
      items: UploadLibraryItem[];
      total: number;
      hasMore: boolean;
      nextOffset: number;
      months: UploadLibraryMonth[];
    }
  | { ok: false; error: string };

type UploadResponse =
  | { ok: true; url: string; absoluteUrl?: string }
  | { ok: false; error: string };

const PAGE_SIZE = 48;

function formatBytes(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

function monthGroupKey(item: UploadLibraryItem): string {
  return `${item.year}-${item.month}`;
}

function monthHeading(year: number, month: number): string {
  try {
    return new Intl.DateTimeFormat("en-US", {
      month: "long",
      year: "numeric",
    }).format(new Date(year, month - 1, 1));
  } catch {
    return `${year}-${String(month).padStart(2, "0")}`;
  }
}

export default function MediaGrid() {
  const [items, setItems] = useState<UploadLibraryItem[]>([]);
  const [months, setMonths] = useState<UploadLibraryMonth[]>([]);
  const [total, setTotal] = useState(0);
  const [hasMore, setHasMore] = useState(false);
  const [nextOffset, setNextOffset] = useState(0);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [searchInput, setSearchInput] = useState("");
  const [query, setQuery] = useState("");
  const [filterYear, setFilterYear] = useState<number | null>(null);
  const [filterMonth, setFilterMonth] = useState<number | null>(null);

  const [uploadedUrl, setUploadedUrl] = useState<string | null>(null);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [uploadPending, setUploadPending] = useState(false);
  const [copiedUrl, setCopiedUrl] = useState<string | null>(null);

  const fetchId = useRef(0);

  const buildParams = useCallback(
    (offset: number) => {
      const params = new URLSearchParams();
      params.set("offset", String(offset));
      params.set("limit", String(PAGE_SIZE));
      if (query.trim()) params.set("q", query.trim());
      if (filterYear != null) params.set("year", String(filterYear));
      if (filterMonth != null) params.set("month", String(filterMonth));
      return params;
    },
    [query, filterYear, filterMonth],
  );

  const fetchPage = useCallback(
    async (offset: number, append: boolean) => {
      const id = ++fetchId.current;
      if (append) setLoadingMore(true);
      else setLoading(true);
      setError(null);

      try {
        const res = await fetch(
          `/api/admin/media/library?${buildParams(offset).toString()}`,
          { credentials: "same-origin" },
        );
        const data = (await res.json()) as LibraryResponse;
        if (id !== fetchId.current) return;

        if (!data.ok) {
          setError(data.error || "Could not load media library.");
          if (!append) {
            setItems([]);
            setTotal(0);
            setHasMore(false);
          }
          return;
        }

        setItems((prev) => (append ? [...prev, ...data.items] : data.items));
        setTotal(data.total);
        setHasMore(data.hasMore);
        setNextOffset(data.nextOffset);
        if (data.months?.length) setMonths(data.months);
      } catch (err) {
        if (id !== fetchId.current) return;
        setError(err instanceof Error ? err.message : "Could not load media.");
      } finally {
        if (id === fetchId.current) {
          setLoading(false);
          setLoadingMore(false);
        }
      }
    },
    [buildParams],
  );

  useEffect(() => {
    const t = window.setTimeout(() => setQuery(searchInput), 350);
    return () => window.clearTimeout(t);
  }, [searchInput]);

  useEffect(() => {
    void fetchPage(0, false);
  }, [fetchPage]);

  const groupedSections = useMemo(() => {
    if (filterYear != null && filterMonth != null) {
      return [{ key: "filtered", label: null as string | null, items }];
    }
    const map = new Map<string, { label: string; items: UploadLibraryItem[] }>();
    for (const item of items) {
      const key = monthGroupKey(item);
      let group = map.get(key);
      if (!group) {
        group = {
          label: monthHeading(item.year, item.month),
          items: [],
        };
        map.set(key, group);
      }
      group.items.push(item);
    }
    return [...map.entries()].map(([key, group]) => ({
      key,
      label: group.label,
      items: group.items,
    }));
  }, [items, filterYear, filterMonth]);

  const onFile = async (file: File | null) => {
    if (!file) return;
    setUploadError(null);
    setUploadedUrl(null);
    setUploadPending(true);
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
        setUploadError(
          res.status === 413
            ? "Image is too large for the server (max 10MB)."
            : `Upload failed (${res.status}).`,
        );
        return;
      }
      if (!result.ok) {
        setUploadError(result.error || `Upload failed (${res.status}).`);
        return;
      }
      const url = result.absoluteUrl || result.url;
      setUploadedUrl(url);
      await fetchPage(0, false);
    } catch (err) {
      setUploadError(err instanceof Error ? err.message : "Upload failed");
    } finally {
      setUploadPending(false);
    }
  };

  const copyUrl = async (url: string) => {
    const text =
      url.startsWith("http://") || url.startsWith("https://")
        ? url
        : `${window.location.origin}${url.startsWith("/") ? url : `/${url}`}`;
    try {
      await navigator.clipboard.writeText(text);
      setCopiedUrl(url);
      window.setTimeout(() => setCopiedUrl(null), 2000);
    } catch {
      setCopiedUrl(null);
    }
  };

  const selectMonth = (year: number | null, month: number | null) => {
    setFilterYear(year);
    setFilterMonth(month);
  };

  const filterLabel =
    filterYear != null && filterMonth != null
      ? monthHeading(filterYear, filterMonth)
      : "All dates";

  return (
    <DashboardCard
      title="Media library"
      subtitle={`${total.toLocaleString()} file${total === 1 ? "" : "s"} on disk under public/uploads`}
    >
      <Stack spacing={2} mb={3}>
        <Typography variant="body2" color="text.secondary">
          Lists every image saved on the server (<code>/uploads/YYYY-MM-DD/…</code>),
          not only news featured images. Uploads are optimized to WebP; paste URLs
          into news, settings, or banners.
        </Typography>
        <Stack direction={{ xs: "column", sm: "row" }} spacing={1.5} alignItems="flex-start">
          <Button
            variant="contained"
            component="label"
            disabled={uploadPending}
            startIcon={
              uploadPending ? <CircularProgress size={16} color="inherit" /> : undefined
            }
          >
            {uploadPending ? "Uploading…" : "Upload image"}
            <input
              hidden
              type="file"
              accept="image/jpeg,image/png,image/webp,image/gif,image/avif"
              onChange={(e) => void onFile(e.target.files?.[0] ?? null)}
            />
          </Button>
          <TextField
            size="small"
            label="Search"
            placeholder="Filename or date (2026-09-17)"
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
            sx={{ minWidth: { xs: "100%", sm: 280 } }}
          />
        </Stack>
        {uploadError ? <Alert severity="error">{uploadError}</Alert> : null}
        {uploadedUrl ? (
          <Alert severity="success">
            Uploaded —{" "}
            <Box component="span" sx={{ wordBreak: "break-all" }}>
              {uploadedUrl}
            </Box>
          </Alert>
        ) : null}
        {error ? <Alert severity="error">{error}</Alert> : null}
      </Stack>

      <Grid container spacing={3}>
        <Grid size={{ xs: 12, md: 3 }}>
          <Typography variant="subtitle2" gutterBottom>
            Browse by month
          </Typography>
          <List dense disablePadding sx={{ border: 1, borderColor: "divider", borderRadius: 1 }}>
            <ListItemButton
              selected={filterYear == null && filterMonth == null}
              onClick={() => selectMonth(null, null)}
            >
              <ListItemText
                primary="All dates"
                secondary={
                  months.length
                    ? `${months.reduce((n, m) => n + m.count, 0).toLocaleString()} total`
                    : undefined
                }
              />
            </ListItemButton>
            {months.map((m) => (
              <ListItemButton
                key={`${m.year}-${m.month}`}
                selected={filterYear === m.year && filterMonth === m.month}
                onClick={() => selectMonth(m.year, m.month)}
              >
                <ListItemText primary={m.label} secondary={`${m.count} file${m.count === 1 ? "" : "s"}`} />
              </ListItemButton>
            ))}
            {months.length === 0 && !loading ? (
              <ListItemButton disabled>
                <ListItemText primary="No uploads yet" />
              </ListItemButton>
            ) : null}
          </List>
        </Grid>

        <Grid size={{ xs: 12, md: 9 }}>
          <Stack direction="row" justifyContent="space-between" alignItems="center" mb={2}>
            <Typography variant="subtitle1">{filterLabel}</Typography>
            <Typography variant="caption" color="text.secondary">
              Showing {items.length.toLocaleString()} of {total.toLocaleString()}
            </Typography>
          </Stack>

          {loading && items.length === 0 ? (
            <Box py={6} display="flex" justifyContent="center">
              <CircularProgress />
            </Box>
          ) : null}

          {!loading && items.length === 0 ? (
            <Typography color="text.secondary" py={4}>
              No images match this filter. Upload a file or choose another month.
            </Typography>
          ) : null}

          {groupedSections.map((section) => (
            <Box key={section.key} mb={3}>
              {section.label ? (
                <Typography
                  variant="overline"
                  color="text.secondary"
                  sx={{ display: "block", mb: 1.5, letterSpacing: 1 }}
                >
                  {section.label}
                </Typography>
              ) : null}
              <Grid container spacing={2}>
                {section.items.map((item) => {
                  const displayUrl = item.url.startsWith("/") ? item.url : item.url;
                  return (
                    <Grid key={item.url} size={{ xs: 12, sm: 6, lg: 4 }}>
                      <Card variant="outlined" sx={{ height: "100%" }}>
                        <CardMedia
                          component="img"
                          height="160"
                          image={displayUrl}
                          alt={item.filename}
                          sx={{ objectFit: "cover", bgcolor: "grey.100" }}
                        />
                        <CardContent sx={{ pb: 1 }}>
                          <Typography variant="caption" color="text.secondary" display="block">
                            {item.day} · {formatBytes(item.size)}
                          </Typography>
                          <Typography
                            variant="body2"
                            sx={{ wordBreak: "break-all", mt: 0.5 }}
                            noWrap
                            title={item.url}
                          >
                            {item.filename}
                          </Typography>
                        </CardContent>
                        <CardActions sx={{ pt: 0, px: 2, pb: 2 }}>
                          <Button size="small" onClick={() => void copyUrl(item.url)}>
                            {copiedUrl === item.url ? "Copied" : "Copy URL"}
                          </Button>
                        </CardActions>
                      </Card>
                    </Grid>
                  );
                })}
              </Grid>
            </Box>
          ))}

          {hasMore ? (
            <Box display="flex" justifyContent="center" py={2}>
              <Button
                variant="outlined"
                disabled={loadingMore}
                onClick={() => void fetchPage(nextOffset, true)}
                startIcon={loadingMore ? <CircularProgress size={16} /> : undefined}
              >
                {loadingMore ? "Loading…" : "Load more"}
              </Button>
            </Box>
          ) : null}
        </Grid>
      </Grid>
    </DashboardCard>
  );
}
