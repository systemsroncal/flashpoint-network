"use client";

import BrightcoveLivePlayer from "@/components/public/BrightcoveLivePlayer";
import LiveHeroCopy, { LIVE_HEADLINE } from "@/components/public/LiveHeroCopy";

export default function HomeLiveHero() {
  return (
    <section className="relative bg-black text-white">
      <div aria-hidden className="pointer-events-none absolute inset-0 opacity-40">
        <span className="absolute inset-0 bg-gradient-to-r from-black via-black/85 to-[#1b2a64]/55" />
        <span className="absolute inset-0 bg-[radial-gradient(ellipse_at_30%_50%,rgba(184,5,41,0.18),transparent_55%)]" />
      </div>

      <div className="relative mx-auto flex max-w-[1440px] flex-col-reverse items-center gap-6 px-4 py-8 md:flex-row md:gap-12 md:px-8 md:py-10 lg:gap-[49px] lg:px-10 lg:py-12">
        <div className="relative w-full max-w-[700px] shrink-0 md:w-[52%]">
          <div
            data-live-hero=""
            className="relative aspect-[700/394] w-full overflow-hidden rounded-[15px]"
          >
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
  );
}
