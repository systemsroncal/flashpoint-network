const MAX_WIDTH_PATTERN =
  /^(\d+(\.\d+)?(px|%|vw|rem|em|ch)|100%|none)$/i;

/** Safe CSS max-width for inline styles (e.g. 700px, 90vw, 100%). */
export function sanitizeBannerMaxWidth(
  raw: unknown,
  fallback = "100%",
): string {
  const v = typeof raw === "string" ? raw.trim() : "";
  if (!v) return fallback;
  if (MAX_WIDTH_PATTERN.test(v)) return v;
  return fallback;
}
