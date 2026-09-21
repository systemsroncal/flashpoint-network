"use client";

import Image from "next/image";
import Link from "next/link";
import { useCallback, useEffect, useMemo, useRef } from "react";

export type HomeShowCarouselItem = {
  id: string;
  title: string;
  hostName: string | null;
  imageUrl: string;
  href?: string;
};

const BORDER_COLORS = ["#ffeebe", "#ffbebe", "#bed5ff", "#bee8ff", "#e8beff"];
const AUTOPLAY_MS = 2400;
const DRAG_THRESHOLD_PX = 4;

const CARD_HOVER =
  "shadow-[0_8px_24px_rgba(0,0,0,0.28)] transition-[transform,box-shadow] duration-[550ms] ease-[cubic-bezier(0.22,1,0.36,1)] delay-150 hover:delay-75 hover:scale-[1.015] hover:shadow-[0_8px_22px_rgba(255,255,255,0.14)]";

/**
 * Full-bleed Original Live Shows carousel (Figma desktop 625:8349 / mobile 667:16098).
 * Artwork already includes title/copy — no text overlay.
 */
export default function HomeShowsCarousel({
  items,
  linkable = true,
}: {
  items: HomeShowCarouselItem[];
  /** When false, cards are display-only (e.g. /home2 network listing). */
  linkable?: boolean;
}) {
  const scrollerRef = useRef<HTMLDivElement>(null);
  const pausedRef = useRef(false);
  const draggingRef = useRef(false);
  const dragStateRef = useRef({
    pointerId: -1,
    startX: 0,
    startScrollLeft: 0,
    moved: false,
  });
  const loopReadyRef = useRef(false);

  const loopItems = useMemo(() => {
    if (items.length === 0) return [];
    const tripled = [...items, ...items, ...items];
    return tripled.map((item, index) => ({
      ...item,
      loopKey: `${item.id}-${index}`,
    }));
  }, [items]);

  const getSegmentWidth = useCallback((el: HTMLDivElement) => {
    return el.scrollWidth / 3;
  }, []);

  const normalizeLoopScroll = useCallback(() => {
    const el = scrollerRef.current;
    if (!el || items.length === 0) return;
    const segment = getSegmentWidth(el);
    if (segment <= 0) return;

    const left = el.scrollLeft;
    if (left < segment * 0.15) {
      el.scrollLeft = left + segment;
    } else if (left > segment * 2.85) {
      el.scrollLeft = left - segment;
    }
  }, [getSegmentWidth, items.length]);

  const scrollByCard = useCallback(
    (dir: -1 | 1, behavior: ScrollBehavior = "smooth") => {
      const el = scrollerRef.current;
      if (!el) return;
      const card = el.querySelector<HTMLElement>("[data-show-card]");
      const gap =
        parseFloat(getComputedStyle(el).gap || "0") ||
        parseFloat(getComputedStyle(el).columnGap || "0") ||
        16;
      const step = (card?.offsetWidth || 280) + gap;
      el.scrollTo({ left: el.scrollLeft + dir * step, behavior });
    },
    [],
  );

  const initLoopPosition = useCallback(() => {
    const el = scrollerRef.current;
    if (!el || items.length === 0) return;
    const segment = getSegmentWidth(el);
    if (segment > 0) {
      el.scrollLeft = segment;
      loopReadyRef.current = true;
    }
  }, [getSegmentWidth, items.length]);

  useEffect(() => {
    const el = scrollerRef.current;
    if (!el || items.length === 0) return;

    initLoopPosition();

    const ro = new ResizeObserver(() => {
      if (!draggingRef.current) initLoopPosition();
    });
    ro.observe(el);

    const onScroll = () => {
      if (!draggingRef.current) normalizeLoopScroll();
    };
    el.addEventListener("scroll", onScroll, { passive: true });
    el.addEventListener("scrollend", onScroll);

    return () => {
      ro.disconnect();
      el.removeEventListener("scroll", onScroll);
      el.removeEventListener("scrollend", onScroll);
    };
  }, [items.length, initLoopPosition, normalizeLoopScroll]);

  useEffect(() => {
    if (items.length < 2) return;
    const id = window.setInterval(() => {
      if (pausedRef.current || draggingRef.current) return;
      scrollByCard(1, "smooth");
    }, AUTOPLAY_MS);
    return () => window.clearInterval(id);
  }, [items.length, scrollByCard]);

  const endDragSession = useCallback(() => {
    const el = scrollerRef.current;
    draggingRef.current = false;
    if (el) {
      el.classList.add("scroll-smooth", "snap-x", "snap-mandatory");
    }
    normalizeLoopScroll();
    window.setTimeout(() => {
      pausedRef.current = false;
    }, 350);
  }, [normalizeLoopScroll]);

  const onPointerDown = (e: React.PointerEvent<HTMLDivElement>) => {
    if (e.button !== 0) return;
    const el = scrollerRef.current;
    if (!el) return;

    dragStateRef.current = {
      pointerId: e.pointerId,
      startX: e.clientX,
      startScrollLeft: el.scrollLeft,
      moved: false,
    };
    draggingRef.current = true;
    pausedRef.current = true;

    el.classList.remove("scroll-smooth", "snap-x", "snap-mandatory");

    const onMove = (ev: PointerEvent) => {
      if (ev.pointerId !== dragStateRef.current.pointerId) return;
      const dx = ev.clientX - dragStateRef.current.startX;
      if (Math.abs(dx) > DRAG_THRESHOLD_PX) {
        dragStateRef.current.moved = true;
      }
      el.scrollLeft = dragStateRef.current.startScrollLeft - dx;
    };

    const onUp = (ev: PointerEvent) => {
      if (ev.pointerId !== dragStateRef.current.pointerId) return;
      window.removeEventListener("pointermove", onMove);
      window.removeEventListener("pointerup", onUp);
      window.removeEventListener("pointercancel", onUp);
      endDragSession();
    };

    window.addEventListener("pointermove", onMove);
    window.addEventListener("pointerup", onUp);
    window.addEventListener("pointercancel", onUp);
  };

  const blockClickIfDragged = (e: React.MouseEvent) => {
    if (dragStateRef.current.moved) {
      e.preventDefault();
      e.stopPropagation();
      dragStateRef.current.moved = false;
    }
  };

  if (items.length === 0) return null;

  const renderCard = (
    item: HomeShowCarouselItem & { loopKey: string },
    index: number,
  ) => {
    const className = `relative aspect-[336/525] w-full shrink-0 snap-center overflow-hidden rounded-[19px] border-2 ${CARD_HOVER} min-[345px]:w-[calc((100%-1rem)/2)] md:w-[300px] lg:w-[336px]`;
    const style = {
      borderColor: BORDER_COLORS[index % BORDER_COLORS.length],
    };

    const image = (
      <Image
        src={item.imageUrl}
        alt=""
        fill
        className="pointer-events-none object-cover select-none"
        sizes="(max-width:344px) 100vw, (max-width:768px) 50vw, 336px"
        draggable={false}
      />
    );

    if (linkable && item.href) {
      return (
        <Link
          key={item.loopKey}
          href={item.href}
          data-show-card
          aria-label={item.title}
          className={className}
          style={style}
          draggable={false}
          onClick={blockClickIfDragged}
        >
          {image}
        </Link>
      );
    }

    return (
      <div
        key={item.loopKey}
        data-show-card
        role="img"
        aria-label={item.title}
        className={className}
        style={style}
      >
        {image}
      </div>
    );
  };

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
          if (!draggingRef.current) pausedRef.current = false;
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
          className="flex w-full cursor-grab select-none gap-4 overflow-x-auto scroll-smooth px-4 py-4 snap-x snap-mandatory active:cursor-grabbing [-ms-overflow-style:none] [scrollbar-width:none] [touch-action:pan-x] md:gap-5 md:px-8 lg:px-16 xl:px-20 [&::-webkit-scrollbar]:hidden"
          onPointerDown={onPointerDown}
        >
          {loopItems.map((item, index) => renderCard(item, index))}
        </div>
      </div>
    </section>
  );
}
