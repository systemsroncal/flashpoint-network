/** Base64-encode embed HTML for safe storage in data attributes. */
export function encodeEmbedRaw(html: string): string {
  const trimmed = html.trim();
  if (!trimmed) return "";
  if (typeof Buffer !== "undefined") {
    return Buffer.from(trimmed, "utf8").toString("base64");
  }
  return btoa(unescape(encodeURIComponent(trimmed)));
}

export function decodeEmbedRaw(encoded: string): string {
  if (!encoded) return "";
  try {
    if (typeof Buffer !== "undefined") {
      return Buffer.from(encoded, "base64").toString("utf8");
    }
    return decodeURIComponent(escape(atob(encoded)));
  } catch {
    return "";
  }
}

const EMBED_DIV_RE =
  /<div\b[^>]*\bdata-fpn-html-embed\b[^>]*\bdata-raw="([^"]*)"[^>]*>\s*<\/div>/gi;

const EMBED_DIV_RE_ALT =
  /<div\b[^>]*\bdata-raw="([^"]*)"[^>]*\bdata-fpn-html-embed\b[^>]*>\s*<\/div>/gi;

/** Replace stored embed slots with the original embed markup. */
export function expandHtmlEmbedsInArticle(html: string): string {
  let out = html;
  for (const re of [EMBED_DIV_RE, EMBED_DIV_RE_ALT]) {
    out = out.replace(re, (_, raw: string) => decodeEmbedRaw(raw));
  }
  return out;
}
