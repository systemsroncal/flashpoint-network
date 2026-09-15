import Image from "next/image";
import Link from "next/link";
import PostCard from "@/components/public/PostCard";
import VideoPlayer from "@/components/public/VideoPlayer";
import type { HomePayload } from "@/lib/types/cms";
import {
  formatDate,
  formatReadTime,
  formatTickerDate,
  formatTickerTime,
  formatViews,
} from "@/lib/format";

export default function HomeView({ data }: { data: HomePayload }) {
  const mainVideo = data.mustWatch[0];
  const sideVideos = data.mustWatch.slice(1, 5);
  const mainExclusive = data.exclusives[0];
  const exclusiveRows = data.exclusives.slice(1, 5);
  const now = new Date();
  const tickerDate = formatTickerDate(now);
  const tickerTime = formatTickerTime(now);
  const breaking =
    data.featured?.title ||
    data.liveEvent?.title ||
    "Outgoing Army secretary breaks silence after submitting resignation";

  return (
    <div className="bg-white text-black">
      {/* Orange ticker — date is always current */}
      <div className="bg-[var(--fpn-rojo)] text-white">
        <div className="mx-auto flex max-w-[1440px] items-center justify-between gap-4 px-4 py-3 md:px-8 lg:px-10">
          <div className="flex min-w-0 items-center gap-3">
            <p className="min-w-0 truncate text-sm font-bold sm:text-base md:text-[18px]">
              Today {tickerTime}{" "}
              <span className="font-bold opacity-90">|</span> Public Defender:{" "}
              {breaking}
            </p>
            <Image
              src="/brand/ticker-next.svg"
              alt=""
              width={28}
              height={28}
              className="hidden shrink-0 sm:block"
            />
          </div>
          <time
            dateTime={now.toISOString().slice(0, 10)}
            className="hidden shrink-0 text-[15px] font-medium tabular-nums sm:inline"
          >
            {tickerDate}
          </time>
        </div>
      </div>

      {/* Live hero */}
      {data.liveEvent ? (
        <section className="bg-black text-white">
          <div className="mx-auto flex max-w-[1440px] flex-col items-center gap-10 px-4 py-8 md:flex-row md:gap-12 md:px-8 lg:px-10 lg:py-10">
            <div className="relative w-full max-w-[700px] shrink-0 overflow-hidden rounded-[15px] md:w-[52%]">
              {data.liveEvent.video_url ? (
                <VideoPlayer
                  url={data.liveEvent.video_url}
                  title={data.liveEvent.title}
                  poster={data.liveEvent.thumbnail_url}
                  className="aspect-video w-full"
                />
              ) : (
                <Link
                  href={`/events/${data.liveEvent.slug}`}
                  className="relative block aspect-[700/394] bg-[#0B1220]"
                >
                  {data.liveEvent.thumbnail_url ? (
                    <Image
                      src={data.liveEvent.thumbnail_url}
                      alt=""
                      fill
                      priority
                      className="object-cover opacity-90"
                      sizes="(max-width:768px) 100vw, 52vw"
                    />
                  ) : null}
                  <span className="absolute inset-0 bg-gradient-to-r from-[#1b2a64]/40 via-transparent to-[#ff490d]/20" />
                  <span className="absolute bottom-4 left-4 sm:bottom-6 sm:left-6">
                    <Image
                      src="/brand/play-btn.svg"
                      alt=""
                      width={72}
                      height={72}
                      className="h-14 w-14 sm:h-[72px] sm:w-[72px]"
                    />
                  </span>
                </Link>
              )}
            </div>

            <div className="w-full md:flex-1">
              <div className="flex flex-wrap items-center gap-3">
                {data.liveEvent.is_live ? (
                  <span className="inline-flex h-[30px] items-center gap-2 rounded-[5px] bg-[var(--fpn-rojo)] px-2.5 text-[13px] font-black uppercase tracking-wide text-white">
                    <span className="relative inline-block h-[17px] w-[17px]">
                      <Image
                        src="/brand/live-signal-2.svg"
                        alt=""
                        width={17}
                        height={17}
                        className="fpn-signal-b absolute inset-0"
                      />
                      <Image
                        src="/brand/live-signal-3.svg"
                        alt=""
                        width={12}
                        height={12}
                        className="fpn-signal-c absolute left-0 top-[5px]"
                      />
                      <Image
                        src="/brand/live-signal-1.svg"
                        alt=""
                        width={5}
                        height={5}
                        className="fpn-signal-a absolute left-0 top-[14px]"
                      />
                    </span>
                    On Live
                  </span>
                ) : null}
                <span className="text-[15px] font-medium text-white">
                  {data.liveEvent.starts_at
                    ? formatTickerTime(new Date(data.liveEvent.starts_at))
                    : "8:00 PM"}
                  {data.liveEvent.ends_at
                    ? ` - ${formatTickerTime(new Date(data.liveEvent.ends_at))}`
                    : ""}
                </span>
              </div>
              <p className="mt-5 text-[22px] font-extrabold italic leading-tight text-white md:text-[26px]">
                Now: {data.liveEvent.host_name || "FlashPoint Live"}
              </p>
              <h1 className="mt-3 max-w-xl font-article text-[2rem] font-bold leading-[1.15] tracking-tight text-white md:text-[2.5rem]">
                <Link
                  href={`/events/${data.liveEvent.slug}`}
                  className="hover:text-[var(--fpn-rojo)]"
                >
                  {data.liveEvent.title}
                </Link>
              </h1>
            </div>
          </div>
        </section>
      ) : null}

      <div className="mx-auto max-w-[1440px] space-y-12 px-4 py-10 md:px-8 lg:px-10 lg:py-12">
        {/* Top stories: featured + secondary + podcasts/latest */}
        <section className="grid gap-8 lg:grid-cols-[1.35fr_1fr_0.95fr] lg:gap-7">
          <div>
            {data.featured ? (
              <PostCard post={data.featured} variant="hero" />
            ) : null}
          </div>
          <div className="flex flex-col">
            {data.secondary.map((post) => (
              <PostCard key={post.id} post={post} variant="stack" />
            ))}
          </div>
          <aside className="space-y-6">
            <div>
              <div className="mb-2 flex items-end justify-between gap-3">
                <h2 className="font-article text-[1.65rem] font-black leading-none tracking-tight">
                  Podcasts
                </h2>
                <Link
                  href="/?type=podcast"
                  className="text-[11px] font-bold uppercase tracking-[0.08em] text-[var(--fpn-rojo)] hover:underline"
                >
                  See all
                </Link>
              </div>
              <div className="border-t border-[#ccc]">
                {data.podcasts.map((post) => (
                  <PostCard key={post.id} post={post} variant="podcast" />
                ))}
              </div>
            </div>
            <div>
              <h2 className="mb-2 font-article text-[1.65rem] font-black leading-none tracking-tight">
                Latest News
              </h2>
              <div className="border-t border-[#ccc]">
                {data.latest.map((post) => (
                  <PostCard key={post.id} post={post} variant="latest" />
                ))}
              </div>
            </div>
          </aside>
        </section>

        {data.grid.length > 0 ? (
          <section className="grid gap-x-6 gap-y-8 sm:grid-cols-2 md:grid-cols-3">
            {data.grid.slice(0, 6).map((post) => (
              <PostCard key={post.id} post={post} />
            ))}
          </section>
        ) : null}

        {/* Subscribe banner */}
        <section className="flex flex-col items-center justify-between gap-5 overflow-hidden rounded-[12px] bg-black px-6 py-7 text-white md:flex-row md:px-10">
          <div>
            <h2 className="font-article text-[1.75rem] font-black leading-tight md:text-[2rem]">
              Get The Full Story. As It Is.
            </h2>
            <p className="mt-1.5 text-sm text-white/70">
              Subscribe for complete FPN access.
            </p>
          </div>
          <Link
            href="/admin"
            className="inline-flex rounded-md bg-[var(--fpn-rojo)] px-7 py-3 text-sm font-bold text-white hover:brightness-110"
          >
            Subscribe
          </Link>
        </section>

        {/* Must-watch */}
        <section>
          <h2 className="mb-6 font-article text-[1.85rem] font-black tracking-tight md:text-[2.1rem]">
            Must-Watch Videos
          </h2>
          <div className="grid gap-6 md:grid-cols-[1.35fr_1fr]">
            {mainVideo ? <PostCard post={mainVideo} variant="video" /> : null}
            <div className="flex flex-col divide-y divide-[#ccc]/80 border-t border-[#ccc]/80">
              {sideVideos.map((post) => (
                <article key={post.id} className="flex gap-4 py-4">
                  <Link
                    href={`/news/${post.slug}`}
                    className="relative h-[88px] w-[140px] shrink-0 overflow-hidden rounded-[10px] bg-neutral-200"
                  >
                    {post.featured_image_url ? (
                      <Image
                        src={post.featured_image_url}
                        alt=""
                        fill
                        className="object-cover"
                        sizes="140px"
                      />
                    ) : null}
                    <span className="absolute bottom-2 left-2">
                      <Image
                        src="/brand/play-btn.svg"
                        alt=""
                        width={28}
                        height={28}
                      />
                    </span>
                  </Link>
                  <div className="min-w-0">
                    <Link
                      href={`/news/${post.slug}`}
                      className="font-article text-[16px] font-black leading-snug tracking-tight text-black hover:text-[var(--fpn-rojo)]"
                    >
                      {post.title}
                    </Link>
                    <p className="mt-2 text-[13px] text-[var(--fpn-rojo)]">
                      {formatDate(post.published_at)}
                    </p>
                  </div>
                </article>
              ))}
            </div>
          </div>
        </section>

        {/* Elections */}
        <section>
          <h2 className="mb-6 font-article text-[1.85rem] font-black tracking-tight md:text-[2.1rem]">
            Elections
          </h2>
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {data.elections.map((post) => (
              <PostCard key={post.id} post={{ ...post, is_video: true }} />
            ))}
          </div>
        </section>

        {/* Sponsored gradient */}
        <section className="overflow-hidden rounded-[12px] bg-gradient-to-r from-[#3B1D8F] via-[#2F2AA8] to-[#1A3A9C] text-white">
          <div className="flex flex-col items-start justify-between gap-4 px-6 py-9 md:flex-row md:items-center md:px-10">
            <div>
              <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-white/70">
                Sponsored
              </p>
              <h2 className="mt-2 font-article text-[1.75rem] font-black md:text-[2rem]">
                Cut your mobile bill in half
              </h2>
              <p className="mt-1 text-sm text-white/75">
                Limited-time offer for FPN readers.
              </p>
            </div>
            <span className="inline-flex rounded-md bg-white px-5 py-2.5 text-sm font-bold text-[#1A3A9C]">
              Learn more
            </span>
          </div>
        </section>
      </div>

      {/* Exclusive Content */}
      <section className="bg-[#F5F5F5]">
        <div className="mx-auto max-w-[1440px] px-4 py-12 md:px-8 lg:px-10 lg:py-14">
          <div className="mb-8 flex items-center gap-4">
            <Image
              src="/brand/exclusive-star.svg"
              alt=""
              width={48}
              height={48}
              className="h-10 w-10 md:h-12 md:w-12"
            />
            <h2 className="font-article text-[1.85rem] font-black tracking-tight md:text-[2.4rem]">
              Exclusive Content
            </h2>
          </div>

          {mainExclusive ? (
            <div className="mb-10 grid items-center gap-6 rounded-[24px] bg-black p-3 text-white md:grid-cols-2 md:gap-8 md:rounded-[33px] md:p-4">
              <Link
                href={`/news/${mainExclusive.slug}`}
                className="relative aspect-[16/10] overflow-hidden rounded-[18px] md:aspect-[775/434] md:rounded-[24px]"
              >
                {mainExclusive.featured_image_url ? (
                  <Image
                    src={mainExclusive.featured_image_url}
                    alt=""
                    fill
                    className="object-cover"
                    sizes="(max-width:768px) 100vw, 48vw"
                  />
                ) : null}
                <span className="absolute left-3 top-3">
                  <Image
                    src="/brand/exclusive-star.svg"
                    alt=""
                    width={40}
                    height={40}
                  />
                </span>
              </Link>
              <div className="px-2 pb-3 md:pr-4 md:pb-2">
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <p className="text-[15px] font-medium uppercase tracking-wide text-[var(--fpn-rojo)] md:text-[18px]">
                    {mainExclusive.category?.name ?? "Politics"}
                  </p>
                  <span className="inline-flex items-center gap-3 text-[13px] text-[var(--fpn-meta)]">
                    <span className="inline-flex items-center gap-1.5">
                      <Image
                        src="/brand/icon-clock.svg"
                        alt=""
                        width={16}
                        height={16}
                      />
                      {formatReadTime(mainExclusive.reading_time_minutes)}
                    </span>
                    <span className="inline-flex items-center gap-1.5">
                      <Image
                        src="/brand/icon-comments.svg"
                        alt=""
                        width={15}
                        height={15}
                      />
                      {formatViews(mainExclusive.view_count)}
                    </span>
                  </span>
                </div>
                <h3 className="mt-3 font-article text-[1.65rem] font-black leading-[1.15] tracking-tight md:text-[2.15rem]">
                  <Link
                    href={`/news/${mainExclusive.slug}`}
                    className="hover:text-[var(--fpn-rojo)]"
                  >
                    {mainExclusive.title}
                  </Link>
                </h3>
                {mainExclusive.excerpt ? (
                  <p className="mt-3 text-[15px] leading-7 text-white/85 md:text-[17px]">
                    {mainExclusive.excerpt}
                  </p>
                ) : null}
                <p className="mt-4 text-[14px] text-[var(--fpn-rojo)]">
                  {formatDate(mainExclusive.published_at)}
                </p>
              </div>
            </div>
          ) : null}

          <div className="grid gap-10 lg:grid-cols-[1.55fr_0.7fr]">
            <div className="divide-y divide-[#ccc]">
              {exclusiveRows.map((post) => (
                <article
                  key={post.id}
                  className="grid gap-5 py-6 md:grid-cols-[1fr_0.85fr] md:items-center"
                >
                  <div>
                    <p className="text-[12px] font-medium uppercase tracking-wide text-[var(--fpn-rojo)]">
                      {(post.category?.name ?? "News").toUpperCase()}
                    </p>
                    <h3 className="mt-1 font-article text-[1.25rem] font-black leading-snug tracking-tight md:text-[1.5rem]">
                      <Link
                        href={`/news/${post.slug}`}
                        className="hover:text-[var(--fpn-rojo)]"
                      >
                        {post.title}
                      </Link>
                    </h3>
                    {post.excerpt ? (
                      <p className="mt-2 line-clamp-2 text-[15px] leading-6 text-black/80">
                        {post.excerpt}
                      </p>
                    ) : null}
                    <div className="mt-3 flex flex-wrap items-center justify-between gap-2 text-[13px]">
                      <span className="inline-flex items-center gap-3 text-[var(--fpn-meta)]">
                        <span className="inline-flex items-center gap-1.5">
                          <Image
                            src="/brand/icon-clock.svg"
                            alt=""
                            width={15}
                            height={15}
                          />
                          {formatReadTime(post.reading_time_minutes)}
                        </span>
                        <span className="inline-flex items-center gap-1.5">
                          <Image
                            src="/brand/icon-comments.svg"
                            alt=""
                            width={14}
                            height={14}
                          />
                          {formatViews(post.view_count)}
                        </span>
                      </span>
                      <span className="text-[var(--fpn-rojo)]">
                        {formatDate(post.published_at)}
                      </span>
                    </div>
                  </div>
                  <Link
                    href={`/news/${post.slug}`}
                    className="relative aspect-[16/10] overflow-hidden rounded-[12px] bg-neutral-200"
                  >
                    {post.featured_image_url ? (
                      <Image
                        src={post.featured_image_url}
                        alt=""
                        fill
                        className="object-cover"
                        sizes="(max-width:768px) 100vw, 28vw"
                      />
                    ) : null}
                    <span className="absolute left-2 top-2">
                      <Image
                        src="/brand/exclusive-star.svg"
                        alt=""
                        width={36}
                        height={36}
                      />
                    </span>
                  </Link>
                </article>
              ))}
            </div>

            <aside>
              <h2 className="mb-4 font-article text-[1.85rem] font-black tracking-tight">
                Popular
              </h2>
              <ol className="divide-y divide-[#ccc] border-t border-[#ccc]">
                {data.popular.map((post, index) => (
                  <li key={post.id} className="py-4">
                    <p className="text-[22px] font-medium leading-none text-[var(--fpn-rojo)]">
                      {index + 1}
                    </p>
                    <Link
                      href={`/news/${post.slug}`}
                      className="mt-1 block font-article text-[1.05rem] font-black leading-snug tracking-tight text-black hover:text-[var(--fpn-rojo)]"
                    >
                      {post.title}
                    </Link>
                  </li>
                ))}
              </ol>
            </aside>
          </div>
        </div>
      </section>

      <div className="mx-auto max-w-[1440px] px-4 py-12 md:px-8 lg:px-10">
        <section className="border border-black/10 bg-white px-6 py-12 text-center">
          <h2 className="mx-auto max-w-xl font-article text-[1.75rem] font-black leading-snug tracking-tight">
            The biggest stories of the day delivered to your inbox
          </h2>
          <form className="mx-auto mt-6 flex max-w-lg flex-col gap-2 sm:flex-row">
            <input
              type="email"
              required
              placeholder="Email address"
              className="flex-1 border border-black/15 bg-white px-3 py-3 text-sm outline-none focus:border-[var(--fpn-rojo)]"
            />
            <button
              type="submit"
              className="rounded-md bg-[var(--fpn-rojo)] px-5 py-3 text-sm font-bold text-white hover:brightness-110"
            >
              Sign up
            </button>
          </form>
        </section>
      </div>
    </div>
  );
}
