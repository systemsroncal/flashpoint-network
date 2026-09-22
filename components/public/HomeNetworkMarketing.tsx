import Image from "next/image";
import Link from "next/link";
import { PartnersGrid } from "@/components/public/HomePartnerLogos";
import HomeStayInformedSection from "@/components/public/HomeStayInformedSection";
import type { Post } from "@/lib/types/cms";


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
    label: "News & Analysis",
    href: "/news",
    image: "/brand/home/pillars/news-v2.png",
  },
  {
    label: "Family Classics",
    href: "/classic-programs",
    image: "/brand/home/pillars/classics-v2.png",
  },
  {
    label: "Network Programs",
    href: "/network-programs",
    image: "/brand/home/pillars/ministry-programs-v2.png",
  },
  {
    label: "Gene Bailey & More",
    href: "/live",
    image: "/brand/home/pillars/gene-bailey-and-more.png",
  },
];

export default function HomeNetworkMarketing({
  newsPosts,
  defaultFeatured,
  timeZone,
  showStayInformed = true,
}: {
  newsPosts: Post[];
  defaultFeatured: string | null;
  timeZone: string;
  /** Set false when Stay Informed is rendered elsewhere (e.g. /home2 after hero). */
  showStayInformed?: boolean;
}) {
  return (
    <div className="w-full max-w-none bg-[#101011] text-white">
      {/* Classics banner — full width rail */}
      <section className="w-full px-4 py-10 md:px-8 lg:px-16 xl:px-20">
        <div className="mx-auto flex w-full max-w-[1400px] flex-col items-stretch overflow-hidden rounded-[22px] border border-[#2a1747] bg-[#000d3c] md:flex-row md:items-center">
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
              <h2 className="font-home-title text-xl font-bold tracking-tight md:text-[1.4rem]">
                Family Classics Are Back
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
              See All Family Classics
            </Link>
          </div>
        </div>
      </section>

      {/* More reasons */}
      <section className="w-full px-4 py-12 md:px-8 md:py-16 lg:px-16 xl:px-20">
        <h2 className="mx-auto w-full max-w-[1920px] text-center font-home-title text-[1.85rem] font-bold tracking-tight md:text-left md:text-[2.7rem]">
          More Reasons to Stay Connected with FlashPoint TV Network
        </h2>
        <div className="mx-auto mt-8 grid w-full max-w-[1920px] gap-4 sm:grid-cols-2 xl:grid-cols-4">
          {REASONS.map((reason) => (
            <article
              key={reason.title}
              className="flex min-h-[300px] flex-col justify-between rounded-[20px] bg-gradient-to-r from-[#161836] to-[#100d1e] p-6 md:min-h-[340px] md:p-7"
            >
              <div>
                <h3 className="font-home-title text-[1.35rem] font-black leading-snug md:text-[1.65rem]">
                  {reason.title}
                </h3>
                <p className="mt-3 text-[15px] leading-relaxed text-[#c3c5d6] md:text-[17px]">
                  {reason.body}
                </p>
              </div>
              <div className="mt-6 flex justify-end">
                <div className="relative h-[4.8rem] w-24">
                  <Image
                    src={reason.icon}
                    alt=""
                    fill
                    className="object-contain object-right"
                    sizes="96px"
                  />
                </div>
              </div>
            </article>
          ))}
        </div>
      </section>

      {showStayInformed ? (
        <HomeStayInformedSection
          newsPosts={newsPosts}
          defaultFeatured={defaultFeatured}
          timeZone={timeZone}
        />
      ) : null}

      {/* Four pillars */}
      <section className="w-full px-4 py-14 md:px-8 md:py-16 lg:px-16 xl:px-20">
        <div className="mx-auto max-w-3xl text-center">
          <h2 className="font-home-title text-[2rem] font-bold tracking-tight md:text-[3rem]">
            Four Pillars of the Network
          </h2>
          <p className="mt-4 text-[15px] leading-relaxed text-[#a5aab5] md:text-[19px]">
            From live broadcasts and trusted news to faith-based teaching and
            American classics, FPTN brings together programming that informs,
            strengthens and inspires.
          </p>
        </div>
        <div className="mx-auto mt-10 grid w-full max-w-[1920px] grid-cols-1 gap-4 min-[345px]:grid-cols-2 lg:grid-cols-4 lg:gap-8">
          {PILLARS.map((pillar) => (
            <Link
              key={pillar.label}
              href={pillar.href}
              aria-label={pillar.label}
              className="group relative aspect-[336/519] overflow-hidden rounded-[9px] shadow-[0_8px_24px_rgba(0,0,0,0.28)] transition-[transform,box-shadow] duration-[550ms] ease-[cubic-bezier(0.22,1,0.36,1)] delay-150 hover:z-10 hover:scale-[1.015] hover:delay-75 hover:shadow-[0_8px_22px_rgba(255,255,255,0.14)]"
            >
              <Image
                src={pillar.image}
                alt=""
                fill
                className="object-cover"
                sizes="(max-width:344px) 100vw, (max-width:1024px) 50vw, 25vw"
              />
            </Link>
          ))}
        </div>
      </section>

      {/* Watch anywhere */}
      <section className="relative w-full overflow-hidden">
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
        <div className="relative w-full lg:flex lg:items-center lg:min-h-[min(52vw,560px)] lg:py-14 xl:min-h-[560px]">
          <div className="relative z-10 w-full px-4 py-14 text-center md:px-8 md:py-20 lg:ml-auto lg:max-w-[840px] lg:flex-shrink-0 lg:py-0 lg:pr-10 lg:text-left">
            <h2 className="font-home-title text-[2rem] font-bold tracking-tight md:text-[3.2rem]">
              Watch FlashPoint Anywhere
            </h2>
            <p className="mx-auto mt-4 max-w-xl text-[16px] leading-relaxed text-white/88 md:text-[1.35rem] md:leading-8 lg:mx-0">
              Access FlashPoint Television Network at home or on the go.
              <br className="hidden sm:inline" />
              <span className="sm:hidden"> </span>
              Watch on Roku, Xfinity, broadcast affiliates, streaming partners,
              and digital platforms across the country.
            </p>
            <PartnersGrid className="mt-8" />
            <p className="mt-6 text-sm text-white/40 md:text-[1.05rem]">
              More channels and distribution partners continue to be added.
            </p>
          </div>
          <div className="relative mx-auto mt-4 w-full max-w-[min(92vw,560px)] px-4 pb-14 sm:mt-6 lg:pointer-events-none lg:mx-0 lg:mt-0 lg:w-[46%] lg:max-w-none lg:flex-shrink-0 lg:px-0 lg:pb-0 lg:pr-0">
            <div className="relative mx-auto aspect-[935/769] w-full lg:mx-0 lg:ml-auto lg:max-w-[720px]">
              <Image
                src="/brand/home/watch-anywhere-tv-mobile.png"
                alt="FlashPoint on a smart TV channel guide"
                fill
                className="object-contain object-center lg:hidden"
                sizes="(max-width:1024px) 92vw, 0px"
              />
              <Image
                src="/brand/home/watch-anywhere-tv.png"
                alt="FlashPoint on a smart TV channel guide"
                fill
                className="hidden object-contain object-right object-bottom lg:block"
                sizes="46vw"
              />
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
