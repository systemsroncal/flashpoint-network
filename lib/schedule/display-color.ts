const BRAND_ORANGE = new Set([
  "#ff490d",
  "rgb(255, 73, 13)",
  "rgb(255,73,13)",
  "rgba(255, 73, 13, 1)",
  "rgba(255,73,13,1)",
]);

const BRAND_NAVY = new Set([
  "#1b2a64",
  "rgb(27, 42, 100)",
  "rgb(27,42,100)",
  "rgba(27, 42, 100, 1)",
  "rgba(27,42,100,1)",
]);

function normalizeColorKey(color: string): string {
  return color.trim().toLowerCase().replace(/\s+/g, "");
}

/** Schedule entries stored with FPN orange/navy should render as white on the grid. */
export function isBrandScheduleColor(color: string | null | undefined): boolean {
  if (!color) return false;
  const key = normalizeColorKey(color);
  if (BRAND_ORANGE.has(key) || BRAND_NAVY.has(key)) return true;
  if (key === "var(--fpn-rojo)" || key === "var(--fpn-navy)") return true;
  return false;
}

export function scheduleEntryDisplayColor(
  color: string | null | undefined,
  fallback?: string,
): string {
  const resolved = (color || fallback || "").trim();
  if (!resolved || isBrandScheduleColor(resolved)) return "#ffffff";
  return resolved;
}
