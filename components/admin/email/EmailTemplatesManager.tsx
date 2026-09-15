"use client";

import { useMemo, useState } from "react";
import {
  Box,
  Button,
  ButtonGroup,
  Grid,
  Stack,
  TextField,
  Typography,
} from "@mui/material";
import DashboardCard from "@/components/admin/shared/DashboardCard";
import RichTextEditor from "@/components/admin/shared/RichTextEditor";
import { upsertEmailTemplateAction } from "@/lib/admin/actions";
import {
  compileEmailPreviewHtml,
  type EmailDesign,
  type LogoAlign,
} from "@/lib/email/preview";

export type EmailTemplate = {
  id: string;
  name: string;
  slug: string;
  subject: string;
  body_html: string;
  header_bg_color?: string | null;
  footer_bg_color?: string | null;
  logo_url?: string | null;
  logo_align?: string | null;
  max_width?: number | null;
};

const DEFAULT_LOGO = "/brand/fpn-logo-mark.svg";

function asLogoAlign(value: string | null | undefined): LogoAlign {
  if (value === "left" || value === "right" || value === "center") return value;
  return "center";
}

function TemplateEditor({
  template,
  siteName,
  mode,
}: {
  template?: EmailTemplate;
  siteName: string;
  mode: "create" | "edit";
}) {
  const [name, setName] = useState(template?.name ?? "");
  const [slug, setSlug] = useState(template?.slug ?? "");
  const [subject, setSubject] = useState(template?.subject ?? "");
  const [bodyHtml, setBodyHtml] = useState(
    template?.body_html ??
      "<p>Hello {CURRENT_USER_FULLNAME},</p><p>Welcome to {SITE_NAME}.</p>",
  );
  const [headerBg, setHeaderBg] = useState(
    template?.header_bg_color ?? "#1b2a64",
  );
  const [footerBg, setFooterBg] = useState(
    template?.footer_bg_color ?? "#111111",
  );
  const [logoUrl, setLogoUrl] = useState(
    template?.logo_url ?? DEFAULT_LOGO,
  );
  const [logoAlign, setLogoAlign] = useState<LogoAlign>(
    asLogoAlign(template?.logo_align),
  );
  const [maxWidth, setMaxWidth] = useState(
    String(template?.max_width ?? 600),
  );

  const design: EmailDesign = useMemo(
    () => ({
      headerBgColor: headerBg,
      footerBgColor: footerBg,
      logoUrl,
      maxWidth: Number(maxWidth) || 600,
      logoAlign,
    }),
    [headerBg, footerBg, logoUrl, maxWidth, logoAlign],
  );

  const previewHtml = useMemo(
    () =>
      compileEmailPreviewHtml({
        subject,
        bodyHtml,
        design,
        siteName,
      }),
    [subject, bodyHtml, design, siteName],
  );

  return (
    <DashboardCard
      title={mode === "create" ? "Add template" : template?.name || "Template"}
      subtitle={mode === "edit" ? `slug: ${template?.slug}` : undefined}
    >
      <Box component="form" action={upsertEmailTemplateAction}>
        {template?.id ? (
          <input type="hidden" name="id" value={template.id} />
        ) : null}
        <Grid container spacing={2.5}>
          <Grid size={{ xs: 12, lg: 6 }}>
            <Stack spacing={2}>
              <Stack direction={{ xs: "column", md: "row" }} spacing={2}>
                <TextField
                  name="name"
                  label="Name"
                  required
                  fullWidth
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                />
                <TextField
                  name="slug"
                  label="Slug"
                  fullWidth
                  value={slug}
                  onChange={(e) => setSlug(e.target.value)}
                />
              </Stack>
              <TextField
                name="subject"
                label="Subject"
                required
                fullWidth
                value={subject}
                onChange={(e) => setSubject(e.target.value)}
                helperText="Supports shortcodes like {SITE_NAME}"
              />

              <Typography variant="subtitle2">Design</Typography>
              <Stack direction={{ xs: "column", sm: "row" }} spacing={2}>
                <TextField
                  name="header_bg_color"
                  label="Header color"
                  type="color"
                  fullWidth
                  value={headerBg}
                  onChange={(e) => setHeaderBg(e.target.value)}
                  InputLabelProps={{ shrink: true }}
                />
                <TextField
                  name="footer_bg_color"
                  label="Footer color"
                  type="color"
                  fullWidth
                  value={footerBg}
                  onChange={(e) => setFooterBg(e.target.value)}
                  InputLabelProps={{ shrink: true }}
                />
                <TextField
                  name="max_width"
                  label="Max width (px)"
                  type="number"
                  fullWidth
                  value={maxWidth}
                  onChange={(e) => setMaxWidth(e.target.value)}
                  inputProps={{ min: 320, max: 900 }}
                />
              </Stack>
              <TextField
                name="logo_url"
                label="Logo URL"
                fullWidth
                value={logoUrl}
                onChange={(e) => setLogoUrl(e.target.value)}
                helperText="Shown in the email header"
              />
              <Box>
                <Typography variant="caption" color="text.secondary" display="block" mb={0.75}>
                  Logo alignment
                </Typography>
                <input type="hidden" name="logo_align" value={logoAlign} />
                <ButtonGroup size="small" variant="outlined">
                  {(["left", "center", "right"] as LogoAlign[]).map((align) => (
                    <Button
                      key={align}
                      type="button"
                      variant={logoAlign === align ? "contained" : "outlined"}
                      onClick={() => setLogoAlign(align)}
                    >
                      {align[0].toUpperCase() + align.slice(1)}
                    </Button>
                  ))}
                </ButtonGroup>
              </Box>

              <RichTextEditor
                name="body_html"
                label="Body"
                placeholder="Write the email body…"
                minHeight={mode === "create" ? 240 : 280}
                initialHtml={
                  template?.body_html ??
                  "<p>Hello {CURRENT_USER_FULLNAME},</p><p>Welcome to {SITE_NAME}.</p>"
                }
                onHtmlChange={setBodyHtml}
              />
              <Typography variant="caption" color="textSecondary">
                Shortcodes: {"{SITE_NAME}"}, {"{CURRENT_USER_FULLNAME}"},{" "}
                {"{CURRENT_USER_NAME}"}, {"{RESET_LINK}"}, {"{SITE_URL}"},{" "}
                {"{CURRENT_YEAR}"}, {"{CURRENT_DATE}"}
              </Typography>
              <Button
                type="submit"
                variant={mode === "create" ? "contained" : "outlined"}
                sx={{ alignSelf: "flex-start" }}
              >
                {mode === "create" ? "Create template" : "Save"}
              </Button>
            </Stack>
          </Grid>

          <Grid size={{ xs: 12, lg: 6 }}>
            <Typography variant="subtitle2" sx={{ mb: 1 }}>
              Live preview
            </Typography>
            <Box
              sx={{
                border: "1px solid",
                borderColor: "divider",
                borderRadius: 1,
                overflow: "hidden",
                bgcolor: "#e5e7eb",
                minHeight: 420,
              }}
            >
              <Box
                component="iframe"
                title={`Preview ${name || "template"}`}
                srcDoc={previewHtml}
                sandbox=""
                sx={{
                  display: "block",
                  width: "100%",
                  minHeight: 520,
                  border: 0,
                  bgcolor: "#f3f4f6",
                }}
              />
            </Box>
            <Typography variant="caption" color="text.secondary" display="block" mt={1}>
              Shortcodes are replaced with sample values in this preview only.
            </Typography>
          </Grid>
        </Grid>
      </Box>
    </DashboardCard>
  );
}

export default function EmailTemplatesManager({
  templates,
  siteName,
}: {
  templates: EmailTemplate[];
  siteName: string;
}) {
  return (
    <Stack spacing={3}>
      <TemplateEditor mode="create" siteName={siteName} />
      {templates.map((template) => (
        <TemplateEditor
          key={template.id}
          mode="edit"
          template={template}
          siteName={siteName}
        />
      ))}
    </Stack>
  );
}
