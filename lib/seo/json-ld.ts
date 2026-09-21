/** Strip undefined keys so JSON-LD stays valid and compact. */
export function compactJsonLd<T extends Record<string, unknown>>(value: T): T {
  const out: Record<string, unknown> = {};
  for (const [key, val] of Object.entries(value)) {
    if (val === undefined || val === null) continue;
    if (Array.isArray(val) && val.length === 0) continue;
    if (
      typeof val === "object" &&
      !Array.isArray(val) &&
      val !== null &&
      Object.keys(val as object).length === 0
    ) {
      continue;
    }
    out[key] = val;
  }
  return out as T;
}

export function jsonLdScriptContent(data: unknown): string {
  return JSON.stringify(data).replace(/</g, "\\u003c");
}
