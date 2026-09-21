import { getSiteUrl } from "@/lib/env";

/** Canonical absolute URL for a site path (leading slash). */
export function siteOrigin(): string {
  return getSiteUrl().replace(/\/$/, "");
}

export function absoluteSiteUrl(path: string): string {
  const base = siteOrigin();
  const normalized = path.startsWith("/") ? path : `/${path}`;
  return `${base}${normalized}`;
}
