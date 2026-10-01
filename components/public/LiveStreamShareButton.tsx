"use client";

import { useCallback, useState } from "react";
import {
  LIVE_DESCRIPTION,
  LIVE_HEADLINE,
} from "@/components/public/LiveHeroCopy";

type Props = {
  /** Path or absolute URL to share. Defaults to /live. */
  sharePath?: string;
  className?: string;
};

function resolveShareUrl(sharePath: string): string {
  if (sharePath.startsWith("http://") || sharePath.startsWith("https://")) {
    return sharePath;
  }
  const path = sharePath.startsWith("/") ? sharePath : `/${sharePath}`;
  return `${window.location.origin}${path}`;
}

export default function LiveStreamShareButton({
  sharePath = "/live",
  className = "",
}: Props) {
  const [copied, setCopied] = useState(false);

  const onShare = useCallback(async () => {
    const url = resolveShareUrl(sharePath);
    const shareData = {
      title: LIVE_HEADLINE,
      text: LIVE_DESCRIPTION,
      url,
    };

    if (typeof navigator !== "undefined" && navigator.share) {
      try {
        await navigator.share(shareData);
        return;
      } catch (err) {
        if (err instanceof DOMException && err.name === "AbortError") return;
      }
    }

    try {
      await navigator.clipboard.writeText(url);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 2000);
    } catch {
      /* ignore */
    }
  }, [sharePath]);

  return (
    <button
      type="button"
      onClick={() => void onShare()}
      className={`fpn-live-share-cta w-auto max-w-none shrink-0 ${className}`.trim()}
      aria-label={copied ? "Link copied" : "Share live stream"}
    >
      <svg
        className="fpn-live-share-icon"
        viewBox="0 0 20 20"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        aria-hidden
      >
        <path
          d="M10 4v7.5"
          stroke="currentColor"
          strokeWidth="1.75"
          strokeLinecap="round"
        />
        <path
          d="M7 7.25 10 4l3 3.25"
          stroke="currentColor"
          strokeWidth="1.75"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        <path
          d="M5.25 11.25v4A1.25 1.25 0 0 0 6.5 16.5h7a1.25 1.25 0 0 0 1.25-1.25v-4"
          stroke="currentColor"
          strokeWidth="1.75"
          strokeLinecap="round"
        />
      </svg>
      <span>{copied ? "Link copied" : "Share"}</span>
    </button>
  );
}
