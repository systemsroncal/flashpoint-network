import "server-only";

import { createAdminClient } from "@/lib/supabase/admin";
import { resolveMediaUrl } from "@/lib/media/public-url";
import {
  TOP_HEADER_BANNER_SETTING,
  type TopHeaderBannerSettings,
} from "@/lib/top-banner/constants";

export type { TopHeaderBannerSettings };

const DEFAULTS: TopHeaderBannerSettings = {
  active: false,
  href: "",
  desktopImageUrl: null,
  mobileImageUrl: null,
  openInNewTab: true,
};

function asObject(value: unknown): Record<string, unknown> {
  if (value && typeof value === "object" && !Array.isArray(value)) {
    return value as Record<string, unknown>;
  }
  if (typeof value === "string") {
    try {
      const parsed = JSON.parse(value);
      if (parsed && typeof parsed === "object") {
        return parsed as Record<string, unknown>;
      }
    } catch {
      /* ignore */
    }
  }
  return {};
}

function pickUrl(raw: unknown): string | null {
  const s = typeof raw === "string" ? raw.trim() : "";
  return s ? resolveMediaUrl(s) : null;
}

export async function getTopHeaderBannerSettings(): Promise<TopHeaderBannerSettings> {
  const admin = createAdminClient();
  if (!admin) return DEFAULTS;
  const { data } = await admin
    .from("site_settings")
    .select("value")
    .eq("key", TOP_HEADER_BANNER_SETTING)
    .maybeSingle();
  const raw = asObject(data?.value);
  const desktop = pickUrl(raw.desktop_image_url);
  const mobile = pickUrl(raw.mobile_image_url);
  return {
    active: typeof raw.active === "boolean" ? raw.active : DEFAULTS.active,
    href: typeof raw.href === "string" ? raw.href.trim() : "",
    desktopImageUrl: desktop,
    mobileImageUrl: mobile,
    openInNewTab:
      typeof raw.open_in_new_tab === "boolean"
        ? raw.open_in_new_tab
        : DEFAULTS.openInNewTab,
  };
}

export function topHeaderBannerIsRenderable(
  settings: TopHeaderBannerSettings,
): boolean {
  return settings.active && Boolean(settings.desktopImageUrl || settings.mobileImageUrl);
}
