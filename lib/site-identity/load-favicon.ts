import "server-only";

import { readFile } from "node:fs/promises";
import path from "node:path";
import { getSiteUrl } from "@/lib/env";
import { absoluteMediaUrl, resolveMediaUrl } from "@/lib/media/public-url";
import {
  assertUnderUploadsRoot,
  getUploadsRoot,
} from "@/lib/media/uploads-root";
import { getSiteIdentity } from "@/lib/site-identity/settings";

const CONTENT_TYPES: Record<string, string> = {
  ".webp": "image/webp",
  ".jpg": "image/jpeg",
  ".jpeg": "image/jpeg",
  ".png": "image/png",
  ".gif": "image/gif",
  ".avif": "image/avif",
  ".svg": "image/svg+xml",
  ".ico": "image/x-icon",
};

const FALLBACK_PUBLIC = path.join(
  process.cwd(),
  "public",
  "brand",
  "fpn-logo-wordmark.png",
);

export type LoadedFavicon = {
  buffer: Buffer;
  contentType: string;
};

function contentTypeForPath(filePath: string): string {
  const ext = path.extname(filePath).toLowerCase();
  return CONTENT_TYPES[ext] || "application/octet-stream";
}

async function readPublicMedia(relativeFromPublic: string): Promise<LoadedFavicon | null> {
  const safe = relativeFromPublic.replace(/^\/+/, "");
  if (!safe || safe.includes("..")) return null;
  const filePath = path.resolve(process.cwd(), "public", safe);
  const publicRoot = path.resolve(process.cwd(), "public");
  if (!filePath.startsWith(publicRoot + path.sep) && filePath !== publicRoot) {
    return null;
  }
  try {
    const buffer = await readFile(filePath);
    return { buffer, contentType: contentTypeForPath(filePath) };
  } catch {
    return null;
  }
}

async function readUploads(relative: string): Promise<LoadedFavicon | null> {
  try {
    const filePath = assertUnderUploadsRoot(
      path.join(getUploadsRoot(), relative),
    );
    const buffer = await readFile(filePath);
    return { buffer, contentType: contentTypeForPath(filePath) };
  } catch {
    return null;
  }
}

async function fetchRemote(url: string): Promise<LoadedFavicon | null> {
  try {
    const res = await fetch(url, { cache: "no-store" });
    if (!res.ok) return null;
    const buffer = Buffer.from(await res.arrayBuffer());
    const contentType =
      res.headers.get("content-type") ||
      contentTypeForPath(url) ||
      "image/png";
    return { buffer, contentType };
  } catch {
    return null;
  }
}

/** Load configured tab icon bytes (uploads, /media, or remote). */
export async function loadSiteFavicon(): Promise<LoadedFavicon | null> {
  const identity = await getSiteIdentity();
  const resolved = identity.faviconUrl
    ? resolveMediaUrl(identity.faviconUrl)
    : null;
  if (!resolved) return null;

  if (resolved.startsWith("/uploads/")) {
    const fromDisk = await readUploads(resolved.slice("/uploads/".length));
    if (fromDisk) return fromDisk;
  }

  if (resolved.startsWith("/media/") || resolved.startsWith("/brand/")) {
    const fromPublic = await readPublicMedia(resolved);
    if (fromPublic) return fromPublic;
  }

  const absolute = absoluteMediaUrl(resolved) || resolved;
  const fetchUrl = absolute.startsWith("http")
    ? absolute
    : `${getSiteUrl().replace(/\/$/, "")}${absolute.startsWith("/") ? absolute : `/${absolute}`}`;

  const remote = await fetchRemote(fetchUrl);
  if (remote) return remote;

  // Same-origin paths may only be reachable via /api/media on some hosts.
  if (resolved.startsWith("/uploads/")) {
    const origin = getSiteUrl().replace(/\/$/, "");
    const viaApi = await fetchRemote(
      `${origin}/api/media/${resolved.slice("/uploads/".length)}`,
    );
    if (viaApi) return viaApi;
  }

  return null;
}

export async function loadSiteFaviconOrFallback(): Promise<LoadedFavicon> {
  const configured = await loadSiteFavicon();
  if (configured) return configured;
  try {
    const buffer = await readFile(FALLBACK_PUBLIC);
    return { buffer, contentType: "image/png" };
  } catch {
    const svg = Buffer.from(
      `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 32 32"><rect width="32" height="32" fill="#e10600"/></svg>`,
      "utf8",
    );
    return { buffer: svg, contentType: "image/svg+xml" };
  }
}
