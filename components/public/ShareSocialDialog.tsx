"use client";

import { useCallback, useEffect, useState } from "react";
import {
  buildSocialShareLinks,
  type SocialNetwork,
} from "@/lib/share/social-links";

const NETWORK_STYLE: Record<
  SocialNetwork,
  { border: string; color: string; bg: string }
> = {
  whatsapp: { border: "#25d366", color: "#25d366", bg: "rgba(37,211,102,0.08)" },
  facebook: { border: "#1877f2", color: "#1877f2", bg: "rgba(24,119,242,0.08)" },
  x: { border: "#e7e7e7", color: "#f5f5f5", bg: "rgba(255,255,255,0.06)" },
  linkedin: { border: "#0a66c2", color: "#0a66c2", bg: "rgba(10,102,194,0.08)" },
  telegram: { border: "#29a9eb", color: "#29a9eb", bg: "rgba(41,169,235,0.08)" },
  email: { border: "#d1d5db", color: "#f3f4f6", bg: "rgba(255,255,255,0.05)" },
};

type Props = {
  open: boolean;
  onClose: () => void;
  pageUrl: string;
  title: string;
  text?: string | null;
};

export default function ShareSocialDialog({
  open,
  onClose,
  pageUrl,
  title,
  text,
}: Props) {
  const [copied, setCopied] = useState(false);
  const links = buildSocialShareLinks({ url: pageUrl, title, text });

  const copyMessage = useCallback(async () => {
    const trimmedText = (text || title).trim();
    const payload = trimmedText ? `${trimmedText}\n\n${pageUrl}` : pageUrl;
    try {
      await navigator.clipboard.writeText(payload);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 2000);
    } catch {
      /* ignore */
    }
  }, [pageUrl, text, title]);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    document.addEventListener("keydown", onKey);
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = prev;
      document.removeEventListener("keydown", onKey);
    };
  }, [open, onClose]);

  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center p-4"
      role="presentation"
    >
      <button
        type="button"
        className="absolute inset-0 bg-black/55 backdrop-blur-[2px]"
        aria-label="Close share dialog"
        onClick={onClose}
      />
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="share-dialog-title"
        className="relative z-10 w-full max-w-lg rounded-xl border border-white/10 bg-[#1e1e1e] p-5 text-white shadow-2xl md:p-6"
      >
        <h2
          id="share-dialog-title"
          className="text-lg font-semibold tracking-tight md:text-xl"
        >
          Share
        </h2>
        <div className="mt-4 grid grid-cols-2 gap-2 sm:grid-cols-3">
          {links.map((item) => {
            const style = NETWORK_STYLE[item.key];
            const isExternal = item.key !== "email";
            return (
              <a
                key={item.key}
                href={item.href}
                target={isExternal ? "_blank" : undefined}
                rel={isExternal ? "noopener noreferrer" : undefined}
                className="inline-flex items-center justify-center gap-2 rounded-md border px-3 py-2.5 text-sm font-semibold transition hover:brightness-110"
                style={{
                  borderColor: style.border,
                  color: style.color,
                  backgroundColor: style.bg,
                }}
              >
                {item.label}
              </a>
            );
          })}
        </div>
        <div className="mt-5">
          <label className="mb-1.5 block text-xs font-medium text-white/55">
            Link
          </label>
          <div className="flex items-stretch gap-2 rounded-md border border-white/15 bg-[#2a2a2a]">
            <input
              readOnly
              value={pageUrl}
              className="min-w-0 flex-1 bg-transparent px-3 py-2.5 text-sm text-white outline-none"
            />
            <button
              type="button"
              onClick={() => void copyMessage()}
              className="shrink-0 border-l border-white/10 px-3 text-white/80 hover:text-white"
              aria-label="Copy link and message"
            >
              {copied ? "✓" : "⧉"}
            </button>
          </div>
          <p className="mt-2 text-xs text-white/45">
            Copy includes the message and link. Paste it in Instagram DMs or any
            app.
          </p>
        </div>
      </div>
    </div>
  );
}
