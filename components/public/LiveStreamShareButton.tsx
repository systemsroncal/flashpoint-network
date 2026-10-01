"use client";

import Image from "next/image";
import { useCallback, useState } from "react";
import {
  LIVE_DESCRIPTION,
  LIVE_HEADLINE,
} from "@/components/public/LiveHeroCopy";

type Props = {
  /** Path or absolute URL to share. Defaults to /live. */
  sharePath?: string;
  className?: string;
  fullWidth?: boolean;
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
  fullWidth = false,
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
      className={`fpn-live-cta fpn-live-cta--hero ${fullWidth ? "fpn-live-cta--full" : ""} ${className}`.trim()}
      aria-label={copied ? "Link copied" : "Share live stream"}
    >
      <Image
        src="/brand/share/share.svg"
        alt=""
        width={20}
        height={20}
        className="shrink-0"
      />
      <span>{copied ? "Link copied" : "Share"}</span>
    </button>
  );
}
