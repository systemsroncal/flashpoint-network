import {
  absoluteMediaUrl,
  rewriteHtmlMediaUrls,
} from "@/lib/media/public-url";

type Props = {
  html: string;
  className?: string;
};

function unwrapWholeBodyBold(html: string) {
  // Tiptap/seed sometimes wraps the entire body in one <strong>/<b>.
  const trimmed = html.trim();
  const match = trimmed.match(
    /^<(strong|b)(?:\s[^>]*)?>([\s\S]*)<\/\1>$/i,
  );
  if (!match) return html;
  const inner = match[2].trim();
  // Only unwrap when the wrapper is the sole root and still contains block markup.
  if (/<(p|h[1-6]|ul|ol|blockquote)\b/i.test(inner)) {
    return inner;
  }
  return html;
}

function normalizeHtml(html: string) {
  const raw = (html ?? "").trim();
  if (!raw) return "";
  if (/<[a-z][\s\S]*>/i.test(raw)) return unwrapWholeBodyBold(raw);
  return raw
    .split(/\n+/)
    .map((line) => line.trim())
    .filter(Boolean)
    .map((line) => `<p>${escapeText(line)}</p>`)
    .join("");
}

function escapeText(text: string) {
  return text
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

/** Renders admin-authored HTML for public article/event bodies. */
export default function RichHtml({ html, className }: Props) {
  const safe = rewriteHtmlMediaUrls(
    normalizeHtml(html)
      .replace(/<script[\s\S]*?>[\s\S]*?<\/script>/gi, "")
      .replace(/on\w+=["'][^"']*["']/gi, "")
      .replace(/javascript:/gi, ""),
  );

  if (!safe) return null;

  return (
    <div
      className={["fpn-rich-html", className].filter(Boolean).join(" ")}
      dangerouslySetInnerHTML={{ __html: safe }}
    />
  );
}

/** Helper for callers that need a single absolute media URL. */
export { absoluteMediaUrl };
