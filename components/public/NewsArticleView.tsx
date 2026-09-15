import Image from "next/image";
import Link from "next/link";
import PostCard from "@/components/public/PostCard";
import RichHtml from "@/components/public/RichHtml";
import ShareBar from "@/components/public/ShareBar";
import type { Post } from "@/lib/types/cms";
import { formatDate, formatReadTime, formatViews } from "@/lib/format";

type Props = {
  post: Post;
  latest: Post[];
  podcasts: Post[];
  popular: Post[];
  previous: Post | null;
  next: Post | null;
};

export default function NewsArticleView({
  post,
  latest,
  podcasts,
  popular,
  previous,
  next,
}: Props) {
  const category = (post.category?.name ?? "News").toUpperCase();
  const href = `/news/${post.slug}`;
  const caption =
    post.excerpt ||
    "Photo courtesy of Flash Point Network coverage.";

  return (
    <article className="bg-white text-black">
      {/* Title + dek */}
      <div className="mx-auto max-w-[1280px] px-4 pb-6 pt-10 text-center md:px-8 lg:px-10 lg:pt-12">
        <h1 className="mx-auto max-w-[1100px] font-article text-[2rem] font-black leading-[1.15] tracking-tight text-black md:text-[2.75rem] lg:text-[3.2rem]">
          {post.title}
        </h1>
        {post.excerpt ? (
          <p className="mx-auto mt-5 max-w-[980px] text-base leading-7 text-black md:text-[1.25rem] md:leading-9">
            {post.excerpt}
          </p>
        ) : null}
      </div>

      {/* Hero + meta / vertical share */}
      <div className="mx-auto max-w-[1440px] px-4 md:px-8 lg:px-10">
        <div className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-center lg:gap-8">
          <div className="w-full max-w-[1100px] flex-1">
            {post.featured_image_url ? (
              <div className="relative aspect-[16/9] overflow-hidden rounded-[13px] bg-neutral-200 lg:aspect-[1245/697]">
                <Image
                  src={post.featured_image_url}
                  alt=""
                  fill
                  priority
                  className="object-cover"
                  sizes="(max-width:1024px) 100vw, 1100px"
                />
              </div>
            ) : (
              <div className="aspect-[16/9] rounded-[13px] bg-neutral-200" />
            )}
          </div>

          <aside className="flex w-full shrink-0 flex-row flex-wrap items-start justify-between gap-6 border-t border-[#ccc] pt-4 lg:w-[140px] lg:flex-col lg:border-t-0 lg:pt-0">
            <div className="space-y-2">
              <p className="text-[18px] font-medium uppercase tracking-wide text-[var(--fpn-rojo)] lg:text-[22px]">
                {category}
              </p>
              <p className="text-[15px] font-semibold text-[var(--fpn-rojo)] lg:text-[17px]">
                {formatDate(post.published_at)}
              </p>
              <div className="flex flex-col gap-2 text-[15px] text-black lg:text-[17px]">
                <span className="inline-flex items-center gap-2">
                  <Image
                    src="/brand/icon-clock.svg"
                    alt=""
                    width={18}
                    height={18}
                  />
                  {formatReadTime(post.reading_time_minutes)}
                </span>
                <span className="inline-flex items-center gap-2">
                  <Image
                    src="/brand/icon-comments.svg"
                    alt=""
                    width={17}
                    height={17}
                  />
                  {formatViews(post.view_count)}
                </span>
              </div>
            </div>
            <div className="hidden lg:block">
              <ShareBar title={post.title} urlPath={href} orientation="vertical" />
            </div>
          </aside>
        </div>
      </div>

      {/* Body + sidebar */}
      <div className="mx-auto mt-10 grid max-w-[1440px] gap-10 px-4 pb-6 md:px-8 lg:mt-12 lg:grid-cols-[minmax(0,1fr)_370px] lg:gap-12 lg:px-10">
        <div className="mx-auto w-full max-w-[906px] lg:mx-0">
          <p className="mb-6 font-article text-[15px] leading-relaxed text-[#111] md:text-[16px]">
            {caption}
          </p>

          <RichHtml
            html={post.body || (post.excerpt ? `<p>${post.excerpt}</p>` : "")}
            className="fpn-rich-html fpn-article-body text-[17px] leading-[1.7] text-[#111] md:text-[18px]"
          />

          {/* Gift CTA */}
          <div className="mt-10 flex items-center gap-4 border-y border-[#ccc] py-5">
            <Image src="/brand/gift.svg" alt="" width={48} height={48} />
            <div>
              <p className="font-article text-lg font-black tracking-tight">
                Give a Gift Subscription
              </p>
              <p className="text-sm text-black/70">
                Share the FPN with someone special.
              </p>
            </div>
            <Link
              href="/admin"
              className="ml-auto hidden rounded-md bg-[var(--fpn-rojo)] px-4 py-2 text-sm font-bold text-white sm:inline-flex"
            >
              Gift now
            </Link>
          </div>

          {/* Soft paywall / continue CTA */}
          <div className="relative mt-10 overflow-hidden rounded-[12px] bg-[#F3F3F3] px-6 py-12 text-center">
            <div className="pointer-events-none absolute inset-x-0 -top-16 h-16 bg-gradient-to-b from-transparent to-[#F3F3F3]" />
            <h2 className="font-article text-2xl font-black tracking-tight md:text-[1.75rem]">
              Don&apos;t stop here
            </h2>
            <p className="mx-auto mt-2 max-w-md text-sm text-black/70">
              Create your FPN All Access account for free to keep reading and join
              the conversation.
            </p>
            <Link
              href="/admin"
              className="mt-5 inline-flex rounded-md bg-[var(--fpn-rojo)] px-6 py-3 text-sm font-bold text-white hover:brightness-110"
            >
              Create your FPN All Access account for free
            </Link>
            <p className="mt-3 text-sm text-black/60">
              Already a subscriber?{" "}
              <Link href="/admin" className="font-semibold underline">
                Log In
              </Link>
            </p>
          </div>

          <div className="mt-10 lg:hidden">
            <ShareBar title={post.title} urlPath={href} />
          </div>

          <div className="mt-10 hidden lg:block">
            <ShareBar title={post.title} urlPath={href} />
          </div>

          {/* Prev / Next */}
          <div className="mt-10 grid gap-6 border-t border-[#ccc] pt-8 sm:grid-cols-2">
            <div>
              <p className="text-[11px] font-bold uppercase tracking-[0.14em] text-black/50">
                Previous
              </p>
              {previous ? (
                <Link
                  href={`/news/${previous.slug}`}
                  className="mt-2 block font-article text-lg font-black leading-snug tracking-tight hover:text-[var(--fpn-rojo)]"
                >
                  {previous.title}
                </Link>
              ) : (
                <p className="mt-2 text-sm text-black/40">Start of the feed</p>
              )}
            </div>
            <div className="sm:text-right">
              <p className="text-[11px] font-bold uppercase tracking-[0.14em] text-black/50">
                Next
              </p>
              {next ? (
                <Link
                  href={`/news/${next.slug}`}
                  className="mt-2 block font-article text-lg font-black leading-snug tracking-tight hover:text-[var(--fpn-rojo)]"
                >
                  {next.title}
                </Link>
              ) : (
                <p className="mt-2 text-sm text-black/40">End of the feed</p>
              )}
            </div>
          </div>

          {/* Comments CTA */}
          <div className="mt-12 border-t border-[#ccc] pt-8">
            <h2 className="font-article text-[1.75rem] font-black tracking-tight">
              Comments
            </h2>
            <p className="mt-2 text-sm text-black/65">
              Only FPN all-access subscribers can comment.
            </p>
            <Link
              href="/admin"
              className="mt-4 inline-flex rounded-md bg-[var(--fpn-rojo)] px-5 py-3 text-sm font-bold text-white hover:brightness-110"
            >
              Unlock FPN All-Access to join the conversation
            </Link>
          </div>
        </div>

        {/* Right sidebar */}
        <aside className="space-y-10">
          <div className="overflow-hidden rounded-[12px] bg-[#111] p-4 text-white">
            <p className="text-[11px] font-bold uppercase tracking-[0.14em] text-[var(--fpn-rojo)]">
              Special offer
            </p>
            <p className="mt-3 font-article text-xl font-black leading-snug">
              Flashpoint of Revival
            </p>
            <p className="mt-2 text-sm text-white/65">
              Pair coverage with the books shaping tonight&apos;s conversation.
            </p>
            <Link
              href="/admin"
              className="mt-4 inline-flex rounded-md bg-white px-4 py-2 text-sm font-bold text-black"
            >
              View offer
            </Link>
          </div>

          <div>
            <h2 className="font-article text-[1.75rem] font-black tracking-tight md:text-[2rem]">
              Latest News
            </h2>
            <div className="mt-2 border-t border-[#ccc]">
              {latest.map((item) => (
                <PostCard key={item.id} post={item} variant="latest" />
              ))}
            </div>
          </div>

          <div>
            <div className="mb-2 flex items-end justify-between gap-3">
              <h2 className="font-article text-[1.75rem] font-black tracking-tight md:text-[2rem]">
                Podcasts
              </h2>
              <Link
                href="/?type=podcast"
                className="text-[11px] font-bold uppercase tracking-[0.08em] text-[var(--fpn-rojo)]"
              >
                See all
              </Link>
            </div>
            <div className="border-t border-[#ccc]">
              {podcasts.map((item) => (
                <PostCard key={item.id} post={item} variant="podcast" />
              ))}
            </div>
          </div>
        </aside>
      </div>

      {/* Popular */}
      {popular.length > 0 ? (
        <section className="border-t border-[#ccc] bg-white">
          <div className="mx-auto max-w-[1440px] px-4 py-12 md:px-8 lg:px-10">
            <h2 className="mb-6 font-article text-[1.85rem] font-black tracking-tight md:text-[2.2rem]">
              Popular
            </h2>
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {popular.map((item) => (
                <PostCard key={item.id} post={item} />
              ))}
            </div>
          </div>
        </section>
      ) : null}
    </article>
  );
}
