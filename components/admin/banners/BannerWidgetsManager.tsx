"use client";

import { useState } from "react";
import {
  Alert,
  Box,
  Button,
  Checkbox,
  FormControlLabel,
  Stack,
  Switch,
  TextField,
  Typography,
} from "@mui/material";
import DashboardCard from "@/components/admin/shared/DashboardCard";
import ImageUploadField from "@/components/admin/shared/ImageUploadField";
import { upsertBannerWidgetAction } from "@/lib/admin/actions";
import type { BannerWidget } from "@/lib/banners/slots";

type Props = {
  widgets: BannerWidget[];
  flash?: { saved?: boolean; error?: string | null };
};

export default function BannerWidgetsManager({ widgets, flash }: Props) {
  return (
    <Stack spacing={3}>
      {flash?.error ? <Alert severity="error">{flash.error}</Alert> : null}
      {flash?.saved ? (
        <Alert severity="success">Banner saved.</Alert>
      ) : null}

      <Typography variant="body2" color="text.secondary">
        Each slot needs at least one image (Desktop ≥768px and/or Responsive ≤767px).
        If only one is set, it is used at every breakpoint. Uploads go to{" "}
        <code>public/uploads</code>.
      </Typography>

      {widgets.map((widget) => (
        <BannerWidgetEditor key={widget.id} widget={widget} />
      ))}

      {widgets.length === 0 ? (
        <Typography color="text.secondary">
          No banner slots yet. Run the banner_widgets migration / seed.
        </Typography>
      ) : null}
    </Stack>
  );
}

function BannerWidgetEditor({ widget }: { widget: BannerWidget }) {
  const [openInNewTab, setOpenInNewTab] = useState(widget.open_in_new_tab !== false);
  const [enabled, setEnabled] = useState(widget.enabled !== false);

  return (
    <DashboardCard title={widget.label} subtitle={`Slot: ${widget.slot}`}>
      <Box component="form" action={upsertBannerWidgetAction}>
        <input type="hidden" name="id" value={widget.id} />
        <input type="hidden" name="open_in_new_tab" value={openInNewTab ? "true" : "false"} />
        <input type="hidden" name="enabled" value={enabled ? "true" : "false"} />
        <Stack spacing={2.5}>
          <TextField
            name="label"
            label="Label"
            fullWidth
            defaultValue={widget.label}
            required
          />
          <TextField
            name="href"
            label="URL"
            fullWidth
            defaultValue={widget.href}
            placeholder="https://"
            helperText="Destination when the banner is clicked."
          />

          <Stack direction={{ xs: "column", md: "row" }} spacing={3}>
            <Box flex={1}>
              <ImageUploadField
                name="desktop_image_url"
                label="Desktop banner image (≥768px)"
                defaultValue={widget.desktop_image_url}
              />
            </Box>
            <Box flex={1}>
              <ImageUploadField
                name="mobile_image_url"
                label="Responsive banner image (≤767px)"
                defaultValue={widget.mobile_image_url}
              />
            </Box>
          </Stack>

          <FormControlLabel
            control={
              <Checkbox
                checked={openInNewTab}
                onChange={(e) => setOpenInNewTab(e.target.checked)}
              />
            }
            label="Open in new tab"
          />

          <FormControlLabel
            control={
              <Switch
                checked={enabled}
                onChange={(e) => setEnabled(e.target.checked)}
                color="primary"
              />
            }
            label="Enabled"
          />

          <Button type="submit" variant="contained" sx={{ alignSelf: "flex-start" }}>
            Save banner
          </Button>
        </Stack>
      </Box>
    </DashboardCard>
  );
}
