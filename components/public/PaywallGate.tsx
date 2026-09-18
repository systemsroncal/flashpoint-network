"use client";

import { useEffect, useMemo, useState } from "react";

const COOKIE = "fpn_free_views";
const MAX_TRACK = 40;

function readViewed(): string[] {
  if (typeof document === "undefined") return [];
  try {
    const raw = document.cookie
      .split("; ")
      .find((c) => c.startsWith(`${COOKIE}=`))
      ?.split("=")[1];
    if (!raw) return [];
    const parsed = JSON.parse(decodeURIComponent(raw));
    return Array.isArray(parsed)
      ? parsed.filter((x) => typeof x === "string").slice(0, MAX_TRACK)
      : [];
  } catch {
    return [];
  }
}

function writeViewed(ids: string[]) {
  const value = encodeURIComponent(JSON.stringify(ids.slice(0, MAX_TRACK)));
  const maxAge = 60 * 60 * 24 * 30;
  document.cookie = `${COOKIE}=${value}; path=/; max-age=${maxAge}; SameSite=Lax`;
}

export type PaywallGateProps = {
  postId: string;
  isPremium: boolean;
  enabled: boolean;
  freeArticleLimit: number;
  bypass: boolean;
  title: string;
  body: string;
  children: React.ReactNode;
};

export default function PaywallGate({
  postId,
  isPremium,
  enabled,
  freeArticleLimit,
  bypass,
  title,
  body,
  children,
}: PaywallGateProps) {
  const [locked, setLocked] = useState(false);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    if (bypass || !enabled) {
      setLocked(false);
      setReady(true);
      return;
    }

    const viewed = readViewed();
    const already = viewed.includes(postId);
    let next = viewed;
    if (!already) {
      next = [...viewed, postId];
      writeViewed(next);
    }

    if (isPremium) {
      setLocked(true);
    } else {
      const count = already ? viewed.length : next.length;
      setLocked(count > freeArticleLimit);
    }
    setReady(true);
  }, [bypass, enabled, freeArticleLimit, isPremium, postId]);

  const overlay = useMemo(() => {
    if (!locked) return null;
    return (
      <div className="absolute inset-x-0 bottom-0 z-10 flex flex-col justify-end">
        <div className="h-32 bg-gradient-to-b from-transparent to-white" />
        <div className="rounded-[12px] bg-[#F3F3F3] px-6 py-10 text-center shadow-sm">
          <h2 className="font-article text-2xl font-black tracking-tight md:text-[1.75rem]">
            {title}
          </h2>
          <p className="mx-auto mt-2 max-w-md text-sm text-black/70">{body}</p>
          <div className="mt-5 flex flex-wrap items-center justify-center gap-3">
            <p className="text-sm font-semibold text-black/60">
              Account signup is temporarily paused. Check back soon.
            </p>
          </div>
        </div>
      </div>
    );
  }, [body, locked, title]);

  return (
    <div className="relative">
      <div
        className={
          locked
            ? "max-h-[28rem] overflow-hidden [mask-image:linear-gradient(180deg,#000_55%,transparent)]"
            : undefined
        }
        aria-hidden={locked || undefined}
      >
        {children}
      </div>
      {ready ? overlay : null}
    </div>
  );
}
