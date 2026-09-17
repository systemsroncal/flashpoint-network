/**
 * Sanitize post-login / post-auth redirect targets.
 * Allows paths like `/admin/posts/<uuid>` while blocking open redirects.
 */
export function safeNext(path: string | null | undefined): string {
  if (path == null) return "/";

  let value = String(path).trim();
  if (!value) return "/";

  try {
    value = decodeURIComponent(value);
  } catch {
    return "/";
  }

  value = value.trim();
  if (!value.startsWith("/") || value.startsWith("//")) return "/";
  if (value.includes("\\") || /[\0-\x1f\x7f]/.test(value)) return "/";
  if (value.length > 512) return "/";
  // Block scheme-relative or embedded absolute URLs
  if (/^[\\/]*https?:/i.test(value) || value.includes("://")) return "/";

  return value;
}
