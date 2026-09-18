import type { ResponsiveLogoMaxWidth } from "@/lib/site-identity/logo-layout";

export const SITE_IDENTITY_SETTING = "site_identity";

/** Default header / mobile wordmark when nothing is saved yet. */
export const DEFAULT_HEADER_LOGO_URL =
  "https://fptn.com/uploads/2026-09-17/35285d99-e36c-479b-99fa-a899753c63da.webp";

export const DEFAULT_FOOTER_MARK_URL = "/brand/fpn-logo-mark.svg";
export const DEFAULT_MOBILE_WORDMARK_URL = "/brand/fpn-logo-wordmark.png";

export type SiteIdentity = {
  siteName: string;
  headerLogoUrl: string;
  footerLogoUrl: string | null;
  headerLogoMaxWidth: ResponsiveLogoMaxWidth;
  footerLogoMaxWidth: ResponsiveLogoMaxWidth;
  headerLogoClassName: string;
  footerLogoClassName: string;
  /** Login, register, forgot/update password — empty = header logo in badge lockup */
  authLogoUrl: string | null;
  faviconUrl: string | null;
  defaultFeaturedImageUrl: string | null;
};
