"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import BrightcoveLivePlayer from "@/components/public/BrightcoveLivePlayer";
import LiveTvIcon from "@/components/public/LiveTvIcon";

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
  const [dockVisible, setDockVisible] = useState(false);

  useEffect(() => {
    const hero = heroRef.current;
    if (!hero) return;

    const media = window.matchMedia("(max-width: 767px)");
    const syncDock = (heroInView: boolean) => {
      setDockVisible(media.matches && !heroInView);
    };

    const observer = new IntersectionObserver(
      ([entry]) => {
        syncDock(entry.isIntersecting);
      },
      { threshold: 0.18 },
    );

    observer.observe(hero);
    const onMedia = () => {
      const rect = hero.getBoundingClientRect();
      const inView = rect.bottom > 80 && rect.top < window.innerHeight;
      syncDock(inView);
    };
    media.addEventListener("change", onMedia);

    return () => {
      observer.disconnect();
      media.removeEventListener("change", onMedia);
    };
  }, []);

  const headline = `FlashPoint Live | ${headlineDate}`;

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

      {dockVisible ? (
        <Link href="/live" className="fpn-live-dock md:hidden">
          <span className="fpn-live-dock-screen" aria-hidden>
            <LiveTvIcon />
          </span>
          <span className="fpn-live-cta fpn-live-cta--dock">
            <WatchLiveLabel />
          </span>
        </Link>
      ) : null}
    </>
  );
}
