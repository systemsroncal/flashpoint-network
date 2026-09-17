import "server-only";

import { createAdminClient } from "@/lib/supabase/admin";

/** site_settings key for third-party HTML / script injection */
export const CUSTOM_HTML_SETTING = "custom_html";

export type CustomHtmlSettings = {
  /** Injected into document head on public pages */
  head: string;
  /** Injected right after body opens on public pages */
  body: string;
  /** Injected before body closes (site footer area) on public pages */
  footer: string;
};

const DEFAULTS: CustomHtmlSettings = {
  head: "",
  body: "",
  footer: "",
};

function asObject(value: unknown): Record<string, unknown> {
  if (value && typeof value === "object" && !Array.isArray(value)) {
    return value as Record<string, unknown>;
  }
  if (typeof value === "string") {
    try {
      const parsed = JSON.parse(value);
      if (parsed && typeof parsed === "object" && !Array.isArray(parsed)) {
        return parsed as Record<string, unknown>;
      }
    } catch {
      /* ignore */
    }
  }
  return {};
}

function asHtmlString(value: unknown): string {
  return typeof value === "string" ? value : "";
}

/**
 * Trusted admin-authored HTML for public layouts.
 * Only admins may edit; contents are rendered with script execution enabled.
 */
export async function getCustomHtmlSettings(): Promise<CustomHtmlSettings> {
  const admin = createAdminClient();
  if (!admin) return DEFAULTS;
  const { data } = await admin
    .from("site_settings")
    .select("value")
    .eq("key", CUSTOM_HTML_SETTING)
    .maybeSingle();
  const raw = asObject(data?.value);
  return {
    head: asHtmlString(raw.head),
    body: asHtmlString(raw.body),
    footer: asHtmlString(raw.footer),
  };
}
