"use client";

import Link from "next/link";
import { useEffect, useId, useRef, useState } from "react";
import BrightcoveLivePlayer from "@/components/public/BrightcoveLivePlayer";
import LiveTvIcon from "@/components/public/LiveTvIcon";

function WatchLiveLabel({ compact }: { compact?: boolean }) {
  return (
    <>
      Watch Live
      <svg
        width={compact ? 18 : 21}
        height={compact ? 17 : 20}
        viewBox="0 0 21 20"
        fill="none"
        aria-hidden
      >
        <path
          d="M16.6467 10.3465L7.81454 16.2347C7.62307 16.3623 7.36437 16.3106 7.23672 16.1191C7.1911 16.0507 7.16675 15.9703 7.16675 15.888V4.11174C7.16675 3.88162 7.3533 3.69507 7.58341 3.69507C7.66567 3.69507 7.7461 3.71942 7.81454 3.76505L16.6467 9.65317C16.8382 9.78084 16.8899 10.0395 16.7622 10.231C16.7317 10.2768 16.6925 10.316 16.6467 10.3465Z"
          fill="#0A0A0A"
        />
      </svg>
    </>
  );
}

function LiveMobileSheet({
  open,
  onClose,
  headline,
  titleId,
}: {
  open: boolean;
  onClose: () => void;
  headline: string;
  titleId: string;
}) {
  useEffect(() => {
    if (!open) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    document.addEventListener("keydown", onKey);
    return () => {
      document.body.style.overflow = prev;
      document.removeEventListener("keydown", onKey);
    };
  }, [open, onClose]);

  if (!open) return null;

  return (
    <div
      className="fpn-live-sheet md:hidden"
      role="dialog"
      aria-modal="true"
      aria-labelledby={titleId}
    >
      <div className="fpn-live-sheet-header">
        <div className="fpn-live-cta fpn-live-cta--sheet">
          <LiveTvIcon />
          Live
        </div>
        <button
          type="button"
          onClick={onClose}
          className="fpn-live-sheet-close"
          aria-label="Close live video"
        >
          ×
        </button>
      </div>
      <div className="fpn-live-sheet-body">
        <BrightcoveLivePlayer
          title={headline}
          autoplay
          className="w-full overflow-hidden rounded-[12px]"
        />
        <p id={titleId} className="mt-4 font-article text-xl font-bold leading-tight">
          {headline}
        </p>
        <p className="mt-1 text-sm text-white/70">Now: FlashPoint Live</p>
        <Link
          href="/live"
          className="mt-5 inline-flex text-sm font-semibold text-[var(--fpn-rojo)] underline"
        >
          Open full live page
        </Link>
      </div>
    </div>
  );
}

export default function HomeLiveHero({ headlineDate }: { headlineDate: string }) {
  const heroRef = useRef<HTMLElement>(null);
  const titleId = useId();
  const [dockVisible, setDockVisible] = useState(false);
  const [sheetOpen, setSheetOpen] = useState(false);

  useEffect(() => {
    const hero = heroRef.current;
    if (!hero) return;

    const media = window.matchMedia("(max-width: 767px)");
    const syncDock = (heroInView: boolean) => {
      setDockVisible(media.matches && !heroInView && !sheetOpen);
    };

    const observer = new IntersectionObserver(
      ([entry]) => {
        syncDock(entry.isIntersecting);
      },
      { threshold: 0.12, rootMargin: "-48px 0px 0px 0px" },
    );

    observer.observe(hero);
    const onMedia = () => {
      const rect = hero.getBoundingClientRect();
      const inView = rect.bottom > 72 && rect.top < window.innerHeight * 0.85;
      syncDock(inView);
    };
    media.addEventListener("change", onMedia);
    onMedia();

    return () => {
      observer.disconnect();
      media.removeEventListener("change", onMedia);
    };
  }, [sheetOpen]);

  const headline = `FlashPoint Live | ${headlineDate}`;

  const openSheet = () => {
    setSheetOpen(true);
    setDockVisible(false);
  };

  return (
    <>
      <section
        ref={heroRef}
        className="relative overflow-hidden bg-black text-white"
      >
        <div aria-hidden className="pointer-events-none absolute inset-0 opacity-40">
          <span className="absolute inset-0 bg-gradient-to-r from-black via-black/85 to-[#1b2a64]/55" />
          <span className="absolute inset-0 bg-[radial-gradient(ellipse_at_30%_50%,rgba(255,73,13,0.18),transparent_55%)]" />
        </div>

        <div className="relative mx-auto flex max-w-[1440px] flex-col items-center gap-8 px-4 py-10 md:flex-row md:gap-12 md:px-8 lg:gap-[49px] lg:px-10 lg:py-12">
          <div className="relative w-full max-w-[700px] shrink-0 overflow-hidden rounded-[15px] md:w-[52%]">
            <BrightcoveLivePlayer
              title={headline}
              autoplay
              className="aspect-[700/394] w-full rounded-[15px]"
            />
          </div>

          <div className="w-full md:flex-1 md:max-w-[602px]">
            <Link href="/live" className="fpn-live-cta fpn-live-cta--hero hidden md:inline-flex">
              <LiveTvIcon />
              <WatchLiveLabel />
            </Link>
            <button
              type="button"
              onClick={openSheet}
              className="fpn-live-cta fpn-live-cta--hero md:hidden"
            >
              <LiveTvIcon />
              <WatchLiveLabel />
            </button>
            <p className="mt-5 text-[22px] font-extrabold italic leading-tight tracking-tight text-white md:text-[29px]">
              Now: FlashPoint Live
            </p>
            <h1 className="mt-4 max-w-xl font-article text-[2rem] font-bold leading-[1.15] tracking-tight text-white md:text-[2.75rem]">
              {headline}
            </h1>
          </div>
        </div>
      </section>

      {dockVisible ? (
        <button
          type="button"
          className="fpn-live-dock fpn-live-dock--enter md:hidden"
          onClick={openSheet}
          aria-label="Watch FlashPoint Live"
        >
          <span className="fpn-live-dock-screen" aria-hidden>
            <span className="fpn-live-dock-screen-inner" />
            <span className="fpn-live-dock-badge">LIVE</span>
            <span className="fpn-live-dock-screen-icon">
              <LiveTvIcon />
            </span>
          </span>
          <span className="fpn-live-dock-copy">
            <span className="fpn-live-dock-title">FlashPoint Live</span>
            <span className="fpn-live-cta fpn-live-cta--dock">
              <WatchLiveLabel compact />
            </span>
          </span>
        </button>
      ) : null}

      <LiveMobileSheet
        open={sheetOpen}
        onClose={() => setSheetOpen(false)}
        headline={headline}
        titleId={titleId}
      />
    </>
  );
}
