"use client";

import { useMemo } from "react";
import {
  Alert,
  Box,
  Button,
  Checkbox,
  FormControlLabel,
  Stack,
  TextField,
  Typography,
} from "@mui/material";
import DashboardCard from "@/components/admin/shared/DashboardCard";
import { saveAiProviderKeysAction } from "@/lib/admin/ai-actions";
import { upsertSiteSettingAction } from "@/lib/admin/actions";
import type { AiProviderStatus } from "@/lib/ai/catalog";
import { AI_KEYS_SETTING } from "@/lib/ai/catalog";

type Setting = {
  key: string;
  value: unknown;
  updated_at?: string;
};

export default function SettingsManager({
  settings,
  aiProviders,
}: {
  settings: Setting[];
  aiProviders: AiProviderStatus[];
}) {
  const visibleSettings = useMemo(
    () => settings.filter((s) => s.key !== AI_KEYS_SETTING),
    [settings],
  );

  return (
    <Stack spacing={3}>
      <DashboardCard
        title="AI provider API keys"
        subtitle="Used by the News AI writing assistant. Keys stay on the server — never sent to the public site."
      >
        <Box component="form" action={saveAiProviderKeysAction}>
          <Stack spacing={2}>
            <Alert severity="info">
              Leave a field blank to keep the current key. Check “Clear” to remove
              a saved key. Optional env overrides:{" "}
              <code>AI_GOOGLE_API_KEY</code>, <code>AI_OPENAI_API_KEY</code>,{" "}
              <code>AI_XAI_API_KEY</code>, <code>AI_ANTHROPIC_API_KEY</code>,{" "}
              <code>AI_NVIDIA_API_KEY</code>, <code>AI_PERPLEXITY_API_KEY</code>.
            </Alert>
            {aiProviders.map((p) => (
              <Box
                key={p.id}
                sx={{
                  p: 2,
                  border: "1px solid",
                  borderColor: "divider",
                  borderRadius: 1,
                }}
              >
                <Stack
                  direction={{ xs: "column", sm: "row" }}
                  spacing={2}
                  alignItems={{ sm: "center" }}
                >
                  <Box flex={1}>
                    <Typography fontWeight={600}>{p.label}</Typography>
                    <Typography variant="caption" color="text.secondary">
                      {p.configured
                        ? `Configured ${p.hint ?? ""}`
                        : "Not configured"}
                    </Typography>
                  </Box>
                  <TextField
                    name={`key_${p.id}`}
                    label={p.settingLabel}
                    type="password"
                    fullWidth
                    autoComplete="off"
                    placeholder={
                      p.configured ? "•••••••• (leave blank to keep)" : "Paste API key"
                    }
                    sx={{ flex: 2 }}
                  />
                  <FormControlLabel
                    control={<Checkbox name={`clear_${p.id}`} />}
                    label="Clear"
                  />
                </Stack>
              </Box>
            ))}
            <Button type="submit" variant="contained" sx={{ alignSelf: "flex-start" }}>
              Save AI keys
            </Button>
          </Stack>
        </Box>
      </DashboardCard>

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

      {visibleSettings.map((setting) => (
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
