"use client";

import Image from "next/image";
import Link from "next/link";
import { formatTickerDate, formatTickerTime } from "@/lib/format";
import type { EventItem } from "@/lib/types/cms";

function itemLabel(event: EventItem) {
  const when = event.is_live
    ? "LIVE"
    : event.starts_at
      ? formatTickerTime(new Date(event.starts_at))
      : formatTickerTime(new Date());
  const host = event.host_name?.trim();
  const headline = host ? `${host}: ${event.title}` : event.title;
  return { when, headline };
}

export default function EventsTicker({ events }: { events: EventItem[] }) {
  const now = new Date();
  const items = events.length > 0 ? events : null;
  const half =
    items && items.length > 0
      ? Array.from(
          { length: Math.max(2, Math.ceil(8 / items.length)) },
          () => items,
        ).flat()
      : [];
  const loop = half.length ? [...half, ...half] : [];
  const durationSec = Math.max(32, half.length * 5);

  return (
    <div className="bg-[var(--fpn-rojo)] text-white">
      <div className="mx-auto flex max-w-[1440px] items-center gap-4 px-4 py-3 md:px-8 lg:px-10">
        <div className="min-w-0 flex-1 overflow-hidden">
          {items ? (
            <div className="fpn-ticker-mask">
              <div
                className="fpn-ticker-track"
                style={{ animationDuration: `${durationSec}s` }}
              >
                {loop.map((event, i) => {
                  const { when, headline } = itemLabel(event);
                  return (
                    <Link
                      key={`${event.id}-${i}`}
                      href={`/events/${event.slug}`}
                      className="inline-flex shrink-0 items-center gap-3 pr-8 text-sm font-bold sm:text-base md:text-[18px]"
                    >
                      <span className="whitespace-nowrap">
                        Today {when}{" "}
                        <span className="font-bold opacity-90">|</span> {headline}
                      </span>
                      <Image
                        src="/brand/ticker-next.svg"
                        alt=""
                        width={28}
                        height={28}
                        className="hidden shrink-0 sm:block"
                      />
                    </Link>
                  );
                })}
              </div>
            </div>
          ) : (
            <p className="truncate text-sm font-bold sm:text-base md:text-[18px]">
              Today {formatTickerTime(now)}{" "}
              <span className="font-bold opacity-90">|</span> FlashPoint events
              coming up
            </p>
          )}
        </div>
        <time
          dateTime={now.toISOString().slice(0, 10)}
          className="hidden shrink-0 text-[15px] font-medium tabular-nums sm:inline"
        >
          {formatTickerDate(now)}
        </time>
      </div>
    </div>
  );
}
