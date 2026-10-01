/** Calendar helpers for schedule admin (import defaults + navigation). */

export function addCalendarMonth(
  year: number,
  month: number,
  delta: number,
): { year: number; month: number } {
  const d = new Date(year, month - 1 + delta, 1);
  return { year: d.getFullYear(), month: d.getMonth() + 1 };
}

export function periodFromAirDate(airDate: string): { year: number; month: number } {
  const [y, m] = airDate.split("-").map(Number);
  return { year: y, month: m };
}

/**
 * First month that still needs a schedule after the latest uploaded month.
 * If nothing exists yet, defaults to the current calendar month.
 */
export function nextScheduleMonthAfterLatest(
  latest: { year: number; month: number } | null,
  now = new Date(),
): { year: number; month: number } {
  if (!latest) {
    return { year: now.getFullYear(), month: now.getMonth() + 1 };
  }
  return addCalendarMonth(latest.year, latest.month, 1);
}
