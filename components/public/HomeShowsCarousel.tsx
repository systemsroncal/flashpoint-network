"use client";

import Image from "next/image";
import Link from "next/link";
import { useRef } from "react";

export type HomeShowCarouselItem = {
  id: string;
  title: string;
  hostName: string | null;
  imageUrl: string;
  href: string;
};

const BORDER_COLORS = ["#ffeebe", "#ffbebe", "#bed5ff", "#bee8ff", "#e8beff"];

export default function HomeShowsCarousel({
  items,
}: {
  items: HomeShowCarouselItem[];
}) {
  const scrollerRef = useRef<HTMLDivElement>(null);

  const scrollByCard = (dir: -1 | 1) => {
    const el = scrollerRef.current;
    if (!el) return;
    const card = el.querySelector<HTMLElement>("[data-show-card]");
    const step = (card?.offsetWidth || 280) + 20;
    el.scrollBy({ left: dir * step, behavior: "smooth" });
  };

  if (items.length === 0) return null;

  return (
    <section className="bg-[#101011] px-4 py-14 text-white md:px-8 md:py-16 lg:px-10">
      <div className="mx-auto max-w-[1560px]">
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

        <div className="relative mt-10 md:mt-12">
          <button
            type="button"
            onClick={() => scrollByCard(-1)}
            className="absolute left-0 top-1/2 z-10 hidden h-10 w-10 -translate-y-1/2 items-center justify-center rounded-full bg-white/15 text-white backdrop-blur-sm transition hover:bg-white/25 md:flex lg:-left-2"
            aria-label="Previous shows"
          >
            ‹
          </button>
          <button
            type="button"
            onClick={() => scrollByCard(1)}
            className="absolute right-0 top-1/2 z-10 hidden h-10 w-10 -translate-y-1/2 items-center justify-center rounded-full bg-white/15 text-white backdrop-blur-sm transition hover:bg-white/25 md:flex lg:-right-2"
            aria-label="Next shows"
          >
            ›
          </button>

          <div
            ref={scrollerRef}
            className="flex snap-x snap-mandatory gap-4 overflow-x-auto scroll-smooth pb-2 [-ms-overflow-style:none] [scrollbar-width:none] md:gap-5 [&::-webkit-scrollbar]:hidden"
          >
            {items.map((item, index) => (
              <Link
                key={item.id}
                href={item.href}
                data-show-card
                className="relative aspect-[336/525] w-[min(78vw,300px)] shrink-0 snap-center overflow-hidden rounded-[19px] border-2 sm:w-[280px] md:w-[320px] lg:w-[336px]"
                style={{
                  borderColor: BORDER_COLORS[index % BORDER_COLORS.length],
                }}
              >
                <Image
                  src={item.imageUrl}
                  alt=""
                  fill
                  className="object-cover"
                  sizes="(max-width:768px) 78vw, 336px"
                />
                <span
                  className="absolute inset-0"
                  style={{
                    backgroundImage:
                      "linear-gradient(180deg, rgba(0,0,0,0) 55%, rgba(0,0,0,0.72) 100%)",
                  }}
                  aria-hidden
                />
                <span className="absolute inset-x-0 bottom-0 p-5 md:p-7">
                  <span className="block font-article text-xl font-extrabold leading-tight md:text-[1.65rem]">
                    {item.title}
                  </span>
                  {item.hostName ? (
                    <span className="mt-2 block truncate text-sm text-white/75">
                      {item.hostName}
                    </span>
                  ) : null}
                </span>
              </Link>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
