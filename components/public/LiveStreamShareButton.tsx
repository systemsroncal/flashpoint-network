"use client";

import { useCallback, useState, useSyncExternalStore } from "react";
import ShareSocialDialog from "@/components/public/ShareSocialDialog";
import {
  LIVE_DESCRIPTION,
  LIVE_HEADLINE,
} from "@/components/public/LiveHeroCopy";

type Props = {
  /** Path or absolute URL when useCurrentUrl is false. */
  sharePath?: string;
  shareTitle?: string;
  shareText?: string | null;
  /** When true, shares window.location.href (article / current page). */
  useCurrentUrl?: boolean;
  className?: string;
};

function resolveShareUrl(sharePath: string): string {
  if (sharePath.startsWith("http://") || sharePath.startsWith("https://")) {
    return sharePath;
  }
  const path = sharePath.startsWith("/") ? sharePath : `/${sharePath}`;
  return `${window.location.origin}${path}`;
}

function subscribePageUrl() {
  return () => {};
}

function subscribeDesktopMq(onChange: () => void) {
  const mq = window.matchMedia("(min-width: 768px)");
  mq.addEventListener("change", onChange);
  return () => mq.removeEventListener("change", onChange);
}

function getDesktopMqSnapshot() {
  return window.matchMedia("(min-width: 768px)").matches;
}

function getDesktopMqServerSnapshot() {
  return false;
}

export default function LiveStreamShareButton({
  sharePath = "/live",
  shareTitle = LIVE_HEADLINE,
  shareText = LIVE_DESCRIPTION,
  useCurrentUrl = false,
  className = "",
}: Props) {
  const [copied, setCopied] = useState(false);
  const [dialogOpen, setDialogOpen] = useState(false);
  const isDesktop = useSyncExternalStore(
    subscribeDesktopMq,
    getDesktopMqSnapshot,
    getDesktopMqServerSnapshot,
  );

  const currentUrl = useSyncExternalStore(
    subscribePageUrl,
    () => window.location.href,
    () => "",
  );

  const pageUrl = useCurrentUrl ? currentUrl : resolveShareUrl(sharePath);

  const onShare = useCallback(async () => {
    if (isDesktop) {
      setDialogOpen(true);
      return;
    }

    const url = pageUrl || resolveShareUrl(sharePath);
    const shareData = {
      title: shareTitle,
      text: shareText || shareTitle,
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
  }, [isDesktop, pageUrl, sharePath, shareText, shareTitle]);

  return (
    <>
      <button
        type="button"
        onClick={() => void onShare()}
        className={`fpn-live-share-cta w-auto max-w-none shrink-0 ${className}`.trim()}
        aria-label={copied ? "Link copied" : "Share"}
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
      <ShareSocialDialog
        open={dialogOpen}
        onClose={() => setDialogOpen(false)}
        pageUrl={pageUrl || resolveShareUrl(sharePath)}
        title={shareTitle}
        text={shareText}
      />
    </>
  );
}
