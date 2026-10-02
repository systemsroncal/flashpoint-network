/**
 * ChatGPT mobile (and some iOS WebViews) often put markdown/plain text on the
 * clipboard without text/html. Desktop browser copy usually includes HTML.
 */

function escapeHtml(text: string): string {
  return text
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

/** Inline **bold**, *italic*, __bold__, _italic_ (ChatGPT-style). */
export function inlineMarkdownToHtml(text: string): string {
  let out = escapeHtml(text);
  out = out.replace(/\*\*(.+?)\*\*/g, "<strong>$1</strong>");
  out = out.replace(/__(.+?)__/g, "<strong>$1</strong>");
  out = out.replace(/\*([^*]+)\*/g, "<em>$1</em>");
  out = out.replace(/_([^_]+)_/g, "<em>$1</em>");
  return out;
}

function headingTag(level: number): "h2" | "h3" {
  return level <= 2 ? "h2" : "h3";
}

/** Plain text / markdown → HTML for TipTap (headings, lists, paragraphs). */
export function markdownPlainToHtml(text: string): string {
  const lines = text.replace(/\r\n/g, "\n").split("\n");
  const parts: string[] = [];
  let listType: "ul" | "ol" | null = null;
  let listItems: string[] = [];

  const flushList = () => {
    if (!listType || listItems.length === 0) return;
    parts.push(
      `<${listType}>${listItems.map((item) => `<li>${item}</li>`).join("")}</${listType}>`,
    );
    listType = null;
    listItems = [];
  };

  for (const raw of lines) {
    const trimmed = raw.trim();
    if (!trimmed) {
      flushList();
      continue;
    }

    const bullet = /^[-*•]\s+(.+)$/.exec(trimmed);
    if (bullet) {
      if (listType === "ol") flushList();
      listType = "ul";
      listItems.push(inlineMarkdownToHtml(bullet[1]));
      continue;
    }

    const ordered = /^\d+\.\s+(.+)$/.exec(trimmed);
    if (ordered) {
      if (listType === "ul") flushList();
      listType = "ol";
      listItems.push(inlineMarkdownToHtml(ordered[1]));
      continue;
    }

    flushList();

    const heading = /^(#{1,6})\s+(.+)$/.exec(trimmed);
    if (heading) {
      const tag = headingTag(heading[1].length);
      parts.push(
        `<${tag}>${inlineMarkdownToHtml(heading[2])}</${tag}>`,
      );
      continue;
    }

    parts.push(`<p>${inlineMarkdownToHtml(trimmed)}</p>`);
  }

  flushList();
  return parts.join("") || "<p></p>";
}

const MARKDOWN_SIGNAL =
  /(\*\*|__|(^|\n)#{1,6}\s|(^|\n)[-*•]\s|(^|\n)\d+\.\s)/m;

/** True when clipboard HTML lacks real structure but plain text looks like markdown. */
export function shouldPastePlainAsMarkdown(
  html: string,
  plain: string,
): boolean {
  const text = plain.trim();
  if (!text) return false;

  const hasMarkdown = MARKDOWN_SIGNAL.test(text);
  if (!hasMarkdown) return false;

  const rawHtml = html.trim();
  if (!rawHtml) return true;

  const hasSemanticHtml =
    /<(h[1-6]|strong|b|em|i|ul|ol|li|p)\b/i.test(rawHtml);
  const hasInlineBold = /<(strong|b)\b/i.test(rawHtml);

  if (!hasSemanticHtml) return true;
  if (/\*\*|__/.test(text) && !hasInlineBold) return true;

  return false;
}

/** Normalize pasted HTML (h1→h2, strip junk wrappers). */
export function normalizePastedHtml(html: string): string {
  let out = html
    .replace(/<meta[^>]*>/gi, "")
    .replace(/<!--[\s\S]*?-->/g, "")
    .replace(/<!\[if[\s\S]*?endif\]>/gi, "");

  out = out.replace(/<h1\b([^>]*)>/gi, "<h2$1>");
  out = out.replace(/<\/h1>/gi, "</h2>");
  out = out.replace(/<h[4-6]\b([^>]*)>/gi, "<h3$1>");
  out = out.replace(/<\/h[4-6]>/gi, "</h3>");

  return out;
}
