import { sanitizeBannerMaxWidth } from "@/lib/top-banner/max-width";

export type ResponsiveLogoMaxWidth = {
  phone: string;
  tablet: string;
  laptop: string;
  desktop: string;
};

export const DEFAULT_HEADER_LOGO_MAX: ResponsiveLogoMaxWidth = {
  phone: "140px",
  tablet: "160px",
  laptop: "180px",
  desktop: "200px",
};

export const DEFAULT_FOOTER_LOGO_MAX: ResponsiveLogoMaxWidth = {
  phone: "120px",
  tablet: "140px",
  laptop: "160px",
  desktop: "160px",
};

const TOKEN_PATTERN = /^[\w\-:/.[\]%]+$/;

export function sanitizeLogoClassName(raw: unknown): string {
  const v = typeof raw === "string" ? raw.trim() : "";
  if (!v || v.length > 240) return "";
  return v
    .split(/\s+/)
    .filter((token) => TOKEN_PATTERN.test(token))
    .join(" ");
}

function readWidth(
  raw: unknown,
  key: keyof ResponsiveLogoMaxWidth,
  fallback: ResponsiveLogoMaxWidth,
): string {
  if (!raw || typeof raw !== "object" || Array.isArray(raw)) {
    return fallback[key];
  }
  const obj = raw as Record<string, unknown>;
  return sanitizeBannerMaxWidth(obj[key], fallback[key]);
}

export function parseResponsiveLogoMaxWidth(
  raw: unknown,
  defaults: ResponsiveLogoMaxWidth,
): ResponsiveLogoMaxWidth {
  return {
    phone: readWidth(raw, "phone", defaults),
    tablet: readWidth(raw, "tablet", defaults),
    laptop: readWidth(raw, "laptop", defaults),
    desktop: readWidth(raw, "desktop", defaults),
  };
}

export function responsiveLogoMaxWidthStyle(
  widths: ResponsiveLogoMaxWidth,
): Record<string, string> {
  return {
    "--site-logo-max-phone": widths.phone,
    "--site-logo-max-tablet": widths.tablet,
    "--site-logo-max-laptop": widths.laptop,
    "--site-logo-max-desktop": widths.desktop,
  };
}
