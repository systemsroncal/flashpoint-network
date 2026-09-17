import type { EventItem } from "@/lib/types/cms";

/**
 * Next closest upcoming event for the home orange bar.
 * Prefers a live event; otherwise the soonest start that is still upcoming
 * or ongoing (`ends_at` ≥ now). Ordering uses absolute instants (equivalent
 * under any IANA zone); callers format times with the site timezone setting.
 */
export function pickNextUpcomingEvent(
  events: EventItem[],
  now: Date = new Date(),
): EventItem | null {
  const nowMs = now.getTime();

  const live = events
    .filter((e) => e.is_live)
    .sort((a, b) => {
      const ta = a.starts_at ? Date.parse(a.starts_at) : 0;
      const tb = b.starts_at ? Date.parse(b.starts_at) : 0;
      return tb - ta;
    });
  if (live[0]) return live[0];

  const upcoming = events
    .filter((e) => {
      if (!e.starts_at) return false;
      const start = Date.parse(e.starts_at);
      if (Number.isNaN(start)) return false;
      if (e.ends_at) {
        const end = Date.parse(e.ends_at);
        if (!Number.isNaN(end) && end >= nowMs) return true;
      }
      return start >= nowMs;
    })
    .sort(
      (a, b) => Date.parse(a.starts_at!) - Date.parse(b.starts_at!),
    );

  return upcoming[0] ?? null;
}

/** Normalize optional event CTA URL; empty → null. */
export function normalizeExternalUrl(
  raw: string | null | undefined,
): string | null {
  const trimmed = (raw ?? "").trim();
  if (!trimmed) return null;
  try {
    const url = new URL(trimmed);
    if (url.protocol !== "http:" && url.protocol !== "https:") return null;
    return url.toString();
  } catch {
    return null;
  }
}
