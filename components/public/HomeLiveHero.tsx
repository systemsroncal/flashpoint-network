"use client";

import Link from "next/link";
import { type MouseEvent, useEffect, useRef, useState } from "react";
import BrightcoveLivePlayer from "@/components/public/BrightcoveLivePlayer";
import LiveTvIcon from "@/components/public/LiveTvIcon";
import {
  dismissLivePipFor24Hours,
  isLivePipDismissed,
} from "@/lib/live/pip-dismiss";

function WatchLiveLabel() {
  return (
    <>
      Watch Live
      <svg width="21" height="20" viewBox="0 0 21 20" fill="none" aria-hidden>
        <path
          d="M16.6467 10.3465L7.81454 16.2347C7.62307 16.3623 7.36437 16.3106 7.23672 16.1191C7.1911 16.0507 7.16675 15.9703 7.16675 15.888V4.11174C7.16675 3.88162 7.3533 3.69507 7.58341 3.69507C7.66567 3.69507 7.7461 3.71942 7.81454 3.76505L16.6467 9.65317C16.8382 9.78084 16.8899 10.0395 16.7622 10.231C16.7317 10.2768 16.6925 10.316 16.6467 10.3465Z"
          fill="#0A0A0A"
        />
      </svg>
    </>
  );
}

export default function HomeLiveHero({ headlineDate }: { headlineDate: string }) {
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

  const headline = `FlashPoint Live | ${headlineDate}`;

  const pipVisible =
    isMobile && !heroInView && !pipDismissed;

  const closePip = (e: MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    dismissLivePipFor24Hours();
    setPipDismissed(true);
  };

  return (
    <>
      <section
        ref={heroRef}
        className="relative bg-black text-white"
      >
        <div aria-hidden className="pointer-events-none absolute inset-0 opacity-40">
          <span className="absolute inset-0 bg-gradient-to-r from-black via-black/85 to-[#1b2a64]/55" />
          <span className="absolute inset-0 bg-[radial-gradient(ellipse_at_30%_50%,rgba(255,73,13,0.18),transparent_55%)]" />
        </div>

        <div className="relative mx-auto flex max-w-[1440px] flex-col items-center gap-8 px-4 py-10 md:flex-row md:gap-12 md:px-8 lg:gap-[49px] lg:px-10 lg:py-12">
          <div className="relative w-full max-w-[700px] shrink-0 md:w-[52%]">
            <div className="relative aspect-[700/394] w-full overflow-hidden rounded-[15px]">
              <BrightcoveLivePlayer
                title={headline}
                autoplay
                className="h-full w-full rounded-[15px]"
              />
            </div>
          </div>

          <div className="w-full md:flex-1 md:max-w-[602px]">
            <Link href="/live" className="fpn-live-cta fpn-live-cta--hero">
              <LiveTvIcon />
              <WatchLiveLabel />
            </Link>
            <p className="mt-5 text-[22px] font-extrabold italic leading-tight tracking-tight text-white md:text-[29px]">
              Now: FlashPoint Live
            </p>
            <h1 className="mt-4 max-w-xl font-article text-[2rem] font-bold leading-[1.15] tracking-tight text-white md:text-[2.75rem]">
              {headline}
            </h1>
          </div>
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
          <Link href="/live" className="fpn-live-pip-card" aria-label="Open FlashPoint Live">
            <span className="fpn-live-pip-video">
              <span className="fpn-live-pip-badge">LIVE</span>
              <BrightcoveLivePlayer
                title={headline}
                autoplay
                className="fpn-live-pip-player"
              />
            </span>
            <span className="fpn-live-pip-copy">
              <span className="fpn-live-pip-title">FlashPoint Live</span>
              <span className="fpn-live-pip-action">
                <LiveTvIcon />
                <span>Watch Live</span>
              </span>
            </span>
          </Link>
        </div>
      ) : null}
    </>
  );
}
