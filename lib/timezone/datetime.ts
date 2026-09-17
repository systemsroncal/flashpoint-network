/**
 * Convert between UTC ISO strings and HTML datetime-local values
 * interpreted in a specific IANA timezone (not the runtime server TZ).
 */

function pad(n: number): string {
  return String(n).padStart(2, "0");
}

function partsInTimezone(
  date: Date,
  timeZone: string,
): {
  year: number;
  month: number;
  day: number;
  hour: number;
  minute: number;
  second: number;
} {
  const fmt = new Intl.DateTimeFormat("en-US", {
    timeZone,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
    hourCycle: "h23",
  });
  const map: Record<string, string> = {};
  for (const p of fmt.formatToParts(date)) {
    if (p.type !== "literal") map[p.type] = p.value;
  }
  return {
    year: Number(map.year),
    month: Number(map.month),
    day: Number(map.day),
    hour: Number(map.hour),
    minute: Number(map.minute),
    second: Number(map.second),
  };
}

/** UTC ISO → `YYYY-MM-DDTHH:mm` in the given timezone. */
export function isoToDatetimeLocal(
  value: string | null | undefined,
  timeZone: string,
): string {
  if (!value) return "";
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return "";
  const p = partsInTimezone(d, timeZone);
  return `${p.year}-${pad(p.month)}-${pad(p.day)}T${pad(p.hour)}:${pad(p.minute)}`;
}

/**
 * `YYYY-MM-DDTHH:mm` (or with seconds) in `timeZone` → UTC ISO.
 * Iteratively corrects offset so DST edges stay accurate.
 */
export function datetimeLocalToIso(
  raw: string,
  timeZone: string,
): string | null {
  const trimmed = raw.trim();
  const m = trimmed.match(
    /^(\d{4})-(\d{2})-(\d{2})T(\d{2}):(\d{2})(?::(\d{2}))?$/,
  );
  if (!m) return null;

  const year = Number(m[1]);
  const month = Number(m[2]);
  const day = Number(m[3]);
  const hour = Number(m[4]);
  const minute = Number(m[5]);
  const second = Number(m[6] || "0");

  // Initial guess: treat wall time as UTC, then nudge by TZ offset.
  let utcMs = Date.UTC(year, month - 1, day, hour, minute, second);

  for (let i = 0; i < 4; i++) {
    const shown = partsInTimezone(new Date(utcMs), timeZone);
    const asUtc = Date.UTC(
      shown.year,
      shown.month - 1,
      shown.day,
      shown.hour,
      shown.minute,
      shown.second,
    );
    const desired = Date.UTC(year, month - 1, day, hour, minute, second);
    const diff = desired - asUtc;
    if (diff === 0) break;
    utcMs += diff;
  }

  const result = new Date(utcMs);
  if (Number.isNaN(result.getTime())) return null;
  return result.toISOString();
}
