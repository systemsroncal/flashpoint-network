import Image from "next/image";
import Link from "next/link";
import BannerWidget from "@/components/public/BannerWidget";
import PostCard from "@/components/public/PostCard";
import PaywallGate from "@/components/public/PaywallGate";
import RichHtml from "@/components/public/RichHtml";
import ShareBar from "@/components/public/ShareBar";
import VideoPlayer from "@/components/public/VideoPlayer";
import type { BannerSlot, BannerWidget as BannerWidgetRow } from "@/lib/banners/slots";
import type { Post } from "@/lib/types/cms";
import type { PaywallSettings } from "@/lib/paywall/settings";
import { formatDate, formatReadTime, formatViews } from "@/lib/format";
import { resolveMediaUrl } from "@/lib/media/public-url";
import { shouldShowFeaturedImageInArticleHero } from "@/lib/posts/media-layout";
import { youtubeThumbnailUrl } from "@/lib/media/youtube";
import { withPublicAuthAccess } from "@/lib/auth/public-auth-gate";
import { getSiteIdentity } from "@/lib/site-identity/settings";
import { getSiteTimezone } from "@/lib/timezone/settings";

type Props = {
  post: Post;
  latest: Post[];
  podcasts: Post[];
  popular: Post[];
  previous: Post | null;
  next: Post | null;
  paywall: PaywallSettings;
  paywallBypass: boolean;
  banners?: Partial<Record<BannerSlot, BannerWidgetRow>>;
};

export default async function NewsArticleView({
  post,
  latest,
  podcasts,
  popular,
  previous,
  next,
  paywall,
  paywallBypass,
  banners = {},
}: Props) {
  const [timeZone, identity] = await Promise.all([
    getSiteTimezone(),
    getSiteIdentity(),
  ]);
  const categoryName = post.category?.name ?? "News";
  const category = categoryName.toUpperCase();
  const categoryHref = post.category?.slug
    ? `/category/${post.category.slug}`
    : null;
  const href = `/news/${post.slug}`;
  const featured =
    resolveMediaUrl(post.featured_image_url) ||
    identity.defaultFeaturedImageUrl;
  // Switch is article-hero only — cards/home/SEO always keep featured_image_url.
  const showFeatured = shouldShowFeaturedImageInArticleHero(post);
  const playerInHero = Boolean(post.video_url) && !showFeatured;
  const loginHref = withPublicAuthAccess(
    `/login?next=${encodeURIComponent(href)}`,
  );
  const registerHref = withPublicAuthAccess(
    `/register?next=${encodeURIComponent(href)}`,
  );

  return (
    <article className="bg-white text-black">
      <div className="mx-auto grid max-w-[1440px] gap-10 px-4 pb-6 md:px-8 lg:grid-cols-[minmax(0,1fr)_370px] lg:gap-12 lg:px-10">
        <div className="min-w-0 lg:col-start-1">
          <div className="w-full max-w-[906px] pb-8 pt-10 lg:mx-0 lg:pt-12">
        <header className="text-left">
          {categoryHref ? (
            <Link
              href={categoryHref}
              className="inline-flex rounded-full bg-[var(--fpn-rojo)] px-4 py-1.5 text-[11px] font-bold uppercase tracking-[0.12em] text-white hover:brightness-110"
            >
              {category}
            </Link>
          ) : (
            <span className="inline-flex rounded-full bg-[var(--fpn-rojo)] px-4 py-1.5 text-[11px] font-bold uppercase tracking-[0.12em] text-white">
              {category}
            </span>
          )}
          <h1 className="mt-5 font-article text-[2rem] font-black leading-[1.12] tracking-tight text-black md:text-[2.65rem] lg:text-[3rem]">
            {post.title}
          </h1>
          {post.excerpt ? (
            <p className="mt-4 text-base leading-7 text-black/90 md:text-lg md:leading-8">
              {post.excerpt}
            </p>
          ) : null}
          <div className="mt-5 flex flex-wrap items-center gap-x-5 gap-y-2 text-[15px] text-black">
            <span className="inline-flex items-center gap-2">
              <Image src="/brand/icon-clock.svg" alt="" width={18} height={18} />
              {formatReadTime(post.reading_time_minutes)}
            </span>
            <button
              type="button"
              className="inline-flex items-center gap-2 text-black/80 hover:text-[var(--fpn-rojo)]"
              aria-label="Save article"
            >
              <svg width="16" height="20" viewBox="0 0 16 20" fill="none" aria-hidden>
                <path
                  d="M2 1.5h12v17L8 14.5 2 18.5v-17z"
                  stroke="currentColor"
                  strokeWidth="1.5"
                  strokeLinejoin="round"
                />
              </svg>
            </button>
            <span className="inline-flex items-center gap-2">
              <Image src="/brand/icon-comments.svg" alt="" width={17} height={17} />
              {formatViews(post.view_count)}
            </span>
            <span className="hidden text-black/50 sm:inline" aria-hidden>·</span>
            <time
              dateTime={post.published_at ?? undefined}
              className="hidden text-[14px] text-[var(--fpn-rojo)] sm:inline"
            >
              {formatDate(post.published_at, timeZone)}
            </time>
          </div>
        </header>

        <div className="mt-8">
          {playerInHero && post.video_url ? (
            <div className="overflow-hidden rounded-[13px] bg-black">
              <VideoPlayer
                url={post.video_url}
                title={post.title}
                poster={
                  featured ||
                  youtubeThumbnailUrl(post.video_url) ||
                  null
                }
              />
            </div>
          ) : showFeatured && featured ? (
            <div className="relative aspect-[16/9] overflow-hidden rounded-[13px] bg-neutral-200 lg:aspect-[1245/697]">
              <Image
                src={featured}
                alt=""
                fill
                priority
                className="object-cover"
                sizes="(max-width:1024px) 100vw, 906px"
              />
            </div>
          ) : showFeatured ? (
            <div className="aspect-[16/9] rounded-[13px] bg-neutral-200 lg:aspect-[1245/697]" />
          ) : null}
        </div>

        <div className="mt-6 border-b border-[#ccc] pb-8 pt-2">
          <ShareBar
            title={post.title}
            urlPath={href}
            excerpt={post.excerpt}
            variant="strip"
          />
        </div>
          </div>

        <div className="w-full max-w-[906px] lg:mx-0">
          {/* Player in body only when hero still shows the featured image */}
          {post.video_url && showFeatured ? (
            <div className="mb-8">
              <VideoPlayer
                url={post.video_url}
                title={post.title}
                poster={
                  featured || youtubeThumbnailUrl(post.video_url) || null
                }
              />
            </div>
          ) : null}

          <PaywallGate
            postId={post.id}
            isPremium={Boolean(post.is_premium)}
            enabled={paywall.enabled}
            freeArticleLimit={paywall.freeArticleLimit}
            bypass={paywallBypass}
            title={paywall.modalTitle}
            body={paywall.modalBody}
          >
            <RichHtml
              html={post.body || (post.excerpt ? `<p>${post.excerpt}</p>` : "")}
              className="fpn-article-body"
            />
          </PaywallGate>

          <div className="mt-10 border-t border-[#ccc] pt-8 pb-8">
            <ShareBar
              title={post.title}
              urlPath={href}
              excerpt={post.excerpt}
              orientation="horizontal"
            />
          </div>

          <div className="grid gap-8 border-y border-[#ccc] py-8 sm:grid-cols-2 sm:gap-6">
            <div>
              <p className="text-[11px] font-bold uppercase tracking-[0.14em] text-[var(--fpn-rojo)]">
                Previous
              </p>
              {previous ? (
                <Link
                  href={`/news/${previous.slug}`}
                  className="mt-3 block font-article text-lg font-black leading-snug tracking-tight hover:text-[var(--fpn-rojo)] md:text-xl"
                >
                  {previous.title}
                </Link>
              ) : (
                <p className="mt-3 text-sm text-black/40">Start of the feed</p>
              )}
            </div>
            <div className="sm:text-right">
              <p className="text-[11px] font-bold uppercase tracking-[0.14em] text-[var(--fpn-rojo)]">
                Next
              </p>
              {next ? (
                <Link
                  href={`/news/${next.slug}`}
                  className="mt-3 block font-article text-lg font-black leading-snug tracking-tight hover:text-[var(--fpn-rojo)] md:text-xl"
                >
                  {next.title}
                </Link>
              ) : (
                <p className="mt-3 text-sm text-black/40">End of the feed</p>
              )}
            </div>
          </div>

          <div className="pt-10">
            <h2 className="font-article text-[1.75rem] font-black tracking-tight md:text-[2rem]">
              Comments
            </h2>
            <p className="mt-6 text-center text-[15px] text-black/80">
              Only FPTN All Access subscribers can comment
            </p>
            <Link
              href={registerHref}
              className="mt-5 flex w-full items-center justify-center rounded-[6px] bg-[var(--fpn-rojo)] px-6 py-4 text-center text-[15px] font-bold leading-snug text-white hover:brightness-110"
            >
              Unlock FPTN All Access to join the conversation.
            </Link>
            <p className="mt-5 text-center text-[15px] text-black/80">
              Already a subscriber?{" "}
              <Link
                href={loginHref}
                className="font-bold text-black underline underline-offset-2 hover:text-[var(--fpn-rojo)]"
              >
                Log In
              </Link>
            </p>
          </div>
        </div>
        </div>

        <aside className="space-y-10 lg:col-start-2 lg:row-start-1 lg:self-start lg:pt-12">
          <div className="flex flex-col gap-3">
            <BannerWidget
              widget={banners.article_above_latest_patriot}
              aspectClassName="md:aspect-[370/340]"
              alt="Are You a Patriot? Join FP Army Chapters"
            />
            <BannerWidget
              widget={banners.article_above_latest_ofc}
              aspectClassName="md:aspect-[371/389]"
              alt="Optimal Family Care advertisement"
            />
          </div>

          <div>
            <div className="mb-2 flex items-end justify-between gap-3">
              <h2 className="font-article text-[1.75rem] font-black tracking-tight md:text-[2rem]">
                Latest News
              </h2>
              <Link
                href="/feed/latest"
                className="text-[11px] font-bold uppercase tracking-[0.08em] text-[var(--fpn-rojo)]"
              >
                See more
              </Link>
            </div>
            <div className="mt-2 border-t border-[#ccc]">
              {latest.map((item) => (
                <PostCard key={item.id} post={item} variant="latest"  timeZone={timeZone} />
              ))}
            </div>
          </div>

          <div>
            <div className="mb-2 flex items-end justify-between gap-3">
              <h2 className="font-article text-[1.65rem] font-black leading-[0.95] tracking-tight md:text-[2rem]">
                Beyond the Broadcast
              </h2>
              <Link
                href="/feed/podcasts"
                className="text-[11px] font-bold uppercase tracking-[0.08em] text-[var(--fpn-rojo)]"
              >
                See more
              </Link>
            </div>
            <div className="border-t border-[#ccc]">
              {podcasts.map((item) => (
                <PostCard key={item.id} post={item} variant="podcast"  timeZone={timeZone} />
              ))}
            </div>
          </div>
        </aside>
      </div>

      {/* Popular */}
      {popular.length > 0 ? (
        <section className="border-t border-[#ccc] bg-white">
          <div className="mx-auto max-w-[1440px] px-4 py-12 md:px-8 lg:px-10">
            <div className="mb-6 flex items-end justify-between gap-3">
              <h2 className="font-article text-[1.85rem] font-black tracking-tight md:text-[2.2rem]">
                Popular
              </h2>
              <Link
                href="/feed/popular"
                className="text-[11px] font-bold uppercase tracking-[0.08em] text-[var(--fpn-rojo)]"
              >
                See more
              </Link>
            </div>
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {popular.map((item) => (
                <PostCard key={item.id} post={item}  timeZone={timeZone} />
              ))}
            </div>
          </div>
        </section>
      ) : null}
    </article>
  );
}
