import Image from "next/image";
import Link from "next/link";
import EventsTicker from "@/components/public/EventsTicker";
import NewsletterSignup from "@/components/public/NewsletterSignup";
import PostCard from "@/components/public/PostCard";
import type { HomePayload } from "@/lib/types/cms";
import {
  formatDate,
  formatReadTime,
  formatTickerTime,
  formatViews,
} from "@/lib/format";
import { youtubeThumbnailUrl } from "@/lib/media/youtube";

function SeeMore({ href, label = "See more" }: { href: string; label?: string }) {
  return (
    <Link
      href={href}
      className="text-[11px] font-bold uppercase tracking-[0.08em] text-[var(--fpn-rojo)] hover:underline"
    >
      {label}
    </Link>
  );
}

export default function HomeView({ data }: { data: HomePayload }) {
  const mainVideo = data.mustWatch[0];
  const sideVideos = data.mustWatch.slice(1, 5);
  const mainExclusive = data.exclusives[0];
  const exclusiveRows = data.exclusives.slice(1, 5);
  // Second band under hero: max 6 cards (2×3). Prefer Politics then World.
  const politicsWorld = [
    ...data.politics.slice(0, 3),
    ...data.world.slice(0, 3),
  ].slice(0, 6);

  return (
    <div className="bg-white text-black">
      <EventsTicker events={data.tickerEvents} />

      {!data.featured &&
      !data.liveEvent &&
      politicsWorld.length === 0 &&
      data.latest.length === 0 ? (
        <div className="mx-auto max-w-[1440px] px-4 py-16 text-center md:px-8 lg:px-10">
          <h1 className="font-article text-3xl font-black tracking-tight md:text-4xl">
            Stories are on the way
          </h1>
          <p className="mx-auto mt-3 max-w-lg text-sm text-black/65">
            The newsroom hasn&apos;t published coverage yet. Check Events or
            sign in if you&apos;re on staff.
          </p>
          <div className="mt-6 flex justify-center gap-3">
            <Link
              href="/events"
              className="rounded-md bg-[var(--fpn-rojo)] px-5 py-2.5 text-sm font-bold text-white"
            >
              Browse events
            </Link>
            <Link
              href="/login"
              className="rounded-md border border-black/15 px-5 py-2.5 text-sm font-bold"
            >
              Staff login
            </Link>
          </div>
        </div>
      ) : null}

      {/* Live hero — Figma 7:9354: full-bleed black studio band, poster + circular play (no VideoPlayer) */}
      {data.liveEvent ? (
        <section className="relative overflow-hidden bg-black text-white">
          <div
            aria-hidden
            className="pointer-events-none absolute inset-0 opacity-40"
          >
            {data.liveEvent.thumbnail_url ? (
              <Image
                src={data.liveEvent.thumbnail_url}
                alt=""
                fill
                priority
                className="object-cover"
                sizes="100vw"
              />
            ) : null}
            <span className="absolute inset-0 bg-gradient-to-r from-black via-black/85 to-[#1b2a64]/55" />
            <span className="absolute inset-0 bg-[radial-gradient(ellipse_at_30%_50%,rgba(255,73,13,0.18),transparent_55%)]" />
          </div>

          <div className="relative mx-auto flex max-w-[1440px] flex-col items-center gap-8 px-4 py-10 md:flex-row md:gap-12 md:px-8 lg:gap-[49px] lg:px-10 lg:py-12">
            <Link
              href={`/events/${data.liveEvent.slug}`}
              className="relative block w-full max-w-[700px] shrink-0 overflow-hidden rounded-[15px] md:w-[52%]"
              aria-label={`Watch live: ${data.liveEvent.title}`}
            >
              <span className="relative block aspect-[700/394] bg-[#0B1220]">
                {data.liveEvent.thumbnail_url ? (
                  <Image
                    src={data.liveEvent.thumbnail_url}
                    alt=""
                    fill
                    priority
                    className="object-cover"
                    sizes="(max-width:768px) 100vw, 700px"
                  />
                ) : (
                  <span className="absolute inset-0 bg-gradient-to-br from-[#1b2a64] via-black to-[#ff490d]/40" />
                )}
                <span className="absolute inset-0 bg-black/25" />
                <span className="absolute bottom-0 left-0 z-10">
                  <Image
                    src="/brand/live-play-circle.svg"
                    alt=""
                    width={200}
                    height={200}
                    className="h-[110px] w-[110px] sm:h-[150px] sm:w-[150px] md:h-[200px] md:w-[200px]"
                  />
                </span>
              </span>
            </Link>

            <div className="w-full md:flex-1 md:max-w-[602px]">
              <div className="flex flex-wrap items-center gap-3">
                <span className="inline-flex h-[30px] min-w-[101px] items-center justify-center gap-2 rounded-[5px] bg-[var(--fpn-rojo)] px-2.5 text-[13px] font-black uppercase tracking-wide text-white">
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
                  LIVE
                </span>
                <span className="text-[15px] font-medium text-white md:text-[17px]">
                  {data.liveEvent.starts_at
                    ? formatTickerTime(new Date(data.liveEvent.starts_at))
                    : "8:00 PM"}
                  {data.liveEvent.ends_at
                    ? ` - ${formatTickerTime(new Date(data.liveEvent.ends_at))}`
                    : ""}
                </span>
              </div>
              <p className="mt-5 text-[22px] font-extrabold italic leading-tight tracking-tight text-white md:text-[29px]">
                Now: FlashPoint Live
              </p>
              <h1 className="mt-4 max-w-xl font-article text-[2rem] font-bold leading-[1.15] tracking-tight text-white md:text-[2.75rem]">
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

      <div className="mx-auto max-w-[1654px] space-y-12 px-4 py-10 md:px-8 lg:px-10 lg:py-12">
        {/* Figma 34:12522 — left ~1236 (hero+2 + 3-col Politics/World) | right 370 (Podcasts + Latest) */}
        <section className="grid items-start gap-8 lg:grid-cols-[minmax(0,1fr)_minmax(280px,370px)] lg:gap-12">
          <div className="min-w-0 space-y-9">
            {/* Hero + 2 stacked sides (~775 + divider + ~373) */}
            <div className="grid gap-0 lg:grid-cols-[minmax(0,2.08fr)_1px_minmax(0,1fr)]">
              <div className="min-w-0 lg:pr-7">
                {data.featured ? (
                  <PostCard post={data.featured} variant="hero" />
                ) : null}
              </div>
              <div className="hidden bg-[#ccc] lg:block" aria-hidden />
              <div className="mt-8 flex flex-col border-t border-[#ccc] lg:mt-0 lg:border-t-0 lg:pl-7">
                {data.secondary.map((post) => (
                  <PostCard key={post.id} post={post} variant="stack" />
                ))}
              </div>
            </div>

            {/* Politics + World — max 6 cards in 3-col grid under hero */}
            {politicsWorld.length > 0 ? (
              <div>
                <div className="mb-1 flex flex-wrap items-center justify-end gap-4">
                  <SeeMore href="/category/politics" label="See more · Politics" />
                  <SeeMore href="/category/world" label="See more · World" />
                </div>
                <div className="grid gap-x-[21px] gap-y-2 sm:grid-cols-2 xl:grid-cols-3">
                  {politicsWorld.map((post) => (
                    <PostCard key={post.id} post={post} />
                  ))}
                </div>
              </div>
            ) : null}
          </div>

          <aside className="min-w-0 space-y-8">
            <div>
              <div className="mb-4 flex items-end justify-between gap-3">
                <h2 className="font-article text-[2rem] font-black leading-none tracking-tight md:text-[2.4rem]">
                  Podcasts
                </h2>
                <SeeMore href="/feed/podcasts" label="SEE ALL" />
              </div>
              <div className="border-t border-[#ccc]">
                {data.podcasts.map((post) => (
                  <PostCard key={post.id} post={post} variant="podcast" />
                ))}
              </div>
            </div>
            <div>
              <div className="mb-4 flex items-end justify-between gap-3">
                <h2 className="font-article text-[2rem] font-black leading-none tracking-tight md:text-[2.4rem]">
                  Latest News
                </h2>
                <SeeMore href="/feed/latest" />
              </div>
              <div className="border-t border-[#ccc]">
                {data.latest.map((post) => (
                  <PostCard key={post.id} post={post} variant="latest" />
                ))}
              </div>
            </div>
          </aside>
        </section>

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
            href="/register"
            className="inline-flex rounded-md bg-[var(--fpn-rojo)] px-7 py-3 text-sm font-bold text-white hover:brightness-110"
          >
            Subscribe
          </Link>
        </section>

        {/* Must-watch — Figma ~2/3 featured + 4 stacked */}
        <section>
          <div className="mb-6 flex items-end justify-between gap-3">
            <h2 className="font-article text-[2rem] font-black tracking-tight md:text-[2.4rem]">
              Must-Watch Videos
            </h2>
            <SeeMore href="/feed/videos" />
          </div>
          <div className="grid items-start gap-8 md:grid-cols-[minmax(0,1.85fr)_minmax(280px,1fr)]">
            {mainVideo ? <PostCard post={mainVideo} variant="video" /> : null}
            <div className="flex flex-col divide-y divide-[#ccc] border-t border-[#ccc]">
              {sideVideos.map((post) => {
                const thumb =
                  youtubeThumbnailUrl(post.video_url) || post.featured_image_url;
                return (
                  <article key={post.id} className="flex gap-4 py-5">
                    <Link
                      href={`/news/${post.slug}`}
                      className="relative aspect-video w-[148px] shrink-0 overflow-hidden rounded-[10px] bg-neutral-200 sm:w-[168px]"
                    >
                      {thumb ? (
                        <Image
                          src={thumb}
                          alt=""
                          fill
                          className="object-cover"
                          sizes="168px"
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
                    <div className="min-w-0 flex-1">
                      <p className="text-[11px] font-medium uppercase tracking-wide text-[var(--fpn-rojo)]">
                        {(post.category?.name ?? "Politics").toUpperCase()}
                      </p>
                      <Link
                        href={`/news/${post.slug}`}
                        className="mt-1 block font-article text-[17px] font-black leading-snug tracking-tight text-black hover:text-[var(--fpn-rojo)]"
                      >
                        {post.title}
                      </Link>
                      <div className="mt-2 flex flex-wrap items-center justify-between gap-2 text-[13px]">
                        <span className="inline-flex items-center gap-3 text-[var(--fpn-meta)]">
                          <span className="inline-flex items-center gap-1.5">
                            <Image
                              src="/brand/icon-clock.svg"
                              alt=""
                              width={14}
                              height={14}
                            />
                            {formatReadTime(post.reading_time_minutes)}
                          </span>
                          <span className="inline-flex items-center gap-1.5">
                            <Image
                              src="/brand/icon-comments.svg"
                              alt=""
                              width={13}
                              height={13}
                            />
                            {formatViews(post.view_count)}
                          </span>
                        </span>
                        <span className="text-[var(--fpn-rojo)]">
                          {formatDate(post.published_at)}
                        </span>
                      </div>
                    </div>
                  </article>
                );
              })}
            </div>
          </div>
        </section>

        {/* Elections — Figma 4×2 */}
        <section>
          <div className="mb-6 flex items-end justify-between gap-3">
            <h2 className="font-article text-[2rem] font-black tracking-tight md:text-[2.4rem]">
              Elections
            </h2>
            <SeeMore href="/category/elections" />
          </div>
          <div className="grid gap-x-5 gap-y-8 sm:grid-cols-2 lg:grid-cols-4">
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

      {/* Exclusive Content + Popular — Figma 34:12523 */}
      <section className="bg-[#F5F5F5]">
        <div className="mx-auto max-w-[1654px] px-4 py-12 md:px-8 lg:px-10 lg:py-14">
          <div className="mb-8 flex flex-wrap items-center justify-between gap-4">
            <div className="flex items-center gap-4">
              <Image
                src="/brand/exclusive-star.svg"
                alt=""
                width={60}
                height={60}
                className="h-12 w-12 md:h-[60px] md:w-[60px]"
              />
              <h2 className="font-article text-[2rem] font-black tracking-tight md:text-[2.4rem]">
                Exclusive Content
              </h2>
            </div>
            <SeeMore href="/feed/premium" />
          </div>

          {mainExclusive ? (
            <div className="mb-10 grid items-center gap-6 rounded-[24px] bg-black p-3.5 text-white md:grid-cols-2 md:gap-9 md:rounded-[33px] md:p-4">
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
                    width={48}
                    height={48}
                  />
                </span>
              </Link>
              <div className="px-2 pb-3 md:pr-4 md:pb-2">
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <p className="text-[15px] font-medium uppercase tracking-wide text-[var(--fpn-rojo)] md:text-[18px]">
                    {(mainExclusive.category?.name ?? "Politics").toUpperCase()}
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

          <div className="grid items-start gap-10 lg:grid-cols-[minmax(0,1fr)_minmax(280px,370px)] lg:gap-12">
            <div className="divide-y divide-[#ccc] border-t border-[#ccc]">
              {exclusiveRows.map((post) => (
                <article
                  key={post.id}
                  className="grid gap-5 py-7 md:grid-cols-[minmax(0,1.15fr)_minmax(0,1fr)] md:items-center"
                >
                  <div>
                    <p className="text-[12px] font-medium uppercase tracking-wide text-[var(--fpn-rojo)]">
                      {(post.category?.name ?? "News").toUpperCase()}
                    </p>
                    <h3 className="mt-1 font-article text-[1.35rem] font-black leading-snug tracking-tight md:text-[1.55rem]">
                      <Link
                        href={`/news/${post.slug}`}
                        className="hover:text-[var(--fpn-rojo)]"
                      >
                        {post.title}
                      </Link>
                    </h3>
                    {post.excerpt ? (
                      <p className="mt-2 line-clamp-2 text-[15px] leading-6 text-black/80 md:text-[16px]">
                        {post.excerpt}
                      </p>
                    ) : null}
                    <div className="mt-4 flex flex-wrap items-center justify-between gap-2 text-[13px]">
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
                    className="relative aspect-[556/311] overflow-hidden rounded-[12px] bg-neutral-200"
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
                        width={40}
                        height={40}
                      />
                    </span>
                  </Link>
                </article>
              ))}
            </div>

            <aside className="min-w-0">
              <div className="mb-4 flex items-end justify-between gap-3">
                <h2 className="font-article text-[2rem] font-black tracking-tight md:text-[2.4rem]">
                  Popular
                </h2>
                <SeeMore href="/feed/popular" />
              </div>
              <ol className="divide-y divide-[#ccc] border-t border-[#ccc]">
                {data.popular.slice(0, 5).map((post, index) => (
                  <li key={post.id} className="py-4">
                    <div className="mb-2 flex flex-wrap items-center gap-2">
                      <p className="text-[24px] font-medium leading-none text-[var(--fpn-rojo)]">
                        {index + 1}
                      </p>
                      {post.is_premium ? (
                        <span className="inline-flex items-center gap-1.5 rounded-[4px] bg-[var(--fpn-rojo)] px-2 py-0.5 text-[10px] font-black uppercase tracking-wide text-white">
                          <Image
                            src="/brand/exclusive-star.svg"
                            alt=""
                            width={16}
                            height={16}
                            className="h-4 w-4"
                          />
                          Exclusive
                        </span>
                      ) : null}
                      {post.is_featured ? (
                        <span className="inline-flex items-center gap-1 rounded-[4px] border border-[var(--fpn-rojo)] px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide text-[var(--fpn-rojo)]">
                          <Image
                            src="/brand/fpn-logo-mark.svg"
                            alt=""
                            width={12}
                            height={12}
                            className="h-3 w-3"
                          />
                          Featured
                        </span>
                      ) : null}
                      {!post.is_premium && !post.is_featured ? (
                        <span className="inline-flex items-center gap-1 rounded-[4px] bg-black px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide text-white">
                          <Image
                            src="/brand/exclusive-star.svg"
                            alt=""
                            width={14}
                            height={14}
                            className="h-3.5 w-3.5 invert"
                          />
                          Popular
                        </span>
                      ) : null}
                    </div>
                    <Link
                      href={`/news/${post.slug}`}
                      className="mt-1 block font-article text-[1.1rem] font-black leading-snug tracking-tight text-black hover:text-[var(--fpn-rojo)]"
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

      <div className="mx-auto max-w-[1654px] px-4 py-12 md:px-8 lg:px-10">
        <section className="border border-black/10 bg-white px-6 py-12 text-center">
          <h2 className="mx-auto max-w-xl font-article text-[1.75rem] font-black leading-snug tracking-tight">
            The biggest stories of the day delivered to your inbox
          </h2>
          <NewsletterSignup />
        </section>
      </div>
    </div>
  );
}
