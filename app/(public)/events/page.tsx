import type { Metadata } from "next";
import Link from "next/link";
import Image from "next/image";
import { getPublicEvents } from "@/lib/data/home";
import { formatDate } from "@/lib/format";
import { getSiteName } from "@/lib/env";
import { getSiteTimezone } from "@/lib/timezone/settings";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Events",
  description: "Live and upcoming FlashPoint Television Network events",
};

export default async function EventsIndexPage() {
  const [events, timeZone] = await Promise.all([
    getPublicEvents(),
    getSiteTimezone(),
  ]);
  const siteName = getSiteName();

  return (
    <div className="bg-white text-black">
      <div className="border-b border-black/10 bg-[#0B0F14] text-white">
        <div className="mx-auto max-w-[1440px] px-4 py-10 md:px-8 lg:px-10 lg:py-12">
          <p className="text-xs font-bold uppercase tracking-[0.18em] text-[var(--fpn-rojo)]">
            {siteName}
          </p>
          <h1 className="mt-2 font-article text-3xl font-black tracking-tight md:text-5xl">
            Events
          </h1>
          <p className="mt-3 max-w-2xl text-sm text-white/70 md:text-base">
            Live coverage and FlashPoint conversations — watch, read, and stay
            with the story as it breaks.
          </p>
        </div>
      </div>

      <div className="mx-auto max-w-[1440px] px-4 py-10 md:px-8 lg:px-10">
        {events.length === 0 ? (
          <div className="rounded-[12px] border border-dashed border-black/15 px-6 py-16 text-center">
            <h2 className="font-article text-2xl font-black tracking-tight">
              No events scheduled
            </h2>
            <p className="mx-auto mt-2 max-w-md text-sm text-black/60">
              Check back soon, or browse the latest news meanwhile.
            </p>
            <Link
              href="/"
              className="mt-6 inline-flex rounded-md bg-[var(--fpn-rojo)] px-5 py-2.5 text-sm font-bold text-white"
            >
              Back to home
            </Link>
          </div>
        ) : (
          <ul className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {events.map((event) => (
              <li key={event.id}>
                <Link
                  href={`/events/${event.slug}`}
                  className="group flex h-full flex-col overflow-hidden rounded-[12px] border border-black/10 bg-white transition hover:border-black/25"
                >
                  <div className="relative aspect-video bg-neutral-200">
                    {event.thumbnail_url ? (
                      <Image
                        src={event.thumbnail_url}
                        alt=""
                        fill
                        className="object-cover transition duration-300 group-hover:scale-[1.02]"
                        sizes="(max-width:768px) 100vw, 33vw"
                      />
                    ) : (
                      <span className="absolute inset-0 flex items-center justify-center bg-[#0B1220] text-white/40">
                        Event
                      </span>
                    )}
                    {event.is_live ? (
                      <span className="absolute left-3 top-3 rounded bg-[#E10600] px-2 py-1 text-[10px] font-bold uppercase tracking-wide text-white">
                        Live
                      </span>
                    ) : null}
                  </div>
                  <div className="flex flex-1 flex-col p-4">
                    <p className="text-[11px] font-bold uppercase tracking-[0.12em] text-black/45">
                      {event.format}
                      {event.starts_at ? ` · ${formatDate(event.starts_at, timeZone)}` : ""}
                    </p>
                    <h2 className="mt-2 font-article text-xl font-black leading-snug tracking-tight group-hover:text-[var(--fpn-rojo)]">
                      {event.title}
                    </h2>
                    {event.description ? (
                      <p className="mt-2 line-clamp-3 text-sm text-black/65">
                        {event.description}
                      </p>
                    ) : null}
                    <p className="mt-auto pt-4 text-xs font-semibold text-black/50">
                      Host: {event.host_name || "FlashPoint Live"}
                    </p>
                  </div>
                </Link>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
