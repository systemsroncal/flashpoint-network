"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { type MouseEvent, useEffect, useState } from "react";
import BrightcoveLivePlayer from "@/components/public/BrightcoveLivePlayer";
import { LIVE_HEADLINE } from "@/components/public/LiveHeroCopy";
import LiveTvIcon from "@/components/public/LiveTvIcon";
import {
  clearLivePipDismiss,
  dismissLivePip,
  isLivePipDismissed,
  LIVE_HERO_ATTR,
} from "@/lib/live/pip-dismiss";

const SCROLL_SHOW_PX = 160;

function isLiveHeroPath(pathname: string | null): boolean {
  return (
    pathname === "/" || pathname === "/home2" || pathname === "/live"
  );
}

/**
 * Sitewide floating live mini-player (desktop + mobile).
 * - On `/`, `/home2`, and `/live`: shows when the main live hero scrolls out of view.
 *   Those pages already have a sounding player, so the mini player stays muted.
 * - Elsewhere: shows after a short scroll, unless the user closed it.
 * - Close hides it; scrolling past the hero on `/` or `/live` brings it back
 *   (and re-enables it for the rest of the site).
 */
export default function GlobalLivePip() {
  const pathname = usePathname();
  const heroPage = isLiveHeroPath(pathname);
  const [heroInView, setHeroInView] = useState(heroPage);
  const [scrolled, setScrolled] = useState(false);
  const [dismissed, setDismissed] = useState(false);
  /** Closed while the hero is already off-screen; resets when hero re-enters. */
  const [closedThisPass, setClosedThisPass] = useState(false);

  useEffect(() => {
    setDismissed(isLivePipDismissed());
    setClosedThisPass(false);
    if (heroPage) {
      setHeroInView(true);
    }
  }, [pathname, heroPage]);

  useEffect(() => {
    if (!heroPage) return;

    let observer: IntersectionObserver | null = null;
    let observed: Element | null = null;

    const attach = () => {
      const el = document.querySelector(`[${LIVE_HERO_ATTR}]`);
      if (!el || el === observed) return;
      observer?.disconnect();
      observed = el;
      observer = new IntersectionObserver(
        ([entry]) => {
          const inView = entry.isIntersecting;
          setHeroInView(inView);
          if (inView) {
            setClosedThisPass(false);
          }
        },
        { threshold: 0.12, rootMargin: "-48px 0px 0px 0px" },
      );
      observer.observe(el);
    };

    attach();
    const mo = new MutationObserver(attach);
    mo.observe(document.body, { childList: true, subtree: true });

    return () => {
      observer?.disconnect();
      mo.disconnect();
    };
  }, [heroPage, pathname]);

  useEffect(() => {
    if (heroPage) return;

    const onScroll = () => {
      setScrolled(window.scrollY > SCROLL_SHOW_PX);
    };
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, [heroPage, pathname]);

  useEffect(() => {
    if (!heroPage || heroInView || closedThisPass) return;
    // Scroll past live hero on home /live → show again sitewide.
    clearLivePipDismiss();
    setDismissed(false);
  }, [heroPage, heroInView, closedThisPass]);

  const pipVisible = heroPage
    ? !heroInView && !closedThisPass
    : scrolled && !dismissed;

  const closePip = (e: MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    dismissLivePip();
    setDismissed(true);
    setClosedThisPass(true);
  };

  if (!pipVisible) return null;

  return (
    <div className="fpn-live-pip-wrap">
      <button
        type="button"
        className="fpn-live-pip-close"
        onClick={closePip}
        aria-label="Hide live mini player"
      >
        ×
      </button>
      <Link
        href="/live"
        className="fpn-live-pip-card"
        aria-label="Open FlashPoint TV"
      >
        <span className="fpn-live-pip-video">
          <span className="fpn-live-pip-badge">LIVE</span>
          <BrightcoveLivePlayer
            title={LIVE_HEADLINE}
            autoplay
            muted={heroPage}
            className="fpn-live-pip-player"
          />
        </span>
        <span className="fpn-live-pip-copy">
          <span className="fpn-live-pip-title">FlashPoint TV</span>
          <span className="fpn-live-pip-action">
            <LiveTvIcon />
            <span>WE ARE LIVE</span>
          </span>
        </span>
      </Link>
    </div>
  );
}
