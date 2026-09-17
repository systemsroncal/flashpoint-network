import { getSiteUrl, normalizePublicUrl } from "@/lib/env";

/**
 * Turn a stored media path into a browser-safe URL.
 * - Absolute http(s) / protocol-relative → normalized origin path or left as-is
 * - `uploads/...` without leading slash → `/uploads/...`
 * - `/uploads/...`, `/media/...`, `/brand/...` → kept relative (same-origin OK)
 * - When `absolute` is true, prefix with SITE_URL / NEXT_PUBLIC_SITE_URL
 */
export function resolveMediaUrl(
  raw: string | null | undefined,
  options?: { absolute?: boolean },
): string | null {
  if (raw == null) return null;
  let value = String(raw).trim();
  if (!value) return null;

  // Protocol-relative
  if (value.startsWith("//")) {
    value = `https:${value}`;
  }

  // Already absolute
  if (/^https?:\/\//i.test(value)) {
    if (!options?.absolute) return value;
    try {
      const u = new URL(value);
      // Re-base local upload paths onto canonical site origin
      if (
        u.pathname.startsWith("/uploads/") ||
        u.pathname.startsWith("/media/")
      ) {
        return `${siteOrigin()}${u.pathname}${u.search}`;
      }
      return value;
    } catch {
      return value;
    }
  }

  // Missing leading slash: "uploads/2026-…" or "media/…"
  if (/^(uploads|media|brand)\//i.test(value)) {
    value = `/${value}`;
  }

  // Root-relative
  if (value.startsWith("/")) {
    return options?.absolute ? `${siteOrigin()}${value}` : value;
  }

  // Bare filename → treat as upload under /uploads/
  if (!value.includes("://") && !value.includes("/")) {
    const path = `/uploads/${value}`;
    return options?.absolute ? `${siteOrigin()}${path}` : path;
  }

  return value;
}

function siteOrigin(): string {
  return normalizePublicUrl(getSiteUrl(), "https://fptn.com").replace(/\/$/, "");
}

/** Always absolute public URL (OG, JSON-LD, emails, rich HTML). */
export function absoluteMediaUrl(
  raw: string | null | undefined,
): string | null {
  return resolveMediaUrl(raw, { absolute: true });
}

/**
 * Rewrite `src` / `srcset` / `poster` / `href` on media-like tags inside HTML
 * so relative upload paths become absolute site URLs.
 */
export function rewriteHtmlMediaUrls(html: string | null | undefined): string {
  const raw = html ?? "";
  if (!raw.trim()) return "";

  return raw.replace(
    /\b(src|poster|href|data-src)=["']([^"']+)["']/gi,
    (full, attr: string, url: string) => {
      const lower = url.trim().toLowerCase();
      // Skip anchors, mailto, data URIs, blobs
      if (
        lower.startsWith("#") ||
        lower.startsWith("mailto:") ||
        lower.startsWith("tel:") ||
        lower.startsWith("data:") ||
        lower.startsWith("blob:") ||
        lower.startsWith("javascript:")
      ) {
        return full;
      }
      // Only rewrite local / relative media paths (not external https news links on <a href>)
      const isMediaPath =
        /^(https?:)?\/\/|^\/|^uploads\/|^media\/|^brand\//i.test(url.trim()) ||
        /\.(webp|png|jpe?g|gif|avif|svg|mp4|webm)(\?|#|$)/i.test(url);
      if (attr.toLowerCase() === "href" && !isMediaPath) {
        return full;
      }
      if (
        attr.toLowerCase() === "href" &&
        /^https?:\/\//i.test(url.trim()) &&
        !/\/uploads\//i.test(url) &&
        !/\/media\//i.test(url)
      ) {
        return full;
      }

      const next = absoluteMediaUrl(url);
      if (!next || next === url) return full;
      return `${attr}="${next.replace(/"/g, "&quot;")}"`;
    },
  );
}

/** Normalize a URL before saving to the DB (prefer root-relative /uploads/…). */
export function normalizeStoredMediaUrl(
  raw: string | null | undefined,
): string | null {
  if (raw == null) return null;
  const value = String(raw).trim();
  if (!value) return null;

  try {
    if (/^https?:\/\//i.test(value) || value.startsWith("//")) {
      const absolute = value.startsWith("//") ? `https:${value}` : value;
      const u = new URL(absolute);
      if (
        u.pathname.startsWith("/uploads/") ||
        u.pathname.startsWith("/media/")
      ) {
        return `${u.pathname}${u.search}`;
      }
      return absolute;
    }
  } catch {
    /* fall through */
  }

  return resolveMediaUrl(value, { absolute: false });
}

/** Normalize img/src paths inside HTML before DB save (keep /uploads relative). */
export function normalizeHtmlMediaForStorage(
  html: string | null | undefined,
): string {
  const raw = html ?? "";
  if (!raw.trim()) return "";

  return raw.replace(
    /\b(src|poster|data-src)=["']([^"']+)["']/gi,
    (full, attr: string, url: string) => {
      const next = normalizeStoredMediaUrl(url);
      if (!next || next === url) return full;
      return `${attr}="${next.replace(/"/g, "&quot;")}"`;
    },
  );
}
