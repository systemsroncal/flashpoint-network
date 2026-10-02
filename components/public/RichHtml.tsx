"use client";

import { useEffect, useRef } from "react";
import { expandHtmlEmbedsInArticle } from "@/lib/editor/html-embed";
import {
  absoluteMediaUrl,
  rewriteHtmlMediaUrls,
} from "@/lib/media/public-url";

type Props = {
  html: string;
  className?: string;
};

function unwrapWholeBodyBold(html: string) {
  const trimmed = html.trim();
  const match = trimmed.match(
    /^<(strong|b)(?:\s[^>]*)?>([\s\S]*)<\/\1>$/i,
  );
  if (!match) return html;
  const inner = match[2].trim();
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

function sanitizeArticleHtml(html: string) {
  return html
    .replace(/<script[\s\S]*?>[\s\S]*?<\/script>/gi, (block) => {
      if (/platform\.twitter\.com\/widgets\.js/i.test(block)) return block;
      if (/instagram\.com\/embed\.js/i.test(block)) return block;
      return "";
    })
    .replace(/on\w+=["'][^"']*["']/gi, "")
    .replace(/javascript:/gi, "");
}

function hydrateThirdPartyEmbeds(root: HTMLElement | null) {
  if (!root) return;
  const hasTwitter = root.querySelector(
    "blockquote.twitter-tweet, .twitter-tweet",
  );
  if (hasTwitter) {
    const w = window as Window & {
      twttr?: { widgets?: { load: (el?: HTMLElement) => void } };
    };
    if (w.twttr?.widgets) {
      w.twttr.widgets.load(root);
      return;
    }
    const existing = document.querySelector(
      'script[src*="platform.twitter.com/widgets.js"]',
    );
    if (!existing) {
      const script = document.createElement("script");
      script.src = "https://platform.twitter.com/widgets.js";
      script.async = true;
      script.charset = "utf-8";
      document.body.appendChild(script);
    }
  }
}

/** Renders admin-authored HTML for public article/event bodies. */
export default function RichHtml({ html, className }: Props) {
  const rootRef = useRef<HTMLDivElement>(null);

  const safe = rewriteHtmlMediaUrls(
    sanitizeArticleHtml(
      expandHtmlEmbedsInArticle(normalizeHtml(html)),
    ),
  );

  useEffect(() => {
    hydrateThirdPartyEmbeds(rootRef.current);
  }, [safe]);

  if (!safe) return null;

  return (
    <div
      ref={rootRef}
      className={["fpn-rich-html", className].filter(Boolean).join(" ")}
      dangerouslySetInnerHTML={{ __html: safe }}
    />
  );
}

export { absoluteMediaUrl };
