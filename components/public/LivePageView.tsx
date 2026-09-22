import Image from "next/image";
import BrightcoveLivePlayer from "@/components/public/BrightcoveLivePlayer";
import { LIVE_HEADLINE } from "@/components/public/LiveHeroCopy";

const LIVE_TV_SHOWS = [
  { src: "/brand/live/live-tv-img-01.webp", alt: "FlashPoint live programming" },
  { src: "/brand/live/live-tv-img-02.webp", alt: "FlashPoint live programming" },
  { src: "/brand/live/live-tv-img-03.webp", alt: "FlashPoint live programming" },
  { src: "/brand/live/live-tv-img-04.webp", alt: "FlashPoint live programming" },
  { src: "/brand/live/live-tv-img-05.webp", alt: "FlashPoint live programming" },
];

export default function LivePageView() {
  return (
    <div className="w-full max-w-none bg-white text-black">
      <section
        className="relative overflow-hidden rounded-br-[3rem] md:rounded-br-[6rem] xl:rounded-br-[161px]"
        aria-labelledby="live-stream-heading"
      >
        <div className="absolute inset-0">
          <Image
            src="/brand/live/watch-hero-hero.webp"
            alt=""
            fill
            priority
            className="object-cover object-center"
            sizes="100vw"
          />
          <div className="absolute inset-0 bg-black/37" aria-hidden />
        </div>

        <div className="relative z-10 mx-auto flex w-full max-w-[1336px] flex-col items-center px-4 pb-12 pt-10 text-center text-white md:px-8 md:pb-16 md:pt-14 lg:pb-20 lg:pt-16">
          <h1
            id="live-stream-heading"
            className="max-w-[920px] font-home-title text-[clamp(1.75rem,4.2vw,2.84rem)] font-bold leading-tight tracking-[-0.03em] text-[#faf9f6]"
          >
            Streaming Now: Watch Live
          </h1>
          <p className="mt-5 max-w-[1333px] text-[clamp(1rem,2vw,1.33rem)] leading-[1.45] text-white/95 md:mt-6">
            FlashPoint TV Network gives you instant access to live programming,
            right here on this screen. Watch selected shows, powerful Christian
            messages, breaking news, original programming, and inspiring series
            that celebrate faith and the values that made America strong.
            <br className="hidden sm:block" />
            <span className="sm:hidden"> </span>
            Whether you&apos;re at home or on the go, you can always come back
            here and watch FlashPoint TV live.
          </p>

          <div className="relative mt-8 w-full max-w-[1125px] md:mt-10">
            <div
              data-live-hero=""
              className="relative aspect-[1125/633] w-full overflow-hidden rounded-[24px] shadow-[0_24px_80px_rgba(0,0,0,0.45)]"
            >
              <BrightcoveLivePlayer
                title={LIVE_HEADLINE}
                autoplay
                className="h-full w-full rounded-[24px]"
              />
            </div>
            <Image
              src="/brand/live-play-circle.svg"
              alt=""
              width={200}
              height={200}
              className="pointer-events-none absolute bottom-2 left-2 z-10 h-[clamp(4.5rem,18vw,12rem)] w-[clamp(4.5rem,18vw,12rem)] md:bottom-4 md:left-4"
              aria-hidden
            />
          </div>
        </div>
      </section>

      <section
        className="mx-auto w-full max-w-[1336px] px-4 py-12 text-center md:px-8 md:py-16 lg:py-20"
        aria-labelledby="watch-anywhere-heading"
      >
        <h2
          id="watch-anywhere-heading"
          className="font-home-title text-[clamp(1.75rem,4.2vw,2.84rem)] font-bold leading-tight tracking-[-0.03em]"
        >
          Watch FlashPoint Anywhere
        </h2>
        <div className="mx-auto mt-6 max-w-[1333px] text-[clamp(1rem,2vw,1.33rem)] leading-[1.45] text-black/90">
          <p>
            FlashPoint is a{" "}
            <span className="font-bold">
              24/7, ad-supported television network
            </span>{" "}
            available across multiple platforms and local channels nationwide.
            Watch us on{" "}
            <span className="font-bold">
              Roku, Xfinity Comcast, iFaith.TV, local broadcast stations,
              cable systems, and directly online.
            </span>
          </p>
          <p className="mt-4">
            Whether you&apos;re at home, traveling, or watching from your
            phone, there are multiple ways to stay connected to FlashPoint
            programming, news, faith-based teaching, and original shows.
          </p>
          <p className="mt-4 font-bold">
            Find your local channel or choose your preferred way to watch below.
          </p>
        </div>
        <div className="relative mx-auto mt-10 w-full max-w-[850px] overflow-hidden rounded-2xl">
          <Image
            src="/brand/live/smartv-live-img.webp"
            alt="FlashPoint channel guide on a smart TV"
            width={850}
            height={577}
            className="h-auto w-full"
            sizes="(max-width: 900px) 100vw, 850px"
          />
        </div>
      </section>

      <section
        className="mx-auto w-full max-w-[1920px] px-4 pb-14 md:px-8 md:pb-20 lg:px-10"
        aria-labelledby="live-tv-heading"
      >
        <h2
          id="live-tv-heading"
          className="font-home-title text-[clamp(1.5rem,3.2vw,2.2rem)] font-bold leading-tight tracking-[-0.03em]"
        >
          Live TV on the FPTN
        </h2>
        <ul
          className="mt-6 flex gap-4 overflow-x-auto pb-2 scrollbar-none [-ms-overflow-style:none] [scrollbar-width:none] md:mt-8 md:gap-7 md:justify-center [&::-webkit-scrollbar]:hidden"
        >
          {LIVE_TV_SHOWS.map((item, index) => (
            <li key={item.src} className="shrink-0">
              <div className="relative h-[108px] w-[192px] overflow-hidden rounded-[11px] sm:h-[120px] sm:w-[214px] md:h-[137px] md:w-[244px]">
                <Image
                  src={item.src}
                  alt={item.alt}
                  fill
                  className="object-cover"
                  sizes="244px"
                  priority={index < 2}
                />
              </div>
            </li>
          ))}
        </ul>
      </section>
    </div>
  );
}
