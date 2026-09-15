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
import {
  saveAdSenseSettingsAction,
  savePaywallSettingsAction,
  upsertSiteSettingAction,
} from "@/lib/admin/actions";
import type { AiProviderStatus } from "@/lib/ai/catalog";
import { AI_KEYS_SETTING } from "@/lib/ai/catalog";

type Setting = {
  key: string;
  value: unknown;
  updated_at?: string;
};

function asObject(value: unknown): Record<string, unknown> {
  if (value && typeof value === "object" && !Array.isArray(value)) {
    return value as Record<string, unknown>;
  }
  return {};
}

export default function SettingsManager({
  settings,
  aiProviders,
}: {
  settings: Setting[];
  aiProviders: AiProviderStatus[];
}) {
  const byKey = useMemo(() => {
    const map = new Map<string, Setting>();
    for (const s of settings) map.set(s.key, s);
    return map;
  }, [settings]);

  const paywall = asObject(byKey.get("paywall")?.value);
  const adsense = asObject(byKey.get("adsense")?.value);
  const adsTxtValue = byKey.get("ads_txt")?.value;
  const adsTxt =
    typeof adsTxtValue === "string"
      ? adsTxtValue
      : typeof adsense.ads_txt === "string"
        ? String(adsense.ads_txt)
        : "google.com, pub-0000000000000000, DIRECT, f08c47fec0942fa0";

  const hiddenKeys = new Set(["paywall", "adsense", "ads_txt", AI_KEYS_SETTING]);
  const visibleSettings = settings.filter((s) => !hiddenKeys.has(s.key));

  return (
    <Stack spacing={3}>
      <DashboardCard
        title="Paywall limits"
        subtitle="Soft meter for anonymous readers. Staff and signed-in subscribers bypass."
      >
        <Box component="form" action={savePaywallSettingsAction}>
          <Stack spacing={2}>
            <FormControlLabel
              control={
                <Checkbox
                  name="enabled"
                  defaultChecked={
                    typeof paywall.enabled === "boolean" ? paywall.enabled : true
                  }
                />
              }
              label="Enable soft paywall"
            />
            <TextField
              name="free_article_limit"
              label="Free articles before modal"
              type="number"
              inputProps={{ min: 0, max: 50 }}
              defaultValue={
                typeof paywall.free_article_limit === "number"
                  ? paywall.free_article_limit
                  : 3
              }
              sx={{ maxWidth: 280 }}
            />
            <TextField
              name="modal_title"
              label="Modal title"
              fullWidth
              defaultValue={
                typeof paywall.modal_title === "string"
                  ? paywall.modal_title
                  : "Don't stop here"
              }
            />
            <TextField
              name="modal_body"
              label="Modal body"
              fullWidth
              multiline
              minRows={2}
              defaultValue={
                typeof paywall.modal_body === "string"
                  ? paywall.modal_body
                  : "Create your FPN All Access account for free to keep reading and join the conversation."
              }
            />
            <Button type="submit" variant="contained" sx={{ alignSelf: "flex-start" }}>
              Save paywall
            </Button>
          </Stack>
        </Box>
      </DashboardCard>

      <DashboardCard
        title="AdSense & ads.txt"
        subtitle="Injects the AdSense loader when enabled. Serves /ads.txt from the field below."
      >
        <Box component="form" action={saveAdSenseSettingsAction}>
          <Stack spacing={2}>
            <FormControlLabel
              control={
                <Checkbox
                  name="enabled"
                  defaultChecked={
                    typeof adsense.enabled === "boolean" ? adsense.enabled : false
                  }
                />
              }
              label="Enable AdSense script"
            />
            <TextField
              name="client_id"
              label="AdSense client ID (ca-pub-…)"
              fullWidth
              defaultValue={
                typeof adsense.client_id === "string" ? adsense.client_id : ""
              }
              placeholder="ca-pub-xxxxxxxxxxxxxxxx"
            />
            <TextField
              name="ads_txt"
              label="ads.txt contents"
              fullWidth
              multiline
              minRows={3}
              defaultValue={adsTxt}
              helperText="Published at /ads.txt"
            />
            <Button type="submit" variant="contained" sx={{ alignSelf: "flex-start" }}>
              Save AdSense
            </Button>
          </Stack>
        </Box>
      </DashboardCard>

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
