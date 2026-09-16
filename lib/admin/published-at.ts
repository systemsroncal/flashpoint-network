/**
 * Resolve posts.published_at for create/update.
 *
 * datetime-local values have no timezone. Re-parsing them on the server
 * (new Date("YYYY-MM-DDTHH:mm").toISOString()) shifts the instant whenever
 * the server TZ ≠ the editor's local TZ (or when seconds/ms are truncated).
 * That rewrite reorders home + lists that sort by published_at.
 *
 * When the editor leaves the displayed value unchanged, keep the exact ISO
 * stored in the DB. Only parse a new instant when the field was edited.
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
}): string | null {
  const submitted = opts.submittedRaw.trim();
  const displayInitial = opts.displayInitial.trim();
  const originalIso = (opts.originalIso || "").trim() || null;
  const existingIso = opts.existingIso;

  // Edit: blank field → never bump to "now"; keep existing publish time.
  if (!submitted) {
    if (existingIso) return existingIso;
    if (originalIso) return originalIso;
    if (opts.status === "published") return new Date().toISOString();
    return null;
  }

  // Edit: value matches what we showed → keep exact original ISO (no TZ round-trip).
  if (displayInitial && submitted === displayInitial) {
    return originalIso ?? existingIso ?? parseDatetimeLocal(submitted);
  }

  // Explicit change (or create with a chosen date).
  return parseDatetimeLocal(submitted) ?? existingIso ?? originalIso;
}

function parseDatetimeLocal(raw: string): string | null {
  const parsed = new Date(raw);
  if (Number.isNaN(parsed.getTime())) return null;
  return parsed.toISOString();
}
