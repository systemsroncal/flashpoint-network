import Image from "next/image";
import Link from "next/link";
import BannerWidget from "@/components/public/BannerWidget";
import HomeLiveHero from "@/components/public/HomeLiveHero";
import LatestNewsBar from "@/components/public/LatestNewsBar";
import NewsletterSignup from "@/components/public/NewsletterSignup";
import PatriotHomeBanner from "@/components/public/PatriotHomeBanner";
import PostCard from "@/components/public/PostCard";
import StarlinkHomeBanner from "@/components/public/StarlinkHomeBanner";
import type { BannerSlot, BannerWidget as BannerWidgetRow } from "@/lib/banners/slots";
import type { HomePayload } from "@/lib/types/cms";
import {
  formatDate,
  formatReadTime,
  formatViews,
} from "@/lib/format";
import { cardFeaturedImageUrl } from "@/lib/posts/media-layout";
import { getSiteIdentity } from "@/lib/site-identity/settings";
import { getSiteTimezone } from "@/lib/timezone/settings";

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

export default async function HomeView({
  data,
  banners = {},
}: {
  data: HomePayload;
  banners?: Partial<Record<BannerSlot, BannerWidgetRow>>;
}) {
  const [timeZone, identity] = await Promise.all([
    getSiteTimezone(),
    getSiteIdentity(),
  ]);
  const defaultFeatured = identity.defaultFeaturedImageUrl;
  const mainVideo = data.mustWatch[0];
  const sideVideos = data.mustWatch.slice(1, 5);
  const mainExclusive = data.exclusives[0];
  const mainExclusiveThumb = mainExclusive
    ? cardFeaturedImageUrl(mainExclusive, defaultFeatured)
    : null;
  const exclusiveRows = data.exclusives.slice(1, 5);
  // Second band under First Section: exactly 3 Politics + 3 World (from data.grid).
  // No See more headers; excludes First Section pins/fills in getHomePayload.
  const politicsWorld =
    data.grid.length > 0
      ? data.grid.slice(0, 6)
      : [...data.politics.slice(0, 3), ...data.world.slice(0, 3)];

  return (
    <div className="w-full max-w-none bg-white text-black">
      <LatestNewsBar event={data.nextUpcomingEvent} timeZone={timeZone} />

      {!data.featured &&
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

      <HomeLiveHero />

      <div className="mx-auto max-w-[1654px] space-y-12 px-4 py-10 md:px-8 lg:px-10 lg:py-12">
        {/* Figma 34:12522 — left ~1236 (hero+2 + 3-col Politics/World) | right 370 (Podcasts + Latest) */}
        <section className="grid items-start gap-8 lg:grid-cols-[minmax(0,1fr)_minmax(280px,370px)] lg:gap-12">
          <div className="min-w-0 space-y-9">
            {data.featured || data.secondary.length > 0 ? (
              <header>
                <h2 className="font-article text-[2rem] font-black leading-[1.05] tracking-tight md:text-[2.75rem] lg:text-[3.25rem]">
                  Beyond the Broadcast
                </h2>
                <p className="mt-3 max-w-3xl text-[15px] leading-relaxed text-black/70 md:mt-4 md:text-[17px] md:leading-7">
                  Stay informed with original reporting, analysis, opinion, and
                  stories shaping faith, culture, America, and the world
                </p>
              </header>
            ) : null}

            {/* Hero + 2 stacked sides (~775 + divider + ~373) */}
            <div className="grid gap-0 lg:grid-cols-[minmax(0,2.08fr)_1px_minmax(0,1fr)]">
              <div className="min-w-0 lg:pr-7">
                {data.featured ? (
                  <PostCard post={data.featured} variant="hero"  timeZone={timeZone} />
                ) : null}
              </div>
              <div className="hidden bg-[#ccc] lg:block" aria-hidden />
              <div className="mt-8 flex flex-col border-t border-[#ccc] lg:mt-0 lg:border-t-0 lg:pl-7">
                {data.secondary.map((post) => (
                  <PostCard key={post.id} post={post} variant="stack"  timeZone={timeZone} />
                ))}
              </div>
            </div>

            {/* Politics + World — max 6 cards in 3-col grid under hero (no section header links) */}
            {politicsWorld.length > 0 ? (
              <div className="grid gap-x-[21px] gap-y-2 sm:grid-cols-2 xl:grid-cols-3">
                {politicsWorld.map((post) => (
                  <PostCard key={post.id} post={post}  timeZone={timeZone} />
                ))}
              </div>
            ) : null}
          </div>

          <aside className="min-w-0 space-y-8">
            {/* Sidebar ad above Podcasts — CMS slot home_above_podcasts */}
            <BannerWidget
              widget={banners.home_above_podcasts}
              aspectClassName="aspect-[371/389]"
              alt="Optimal Family Care advertisement"
            />

            <div>
              <div className="mb-4 flex items-end justify-between gap-3">
                <h2 className="font-article text-[1.65rem] font-black leading-[0.95] tracking-tight md:text-[2.15rem]">
                  Beyond the Broadcast
                </h2>
                <SeeMore href="/feed/podcasts" label="SEE ALL" />
              </div>
              <div className="border-t border-[#ccc]">
                {data.podcasts.map((post) => (
                  <PostCard key={post.id} post={post} variant="podcast"  timeZone={timeZone} />
                ))}
              </div>
            </div>

            <div>
              <div className="mb-4 flex items-end justify-between gap-3">
                <h2 className="font-article text-[2rem] font-black leading-none tracking-tight md:text-[45.5px]">
                  Latest News
                </h2>
                <SeeMore href="/feed/latest" />
              </div>
              <div className="border-t border-[#ccc]">
                {data.latest.map((post) => (
                  <PostCard key={post.id} post={post} variant="latest"  timeZone={timeZone} />
                ))}
              </div>
            </div>
          </aside>
        </section>

        {/* Subscribe banner — Figma Group 29790 (desktop row). Mobile/tablet: same row, scaled. */}
        <section className="mx-auto w-full max-w-[1160px] overflow-hidden rounded-[12px] bg-black text-white">
          <div className="flex min-h-[118px] items-stretch sm:min-h-[128px] md:min-h-[130px]">
            {/* Couple — left rail; overflow clip keeps photo inside banner frame */}
            <div className="relative w-[108px] shrink-0 overflow-hidden self-stretch sm:w-[148px] md:w-[197px]">
              <picture className="absolute inset-0 block h-full w-full overflow-hidden">
                <source
                  srcSet="/brand/banners/fpn-full-story-couple.webp"
                  type="image/webp"
                />
                {/* eslint-disable-next-line @next/next/no-img-element -- picture/webp fallback pair */}
                <img
                  src="/brand/banners/fpn-full-story-couple.png"
                  alt="FlashPoint Network hosts"
                  className="absolute inset-0 h-full w-full max-h-full object-cover object-[center_18%] sm:object-[center_12%] md:object-[center_8%]"
                  width={197}
                  height={164}
                />
              </picture>
            </div>

            <div className="flex min-w-0 flex-1 flex-col justify-center gap-2.5 px-3.5 py-3.5 sm:gap-3 sm:px-5 sm:py-4 md:flex-row md:items-center md:justify-between md:gap-6 md:px-8 md:py-6 lg:pl-7">
              <div className="min-w-0">
                <h2 className="font-article text-[clamp(1.05rem,3.8vw,1.45rem)] font-black leading-[1.18] tracking-tight text-pretty sm:text-[1.55rem] md:text-[2.15rem] lg:text-[2.45rem] lg:leading-[1.2]">
                  Get The Full Story. As It Is.
                </h2>
                <p className="mt-1 max-w-[36ch] text-[12.5px] leading-snug text-white/80 sm:mt-1.5 sm:text-sm md:max-w-none md:text-[1.05rem] md:leading-normal">
                  Subscribe for complete FPN access
                </p>
              </div>
              <Link
                href="/register"
                className="inline-flex w-full shrink-0 items-center justify-center rounded-md bg-[var(--fpn-rojo)] px-5 py-2.5 text-[13px] font-black text-white hover:brightness-110 sm:w-auto sm:self-start sm:text-sm md:self-center md:px-7 md:py-3"
              >
                Subscribe
              </Link>
            </div>
          </div>
        </section>

        {/* Must-watch — Figma ~2/3 featured + 4 stacked */}
        <section>
          <div className="mb-6 flex items-end justify-between gap-3">
            <h2 className="font-article text-[2rem] font-black tracking-tight md:text-[45.5px]">
              Must-Watch Videos
            </h2>
            <SeeMore href="/feed/videos" />
          </div>
          <div className="grid items-start gap-8 md:grid-cols-[minmax(0,1.85fr)_minmax(280px,1fr)]">
            {mainVideo ? <PostCard post={mainVideo} variant="video"  timeZone={timeZone} /> : null}
            <div className="flex flex-col divide-y divide-[#ccc] border-t border-[#ccc]">
              {sideVideos.map((post) => {
                const thumb = cardFeaturedImageUrl(post, defaultFeatured);
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
                        className="mt-1 block font-article text-[clamp(19px,1.6vw,1.5rem)] font-black leading-[1.3] tracking-[-0.03em] text-black hover:text-[var(--fpn-rojo)]"
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
                          {formatDate(post.published_at, timeZone)}
                        </span>
                      </div>
                    </div>
                  </article>
                );
              })}
            </div>
          </div>
        </section>

        <PatriotHomeBanner widget={banners.home_patriot_banner} />

        {/* Elections — Figma 4×2 */}
        <section>
          <div className="mb-6 flex items-end justify-between gap-3">
            <h2 className="font-article text-[2rem] font-black tracking-tight md:text-[45.5px]">
              Elections
            </h2>
            <SeeMore href="/category/elections" />
          </div>
          <div className="grid gap-x-5 gap-y-8 sm:grid-cols-2 lg:grid-cols-4">
            {data.elections.map((post) => (
              <PostCard key={post.id} post={{ ...post, is_video: true }}  timeZone={timeZone} />
            ))}
          </div>
        </section>
      </div>

      {/* Starlink ad — Figma 27:10588, full-bleed */}
      <StarlinkHomeBanner />

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
              <h2 className="font-article text-[2rem] font-black tracking-tight md:text-[45.5px]">
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
                {mainExclusiveThumb ? (
                  <Image
                    src={mainExclusiveThumb}
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
                <h3 className="mt-3 font-article text-[clamp(19px,1.6vw,1.5rem)] font-black leading-[1.3] tracking-[-0.5568px] lg:text-[53px] lg:leading-[64.6px]">
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
                  {formatDate(mainExclusive.published_at, timeZone)}
                </p>
              </div>
            </div>
          ) : null}

          <div className="grid items-start gap-10 lg:grid-cols-[minmax(0,1fr)_minmax(280px,370px)] lg:gap-12">
            <div className="divide-y divide-[#ccc] border-t border-[#ccc]">
              {exclusiveRows.map((post) => {
                const thumb = cardFeaturedImageUrl(post, defaultFeatured);
                return (
                <article
                  key={post.id}
                  className="grid gap-5 py-7 md:grid-cols-[minmax(0,1.15fr)_minmax(0,1fr)] md:items-center"
                >
                  <div>
                    <p className="text-[12px] font-medium uppercase tracking-wide text-[var(--fpn-rojo)]">
                      {(post.category?.name ?? "News").toUpperCase()}
                    </p>
                    <h3 className="mt-1 font-article text-[clamp(19px,1.6vw,1.5rem)] font-black leading-[1.3] tracking-[-0.04em] md:text-[33.57px] md:leading-[39px]">
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
                        {formatDate(post.published_at, timeZone)}
                      </span>
                    </div>
                  </div>
                  <Link
                    href={`/news/${post.slug}`}
                    className="relative aspect-[556/311] overflow-hidden rounded-[12px] bg-neutral-200"
                  >
                    {thumb ? (
                      <Image
                        src={thumb}
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
                );
              })}
            </div>

            <aside className="min-w-0 lg:sticky lg:top-6">
              <div className="space-y-8">
                {/* Revival promo — CMS slot home_above_latest (above Popular) */}
                <BannerWidget
                  widget={banners.home_above_latest}
                  aspectClassName="aspect-[370/283]"
                  alt="Special offer — Flashpoint of Revival"
                />

                <div>
                  <div className="mb-4 flex items-end justify-between gap-3">
                    <h2 className="font-article text-[2rem] font-black tracking-tight md:text-[45.5px]">
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
                          className="mt-1 block font-article text-[clamp(19px,1.6vw,1.5rem)] font-black leading-[1.3] tracking-[-0.03em] text-black hover:text-[var(--fpn-rojo)]"
                        >
                          {post.title}
                        </Link>
                      </li>
                    ))}
                  </ol>
                </div>
              </div>
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
