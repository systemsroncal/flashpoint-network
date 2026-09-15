"use client";

import { Box, Button, Stack, TextField, Typography } from "@mui/material";
import DashboardCard from "@/components/admin/shared/DashboardCard";
import RichTextEditor from "@/components/admin/shared/RichTextEditor";
import { upsertEmailTemplateAction } from "@/lib/admin/actions";

type Template = {
  id: string;
  name: string;
  slug: string;
  subject: string;
  body_html: string;
};

export default function EmailTemplatesManager({
  templates,
}: {
  templates: Template[];
}) {
  return (
    <Stack spacing={3}>
      <DashboardCard title="Add template">
        <Box component="form" action={upsertEmailTemplateAction}>
          <Stack spacing={2}>
            <Stack direction={{ xs: "column", md: "row" }} spacing={2}>
              <TextField name="name" label="Name" required fullWidth />
              <TextField name="slug" label="Slug" fullWidth />
            </Stack>
            <TextField name="subject" label="Subject" required fullWidth />
            <RichTextEditor
              name="body_html"
              label="Body"
              placeholder="Write the email body…"
              minHeight={240}
              initialHtml="<p>Hello {CURRENT_USER_FULLNAME},</p>"
            />
            <Typography variant="caption" color="textSecondary">
              Shortcodes: {"{SITE_NAME}"}, {"{CURRENT_USER_FULLNAME}"}, {"{RESET_LINK}"},{" "}
              {"{CURRENT_YEAR}"}
            </Typography>
            <Button type="submit" variant="contained" sx={{ alignSelf: "flex-start" }}>
              Create template
            </Button>
          </Stack>
        </Box>
      </DashboardCard>

      {templates.map((template) => (
        <DashboardCard
          key={template.id}
          title={template.name}
          subtitle={`slug: ${template.slug}`}
        >
          <Box component="form" action={upsertEmailTemplateAction}>
            <input type="hidden" name="id" value={template.id} />
            <Stack spacing={2}>
              <Stack direction={{ xs: "column", md: "row" }} spacing={2}>
                <TextField
                  name="name"
                  label="Name"
                  required
                  fullWidth
                  defaultValue={template.name}
                />
                <TextField
                  name="slug"
                  label="Slug"
                  fullWidth
                  defaultValue={template.slug}
                />
              </Stack>
              <TextField
                name="subject"
                label="Subject"
                required
                fullWidth
                defaultValue={template.subject}
              />
              <RichTextEditor
                name="body_html"
                label="Body"
                placeholder="Write the email body…"
                minHeight={280}
                initialHtml={template.body_html}
              />
              <Typography variant="caption" color="textSecondary">
                Shortcodes: {"{SITE_NAME}"}, {"{CURRENT_USER_FULLNAME}"}, {"{RESET_LINK}"},{" "}
                {"{CURRENT_YEAR}"}
              </Typography>
              <Button type="submit" variant="outlined" sx={{ alignSelf: "flex-start" }}>
                Save
              </Button>
            </Stack>
          </Box>
        </DashboardCard>
      ))}
    </Stack>
  );
}
