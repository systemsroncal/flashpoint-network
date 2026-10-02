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
  return (
    html
      // Inline embed scripts do not run via innerHTML; widgets.js is loaded below.
      .replace(/<script[\s\S]*?>[\s\S]*?<\/script>/gi, "")
      .replace(/on\w+=["'][^"']*["']/gi, "")
      .replace(/javascript:/gi, "")
  );
}

function hydrateThirdPartyEmbeds(root: HTMLElement | null) {
  if (!root) return;
  const hasTwitter = root.querySelector(
    "blockquote.twitter-tweet, .twitter-tweet",
  );
  if (!hasTwitter) return;

  const w = window as Window & {
    twttr?: { widgets?: { load: (el?: HTMLElement) => void } };
  };

  const loadWidgets = () => {
    w.twttr?.widgets?.load(root);
  };

  if (w.twttr?.widgets) {
    loadWidgets();
    return;
  }

  const existing = document.querySelector(
    'script[src*="platform.twitter.com/widgets.js"]',
  ) as HTMLScriptElement | null;

  if (existing) {
    existing.addEventListener("load", loadWidgets, { once: true });
    return;
  }

  const script = document.createElement("script");
  script.src = "https://platform.twitter.com/widgets.js";
  script.async = true;
  script.charset = "utf-8";
  script.addEventListener("load", loadWidgets, { once: true });
  document.body.appendChild(script);
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
    const t = window.setTimeout(() => hydrateThirdPartyEmbeds(rootRef.current), 800);
    return () => window.clearTimeout(t);
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
