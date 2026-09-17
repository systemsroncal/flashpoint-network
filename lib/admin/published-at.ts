import { datetimeLocalToIso } from "@/lib/timezone/datetime";
import { DEFAULT_SITE_TIMEZONE } from "@/lib/timezone/constants";

/**
 * Resolve posts.published_at for create/update.
 *
 * datetime-local values have no timezone. Re-parsing them on the server
 * with `new Date("YYYY-MM-DDTHH:mm")` shifts the instant whenever the
 * server TZ ≠ the site timezone (or when seconds/ms are truncated).
 * That rewrite reorders home + lists that sort by published_at.
 *
 * When the editor leaves the displayed value unchanged, keep the exact ISO
 * stored in the DB. Only parse a new instant when the field was edited —
 * interpreting wall time in the configured site timezone.
 */
export function resolvePublishedAt(opts: {
  submittedRaw: string;
  /** Initial datetime-local string shown in the form (empty on create). */
  displayInitial: string;
  /** Exact ISO from DB when the form was loaded (empty on create). */
  originalIso: string | null;
  /** Current DB value loaded on the server for this id (update only). */
  existingIso: string | null;
  status: string;
  /** Site IANA timezone for interpreting datetime-local. */
  timeZone?: string;
}): string | null {
  const submitted = opts.submittedRaw.trim();
  const displayInitial = opts.displayInitial.trim();
  const originalIso = (opts.originalIso || "").trim() || null;
  const existingIso = opts.existingIso;
  const timeZone = opts.timeZone || DEFAULT_SITE_TIMEZONE;

  // Edit: blank field → never bump to "now"; keep existing publish time.
  if (!submitted) {
    if (existingIso) return existingIso;
    if (originalIso) return originalIso;
    if (opts.status === "published") return new Date().toISOString();
    return null;
  }

  // Edit: value matches what we showed → keep exact original ISO (no TZ round-trip).
  if (displayInitial && submitted === displayInitial) {
    return (
      originalIso ??
      existingIso ??
      datetimeLocalToIso(submitted, timeZone)
    );
  }

  // Explicit change (or create with a chosen date).
  return (
    datetimeLocalToIso(submitted, timeZone) ??
    existingIso ??
    originalIso
  );
}
