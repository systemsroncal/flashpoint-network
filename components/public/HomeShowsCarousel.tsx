"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useRef } from "react";

export type HomeShowCarouselItem = {
  id: string;
  title: string;
  hostName: string | null;
  imageUrl: string;
  href: string;
};

const BORDER_COLORS = ["#ffeebe", "#ffbebe", "#bed5ff", "#bee8ff", "#e8beff"];
const AUTOPLAY_MS = 4200;

/**
 * Full-bleed Original Live Shows carousel (Figma desktop 625:8349 / mobile 667:16098).
 * Artwork already includes title/copy — no text overlay.
 */
export default function HomeShowsCarousel({
  items,
}: {
  items: HomeShowCarouselItem[];
}) {
  const scrollerRef = useRef<HTMLDivElement>(null);
  const pausedRef = useRef(false);

  const scrollByCard = (dir: -1 | 1) => {
    const el = scrollerRef.current;
    if (!el) return;
    const card = el.querySelector<HTMLElement>("[data-show-card]");
    const step = (card?.offsetWidth || 280) + 20;
    const max = el.scrollWidth - el.clientWidth;
    let next = el.scrollLeft + dir * step;
    if (dir > 0 && next >= max - 4) next = 0;
    if (dir < 0 && next <= 0) next = max;
    el.scrollTo({ left: next, behavior: "smooth" });
  };

  useEffect(() => {
    if (items.length < 2) return;
    const id = window.setInterval(() => {
      if (pausedRef.current) return;
      scrollByCard(1);
    }, AUTOPLAY_MS);
    return () => window.clearInterval(id);
  }, [items.length]);

  if (items.length === 0) return null;

  return (
    <section className="w-full bg-[#101011] py-14 text-white md:py-16 lg:py-20">
      <div className="mx-auto w-full max-w-[1920px] px-4 md:px-8 lg:px-16 xl:px-20">
        <div className="mx-auto max-w-3xl text-center">
          <h2 className="font-article text-[2rem] font-bold tracking-tight md:text-[2.7rem]">
            Original Live Shows
          </h2>
          <p className="mt-4 text-[15px] leading-relaxed text-white/85 md:text-[1.05rem]">
            Watch FlashPoint Network live and explore powerful shows, trusted
            voices, faith-based programming, interviews, and original series —
            all in one destination.
          </p>
        </div>
      </div>

      <div
        className="relative mt-10 w-full md:mt-12"
        onMouseEnter={() => {
          pausedRef.current = true;
        }}
        onMouseLeave={() => {
          pausedRef.current = false;
        }}
        onFocusCapture={() => {
          pausedRef.current = true;
        }}
        onBlurCapture={() => {
          pausedRef.current = false;
        }}
      >
        <button
          type="button"
          onClick={() => scrollByCard(-1)}
          className="absolute left-2 top-1/2 z-10 flex h-11 w-11 -translate-y-1/2 items-center justify-center rounded-full bg-white/15 text-2xl text-white backdrop-blur-sm transition hover:bg-white/25 lg:left-4"
          aria-label="Previous shows"
        >
          ‹
        </button>
        <button
          type="button"
          onClick={() => scrollByCard(1)}
          className="absolute right-2 top-1/2 z-10 flex h-11 w-11 -translate-y-1/2 items-center justify-center rounded-full bg-white/15 text-2xl text-white backdrop-blur-sm transition hover:bg-white/25 lg:right-4"
          aria-label="Next shows"
        >
          ›
        </button>

        <div
          ref={scrollerRef}
          className="flex w-full snap-x snap-mandatory gap-4 overflow-x-auto scroll-smooth px-4 py-4 [-ms-overflow-style:none] [scrollbar-width:none] md:gap-5 md:px-8 lg:px-16 xl:px-20 [&::-webkit-scrollbar]:hidden"
        >
          {items.map((item, index) => (
            <Link
              key={item.id}
              href={item.href}
              data-show-card
              aria-label={item.title}
              className="relative aspect-[336/525] w-full shrink-0 snap-center overflow-hidden rounded-[19px] border-2 shadow-[0_8px_24px_rgba(0,0,0,0.28)] transition-[transform,box-shadow] duration-300 ease-in-out hover:z-10 hover:scale-[1.06] hover:shadow-[0_10px_28px_rgba(255,255,255,0.28)] min-[345px]:w-[calc((100%-1rem)/2)] md:w-[300px] lg:w-[336px]"
              style={{
                borderColor: BORDER_COLORS[index % BORDER_COLORS.length],
              }}
            >
              <Image
                src={item.imageUrl}
                alt=""
                fill
                className="object-cover"
                sizes="(max-width:344px) 100vw, (max-width:768px) 50vw, 336px"
              />
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}
