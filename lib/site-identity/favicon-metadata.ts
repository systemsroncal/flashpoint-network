import type { Metadata } from "next";
import type { SiteIdentity } from "@/lib/site-identity/constants";

export function hasConfiguredFavicon(identity: SiteIdentity): boolean {
  return Boolean(identity.faviconUrl?.trim());
}

/**
 * Tab icons are served by app/icon.tsx and app/apple-icon.tsx (dynamic, from settings).
 * Keep metadata minimal so Next does not inject a second default /favicon.ico.
 */
export function buildSiteFaviconMetadata(
  _identity: SiteIdentity,
): Metadata["icons"] | undefined {
  return undefined;
}
