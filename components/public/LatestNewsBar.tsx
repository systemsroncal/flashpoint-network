import Link from "next/link";
import { formatTickerDate, formatTickerTime } from "@/lib/format";
import type { EventItem } from "@/lib/types/cms";
import { DEFAULT_SITE_TIMEZONE } from "@/lib/timezone/constants";

/**
 * Static orange home bar — next closest upcoming (or live) event.
 */
export default function LatestNewsBar({
  event,
  timeZone = DEFAULT_SITE_TIMEZONE,
}: {
  event: EventItem | null;
  timeZone?: string;
}) {
  const now = new Date();
  const when = event?.is_live
    ? "LIVE"
    : event?.starts_at
      ? formatTickerTime(event.starts_at, timeZone)
      : formatTickerTime(now, timeZone);
  const headline = event?.title?.trim() || "FlashPoint coverage coming up";
  const external = event?.external_url?.trim() || null;
  const detailHref = event?.slug ? `/events/${event.slug}` : null;

  const line = (
    <>
      {event?.is_live ? (
        <>
          <span className="font-black tracking-wide">{when}</span>{" "}
          <span className="font-bold opacity-90">|</span> {headline}
        </>
      ) : (
        <>
          Today {when} <span className="font-bold opacity-90">|</span> {headline}
        </>
      )}
    </>
  );

  const textClass =
    "block truncate text-sm font-bold no-underline hover:no-underline sm:text-base md:text-[18px]";

  return (
    <div className="bg-[var(--fpn-rojo)] text-white">
      <div className="mx-auto flex max-w-[1440px] items-center gap-4 px-4 py-3 md:px-8 lg:px-10">
        <div className="min-w-0 flex-1 overflow-hidden">
          {external ? (
            <a
              href={external}
              target="_blank"
              rel="noopener noreferrer"
              className={textClass}
            >
              {line}
            </a>
          ) : detailHref ? (
            <Link href={detailHref} className={textClass}>
              {line}
            </Link>
          ) : (
            <p className={`truncate text-sm font-bold sm:text-base md:text-[18px]`}>
              Today {formatTickerTime(now, timeZone)}{" "}
              <span className="font-bold opacity-90">|</span> FlashPoint coverage
              coming up
            </p>
          )}
        </div>
        <time
          dateTime={now.toISOString().slice(0, 10)}
          className="hidden shrink-0 text-[15px] font-medium tabular-nums sm:inline"
        >
          {formatTickerDate(now, timeZone)}
        </time>
      </div>
    </div>
  );
}
