"use client";

import { useMemo, useState, useTransition } from "react";
import Link from "next/link";
import {
  Alert,
  Box,
  Button,
  Chip,
  Divider,
  Stack,
  TextField,
  Typography,
} from "@mui/material";
import DashboardCard from "@/components/admin/shared/DashboardCard";
import ImageUploadField from "@/components/admin/shared/ImageUploadField";
import { savePublicPageSeoAction } from "@/lib/admin/page-seo-actions";
import type { PublicPageDefinition } from "@/lib/public-pages/registry";
import type { PublicPageSeoRecord } from "@/lib/public-pages/seo-store";
import { normalizePublicUrl } from "@/lib/env";

type Props = {
  page: PublicPageDefinition;
  seo: PublicPageSeoRecord;
  siteName: string;
  siteUrl: string;
  defaultFeaturedImageUrl: string | null;
};

type FormState = {
  seo_title: string;
  seo_description: string;
  seo_keywords: string;
  og_title: string;
  og_description: string;
  og_image_url: string;
};

function initialForm(seo: PublicPageSeoRecord, def: PublicPageDefinition): FormState {
  return {
    seo_title: seo.seo_title ?? "",
    seo_description: seo.seo_description ?? "",
    seo_keywords: seo.seo_keywords ?? "",
    og_title: seo.og_title ?? "",
    og_description: seo.og_description ?? "",
    og_image_url: seo.og_image_url ?? "",
  };
}

export default function PageSeoForm({
  page,
  seo,
  siteName,
  siteUrl,
  defaultFeaturedImageUrl,
}: Props) {
  const [form, setForm] = useState<FormState>(() => initialForm(seo, page));
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [aiPending, setAiPending] = useState(false);
  const [pending, startTransition] = useTransition();

  const previewTitle = (form.seo_title || page.defaultTitle).trim();
  const previewDesc = (
    form.seo_description ||
    page.defaultDescription ||
    ""
  ).trim();

  const effectiveOgImage =
    form.og_image_url.trim() || defaultFeaturedImageUrl || "";

  const host = useMemo(() => {
    try {
      return new URL(normalizePublicUrl(siteUrl)).host;
    } catch {
      return "fptn.com";
    }
  }, [siteUrl]);

  const onSave = () => {
    setMessage(null);
    setError(null);
    const fd = new FormData();
    fd.set("page_key", page.key);
    fd.set("seo_title", form.seo_title);
    fd.set("seo_description", form.seo_description);
    fd.set("seo_keywords", form.seo_keywords);
    fd.set("og_title", form.og_title);
    fd.set("og_description", form.og_description);
    fd.set("og_image_url", form.og_image_url);
    startTransition(async () => {
      const result = await savePublicPageSeoAction(fd);
      if (result.ok) {
        setMessage("SEO saved. Public metadata will update on the next request.");
      } else {
        setError(result.error);
      }
    });
  };

  const onAiSuggest = async () => {
    setAiPending(true);
    setError(null);
    try {
      const res = await fetch("/api/admin/pages/seo-suggest", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ pageKey: page.key }),
      });
      const data = (await res.json()) as FormState & { error?: string; mock?: boolean };
      if (!res.ok) {
        setError(data.error || "AI suggestion failed.");
        return;
      }
      setForm((prev) => ({
        ...prev,
        seo_title: data.seo_title || prev.seo_title,
        seo_description: data.seo_description || prev.seo_description,
        seo_keywords: data.seo_keywords || prev.seo_keywords,
        og_title: data.og_title || prev.og_title,
        og_description: data.og_description || prev.og_description,
      }));
      setMessage(
        data.mock
          ? "Mock SEO suggestions applied (no live AI key)."
          : "AI suggestions applied — review and save.",
      );
    } catch {
      setError("AI suggestion failed.");
    } finally {
      setAiPending(false);
    }
  };

  return (
    <Stack spacing={2}>
      <Button component={Link} href="/admin/pages" variant="text" sx={{ alignSelf: "flex-start" }}>
        ← All pages
      </Button>

      {message ? <Alert severity="success">{message}</Alert> : null}
      {error ? <Alert severity="error">{error}</Alert> : null}

      <DashboardCard
        title={page.label}
        subtitle={`${page.path} · ${page.group}`}
        action={
          <Stack direction="row" spacing={1}>
            <Button
              variant="outlined"
              disabled={aiPending}
              onClick={onAiSuggest}
            >
              {aiPending ? "Suggesting…" : "AI suggest meta"}
            </Button>
            <Button variant="contained" disabled={pending} onClick={onSave}>
              {pending ? "Saving…" : "Save SEO"}
            </Button>
          </Stack>
        }
      >
        <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
          Leave fields blank to use the built-in defaults for this route. Open Graph
          image falls back to the default featured image from Site identity when
          empty.
        </Typography>

        <Box
          sx={{
            mb: 2.5,
            p: 2,
            borderRadius: 1.5,
            bgcolor: "#fff",
            border: "1px solid #e0e0e0",
            maxWidth: 640,
          }}
        >
          <Typography sx={{ fontSize: 14, color: "#202124" }}>{siteName}</Typography>
          <Typography sx={{ fontSize: 12, color: "#4d5156" }}>
            {host} › {page.path.replace(/^\//, "") || "home"}
          </Typography>
          <Typography sx={{ fontSize: 20, color: "#1a0dab", mt: 0.5 }}>
            {previewTitle.length > 70 ? `${previewTitle.slice(0, 67)}…` : previewTitle}
          </Typography>
          <Typography sx={{ fontSize: 14, color: "#4d5156", mt: 0.5 }}>
            {previewDesc.length > 160 ? `${previewDesc.slice(0, 157)}…` : previewDesc}
          </Typography>
        </Box>

        <Stack spacing={2}>
          <TextField
            label="Meta title"
            fullWidth
            value={form.seo_title}
            onChange={(e) => setForm((f) => ({ ...f, seo_title: e.target.value }))}
            placeholder={page.defaultTitle}
          />
          <TextField
            label="Meta description"
            fullWidth
            multiline
            minRows={3}
            value={form.seo_description}
            onChange={(e) =>
              setForm((f) => ({ ...f, seo_description: e.target.value }))
            }
            placeholder={page.defaultDescription}
          />
          <TextField
            label="Focus keywords"
            fullWidth
            value={form.seo_keywords}
            onChange={(e) =>
              setForm((f) => ({ ...f, seo_keywords: e.target.value }))
            }
            helperText="Comma-separated (optional meta keywords)"
          />

          <Divider />
          <Typography variant="subtitle2" fontWeight={700}>
            Open Graph
          </Typography>
          <TextField
            label="OG title"
            fullWidth
            value={form.og_title}
            onChange={(e) => setForm((f) => ({ ...f, og_title: e.target.value }))}
            placeholder={previewTitle}
          />
          <TextField
            label="OG description"
            fullWidth
            multiline
            minRows={2}
            value={form.og_description}
            onChange={(e) =>
              setForm((f) => ({ ...f, og_description: e.target.value }))
            }
            placeholder={previewDesc}
          />

          <Box>
            <ImageUploadField
              name="og_image_url"
              label="OG / meta image (optional)"
              defaultValue={form.og_image_url}
              onUrlChange={(url) => setForm((f) => ({ ...f, og_image_url: url }))}
            />
            {!form.og_image_url.trim() && defaultFeaturedImageUrl ? (
              <Stack direction="row" spacing={1} alignItems="center" sx={{ mt: 1 }}>
                <Chip size="small" label="Using site default featured image" />
                <Typography variant="caption" color="text.secondary">
                  From Settings → Site identity
                </Typography>
              </Stack>
            ) : null}
            {effectiveOgImage ? (
              <Box
                component="img"
                src={effectiveOgImage}
                alt="OG preview"
                sx={{
                  mt: 1.5,
                  display: "block",
                  width: "100%",
                  maxWidth: 480,
                  maxHeight: 240,
                  objectFit: "cover",
                  borderRadius: 1,
                  border: "1px solid",
                  borderColor: "divider",
                }}
              />
            ) : null}
          </Box>
        </Stack>
      </DashboardCard>
    </Stack>
  );
}
