import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import RichHtml from "@/components/public/RichHtml";
import VideoPlayer from "@/components/public/VideoPlayer";
import { getEventBySlug } from "@/lib/data/home";
import { formatDate } from "@/lib/format";

export const dynamic = "force-dynamic";

type Props = {
  params: Promise<{ slug: string }>;
};

export async function generateMetadata({ params }: Props) {
  const { slug } = await params;
  const event = await getEventBySlug(slug);
  if (!event) return { title: "Not found" };
  return {
    title: event.title,
    description: event.description ?? undefined,
  };
}

export default async function EventPage({ params }: Props) {
  const { slug } = await params;
  const event = await getEventBySlug(slug);
  if (!event) notFound();

  return (
    <article className="bg-white">
      <div className="bg-[#0B0F14] text-white">
        <div className="mx-auto grid max-w-5xl gap-6 px-4 py-10 md:grid-cols-2 md:items-center">
          <div className="relative aspect-video overflow-hidden rounded-[12px] bg-black">
            {event.video_url ? (
              <VideoPlayer
                url={event.video_url}
                title={event.title}
                poster={event.thumbnail_url}
                className="h-full w-full"
              />
            ) : (
              <>
                {event.thumbnail_url ? (
                  <Image
                    src={event.thumbnail_url}
                    alt=""
                    fill
                    priority
                    className="object-cover opacity-85"
                    sizes="(max-width:768px) 100vw, 50vw"
                  />
                ) : null}
                <span className="absolute inset-0 flex items-center justify-center">
                  <span className="flex h-16 w-16 items-center justify-center rounded-full border-2 border-white/70 bg-black/40 text-2xl">
                    ▶
                  </span>
                </span>
              </>
            )}
          </div>
          <div>
            <div className="flex flex-wrap items-center gap-2 text-xs font-bold uppercase tracking-wide">
              {event.is_live ? (
                <span className="bg-[#E10600] px-2 py-1">On Live</span>
              ) : (
                <span className="bg-white/15 px-2 py-1">Event</span>
              )}
              <span className="text-white/70">{event.format}</span>
            </div>
            <h1 className="mt-3 font-article text-3xl font-bold leading-tight md:text-4xl">
              {event.title}
            </h1>
            <p className="mt-3 text-sm text-white/70">
              Host: {event.host_name || "FlashPoint Live"}
            </p>
            <p className="mt-2 text-xs text-white/50">
              {formatDate(event.starts_at)}
              {event.ends_at ? ` – ${formatDate(event.ends_at)}` : ""}
            </p>
          </div>
        </div>
      </div>

      <div className="mx-auto max-w-3xl px-4 py-8">
        {event.description ? (
          <p className="text-lg leading-8 text-[#374151]">{event.description}</p>
        ) : null}
        {event.body ? (
          <RichHtml
            html={event.body}
            className="fpn-rich-html mt-6 font-serif text-lg leading-8 text-[#1F2937]"
          />
        ) : null}
        {event.video_url ? (
          <div className="mt-8 md:hidden">
            <VideoPlayer
              url={event.video_url}
              title={event.title}
              poster={event.thumbnail_url}
            />
          </div>
        ) : null}
        <div className="mt-10 border-t border-black/10 pt-6">
          <Link
            href="/"
            className="text-sm font-semibold uppercase tracking-wide text-[#E85D04] hover:underline"
          >
            ← Back to home
          </Link>
        </div>
      </div>
    </article>
  );
}
