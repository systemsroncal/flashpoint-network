import Image from "next/image";
import Link from "next/link";
import NewsletterSignup from "@/components/public/NewsletterSignup";
import PostCard from "@/components/public/PostCard";
import type { Category, Post } from "@/lib/types/cms";
import { formatDate, formatReadTime, formatViews } from "@/lib/format";
import { cardFeaturedImageUrl } from "@/lib/posts/media-layout";
import { getSiteTimezone } from "@/lib/timezone/settings";

type Props = {
  category: Category;
  posts: Post[];
  podcasts: Post[];
  latest: Post[];
  popular: Post[];
};

export default async function CategoryView({
  category,
  posts,
  podcasts,
  latest,
  popular,
}: Props) {
  const timeZone = await getSiteTimezone();
  const featured = posts[0] ?? null;
  const featuredSrc = featured ? cardFeaturedImageUrl(featured) : null;
  const grid = posts.slice(1, 4);
  const list = posts.slice(4);
  const label = category.name.toUpperCase();

  return (
    <div className="bg-white text-black">
      <div className="mx-auto max-w-[1440px] px-4 py-10 md:px-8 lg:px-10 lg:py-12">
        <h1 className="font-article text-[2.4rem] font-black tracking-tight md:text-[3rem]">
          {category.name}
        </h1>
        {category.description ? (
          <p className="mt-2 max-w-2xl text-sm text-black/65 md:text-base">
            {category.description}
          </p>
        ) : null}

        <div className="mt-8 grid gap-10 lg:mt-10 lg:grid-cols-[minmax(0,1.7fr)_370px] lg:gap-12">
          {/* Main column */}
          <div className="min-w-0 space-y-10">
            {posts.length === 0 ? (
              <div className="rounded-[12px] border border-dashed border-black/15 px-6 py-14 text-center">
                <h2 className="font-article text-2xl font-black tracking-tight">
                  No stories in {category.name} yet
                </h2>
                <p className="mx-auto mt-2 max-w-md text-sm text-black/60">
                  Editors haven&apos;t published coverage in this section. Browse
                  other categories or the latest on the home page.
                </p>
                <Link
                  href="/"
                  className="mt-6 inline-flex rounded-md bg-[var(--fpn-rojo)] px-5 py-2.5 text-sm font-bold text-white"
                >
                  Back to home
                </Link>
              </div>
            ) : null}
            {featured ? (
              <article>
                <Link
                  href={`/news/${featured.slug}`}
                  className="relative mb-5 block aspect-[16/9] overflow-hidden rounded-[24px] bg-neutral-200 lg:aspect-[1192/668]"
                >
                  {featuredSrc ? (
                    <Image
                      src={featuredSrc!}
                      alt=""
                      fill
                      priority
                      className="object-cover"
                      sizes="(max-width:1024px) 100vw, 70vw"
                    />
                  ) : null}
                </Link>
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <p className="text-[15px] font-medium uppercase tracking-wide text-[var(--fpn-rojo)] md:text-[18px]">
                    {label}
                  </p>
                  <span className="inline-flex items-center gap-3 text-[13px] text-[var(--fpn-meta)] md:text-[15px]">
                    <span className="inline-flex items-center gap-1.5">
                      <Image
                        src="/brand/icon-clock.svg"
                        alt=""
                        width={18}
                        height={18}
                      />
                      {formatReadTime(featured.reading_time_minutes)}
                    </span>
                    <span className="inline-flex items-center gap-1.5">
                      <Image
                        src="/brand/icon-comments.svg"
                        alt=""
                        width={16}
                        height={16}
                      />
                      {formatViews(featured.view_count)}
                    </span>
                  </span>
                </div>
                <h2 className="mt-2 font-article text-[1.75rem] font-black leading-[1.15] tracking-tight md:text-[2.35rem]">
                  <Link
                    href={`/news/${featured.slug}`}
                    className="hover:text-[var(--fpn-rojo)]"
                  >
                    {featured.title}
                  </Link>
                </h2>
                {featured.excerpt ? (
                  <p className="mt-3 text-[15px] leading-7 text-black/80 md:text-base">
                    {featured.excerpt}
                  </p>
                ) : null}
                <p className="mt-3 text-[14px] text-[var(--fpn-rojo)]">
                  {formatDate(featured.published_at, timeZone)}
                </p>
              </article>
            ) : (
              <p className="rounded-[12px] border border-dashed border-black/15 px-4 py-10 text-center text-sm text-black/50">
                No published stories in {category.name} yet.
              </p>
            )}

            {grid.length > 0 ? (
              <section className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
                {grid.map((post) => (
                  <PostCard key={post.id} post={post}  timeZone={timeZone} />
                ))}
              </section>
            ) : null}

            <section className="flex flex-col items-start justify-between gap-5 overflow-hidden rounded-[12px] bg-black px-6 py-8 text-white md:flex-row md:items-center md:px-10">
              <div>
                <h2 className="font-article text-[1.65rem] font-black leading-tight md:text-[1.9rem]">
                  Get The Full Story. As It Is.
                </h2>
                <p className="mt-1.5 text-sm text-white/70">
                  Subscribe for complete FPN access.
                </p>
              </div>
              <Link
                href="/register"
                className="inline-flex rounded-full bg-[var(--fpn-rojo)] px-7 py-3 text-sm font-bold text-white hover:brightness-110"
              >
                Subscribe
              </Link>
            </section>

            {list.length > 0 ? (
              <section className="divide-y divide-[#ccc] border-t border-[#ccc]">
                {list.map((post) => {
                  const thumb = cardFeaturedImageUrl(post);
                  return (
                  <article
                    key={post.id}
                    className="grid gap-5 py-6 md:grid-cols-[1fr_0.85fr] md:items-center"
                  >
                    <div>
                      <p className="text-[12px] font-medium uppercase tracking-wide text-[var(--fpn-rojo)]">
                        {(post.category?.name ?? category.name).toUpperCase()}
                      </p>
                      <h3 className="mt-1 font-article text-[1.25rem] font-black leading-snug tracking-tight md:text-[1.45rem]">
                        <Link
                          href={`/news/${post.slug}`}
                          className="hover:text-[var(--fpn-rojo)]"
                        >
                          {post.title}
                        </Link>
                      </h3>
                      {post.excerpt ? (
                        <p className="mt-2 line-clamp-2 text-[15px] leading-6 text-black/75">
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
                          {formatDate(post.published_at, timeZone)}
                        </span>
                      </div>
                    </div>
                    <Link
                      href={`/news/${post.slug}`}
                      className="relative aspect-[16/10] overflow-hidden rounded-[12px] bg-neutral-200"
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
                    </Link>
                  </article>
                  );
                })}
              </section>
            ) : null}
          </div>

          {/* Sidebar */}
          <aside className="space-y-9">
            <div className="relative aspect-[370/220] overflow-hidden rounded-[12px] bg-[#0B1220]">
              <div className="absolute inset-0 bg-gradient-to-tr from-[#1b2a64] via-[#111] to-[var(--fpn-rojo)] opacity-80" />
              <div className="absolute inset-0 flex flex-col justify-end p-4 text-white">
                <p className="text-[11px] font-bold uppercase tracking-[0.14em] text-white/70">
                  On air
                </p>
                <p className="mt-1 font-article text-xl font-black leading-snug">
                  FlashPoint Live
                </p>
              </div>
            </div>

            <div>
              <div className="mb-2 flex items-end justify-between gap-3">
                <h2 className="font-article text-[1.65rem] font-black tracking-tight">
                  Podcasts
                </h2>
                <Link
                  href="/feed/podcasts"
                  className="text-[11px] font-bold uppercase tracking-[0.08em] text-[var(--fpn-rojo)]"
                >
                  See more
                </Link>
              </div>
              <div className="border-t border-[#ccc]">
                {podcasts.map((post) => (
                  <PostCard key={post.id} post={post} variant="podcast"  timeZone={timeZone} />
                ))}
              </div>
            </div>

            <div>
              <div className="mb-2 flex items-end justify-between gap-3">
                <h2 className="font-article text-[1.65rem] font-black tracking-tight">
                  Latest News
                </h2>
                <Link
                  href="/feed/latest"
                  className="text-[11px] font-bold uppercase tracking-[0.08em] text-[var(--fpn-rojo)]"
                >
                  See more
                </Link>
              </div>
              <div className="border-t border-[#ccc]">
                {latest.map((post) => (
                  <PostCard key={post.id} post={post} variant="latest"  timeZone={timeZone} />
                ))}
              </div>
            </div>

            <div>
              <div className="mb-3 flex items-end justify-between gap-3">
                <h2 className="font-article text-[1.65rem] font-black tracking-tight">
                  Popular
                </h2>
                <Link
                  href="/feed/popular"
                  className="text-[11px] font-bold uppercase tracking-[0.08em] text-[var(--fpn-rojo)]"
                >
                  See more
                </Link>
              </div>
              <ol className="divide-y divide-[#ccc] border-t border-[#ccc]">
                {popular.map((post, index) => (
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
            </div>
          </aside>
        </div>

        {/* Newsletter */}
        <section className="mt-14 border border-black/10 bg-[#F7F7F7] px-6 py-12 text-center">
          <h2 className="mx-auto max-w-xl font-article text-[1.75rem] font-black leading-snug tracking-tight">
            The biggest stories of the day delivered to your inbox
          </h2>
          <NewsletterSignup />
        </section>
      </div>
    </div>
  );
}
