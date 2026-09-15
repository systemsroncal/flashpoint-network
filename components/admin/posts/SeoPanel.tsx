"use client";

import { useMemo } from "react";
import {
  Box,
  Divider,
  Stack,
  TextField,
  Typography,
  Chip,
} from "@mui/material";

export type SeoValues = {
  seo_title: string;
  seo_description: string;
  seo_keywords: string;
  og_title: string;
  og_description: string;
};

type Props = {
  siteName: string;
  siteUrl: string;
  title: string;
  slug: string;
  excerpt: string;
  featuredImageUrl?: string;
  values: SeoValues;
  onChange: (patch: Partial<SeoValues>) => void;
};

function lengthTone(
  len: number,
  idealMin: number,
  idealMax: number,
  warnMax: number,
): "success" | "warning" | "error" | "default" {
  if (len === 0) return "default";
  if (len >= idealMin && len <= idealMax) return "success";
  if (len < idealMin || len <= warnMax) return "warning";
  return "error";
}

function LengthHint({
  label,
  length,
  ideal,
}: {
  label: string;
  length: number;
  ideal: string;
}) {
  const [min, max] = ideal.split("–").map((n) => Number(n));
  const warnMax = Math.round(max * 1.15);
  const tone = lengthTone(length, min, max, warnMax);
  return (
    <Stack direction="row" spacing={1} alignItems="center" flexWrap="wrap">
      <Typography variant="caption" color="text.secondary">
        {label}: {length} chars · aim {ideal}
      </Typography>
      <Chip
        size="small"
        label={
          tone === "success"
            ? "Good"
            : tone === "warning"
              ? "Fair"
              : tone === "error"
                ? "Too long"
                : "Empty"
        }
        color={tone === "default" ? "default" : tone}
        variant={tone === "default" ? "outlined" : "filled"}
      />
    </Stack>
  );
}

export default function SeoPanel({
  siteName,
  siteUrl,
  title,
  slug,
  excerpt,
  featuredImageUrl,
  values,
  onChange,
}: Props) {
  const previewTitle = (values.seo_title || title || "Untitled").trim();
  const previewDesc = (
    values.seo_description ||
    excerpt ||
    "Add a meta description to improve how this story appears in search."
  ).trim();
  const path = `/news/${slug || "your-slug"}`;
  const host = useMemo(() => {
    try {
      return new URL(siteUrl).host;
    } catch {
      return "fpnetwork.local";
    }
  }, [siteUrl]);
  const breadcrumb = `${host} › news › ${slug || "…"}`;

  const ogTitle = values.og_title || values.seo_title || title;
  const ogDesc = values.og_description || values.seo_description || excerpt;
  const ogImage = featuredImageUrl?.trim() || "";

  return (
    <Box
      sx={{
        border: "1px solid",
        borderColor: "divider",
        borderRadius: 2,
        p: { xs: 2, md: 2.5 },
        bgcolor: "background.paper",
      }}
    >
      <Typography variant="h6" fontWeight={700} gutterBottom>
        SEO
      </Typography>
      <Typography variant="body2" color="text.secondary" mb={2}>
        Meta fields and a live Google-style snippet. Leave blank to fall back to
        the news title and excerpt on the public page. Social / Open Graph image
        always uses the featured image.
      </Typography>

      {/* SERP preview */}
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
        <Stack direction="row" spacing={1} alignItems="center" mb={0.5}>
          <Box
            component="img"
            src="/favicon.ico"
            alt=""
            sx={{ width: 18, height: 18, borderRadius: "50%" }}
          />
          <Box>
            <Typography sx={{ fontSize: 14, color: "#202124", lineHeight: 1.2 }}>
              {siteName}
            </Typography>
            <Typography sx={{ fontSize: 12, color: "#4d5156" }}>
              {breadcrumb}
            </Typography>
          </Box>
        </Stack>
        <Typography
          sx={{
            fontSize: 20,
            color: "#1a0dab",
            lineHeight: 1.3,
            mt: 0.5,
            cursor: "default",
          }}
        >
          {previewTitle.length > 70
            ? `${previewTitle.slice(0, 67)}…`
            : previewTitle}
        </Typography>
        <Typography sx={{ fontSize: 14, color: "#4d5156", mt: 0.5, lineHeight: 1.45 }}>
          {previewDesc.length > 160
            ? `${previewDesc.slice(0, 157)}…`
            : previewDesc}
        </Typography>
      </Box>

      <Stack spacing={2}>
        <Box>
          <TextField
            name="seo_title"
            label="Meta title"
            fullWidth
            value={values.seo_title}
            onChange={(e) => onChange({ seo_title: e.target.value })}
            placeholder={title || "Defaults to news title"}
          />
          <Box mt={0.75}>
            <LengthHint
              label="Title"
              length={(values.seo_title || title).length}
              ideal="50–60"
            />
          </Box>
        </Box>

        <Box>
          <TextField
            name="seo_description"
            label="Meta description"
            fullWidth
            multiline
            minRows={3}
            value={values.seo_description}
            onChange={(e) => onChange({ seo_description: e.target.value })}
            placeholder={excerpt || "Defaults to excerpt"}
          />
          <Box mt={0.75}>
            <LengthHint
              label="Description"
              length={(values.seo_description || excerpt).length}
              ideal="150–160"
            />
          </Box>
        </Box>

        <TextField
          name="seo_keywords"
          label="Focus / SEO keywords"
          fullWidth
          value={values.seo_keywords}
          onChange={(e) => onChange({ seo_keywords: e.target.value })}
          helperText="Comma-separated tags (stored as text; used for editors, optional meta keywords)"
          placeholder="army, resignation, capitol"
        />

        <Divider />
        <Typography variant="subtitle2" fontWeight={700}>
          Open Graph (optional)
        </Typography>
        <TextField
          name="og_title"
          label="OG title"
          fullWidth
          value={values.og_title}
          onChange={(e) => onChange({ og_title: e.target.value })}
          placeholder={ogTitle || "Defaults to meta / news title"}
        />
        <TextField
          name="og_description"
          label="OG description"
          fullWidth
          multiline
          minRows={2}
          value={values.og_description}
          onChange={(e) => onChange({ og_description: e.target.value })}
          placeholder={ogDesc || "Defaults to meta / excerpt"}
        />
        <Box>
          <Typography variant="subtitle2" gutterBottom>
            OG / meta image
          </Typography>
          <Typography variant="body2" color="text.secondary" mb={1.5}>
            Always uses the featured image above. Change the featured image to
            update social previews.
          </Typography>
          {ogImage ? (
            <Box
              component="img"
              src={ogImage}
              alt="Open Graph preview from featured image"
              sx={{
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
          ) : (
            <Box
              sx={{
                p: 2,
                borderRadius: 1,
                border: "1px dashed",
                borderColor: "divider",
                color: "text.secondary",
                maxWidth: 480,
              }}
            >
              No featured image yet — upload one above to set the meta image.
            </Box>
          )}
        </Box>
      </Stack>
    </Box>
  );
}
