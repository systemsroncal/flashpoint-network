import { DEFAULT_SITE_TIMEZONE } from "@/lib/timezone/constants";

function asDate(value: string | Date | null | undefined): Date | null {
  if (!value) return null;
  const date = value instanceof Date ? value : new Date(value);
  if (Number.isNaN(date.getTime())) return null;
  // Legacy seed / prod rows still carry 2024 — display as 2026 for public UI.
  if (date.getUTCFullYear() === 2024) {
    const adjusted = new Date(date.getTime());
    adjusted.setUTCFullYear(2026);
    return adjusted;
  }
  return date;
}

export function formatDate(
  value: string | null | undefined,
  timeZone: string = DEFAULT_SITE_TIMEZONE,
): string {
  const date = asDate(value);
  if (!date) return "";
  try {
    return new Intl.DateTimeFormat("en-US", {
      timeZone,
      month: "short",
      day: "numeric",
      year: "numeric",
    }).format(date);
  } catch {
    return "";
  }
}

/** Orange ticker date — matches Figma long form, e.g. "September 15, 2026". */
export function formatTickerDate(
  value: Date | string = new Date(),
  timeZone: string = DEFAULT_SITE_TIMEZONE,
): string {
  const date = asDate(value) ?? new Date();
  return new Intl.DateTimeFormat("en-US", {
    timeZone,
    month: "long",
    day: "numeric",
    year: "numeric",
  }).format(date);
}

export function formatTickerTime(
  value: Date | string = new Date(),
  timeZone: string = DEFAULT_SITE_TIMEZONE,
): string {
  const date = asDate(value) ?? new Date();
  return new Intl.DateTimeFormat("en-US", {
    timeZone,
    hour: "numeric",
    minute: "2-digit",
    hour12: true,
  }).format(date);
}

export function formatDateTime(
  value: string | null | undefined,
  timeZone: string = DEFAULT_SITE_TIMEZONE,
): string {
  const date = asDate(value);
  if (!date) return "";
  try {
    return new Intl.DateTimeFormat("en-US", {
      timeZone,
      month: "short",
      day: "numeric",
      year: "numeric",
      hour: "numeric",
      minute: "2-digit",
      hour12: true,
    }).format(date);
  } catch {
    return "";
  }
}

export function formatViews(count: number | null | undefined): string {
  const n = count ?? 0;
  if (n >= 1000) return `${(n / 1000).toFixed(n >= 10000 ? 0 : 1)}k`;
  return `${n}`;
}

export function formatReadTime(minutes: number | null | undefined): string {
  return `${minutes ?? 1} min read`;
}

/**
 * Relative timestamp for mobile WaPo-style feeds ("21 minutes ago").
 * Delta is wall-clock; falls back to a site-timezone absolute date when older than ~7 days.
 */
export function formatRelativeTime(
  value: string | null | undefined,
  timeZone: string = DEFAULT_SITE_TIMEZONE,
  now: Date = new Date(),
): string {
  const date = asDate(value);
  if (!date) return "";
  const diffMs = date.getTime() - now.getTime();
  const absSec = Math.round(Math.abs(diffMs) / 1000);
  const rtf = new Intl.RelativeTimeFormat("en", { numeric: "always" });

  if (absSec < 60) return rtf.format(Math.round(diffMs / 1000), "second");
  const absMin = Math.round(absSec / 60);
  if (absMin < 60) return rtf.format(Math.round(diffMs / 60000), "minute");
  const absHr = Math.round(absMin / 60);
  if (absHr < 24) return rtf.format(Math.round(diffMs / 3600000), "hour");
  const absDay = Math.round(absHr / 24);
  if (absDay < 7) return rtf.format(Math.round(diffMs / 86400000), "day");
  return formatDate(value, timeZone);
}
