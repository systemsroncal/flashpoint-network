import Image from "next/image";
import Link from "next/link";
import type { Post } from "@/lib/types/cms";
import { formatDate, formatReadTime } from "@/lib/format";
import { cardFeaturedImageUrl } from "@/lib/posts/media-layout";

const PARTNERS = [
  { src: "/brand/home/partner-roku.png", alt: "Roku", w: 108, h: 34 },
  { src: "/brand/home/partner-xfinity.png", alt: "Xfinity", w: 120, h: 40 },
  { src: "/brand/home/partner-gtn.png", alt: "GTN", w: 88, h: 34 },
  { src: "/brand/home/daystar.svg", alt: "Daystar", w: 120, h: 34 },
  { src: "/brand/home/partner-ovtv.png", alt: "OVTV", w: 76, h: 40 },
  { src: "/brand/home/partner-circle.png", alt: "Partner", w: 56, h: 56 },
  { src: "/brand/home/partner-stream.png", alt: "Streaming partner", w: 150, h: 40 },
  { src: "/brand/home/partner-now.png", alt: "NOW Network", w: 90, h: 40 },
  { src: "/brand/home/partner-unnamed10.png", alt: "Partner", w: 56, h: 56 },
  { src: "/brand/home/partner-logo.png", alt: "Partner", w: 110, h: 26 },
  { src: "/brand/home/partner-wbna.png", alt: "WBNA", w: 110, h: 36 },
  { src: "/brand/home/partner-wbnm.png", alt: "WBNM", w: 110, h: 40 },
  { src: "/brand/home/partner-wjde.png", alt: "WJDE", w: 110, h: 34 },
  { src: "/brand/home/partner-kbpx.png", alt: "KBPX", w: 110, h: 36 },
  { src: "/brand/home/partner-fcc.png", alt: "FCC", w: 110, h: 28 },
];

const REASONS = [
  {
    title: "Enjoy It at Home",
    body: "Watch FPTN through Roku, local broadcast channels, digital platforms, and a growing list of distribution partners — with more ways to watch coming soon.",
    icon: "/brand/home/reason-home.png",
  },
  {
    title: "Watch Everywhere",
    body: "Take FlashPoint with you on your phone, tablet, laptop, PC, or Mac. Just visit FPTN.com and access live programming wherever you are.",
    icon: "/brand/home/reason-everywhere.png",
  },
  {
    title: "Stay Informed",
    body: "Follow current events, breaking stories, interviews, and conversations through FlashPoint programming and FPTN News — helping you stay connected to what is happening in America and around the world.",
    icon: "/brand/home/reason-informed.png",
  },
  {
    title: "Build a Stronger Culture",
    body: "Discover shows, teachings, documentaries, classics, and original programming centered on faith, family, American history and values, Christian voices, and stories designed to inform and inspire.",
    icon: "/brand/home/reason-culture.png",
  },
];

const PILLARS = [
  {
    title: "Black & White Favorites",
    href: "/classic-programs",
    // sprite positions approximated from Figma collage
    objectPosition: "12% 40%",
  },
  {
    title: "Pastors & Ministries",
    href: "/network-programs",
    objectPosition: "38% 40%",
  },
  {
    title: "News & Analysis",
    href: "/news",
    objectPosition: "64% 40%",
  },
  {
    title: "Gene Bailey & More",
    href: "/live",
    objectPosition: "88% 40%",
  },
];

function PartnersGrid({ className = "" }: { className?: string }) {
  return (
    <div
      className={`flex flex-wrap items-center justify-center gap-x-8 gap-y-6 md:justify-start ${className}`}
    >
      {PARTNERS.map((p) => (
        <div
          key={p.src + p.alt}
          className="relative opacity-90 grayscale invert"
          style={{ width: p.w, height: p.h }}
        >
          <Image src={p.src} alt={p.alt} fill className="object-contain" sizes={`${p.w}px`} />
        </div>
      ))}
    </div>
  );
}

export default function HomeNetworkMarketing({
  newsPosts,
  defaultFeatured,
  timeZone,
}: {
  newsPosts: Post[];
  defaultFeatured: string | null;
  timeZone: string;
}) {
  return (
    <div className="bg-[#101011] text-white">
      {/* Classics banner */}
      <section className="px-4 py-10 md:px-8 lg:px-10">
        <div className="mx-auto flex max-w-[1350px] flex-col items-stretch overflow-hidden rounded-[22px] border border-[#2a1747] bg-[#000d3c] md:flex-row md:items-center">
          <div className="relative mx-auto h-[140px] w-[160px] shrink-0 md:mx-0 md:h-[154px] md:w-[182px]">
            <Image
              src="/brand/home/classics-popcorn.png"
              alt=""
              fill
              className="object-contain"
              sizes="182px"
            />
          </div>
          <div className="flex flex-1 flex-col gap-4 px-6 pb-6 pt-2 md:flex-row md:items-center md:justify-between md:px-8 md:py-6">
            <div className="min-w-0">
              <h2 className="text-xl font-bold tracking-tight md:text-[1.4rem]">
                The Black & White Classics Are Back
              </h2>
              <p className="mt-2 max-w-3xl text-[15px] leading-relaxed text-white/90 md:text-[19px] md:leading-7">
                Rediscover the timeless American shows generations grew up
                watching. Classic stories, wholesome entertainment, and
                unforgettable television —{" "}
                <span className="font-bold">right here on FPTN.</span>
              </p>
            </div>
            <Link
              href="/classic-programs"
              className="inline-flex shrink-0 items-center justify-center rounded-full bg-white px-8 py-3 text-sm font-bold text-[#101011] hover:bg-white/90"
            >
              See All Family Shows
            </Link>
          </div>
        </div>
      </section>

      {/* More reasons */}
      <section className="px-4 py-12 md:px-8 md:py-16 lg:px-10">
        <h2 className="mx-auto max-w-[1560px] text-center font-article text-[1.85rem] font-bold tracking-tight md:text-left md:text-[2.7rem]">
          More Reasons to Stay Connected with FlashPoint TV Network
        </h2>
        <div className="mx-auto mt-8 grid max-w-[1560px] gap-4 sm:grid-cols-2 xl:grid-cols-4">
          {REASONS.map((reason) => (
            <article
              key={reason.title}
              className="flex min-h-[300px] flex-col justify-between rounded-[20px] bg-gradient-to-r from-[#161836] to-[#100d1e] p-6 md:min-h-[340px] md:p-7"
            >
              <div>
                <h3 className="text-[1.35rem] font-black leading-snug md:text-[1.65rem]">
                  {reason.title}
                </h3>
                <p className="mt-3 text-[15px] leading-relaxed text-[#c3c5d6] md:text-[17px]">
                  {reason.body}
                </p>
              </div>
              <div className="mt-6 flex justify-end">
                <div className="relative h-16 w-20">
                  <Image
                    src={reason.icon}
                    alt=""
                    fill
                    className="object-contain object-right"
                    sizes="80px"
                  />
                </div>
              </div>
            </article>
          ))}
        </div>
      </section>

      {/* Stay informed news */}
      {newsPosts.length > 0 ? (
        <section className="bg-white px-4 py-12 text-black md:px-8 md:py-16 lg:px-10">
          <div className="mx-auto max-w-[1560px]">
            <div className="flex flex-wrap items-end justify-between gap-3">
              <div>
                <h2 className="font-article text-[2rem] font-black tracking-tight md:text-[2.85rem]">
                  STAY INFORMED. GO DEEPER.
                </h2>
                <p className="mt-3 max-w-3xl text-[15px] text-black/70 md:text-[19px]">
                  Watch the conversation live, then explore the stories,
                  analysis, and articles behind the issues shaping America and
                  the world.
                </p>
              </div>
              <Link
                href="/news"
                className="text-sm font-bold text-[#101011] hover:underline"
              >
                View More &gt;
              </Link>
            </div>
            <div className="mt-8 grid gap-6 sm:grid-cols-2 xl:grid-cols-4">
              {newsPosts.slice(0, 4).map((post) => {
                const thumb = cardFeaturedImageUrl(post, defaultFeatured);
                const category =
                  post.category?.name?.toUpperCase() || "NEWS";
                return (
                  <article key={post.id} className="min-w-0">
                    <Link
                      href={`/news/${post.slug}`}
                      className="relative block aspect-[369/206] overflow-hidden rounded-[10px] bg-neutral-200"
                    >
                      {thumb ? (
                        <Image
                          src={thumb}
                          alt=""
                          fill
                          className="object-cover"
                          sizes="(max-width:1280px) 50vw, 25vw"
                        />
                      ) : null}
                    </Link>
                    <p className="mt-3 text-[13px] font-medium uppercase tracking-wide text-[var(--fpn-rojo)]">
                      {category}
                    </p>
                    <Link href={`/news/${post.slug}`}>
                      <h3 className="mt-1 font-article text-xl font-black leading-snug tracking-tight hover:text-[var(--fpn-rojo)] md:text-[1.5rem]">
                        {post.title}
                      </h3>
                    </Link>
                    <div className="mt-3 flex items-center justify-between gap-3 text-sm text-[#929292]">
                      <span>{formatReadTime(post.reading_time_minutes)}</span>
                      <span className="text-[var(--fpn-rojo)]">
                        {formatDate(post.published_at, timeZone)}
                      </span>
                    </div>
                  </article>
                );
              })}
            </div>
          </div>
        </section>
      ) : null}

      {/* Four pillars */}
      <section className="px-4 py-14 md:px-8 md:py-16 lg:px-10">
        <div className="mx-auto max-w-3xl text-center">
          <h2 className="font-article text-[2rem] font-bold tracking-tight md:text-[3rem]">
            Four Pillars of the Network
          </h2>
          <p className="mt-4 text-[15px] leading-relaxed text-[#a5aab5] md:text-[19px]">
            From live broadcasts and trusted news to faith-based teaching and
            American classics, FPTN brings together programming that informs,
            strengthens and inspires.
          </p>
        </div>
        <div className="mx-auto mt-10 grid max-w-[1560px] gap-4 sm:grid-cols-2 lg:grid-cols-4 lg:gap-8">
          {PILLARS.map((pillar) => (
            <Link
              key={pillar.title}
              href={pillar.href}
              className="group relative aspect-[336/519] overflow-hidden rounded-[9px]"
            >
              <Image
                src="/brand/home/pillars-sprite.png"
                alt=""
                fill
                className="object-cover transition duration-500 group-hover:scale-[1.03]"
                style={{ objectPosition: pillar.objectPosition }}
                sizes="(max-width:1024px) 50vw, 25vw"
              />
              <span className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
              <span className="absolute inset-x-0 bottom-0 p-5 text-lg font-bold leading-snug md:text-xl">
                {pillar.title}
              </span>
            </Link>
          ))}
        </div>
      </section>

      {/* Watch anywhere */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0">
          <Image
            src="/brand/home/watch-anywhere-bg.png"
            alt=""
            fill
            className="object-cover object-bottom"
            sizes="100vw"
          />
          <div className="absolute inset-0 bg-[rgba(8,52,13,0.75)]" />
        </div>
        <div className="relative mx-auto grid max-w-[1560px] gap-10 px-4 py-14 md:px-8 md:py-20 lg:grid-cols-[minmax(0,1fr)_minmax(280px,0.9fr)] lg:px-10">
          <div>
            <h2 className="font-article text-[2rem] font-bold tracking-tight md:text-[3.2rem]">
              Watch FlashPoint Anywhere
            </h2>
            <p className="mt-4 max-w-xl text-[16px] leading-relaxed text-white/88 md:text-[1.35rem] md:leading-8">
              Access FlashPoint Television Network at home or on the go.
              <br />
              Watch on Roku, Xfinity, broadcast affiliates, streaming partners,
              and digital platforms across the country.
            </p>
            <PartnersGrid className="mt-8" />
            <p className="mt-6 text-sm text-white/40 md:text-[1.05rem]">
              More channels and distribution partners continue to be added.
            </p>
          </div>
        </div>
      </section>
    </div>
  );
}
