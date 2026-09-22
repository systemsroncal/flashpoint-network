"use client";

import Link from "next/link";
import BrightcoveLivePlayer from "@/components/public/BrightcoveLivePlayer";
import LiveTvIcon from "@/components/public/LiveTvIcon";
import Home2HeroLogos from "@/components/public/Home2HeroLogos";
import { LIVE_HEADLINE } from "@/components/public/LiveHeroCopy";

/**
 * Full-width network hero (Figma 625:8349 / mobile 667:16098).
 * Headline and partner row are centered; the live player spans the content width.
 */
export default function Home2LiveHero() {
  return (
    <section className="relative w-full bg-black text-white">
      <div className="mx-auto flex w-full max-w-[1920px] flex-col items-center px-4 pb-12 pt-8 text-center md:px-8 md:pb-16 md:pt-12 lg:px-16 lg:pt-14 xl:px-20">
        <h1 className="font-home-title text-[1.85rem] font-bold uppercase leading-[1.08] tracking-tight text-white sm:text-[2.4rem] md:text-[3rem]">
          One Network.
          <br />
          Five Reasons to Watch.
        </h1>
        <p className="mt-4 max-w-[735px] text-[15px] leading-relaxed text-white/70 md:text-[19px]">
          Live Shows • Original Programs • News • Faith • Culture
        </p>

        <div
          data-live-hero=""
          className="relative mt-8 w-full max-w-[1125px] overflow-hidden rounded-[16px] md:mt-10 md:rounded-[24px]"
        >
          <BrightcoveLivePlayer
            title={LIVE_HEADLINE}
            autoplay
            className="aspect-[1125/633] rounded-[16px] md:rounded-[24px]"
          />
        </div>

        <Link href="/live" className="mt-6 inline-flex md:mt-8">
          <span className="fpn-live-cta fpn-live-cta--hero">
            <LiveTvIcon />
            WE ARE LIVE
          </span>
        </Link>

        <Home2HeroLogos className="mt-8 w-full md:mt-10" />
      </div>
    </section>
  );
}
