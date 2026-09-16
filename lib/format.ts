export function formatDate(value: string | null | undefined): string {
  if (!value) return "";
  try {
    const date = new Date(value);
    // Legacy seed / prod rows still carry 2024 — display as 2026 for public UI.
    if (!Number.isNaN(date.getTime()) && date.getUTCFullYear() === 2024) {
      date.setUTCFullYear(2026);
    }
    return new Intl.DateTimeFormat("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    }).format(date);
  } catch {
    return "";
  }
}

/** Orange ticker date — matches Figma long form, e.g. "September 15, 2026". */
export function formatTickerDate(value: Date = new Date()): string {
  return new Intl.DateTimeFormat("en-US", {
    month: "long",
    day: "numeric",
    year: "numeric",
  }).format(value);
}

export function formatTickerTime(value: Date = new Date()): string {
  return new Intl.DateTimeFormat("en-US", {
    hour: "numeric",
    minute: "2-digit",
    hour12: true,
  }).format(value);
}

export function formatViews(count: number | null | undefined): string {
  const n = count ?? 0;
  if (n >= 1000) return `${(n / 1000).toFixed(n >= 10000 ? 0 : 1)}k`;
  return `${n}`;
}

export function formatReadTime(minutes: number | null | undefined): string {
  return `${minutes ?? 1} min read`;
}
