import {
  markdownPlainToHtml,
  normalizePastedHtml,
  shouldPastePlainAsMarkdown,
} from "@/lib/editor/paste-markdown";

export type ClipboardPayload = {
  html: string;
  plain: string;
};

export type PasteAction =
  | { type: "visual-html"; html: string }
  | { type: "html-source"; source: string };

const HTML_SOURCE_START =
  /^<(!DOCTYPE|html|body|head|meta|div|p|h[1-6]|ul|ol|li|span|strong|b|em|i|u|br|a|img|section|article|blockquote|table|tr|td|th|figure|figcaption|pre|code|style|link)\b/i;

/** Plain text that is HTML source (tags), not rendered rich paste. */
export function isHtmlSourceCode(text: string): boolean {
  const t = text.trim();
  if (!t.startsWith("<")) return false;
  if (!/<\/?[a-z][^>]*>/i.test(t)) return false;
  if (!HTML_SOURCE_START.test(t)) return false;
  const openTags = (t.match(/<[a-z][^>/]*>/gi) || []).length;
  return openTags >= 1;
}

function plainToParagraphHtml(plain: string): string {
  const trimmed = plain.trim();
  if (!trimmed) return "<p></p>";
  return trimmed
    .split(/\n\s*\n/)
    .map((block) => block.trim())
    .filter(Boolean)
    .map((block) => {
      const lines = block.split("\n").map((l) => l.trim()).filter(Boolean);
      if (lines.length <= 1) {
        return `<p>${lines[0] ?? ""}</p>`;
      }
      return lines.map((line) => `<p>${line}</p>`).join("");
    })
    .join("");
}

export function resolveClipboardPaste({
  html,
  plain,
}: ClipboardPayload): PasteAction {
  const trimmedPlain = plain.trim();
  const trimmedHtml = html.trim();

  if (trimmedPlain && isHtmlSourceCode(trimmedPlain)) {
    return { type: "html-source", source: trimmedPlain };
  }

  if (trimmedHtml && shouldPastePlainAsMarkdown(trimmedHtml, plain)) {
    return {
      type: "visual-html",
      html: markdownPlainToHtml(plain),
    };
  }

  if (trimmedHtml) {
    const normalized = normalizePastedHtml(trimmedHtml);
    const hasStructure =
      /<(h[1-6]|strong|b|em|i|u|ul|ol|li|p|blockquote|a)\b/i.test(
        normalized,
      );
    if (hasStructure || normalized.length > 20) {
      return { type: "visual-html", html: normalized };
    }
  }

  if (trimmedPlain && shouldPastePlainAsMarkdown(trimmedHtml, plain)) {
    return {
      type: "visual-html",
      html: markdownPlainToHtml(plain),
    };
  }

  if (trimmedPlain) {
    return { type: "visual-html", html: plainToParagraphHtml(plain) };
  }

  return { type: "visual-html", html: "<p></p>" };
}

export async function readClipboardPayload(): Promise<ClipboardPayload> {
  let html = "";
  let plain = "";

  if (typeof navigator !== "undefined" && navigator.clipboard?.read) {
    try {
      const items = await navigator.clipboard.read();
      for (const item of items) {
        if (item.types.includes("text/html")) {
          html = await (await item.getType("text/html")).text();
        }
        if (item.types.includes("text/plain")) {
          plain = await (await item.getType("text/plain")).text();
        }
      }
      return { html, plain };
    } catch {
      /* fall through to readText */
    }
  }

  if (typeof navigator !== "undefined" && navigator.clipboard?.readText) {
    try {
      plain = await navigator.clipboard.readText();
    } catch {
      plain = "";
    }
  }

  return { html, plain };
}

export function insertIntoHtmlSource(
  current: string,
  insertion: string,
  selectionStart: number,
  selectionEnd: number,
): { next: string; cursor: number } {
  const before = current.slice(0, selectionStart);
  const after = current.slice(selectionEnd);
  const next = `${before}${insertion}${after}`;
  const cursor = before.length + insertion.length;
  return { next, cursor };
}
