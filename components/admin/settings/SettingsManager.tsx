"use client";

import { useMemo, useState } from "react";
import {
  Alert,
  Box,
  Button,
  Checkbox,
  FormControlLabel,
  MenuItem,
  Stack,
  Tab,
  Tabs,
  TextField,
  Typography,
} from "@mui/material";
import DashboardCard from "@/components/admin/shared/DashboardCard";
import ImageUploadField from "@/components/admin/shared/ImageUploadField";
import SiteIdentityPanel from "@/components/admin/settings/SiteIdentityPanel";
import type { SiteIdentity } from "@/lib/site-identity/constants";
import { saveAiProviderKeysAction } from "@/lib/admin/ai-actions";
import {
  saveAdSenseSettingsAction,
  saveCustomHtmlSettingsAction,
  saveMaintenanceSettingsAction,
  saveTopHeaderBannerSettingsAction,
  savePaywallSettingsAction,
  saveProgramModulesAction,
  saveTimezoneSettingsAction,
  upsertSiteSettingAction,
} from "@/lib/admin/actions";
import type { AiProviderStatus } from "@/lib/ai/catalog";
import { AI_KEYS_SETTING } from "@/lib/ai/catalog";
import { CUSTOM_HTML_SETTING } from "@/lib/custom-html/constants";
import {
  DEFAULT_SITE_TIMEZONE,
  normalizeSiteTimezone,
  SITE_TIMEZONE_OPTIONS,
  SITE_TIMEZONE_SETTING,
} from "@/lib/timezone/constants";
import { SITE_IDENTITY_SETTING } from "@/lib/site-identity/constants";
import { TOP_HEADER_BANNER_SETTING } from "@/lib/top-banner/constants";

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
  identity,
  canManageProgramModules = false,
  canEditCustomHtml = false,
}: {
  settings: Setting[];
  aiProviders: AiProviderStatus[];
  identity: SiteIdentity;
  canManageProgramModules?: boolean;
  /** Admin / superadmin only — third-party HTML executes on public pages */
  canEditCustomHtml?: boolean;
}) {
  const [tab, setTab] = useState("identity");
  const byKey = useMemo(() => {
    const map = new Map<string, Setting>();
    for (const s of settings) map.set(s.key, s);
    return map;
  }, [settings]);

  const paywall = asObject(byKey.get("paywall")?.value);
  const adsense = asObject(byKey.get("adsense")?.value);
  const maintenance = asObject(byKey.get("maintenance")?.value);
  const topHeaderBanner = asObject(byKey.get(TOP_HEADER_BANNER_SETTING)?.value);
  const programModules = asObject(byKey.get("program_modules")?.value);
  const timezone = normalizeSiteTimezone(byKey.get(SITE_TIMEZONE_SETTING)?.value);
  const customHtml = asObject(byKey.get(CUSTOM_HTML_SETTING)?.value);
  const adsTxtValue = byKey.get("ads_txt")?.value;
  const adsTxt =
    typeof adsTxtValue === "string"
      ? adsTxtValue
      : typeof adsense.ads_txt === "string"
        ? String(adsense.ads_txt)
        : "google.com, pub-0000000000000000, DIRECT, f08c47fec0942fa0";

  const hiddenKeys = new Set([
    "paywall",
    "adsense",
    "ads_txt",
    "maintenance",
    "program_modules",
    SITE_TIMEZONE_SETTING,
    CUSTOM_HTML_SETTING,
    AI_KEYS_SETTING,
    SITE_IDENTITY_SETTING,
    TOP_HEADER_BANNER_SETTING,
  ]);
  const visibleSettings = settings.filter((s) => !hiddenKeys.has(s.key));

  return (
    <Stack spacing={3}>
      <Tabs
        value={tab}
        onChange={(_, value: string) => setTab(value)}
        variant="scrollable"
        scrollButtons="auto"
        sx={{ borderBottom: 1, borderColor: "divider" }}
      >
        <Tab label="Site identity" value="identity" />
        <Tab label="General" value="general" />
        <Tab label="Monetization" value="monetization" />
        <Tab label="Integrations" value="integrations" />
        <Tab label="Advanced" value="advanced" />
      </Tabs>

      {tab === "identity" ? (
        <DashboardCard
          title="Site identity"
          subtitle="Logo, favicon, site name, and default featured image for the public site."
        >
          <SiteIdentityPanel identity={identity} />
        </DashboardCard>
      ) : null}

      {tab === "general" ? (
        <>
      <DashboardCard
        title="Top header banner"
        subtitle="Promotional strip above the site header (desktop + mobile images). Visitors can close it for 24 hours."
      >
        <Box component="form" action={saveTopHeaderBannerSettingsAction}>
          <Stack spacing={2.5}>
            <FormControlLabel
              control={
                <Checkbox
                  name="active"
                  defaultChecked={
                    typeof topHeaderBanner.active === "boolean"
                      ? topHeaderBanner.active
                      : false
                  }
                />
              }
              label="Active (show on public site)"
            />
            <TextField
              name="href"
              label="Link URL"
              fullWidth
              placeholder="https://fptn.com/..."
              helperText="Optional. Entire banner is clickable when set."
              defaultValue={
                typeof topHeaderBanner.href === "string" ? topHeaderBanner.href : ""
              }
            />
            <FormControlLabel
              control={
                <Checkbox
                  name="open_in_new_tab"
                  defaultChecked={
                    typeof topHeaderBanner.open_in_new_tab === "boolean"
                      ? topHeaderBanner.open_in_new_tab
                      : true
                  }
                />
              }
              label="Open link in a new tab"
            />
            <ImageUploadField
              name="desktop_image_url"
              label="Desktop banner (≥768px)"
              defaultValue={
                typeof topHeaderBanner.desktop_image_url === "string"
                  ? topHeaderBanner.desktop_image_url
                  : ""
              }
            />
            <TextField
              name="desktop_max_width"
              label="Desktop max-width"
              fullWidth
              placeholder="900px"
              helperText="Centers the banner. Examples: 700px, 90vw, 100%"
              defaultValue={
                typeof topHeaderBanner.desktop_max_width === "string"
                  ? topHeaderBanner.desktop_max_width
                  : "900px"
              }
            />
            <ImageUploadField
              name="mobile_image_url"
              label="Mobile banner (≤767px)"
              defaultValue={
                typeof topHeaderBanner.mobile_image_url === "string"
                  ? topHeaderBanner.mobile_image_url
                  : ""
              }
            />
            <TextField
              name="mobile_max_width"
              label="Mobile max-width"
              fullWidth
              placeholder="100%"
              helperText="Centers the banner on small screens. Examples: 400px, 100vw, 100%"
              defaultValue={
                typeof topHeaderBanner.mobile_max_width === "string"
                  ? topHeaderBanner.mobile_max_width
                  : "100%"
              }
            />
            <Button type="submit" variant="contained" sx={{ alignSelf: "flex-start" }}>
              Save top banner
            </Button>
          </Stack>
        </Box>
      </DashboardCard>

      <DashboardCard
        title="System timezone"
        subtitle="Used for dates on the public site and in admin (publish times, tickers, datetime fields). Stored as UTC in the database."
      >
        <Box component="form" action={saveTimezoneSettingsAction}>
          <Stack spacing={2}>
            <TextField
              select
              name="timezone"
              label="Timezone"
              fullWidth
              defaultValue={timezone || DEFAULT_SITE_TIMEZONE}
              helperText="Default: Chicago (Central Time). Wall times in forms are interpreted in this zone."
            >
              {SITE_TIMEZONE_OPTIONS.map((opt) => (
                <MenuItem key={opt.value} value={opt.value}>
                  {opt.label}
                </MenuItem>
              ))}
            </TextField>
            <Button type="submit" variant="contained" sx={{ alignSelf: "flex-start" }}>
              Save timezone
            </Button>
          </Stack>
        </Box>
      </DashboardCard>

      <DashboardCard
        title="Maintenance mode"
        subtitle="When enabled, everyone sees Coming Soon on the public site except logged-in admin/superadmin (amber banner). Editors and other roles do not bypass. Auth and /admin stay reachable."
      >
        <Box component="form" action={saveMaintenanceSettingsAction}>
          <Stack spacing={2}>
            <FormControlLabel
              control={
                <Checkbox
                  name="enabled"
                  defaultChecked={
                    typeof maintenance.enabled === "boolean"
                      ? maintenance.enabled
                      : false
                  }
                />
              }
              label="Enable maintenance mode (Coming Soon)"
            />
            <TextField
              name="message"
              label="Optional message override"
              fullWidth
              multiline
              minRows={3}
              helperText="Leave blank to use the Figma Coming Soon copy."
              defaultValue={
                typeof maintenance.message === "string"
                  ? maintenance.message
                  : ""
              }
            />
            <Button type="submit" variant="contained" sx={{ alignSelf: "flex-start" }}>
              Save maintenance
            </Button>
          </Stack>
        </Box>
      </DashboardCard>

      {canManageProgramModules ? (
      <DashboardCard
        title="Program modules"
        subtitle="Temporarily hide Classic and Schedule from the public site and admin. Network Programs is unchanged. No role bypass while a module is off."
      >
        <Box component="form" action={saveProgramModulesAction}>
          <Stack spacing={2}>
            <FormControlLabel
              control={
                <Checkbox
                  name="classic"
                  defaultChecked={
                    typeof programModules.classic === "boolean"
                      ? programModules.classic
                      : false
                  }
                />
              }
              label="Enable Classic Programs (public + admin)"
            />
            <FormControlLabel
              control={
                <Checkbox
                  name="schedule"
                  defaultChecked={
                    typeof programModules.schedule === "boolean"
                      ? programModules.schedule
                      : false
                  }
                />
              }
              label="Enable Schedule Programs (public + admin)"
            />
            <Button type="submit" variant="contained" sx={{ alignSelf: "flex-start" }}>
              Save program modules
            </Button>
          </Stack>
        </Box>
      </DashboardCard>
      ) : null}
        </>
      ) : null}

      {tab === "monetization" ? (
        <>
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
        </>
      ) : null}

      {tab === "integrations" ? (
        <>
      {canEditCustomHtml ? (
        <DashboardCard
          title="Custom HTML & scripts"
          subtitle="Trusted admin-only snippets for Google Analytics, Meta Pixel, Tag Manager, and similar tags. Paste full HTML (including script tags). These run on every public page — never paste untrusted code."
        >
          <Box component="form" action={saveCustomHtmlSettingsAction}>
            <Stack spacing={2}>
              <Alert severity="warning">
                Only admins can edit these fields. Contents are injected into the
                public layout and scripts execute in the visitor&apos;s browser.
              </Alert>
              <TextField
                name="head"
                label="Head"
                fullWidth
                multiline
                minRows={5}
                spellCheck={false}
                inputProps={{ style: { fontFamily: "ui-monospace, monospace", fontSize: 13 } }}
                defaultValue={
                  typeof customHtml.head === "string" ? customHtml.head : ""
                }
                helperText="Injected into the document head on public pages (meta tags, analytics loaders)."
                placeholder={'<!-- Example -->\n<script async src="https://www.googletagmanager.com/gtag/js?id=G-XXXXXXXX"></script>'}
              />
              <TextField
                name="body"
                label="Body"
                fullWidth
                multiline
                minRows={4}
                spellCheck={false}
                inputProps={{ style: { fontFamily: "ui-monospace, monospace", fontSize: 13 } }}
                defaultValue={
                  typeof customHtml.body === "string" ? customHtml.body : ""
                }
                helperText="Injected at the start of the body (right after body opens)."
                placeholder={"<!-- noscript or early body tags -->"}
              />
              <TextField
                name="footer"
                label="Footer"
                fullWidth
                multiline
                minRows={4}
                spellCheck={false}
                inputProps={{ style: { fontFamily: "ui-monospace, monospace", fontSize: 13 } }}
                defaultValue={
                  typeof customHtml.footer === "string" ? customHtml.footer : ""
                }
                helperText="Injected before the body closes, in the site footer area."
                placeholder={"<!-- late-loading tags -->"}
              />
              <Button type="submit" variant="contained" sx={{ alignSelf: "flex-start" }}>
                Save custom HTML
              </Button>
            </Stack>
          </Box>
        </DashboardCard>
      ) : (
        <Alert severity="info">
          Only admins can edit Custom HTML. Ask an admin if you need analytics or
          pixel snippets added.
        </Alert>
      )}
        </>
      ) : null}

      {tab === "advanced" ? (
        <>
      <DashboardCard
        title="AI provider API keys"
        subtitle="Used by the News AI writing assistant. Keys stay on the server — never sent to the public site."
      >
        <Box component="form" action={saveAiProviderKeysAction}>
          <Stack spacing={2}>
            <Alert severity="info">
              Leave a field blank to keep the current key. Check “Clear” to remove
              a saved key. Env overrides (any alias works for NVIDIA):{" "}
              <code>AI_NVIDIA_API_KEY</code>, <code>NVIDIA_API_KEY</code>,{" "}
              <code>NGC_API_KEY</code>. Also{" "}
              <code>AI_GOOGLE_API_KEY</code>, <code>AI_OPENAI_API_KEY</code>,{" "}
              <code>AI_XAI_API_KEY</code>, <code>AI_ANTHROPIC_API_KEY</code>,{" "}
              <code>AI_PERPLEXITY_API_KEY</code>. After editing env on the VPS,
              run <code>pm2 restart fptn --update-env</code>.
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
        </>
      ) : null}
    </Stack>
  );
}
