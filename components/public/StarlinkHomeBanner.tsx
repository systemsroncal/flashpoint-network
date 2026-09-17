import VideoPlayer from "@/components/public/VideoPlayer";

const STARLINK_URL = "https://starlink.com/residential";
const STARLINK_VIDEO = "https://www.youtube.com/watch?v=-8vy3Azdv2I";

/**
 * Full-bleed sponsored band — Figma 27:10588 (Xfinity layout) with Starlink copy + YouTube.
 */
export default function StarlinkHomeBanner() {
  return (
    <section
      className="w-full bg-gradient-to-r from-[#2A1468] via-[#3B1D8F] to-[#4A2AA0] text-white"
      aria-label="Advertising by Starlink"
    >
      <div className="mx-auto flex max-w-[1654px] flex-col items-stretch gap-8 px-4 py-10 md:flex-row md:items-center md:gap-10 md:px-8 md:py-12 lg:gap-14 lg:px-10 lg:py-14">
        <div className="flex min-w-0 flex-1 flex-col justify-center">
          <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-white/80 md:text-[12px]">
            Advertising by Starlink.
          </p>
          <h2 className="mt-3 font-article text-[1.75rem] font-black uppercase leading-[1.08] tracking-tight md:mt-4 md:text-[2.35rem] lg:text-[2.75rem]">
            High-speed internet.
            <br />
            Nearly anywhere.
          </h2>
          <p className="mt-3 max-w-[42ch] text-[14px] leading-relaxed text-white/85 md:mt-4 md:text-[16px] md:leading-[1.55]">
            Stay connected with fast, reliable satellite internet at home, on
            the road, or in places traditional internet can&apos;t easily reach.
          </p>
          <a
            href={STARLINK_URL}
            target="_blank"
            rel="noopener noreferrer sponsored"
            className="mt-5 inline-flex w-fit items-center gap-2 text-[14px] font-bold uppercase tracking-[0.06em] text-white transition-opacity hover:opacity-90 md:mt-6 md:text-[15px]"
          >
            Get Starlink
            <span aria-hidden>→</span>
          </a>
        </div>

        <div className="w-full shrink-0 md:w-[48%] md:max-w-[720px]">
          <VideoPlayer
            url={STARLINK_VIDEO}
            title="Starlink — high-speed internet nearly anywhere"
            autoplay
            loop
            className="aspect-video w-full [&_.plyr]:rounded-[8px]"
          />
        </div>
      </div>
    </section>
  );
}

export { STARLINK_URL, STARLINK_VIDEO };
