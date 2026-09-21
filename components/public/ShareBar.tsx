"use client";

import Image from "next/image";
import { useEffect, useMemo, useState } from "react";
import { getSiteUrl } from "@/lib/env";

type Props = {
  title: string;
  urlPath: string;
  excerpt?: string | null;
  orientation?: "vertical" | "horizontal";
  /** Compact row under article hero (no “Share” heading). */
  variant?: "default" | "strip";
};

type NetworkKey = "linkedin" | "threads" | "facebook" | "x";

const NETWORKS: {
  key: NetworkKey;
  label: string;
  icon: string;
}[] = [
  { key: "linkedin", label: "Linkedin", icon: "/brand/share/linkedin.svg" },
  { key: "threads", label: "Threads", icon: "/brand/share/threads.svg" },
  { key: "facebook", label: "Facebook", icon: "/brand/share/facebook.svg" },
  { key: "x", label: "X", icon: "/brand/share/x.svg" },
];

function absolutePageUrl(urlPath: string, liveUrl?: string) {
  if (liveUrl) return liveUrl;
  const site = getSiteUrl().replace(/\/$/, "");
  const path = urlPath.startsWith("/") ? urlPath : `/${urlPath}`;
  return `${site}${path}`;
}

function buildNetworkHref(
  key: NetworkKey,
  pageUrl: string,
  title: string,
  excerpt?: string | null,
) {
  const url = encodeURIComponent(pageUrl);
  const titleEnc = encodeURIComponent(title);
  const body = excerpt?.trim() ? `${title} — ${excerpt.trim()}` : title;
  const textEnc = encodeURIComponent(body);

  switch (key) {
    case "linkedin":
      return `https://www.linkedin.com/sharing/share-offsite/?url=${url}`;
    case "threads":
      return `https://www.threads.net/intent/post?text=${textEnc}%20${url}`;
    case "facebook":
      return `https://www.facebook.com/sharer/sharer.php?u=${url}`;
    case "x":
      return `https://twitter.com/intent/tweet?url=${url}&text=${titleEnc}`;
    default:
      return pageUrl;
  }
}

function itemClass(
  orientation: "vertical" | "horizontal",
  variant: "default" | "strip",
) {
  if (variant === "strip") {
    return "inline-flex items-center gap-2 py-1 text-[14px] font-medium text-black hover:text-[var(--fpn-rojo)]";
  }
  return orientation === "vertical"
    ? "inline-flex items-center gap-3 py-1.5 text-[15px] font-medium text-black hover:text-[var(--fpn-rojo)]"
    : "inline-flex items-center gap-2.5 text-[15px] font-medium text-black hover:text-[var(--fpn-rojo)]";
}

export default function ShareBar({
  title,
  urlPath,
  excerpt,
  orientation = "horizontal",
  variant = "default",
}: Props) {
  const [pageUrl, setPageUrl] = useState(() => absolutePageUrl(urlPath));
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    // Prefer the live browser URL so query/hash are included when present.
    setPageUrl(
      window.location.href ||
        `${window.location.origin}${urlPath.startsWith("/") ? urlPath : `/${urlPath}`}`,
    );
  }, [urlPath]);

  const networkHrefs = useMemo(() => {
    const base = absolutePageUrl(urlPath, pageUrl);
    return Object.fromEntries(
      NETWORKS.map((n) => [n.key, buildNetworkHref(n.key, base, title, excerpt)]),
    ) as Record<NetworkKey, string>;
  }, [pageUrl, urlPath, title, excerpt]);

  const onNativeShare = async () => {
    const url = absolutePageUrl(urlPath, pageUrl || window.location.href);
    if (navigator.share) {
      try {
        await navigator.share({
          title,
          text: excerpt?.trim() || title,
          url,
        });
        return;
      } catch {
        /* dismissed — fall through to copy */
      }
    }
    try {
      await navigator.clipboard.writeText(url);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 2000);
    } catch {
      /* ignore */
    }
  };

  const networkLinks = NETWORKS.map((item) => (
    <a
      key={item.key}
      href={networkHrefs[item.key]}
      target="_blank"
      rel="noopener noreferrer"
      aria-label={`Share on ${item.label}`}
      className={itemClass(orientation, variant)}
    >
      <Image src={item.icon} alt="" width={18} height={18} />
      {item.label}
    </a>
  ));

  const actions = (
    <>
      <button
        type="button"
        onClick={onNativeShare}
        aria-label={copied ? "Link copied" : "Share or copy link"}
        className={itemClass(orientation, variant)}
      >
        <Image src="/brand/share/share.svg" alt="" width={18} height={18} />
        {copied ? "Copied" : "Share"}
      </button>
      <button
        type="button"
        onClick={() => window.print()}
        aria-label="Print this page"
        className={itemClass(orientation, variant)}
      >
        <Image src="/brand/share/print.svg" alt="" width={18} height={18} />
        Print
      </button>
    </>
  );

  if (variant === "strip") {
    return (
      <div className="flex flex-wrap items-center justify-center gap-x-5 gap-y-2 sm:gap-x-8">
        {networkLinks}
        {actions}
      </div>
    );
  }

  if (orientation === "vertical") {
    return (
      <div className="flex flex-col gap-3">
        <p className="font-article text-[1.35rem] font-black tracking-tight text-black">
          Share
        </p>
        <ul className="flex flex-col gap-1">
          {NETWORKS.map((item) => (
            <li key={item.key}>
              <a
                href={networkHrefs[item.key]}
                target="_blank"
                rel="noopener noreferrer"
                aria-label={`Share on ${item.label}`}
                className={itemClass(orientation, variant)}
              >
                <Image src={item.icon} alt="" width={18} height={18} />
                {item.label}
              </a>
            </li>
          ))}
          <li>
            <button
              type="button"
              onClick={onNativeShare}
              aria-label={copied ? "Link copied" : "Share or copy link"}
              className={itemClass(orientation, variant)}
            >
              <Image src="/brand/share/share.svg" alt="" width={18} height={18} />
              {copied ? "Copied" : "Share"}
            </button>
          </li>
          <li>
            <button
              type="button"
              onClick={() => window.print()}
              aria-label="Print this page"
              className={itemClass(orientation, variant)}
            >
              <Image src="/brand/share/print.svg" alt="" width={18} height={18} />
              Print
            </button>
          </li>
        </ul>
      </div>
    );
  }

  return (
    <div>
      <p className="font-article text-[1.75rem] font-black tracking-tight text-black md:text-[2rem]">
        Share
      </p>
      <div className="mt-4 flex flex-wrap items-center gap-x-6 gap-y-3">
        {networkLinks}
        {actions}
      </div>
    </div>
  );
}
