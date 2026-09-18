"use client";

import Link from "next/link";
import { type MouseEvent, useEffect, useRef, useState } from "react";
import BrightcoveLivePlayer from "@/components/public/BrightcoveLivePlayer";
import LiveHeroCopy, { LIVE_HEADLINE } from "@/components/public/LiveHeroCopy";
import LiveTvIcon from "@/components/public/LiveTvIcon";
import {
  dismissLivePipFor24Hours,
  isLivePipDismissed,
} from "@/lib/live/pip-dismiss";

export default function HomeLiveHero() {
  const heroRef = useRef<HTMLElement>(null);
  const [isMobile, setIsMobile] = useState(false);
  const [heroInView, setHeroInView] = useState(true);
  const [pipDismissed, setPipDismissed] = useState(false);

  useEffect(() => {
    setPipDismissed(isLivePipDismissed());
  }, []);

  useEffect(() => {
    const media = window.matchMedia("(max-width: 767px)");
    const syncMobile = () => setIsMobile(media.matches);
    syncMobile();
    media.addEventListener("change", syncMobile);
    return () => media.removeEventListener("change", syncMobile);
  }, []);

  useEffect(() => {
    const hero = heroRef.current;
    if (!hero) return;

    const observer = new IntersectionObserver(
      ([entry]) => setHeroInView(entry.isIntersecting),
      { threshold: 0.12, rootMargin: "-48px 0px 0px 0px" },
    );

    observer.observe(hero);
    return () => observer.disconnect();
  }, []);

  const pipVisible = isMobile && !heroInView && !pipDismissed;

  const closePip = (e: MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    dismissLivePipFor24Hours();
    setPipDismissed(true);
  };

  return (
    <>
      <section ref={heroRef} className="relative bg-black text-white">
        <div aria-hidden className="pointer-events-none absolute inset-0 opacity-40">
          <span className="absolute inset-0 bg-gradient-to-r from-black via-black/85 to-[#1b2a64]/55" />
          <span className="absolute inset-0 bg-[radial-gradient(ellipse_at_30%_50%,rgba(184,5,41,0.18),transparent_55%)]" />
        </div>

        <div className="relative mx-auto flex max-w-[1440px] flex-col-reverse items-center gap-6 px-4 py-8 md:flex-row md:gap-12 md:px-8 md:py-10 lg:gap-[49px] lg:px-10 lg:py-12">
          <div className="relative w-full max-w-[700px] shrink-0 md:w-[52%]">
            <div className="relative aspect-[700/394] w-full overflow-hidden rounded-[15px]">
              <BrightcoveLivePlayer
                title={LIVE_HEADLINE}
                autoplay
                className="h-full w-full rounded-[15px]"
              />
            </div>
          </div>

          <LiveHeroCopy href="/live" />
        </div>
      </section>

      {pipVisible ? (
        <div className="fpn-live-pip-wrap md:hidden">
          <button
            type="button"
            className="fpn-live-pip-close"
            onClick={closePip}
            aria-label="Hide live mini player for 24 hours"
          >
            ×
          </button>
          <Link href="/live" className="fpn-live-pip-card" aria-label="Open FlashPoint TV">
            <span className="fpn-live-pip-video">
              <span className="fpn-live-pip-badge">LIVE</span>
              <BrightcoveLivePlayer
                title={LIVE_HEADLINE}
                autoplay
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
      ) : null}
    </>
  );
}
