"use client";

import { Box, Button, Stack, TextField, Typography } from "@mui/material";
import DashboardCard from "@/components/admin/shared/DashboardCard";
import { upsertSiteSettingAction } from "@/lib/admin/actions";

type Setting = {
  key: string;
  value: unknown;
  updated_at?: string;
};

export default function SettingsManager({ settings }: { settings: Setting[] }) {
  return (
    <Stack spacing={3}>
      <DashboardCard title="Add / update setting">
        <Box component="form" action={upsertSiteSettingAction}>
          <Stack spacing={2}>
            <TextField name="key" label="Key" required fullWidth placeholder="site_name" />
            <TextField
              name="value"
              label="Value (JSON or plain text)"
              required
              fullWidth
              multiline
              minRows={3}
              placeholder='"Flash Point Network"'
            />
            <Button type="submit" variant="contained" sx={{ alignSelf: "flex-start" }}>
              Save setting
            </Button>
          </Stack>
        </Box>
      </DashboardCard>

      {settings.map((setting) => (
        <DashboardCard key={setting.key} title={setting.key}>
          <Box component="form" action={upsertSiteSettingAction}>
            <input type="hidden" name="key" value={setting.key} />
            <Stack spacing={2}>
              <TextField
                name="value"
                label="Value"
                fullWidth
                multiline
                minRows={3}
                defaultValue={
                  typeof setting.value === "string"
                    ? setting.value
                    : JSON.stringify(setting.value, null, 2)
                }
              />
              <Typography variant="caption" color="textSecondary">
                Updated: {setting.updated_at ?? "—"}
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
