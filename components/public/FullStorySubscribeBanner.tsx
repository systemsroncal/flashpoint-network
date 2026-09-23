type Props = {
  className?: string;
  /** Outer width constraint (default 1180px). */
  maxWidthClass?: string;
};

/** Figma Group 29790 — black rail with couple photo + subscribe headline (footer). */
export default function FullStorySubscribeBanner({
  className = "",
  maxWidthClass = "max-w-[1180px]",
}: Props) {
  return (
    <section
      className={`mx-auto w-full overflow-hidden rounded-[12px] bg-black text-white ${maxWidthClass} ${className}`.trim()}
      aria-labelledby="full-story-banner-heading"
    >
      <div className="flex min-h-[118px] items-stretch sm:min-h-[128px] md:min-h-[130px]">
        <div className="relative w-[108px] shrink-0 overflow-hidden self-stretch sm:w-[148px] md:w-[197px]">
          <picture className="absolute inset-0 block h-full w-full overflow-hidden">
            <source
              srcSet="/brand/banners/fpn-full-story-couple.webp"
              type="image/webp"
            />
            {/* eslint-disable-next-line @next/next/no-img-element -- picture/webp fallback pair */}
            <img
              src="/brand/banners/fpn-full-story-couple.png"
              alt="FlashPoint Television Network hosts"
              className="absolute inset-0 h-full w-full max-h-full object-cover object-[center_18%] sm:object-[center_12%] md:object-[center_8%]"
              width={197}
              height={164}
            />
          </picture>
        </div>

        <div className="flex min-w-0 flex-1 flex-col justify-center gap-2.5 px-3.5 py-3.5 sm:gap-3 sm:px-5 sm:py-4 md:flex-row md:items-center md:justify-between md:gap-6 md:px-8 md:py-6 lg:pl-7">
          <div className="min-w-0">
            <h2
              id="full-story-banner-heading"
              className="font-article text-[clamp(1.05rem,3.8vw,1.45rem)] font-black leading-[1.18] tracking-tight text-pretty sm:text-[1.55rem] md:text-[2.15rem] lg:text-[2.45rem] lg:leading-[1.2]"
            >
              Get The Full Story. As It Is.
            </h2>
            <p className="mt-1 max-w-[36ch] text-[12.5px] leading-snug text-white/80 sm:mt-1.5 sm:text-sm md:max-w-none md:text-[1.05rem] md:leading-normal">
              Subscribe for complete FPTN access
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
