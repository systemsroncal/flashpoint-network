import Image from "next/image";
import Link from "next/link";
import PostCard from "@/components/public/PostCard";
import type { HomePayload } from "@/lib/types/cms";
import { formatDate, formatTickerDate, formatTickerTime } from "@/lib/format";

export default function HomeView({ data }: { data: HomePayload }) {
  const mainVideo = data.mustWatch[0];
  const sideVideos = data.mustWatch.slice(1, 5);
  const mainExclusive = data.exclusives[0];
  const exclusiveList = data.exclusives.slice(1, 5);
  const exclusiveGrid = data.exclusives.slice(5, 9);
  const now = new Date();
  const tickerDate = formatTickerDate(now);
  const tickerTime = formatTickerTime(now);
  const breaking =
    data.featured?.title ||
    data.liveEvent?.title ||
    "Outgoing Army secretary breaks silence after submitting resignation";

  return (
    <div className="bg-white text-black">
      {/* Breaking ticker — date is always current */}
      <div className="bg-[var(--fpn-orange)] text-white">
        <div className="mx-auto flex max-w-[1200px] items-center gap-3 px-4 py-2.5 text-xs font-medium sm:text-[13px]">
          <span className="shrink-0 font-bold uppercase tracking-[0.04em]">
            Today · {tickerTime}
          </span>
          <span className="hidden h-3.5 w-px bg-white/45 sm:block" aria-hidden />
          <p className="min-w-0 flex-1 truncate font-medium">
            <span className="font-semibold">Public Defender:</span> {breaking}
          </p>
          <time
            dateTime={now.toISOString().slice(0, 10)}
            className="hidden shrink-0 font-semibold tabular-nums sm:inline"
          >
            {tickerDate}
          </time>
        </div>
      </div>

      {/* Live hero */}
      {data.liveEvent ? (
        <section className="bg-[#0B0F14] text-white">
          <div className="mx-auto grid max-w-[1200px] gap-8 px-4 py-10 md:grid-cols-[1.2fr_1fr] md:items-center">
            <Link
              href={`/events/${data.liveEvent.slug}`}
              className="relative aspect-video overflow-hidden bg-black"
            >
              {data.liveEvent.thumbnail_url ? (
                <Image
                  src={data.liveEvent.thumbnail_url}
                  alt=""
                  fill
                  priority
                  className="object-cover opacity-85"
                  sizes="(max-width:768px) 100vw, 55vw"
                />
              ) : null}
              <span className="absolute inset-0 flex items-center justify-center">
                <span className="fpn-live-glow flex h-[72px] w-[72px] items-center justify-center rounded-full border-2 border-white/75 bg-black/45 text-[26px]">
                  ▶
                </span>
              </span>
            </Link>
            <div>
              <div className="flex flex-wrap items-center gap-2.5 text-[11px] font-bold uppercase tracking-[0.08em]">
                {data.liveEvent.is_live ? (
                  <span className="inline-flex items-center gap-1.5 bg-[var(--fpn-red)] px-2.5 py-1">
                    <span className="fpn-live-dot h-1.5 w-1.5 rounded-full bg-white" />
                    On Live
                  </span>
                ) : null}
                <span className="text-white/65">
                  {data.liveEvent.starts_at
                    ? formatTickerTime(new Date(data.liveEvent.starts_at))
                    : "8:00 PM"}
                  {data.liveEvent.ends_at
                    ? ` – ${formatTickerTime(new Date(data.liveEvent.ends_at))}`
                    : ""}
                </span>
              </div>
              <p className="mt-4 text-sm text-white/70">
                Now: {data.liveEvent.host_name || "FlashPoint Live"}
              </p>
              <h1 className="mt-2 font-article text-[2rem] font-bold leading-[1.12] md:text-[2.35rem]">
                <Link
                  href={`/events/${data.liveEvent.slug}`}
                  className="hover:text-[var(--fpn-orange)]"
                >
                  {data.liveEvent.title}
                </Link>
              </h1>
              {data.liveEvent.description ? (
                <p className="mt-3 max-w-md text-sm leading-6 text-white/65">
                  {data.liveEvent.description}
                </p>
              ) : null}
            </div>
          </div>
        </section>
      ) : null}

      <div className="mx-auto max-w-[1200px] space-y-12 px-4 py-10">
        {/* Top stories */}
        <section className="grid gap-8 lg:grid-cols-[1.35fr_0.9fr_0.95fr]">
          <div>
            {data.featured ? (
              <PostCard post={data.featured} variant="hero" />
            ) : null}
          </div>
          <div className="flex flex-col border-t border-black/10 lg:border-t-0">
            {data.secondary.map((post) => (
              <PostCard key={post.id} post={post} variant="stack" />
            ))}
          </div>
          <aside className="space-y-7">
            <div>
              <div className="mb-1 flex items-end justify-between border-b-2 border-black pb-2">
                <h2 className="font-article text-[1.35rem] font-bold leading-none">
                  Podcasts
                </h2>
                <Link
                  href="/?type=podcast"
                  className="text-[11px] font-bold uppercase tracking-[0.1em] text-[var(--fpn-orange)] hover:underline"
                >
                  See all
                </Link>
              </div>
              {data.podcasts.map((post) => (
                <PostCard key={post.id} post={post} variant="stack" />
              ))}
            </div>
            <div>
              <div className="mb-1 border-b-2 border-black pb-2">
                <h2 className="font-article text-[1.35rem] font-bold leading-none">
                  Latest News
                </h2>
              </div>
              {data.latest.map((post) => (
                <PostCard key={post.id} post={post} variant="latest" />
              ))}
            </div>
          </aside>
        </section>

        {data.grid.length > 0 ? (
          <section className="grid gap-6 sm:grid-cols-2 md:grid-cols-3">
            {data.grid.slice(0, 6).map((post) => (
              <PostCard key={post.id} post={post} />
            ))}
          </section>
        ) : null}

        {/* Subscribe banner */}
        <section className="flex flex-col items-center justify-between gap-5 bg-black px-6 py-8 text-white md:flex-row md:px-10">
          <div>
            <h2 className="font-article text-[1.75rem] font-bold leading-tight md:text-[2rem]">
              Get The Full Story. As It Is.
            </h2>
            <p className="mt-1.5 text-sm text-white/65">
              Subscribe for complete FPN access.
            </p>
          </div>
          <Link
            href="/admin"
            className="inline-flex bg-[var(--fpn-orange)] px-7 py-3 text-xs font-bold uppercase tracking-[0.12em] text-white hover:bg-[#e63e00]"
          >
            Subscribe
          </Link>
        </section>

        {/* Must-watch */}
        <section>
          <div className="mb-5 border-b-2 border-black pb-2">
            <h2 className="font-article text-[1.75rem] font-bold leading-none">
              Must-Watch Videos
            </h2>
          </div>
          <div className="grid gap-5 md:grid-cols-[1.4fr_1fr]">
            {mainVideo ? <PostCard post={mainVideo} variant="video" /> : null}
            <div className="grid gap-1">
              {sideVideos.map((post) => (
                <PostCard key={post.id} post={post} variant="stack" />
              ))}
            </div>
          </div>
        </section>

        {/* Elections */}
        <section>
          <div className="mb-5 border-b-2 border-black pb-2">
            <h2 className="font-article text-[1.75rem] font-bold leading-none">
              Elections
            </h2>
          </div>
          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
            {data.elections.map((post) => (
              <PostCard key={post.id} post={post} />
            ))}
          </div>
        </section>

        {/* Promo banner (matches Figma sponsored block) */}
        <section className="overflow-hidden bg-gradient-to-r from-[#3B1D8F] via-[#2F2AA8] to-[#1A3A9C] text-white">
          <div className="flex flex-col items-start justify-between gap-4 px-6 py-9 md:flex-row md:items-center md:px-10">
            <div>
              <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-white/70">
                Sponsored
              </p>
              <h2 className="mt-2 font-article text-[1.75rem] font-bold md:text-[2rem]">
                Cut your mobile bill in half
              </h2>
              <p className="mt-1 text-sm text-white/75">
                Limited-time offer for FPN readers.
              </p>
            </div>
            <span className="inline-flex bg-white px-5 py-2.5 text-sm font-bold text-[#1A3A9C]">
              Learn more
            </span>
          </div>
        </section>
      </div>

      {/* Exclusive + popular — full-bleed dark band like Figma */}
      <section className="bg-[#0A0A0A] text-white">
        <div className="mx-auto grid max-w-[1200px] gap-8 px-4 py-10 lg:grid-cols-[1.65fr_0.85fr]">
          <div>
            <div className="mb-5 flex items-center gap-2.5 bg-black px-3 py-2.5">
              <span className="text-[var(--fpn-orange)]" aria-hidden>
                ★
              </span>
              <h2 className="font-article text-lg font-bold tracking-wide">
                Exclusive Content
              </h2>
            </div>
            {mainExclusive ? (
              <div className="mb-6 grid overflow-hidden bg-[#141414] md:grid-cols-2">
                <Link
                  href={`/news/${mainExclusive.slug}`}
                  className="relative aspect-[16/11] md:aspect-auto md:min-h-[280px]"
                >
                  {mainExclusive.featured_image_url ? (
                    <Image
                      src={mainExclusive.featured_image_url}
                      alt=""
                      fill
                      className="object-cover"
                      sizes="(max-width:768px) 100vw, 40vw"
                    />
                  ) : null}
                </Link>
                <div className="flex flex-col justify-center p-5 md:p-7">
                  <p className="text-[11px] font-bold uppercase tracking-[0.1em] text-[var(--fpn-orange)]">
                    {mainExclusive.category?.name ?? "Politics"}
                  </p>
                  <h3 className="mt-2 font-article text-[1.65rem] font-bold leading-tight">
                    <Link
                      href={`/news/${mainExclusive.slug}`}
                      className="hover:text-[var(--fpn-orange)]"
                    >
                      {mainExclusive.title}
                    </Link>
                  </h3>
                  {mainExclusive.excerpt ? (
                    <p className="mt-3 text-sm leading-6 text-white/65">
                      {mainExclusive.excerpt}
                    </p>
                  ) : null}
                  <p className="mt-4 text-xs text-white/45">
                    {formatDate(mainExclusive.published_at)}
                  </p>
                </div>
              </div>
            ) : null}
            <div className="grid gap-6 md:grid-cols-2">
              <div className="bg-[#161616] p-4">
                {exclusiveList.map((post) => (
                  <article
                    key={post.id}
                    className="border-b border-white/10 py-3 last:border-b-0"
                  >
                    <p className="text-[11px] font-bold uppercase tracking-[0.08em] text-[var(--fpn-red)]">
                      {post.category?.name ?? "News"}
                    </p>
                    <Link
                      href={`/news/${post.slug}`}
                      className="mt-1 block font-article text-[15px] font-bold leading-snug text-white hover:text-[var(--fpn-orange)]"
                    >
                      {post.title}
                    </Link>
                  </article>
                ))}
              </div>
              <div className="grid grid-cols-2 gap-3 bg-white p-3">
                {exclusiveGrid.map((post) => (
                  <PostCard key={post.id} post={post} />
                ))}
              </div>
            </div>
          </div>

          <aside className="bg-[#161616] p-5">
            <h2 className="mb-3 font-article text-xl font-bold text-white">
              Popular
            </h2>
            <ol>
              {data.popular.map((post, index) => (
                <li
                  key={post.id}
                  className="flex gap-3 border-b border-white/10 py-3.5 last:border-b-0"
                >
                  <span className="w-6 font-article text-2xl font-bold leading-none text-[var(--fpn-orange)]">
                    {index + 1}
                  </span>
                  <Link
                    href={`/news/${post.slug}`}
                    className="font-article text-[15px] font-bold leading-snug text-white hover:text-[var(--fpn-orange)]"
                  >
                    {post.title}
                  </Link>
                </li>
              ))}
            </ol>
          </aside>
        </div>
      </section>

      <div className="mx-auto max-w-[1200px] space-y-12 px-4 py-12">
        {/* Newsletter */}
        <section className="border border-black/10 bg-[#F7F7F7] px-6 py-12 text-center">
          <h2 className="mx-auto max-w-xl font-article text-[1.75rem] font-bold leading-snug">
            The biggest stories of the day delivered to your inbox
          </h2>
          <form className="mx-auto mt-6 flex max-w-lg flex-col gap-2 sm:flex-row">
            <input
              type="email"
              required
              placeholder="Email address"
              className="flex-1 border border-black/15 bg-white px-3 py-3 text-sm outline-none focus:border-[var(--fpn-orange)]"
            />
            <button
              type="submit"
              className="bg-[var(--fpn-orange)] px-5 py-3 text-xs font-bold uppercase tracking-[0.1em] text-white hover:bg-[#e63e00]"
            >
              Sign me up
            </button>
          </form>
        </section>
      </div>
    </div>
  );
}
