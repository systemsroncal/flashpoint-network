/**
 * Env helpers with safe fallbacks so the app boots without real secrets.
 */

const FALLBACK_SITE_URL = "http://127.0.0.1:43125";

/**
 * Production sometimes has duplicated env: `https://fptn.com, https://fptn.com`.
 * Never pass that raw string to `new URL()`.
 */
export function normalizePublicUrl(
  raw: unknown,
  fallback: string = FALLBACK_SITE_URL,
): string {
  // Empty fallback means "no valid origin" (callers can try another env var).
  const fallbackOrigin =
    fallback === "" ? "" : originOrFallback(fallback, FALLBACK_SITE_URL);
  const text = String(raw ?? "")
    .trim()
    .replace(/^['"]+|['"]+$/g, "");
  if (!text) return fallbackOrigin;

  const parts = text
    .split(/[\s,;]+/)
    .map((part) => part.trim().replace(/^['"]+|['"]+$/g, ""))
    .filter(Boolean);

  for (const part of parts) {
    const origin = originOrFallback(part, "");
    if (origin) return origin;
  }

  return fallbackOrigin;
}

function originOrFallback(candidate: string, fallback: string): string {
  try {
    const parsed = new URL(candidate);
    if (parsed.protocol !== "http:" && parsed.protocol !== "https:") {
      return fallback;
    }
    return parsed.origin.replace(/\/$/, "");
  } catch {
    return fallback;
  }
}

export function getSupabaseUrl(): string {
  return process.env.NEXT_PUBLIC_SUPABASE_URL || "https://placeholder.supabase.co";
}

/**
 * Prefer the classic anon JWT; fall back to the publishable key when present.
 */
export function getSupabaseAnonKey(): string {
  return (
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ||
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY ||
    "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.placeholder"
  );
}

export function isSupabaseConfigured(): boolean {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key =
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ||
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY;

  return Boolean(
    url &&
      key &&
      !url.includes("placeholder") &&
      !url.includes("YOUR_PROJECT"),
  );
}

export function getResendApiKey(): string | null {
  return process.env.RESEND_API_KEY || null;
}

/**
 * Canonical public origin. Prefers NEXT_PUBLIC_SITE_URL, then SITE_URL
 * (CyberPanel/OLS sometimes injects a comma-separated SITE_URL that is not
 * in .env.local). Each value is normalized independently — never concatenated.
 *
 * IMPORTANT: PM2 dumped env can override .env.local at runtime. Always go
 * through this helper (or normalizePublicUrl) before `new URL(...)`.
 */
export function getSiteUrl(): string {
  for (const raw of [
    process.env.NEXT_PUBLIC_SITE_URL,
    process.env.SITE_URL,
  ]) {
    if (!raw) continue;
    const origin = normalizePublicUrl(raw, "");
    if (origin) return origin;
  }
  return FALLBACK_SITE_URL;
}

/** Host-only value for X-Forwarded-Host (no scheme, no commas). */
export function normalizeForwardedHost(raw: unknown): string | null {
  const text = String(raw ?? "").trim();
  if (!text) return null;
  const first = text
    .split(/[\s,;]+/)
    .map((part) => part.trim())
    .filter(Boolean)[0];
  if (!first) return null;
  try {
    if (first.includes("://")) {
      return new URL(first).host;
    }
    if (/[\s,;]/.test(first)) return null;
    return first.replace(/\/$/, "");
  } catch {
    return null;
  }
}

export function getSiteName(): string {
  return process.env.NEXT_PUBLIC_SITE_NAME || "Flash Point Network";
}

/**
 * Rewrite process.env site URL keys in-place so PM2-dumped duplicates
 * (`https://fptn.com, https://fptn.com`) cannot reach Next internals or
 * third-party `new URL(process.env.*)`. Call from instrumentation on boot.
 */
export function scrubSiteUrlEnv(): { key: string; before: string; after: string }[] {
  const changed: { key: string; before: string; after: string }[] = [];
  for (const key of ["NEXT_PUBLIC_SITE_URL", "SITE_URL"] as const) {
    const before = process.env[key];
    if (!before || !/[,;]/.test(before)) continue;
    const after = normalizePublicUrl(before, "");
    if (!after || after === before) continue;
    process.env[key] = after;
    changed.push({ key, before, after });
  }
  return changed;
}
