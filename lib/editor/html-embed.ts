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

export function decodeHtmlEntities(text: string): string {
  return text
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/&amp;/g, "&");
}

function embedSlotHtml(raw: string): string {
  const encoded = encodeEmbedRaw(raw);
  if (!encoded) return "";
  return `<div data-fpn-html-embed="1" class="fpn-html-embed-slot" data-raw="${encoded}"></div>`;
}

/** Fix legacy/broken embed slots (escaped raw="" attr, editor chrome in saved HTML). */
export function normalizeEmbedSlotsInHtml(html: string): string {
  let out = html;

  out = out.replace(
    /<div\b([^>]*)\braw="([^"]*)"([^>]*\bdata-fpn-html-embed="1"[^>]*)>\s*<\/div>/gi,
    (_, _a, rawValue: string) =>
      embedSlotHtml(decodeHtmlEntities(rawValue)) || "",
  );

  out = out.replace(
    /<div\b([^>]*\bdata-fpn-html-embed="1"[^>]*)>([\s\S]*?)<\/div>/gi,
    (whole, attrs: string, inner: string) => {
      if (!/fpn-html-embed-label|fpn-html-embed-preview/i.test(inner)) {
        const encoded = attrs.match(/\bdata-raw="([^"]+)"/i)?.[1];
        if (encoded && !inner.trim()) {
          const decoded = decodeEmbedRaw(encoded);
          if (decoded) return embedSlotHtml(decoded);
        }
        return whole;
      }
      const encoded = attrs.match(/\bdata-raw="([^"]+)"/i)?.[1];
      if (encoded) {
        const decoded = decodeEmbedRaw(encoded);
        if (decoded) return embedSlotHtml(decoded);
      }
      const preview = inner.match(
        /<div[^>]*class="[^"]*fpn-html-embed-preview[^"]*"[^>]*>([\s\S]*?)<\/div>/i,
      )?.[1];
      if (preview?.trim()) return embedSlotHtml(preview.trim());
      return whole;
    },
  );

  return out;
}

const EMBED_DIV_RE =
  /<div\b[^>]*\bdata-fpn-html-embed\b[^>]*\bdata-raw="([^"]*)"[^>]*>\s*<\/div>/gi;

const EMBED_DIV_RE_ALT =
  /<div\b[^>]*\bdata-raw="([^"]*)"[^>]*\bdata-fpn-html-embed\b[^>]*>\s*<\/div>/gi;

/** Replace stored embed slots with the original embed markup. */
export function expandHtmlEmbedsInArticle(html: string): string {
  const normalized = normalizeEmbedSlotsInHtml(html);
  let out = normalized;
  for (const re of [EMBED_DIV_RE, EMBED_DIV_RE_ALT]) {
    out = out.replace(re, (_, raw: string) => {
      const decoded = decodeEmbedRaw(raw);
      return decoded || "";
    });
  }
  return out;
}
