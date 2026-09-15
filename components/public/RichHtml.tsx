type Props = {
  html: string;
  className?: string;
};

function normalizeHtml(html: string) {
  const raw = (html ?? "").trim();
  if (!raw) return "";
  if (/<[a-z][\s\S]*>/i.test(raw)) return raw;
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
  const safe = normalizeHtml(html)
    .replace(/<script[\s\S]*?>[\s\S]*?<\/script>/gi, "")
    .replace(/on\w+=["'][^"']*["']/gi, "")
    .replace(/javascript:/gi, "");

  if (!safe) return null;

  return (
    <div
      className={["fpn-rich-html", className].filter(Boolean).join(" ")}
      dangerouslySetInnerHTML={{ __html: safe }}
    />
  );
}
