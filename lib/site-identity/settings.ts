import "server-only";

import { cache } from "react";
import { getSiteName as getSiteNameFromEnv } from "@/lib/env";
import { createAdminClient } from "@/lib/supabase/admin";
import { resolveMediaUrl } from "@/lib/media/public-url";
import {
  DEFAULT_HEADER_LOGO_URL,
  SITE_IDENTITY_SETTING,
  type SiteIdentity,
} from "@/lib/site-identity/constants";
import {
  DEFAULT_FOOTER_LOGO_MAX,
  DEFAULT_HEADER_LOGO_MAX,
  parseResponsiveLogoMaxWidth,
  sanitizeLogoClassName,
} from "@/lib/site-identity/logo-layout";

export type { SiteIdentity };

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

function strOrNull(raw: unknown): string | null {
  if (typeof raw !== "string") return null;
  const t = raw.trim();
  return t || null;
}

function normalizeIdentity(raw: Record<string, unknown>): SiteIdentity {
  const siteName =
    strOrNull(raw.site_name) ??
    strOrNull(raw.siteName) ??
    getSiteNameFromEnv();

  const headerRaw =
    strOrNull(raw.header_logo_url) ??
    strOrNull(raw.headerLogoUrl) ??
    DEFAULT_HEADER_LOGO_URL;

  const headerLogoUrl =
    resolveMediaUrl(headerRaw) ?? DEFAULT_HEADER_LOGO_URL;

  const footerRaw =
    strOrNull(raw.footer_logo_url) ?? strOrNull(raw.footerLogoUrl);
  const footerLogoUrl = footerRaw ? resolveMediaUrl(footerRaw) : null;

  const authRaw =
    strOrNull(raw.auth_logo_url) ?? strOrNull(raw.authLogoUrl);
  const authLogoUrl = authRaw ? resolveMediaUrl(authRaw) : null;

  const faviconRaw = strOrNull(raw.favicon_url) ?? strOrNull(raw.faviconUrl);
  const faviconUrl = faviconRaw ? resolveMediaUrl(faviconRaw) : null;

  const featuredRaw =
    strOrNull(raw.default_featured_image_url) ??
    strOrNull(raw.defaultFeaturedImageUrl);
  const defaultFeaturedImageUrl = featuredRaw
    ? resolveMediaUrl(featuredRaw)
    : null;

  return {
    siteName: siteName.replace(/Flash\s+Point/gi, "FlashPoint"),
    headerLogoUrl,
    footerLogoUrl,
    headerLogoMaxWidth: parseResponsiveLogoMaxWidth(
      raw.header_logo_max_width ?? raw.headerLogoMaxWidth,
      DEFAULT_HEADER_LOGO_MAX,
    ),
    footerLogoMaxWidth: parseResponsiveLogoMaxWidth(
      raw.footer_logo_max_width ?? raw.footerLogoMaxWidth,
      DEFAULT_FOOTER_LOGO_MAX,
    ),
    headerLogoClassName: sanitizeLogoClassName(
      raw.header_logo_class_name ?? raw.headerLogoClassName,
    ),
    footerLogoClassName: sanitizeLogoClassName(
      raw.footer_logo_class_name ?? raw.footerLogoClassName,
    ),
    authLogoUrl,
    faviconUrl,
    defaultFeaturedImageUrl,
  };
}

const FALLBACK: SiteIdentity = normalizeIdentity({});

export const getSiteIdentity = cache(async (): Promise<SiteIdentity> => {
  const admin = createAdminClient();
  if (!admin) return FALLBACK;

  const { data } = await admin
    .from("site_settings")
    .select("value")
    .eq("key", SITE_IDENTITY_SETTING)
    .maybeSingle();

  if (!data?.value) return FALLBACK;
  return normalizeIdentity(asObject(data.value));
});
