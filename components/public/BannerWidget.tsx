import {
  bannerLinkProps,
  resolveBannerImages,
} from "@/lib/banners/resolve";
import type { BannerWidget } from "@/lib/banners/slots";

type Props = {
  widget: BannerWidget | null | undefined;
  className?: string;
  /** Extra classes on the inner img (merged with responsive defaults). */
  imgClassName?: string;
  /** Aspect ratio box for desktop (≥768px). Mobile uses natural image height. */
  aspectClassName?: string;
  alt?: string;
};

const DEFAULT_IMG =
  "block w-full max-md:h-auto max-md:object-contain md:absolute md:inset-0 md:h-full md:w-full md:object-cover";

/** Apply fixed aspect only from md breakpoint so ≤767px creatives are not cropped. */
function aspectOnDesktopOnly(aspectClassName: string): string {
  if (
    aspectClassName.includes("md:aspect") ||
    aspectClassName.includes("max-md:aspect")
  ) {
    return aspectClassName;
  }
  return aspectClassName.replace(/\baspect-/g, "md:aspect-");
}

/**
 * CMS promo banner: `<picture>` with max-width 767 (mobile) / min-width 768 (desktop).
 * Falls back per rules in resolveBannerImages; renders nothing if no image.
 */
export default function BannerWidget({
  widget,
  className = "",
  imgClassName,
  alt,
  aspectClassName = "md:aspect-[370/283]",
}: Props) {
  if (!widget?.enabled) return null;
  const images = resolveBannerImages(widget);
  if (!images.imgSrc) return null;

  const link = bannerLinkProps(widget);
  const label = alt || widget.label || "Advertisement";
  const aspect = aspectOnDesktopOnly(aspectClassName);

  return (
    <a
      {...link}
      className={`relative block w-full overflow-hidden rounded-[10px] bg-neutral-100 ${aspect} ${className}`.trim()}
      aria-label={label}
    >
      <picture className="block w-full max-md:relative md:absolute md:inset-0 md:block md:h-full md:w-full">
        {images.mobile ? (
          <source media="(max-width: 767px)" srcSet={images.mobile} />
        ) : null}
        {images.desktop ? (
          <source media="(min-width: 768px)" srcSet={images.desktop} />
        ) : null}
        {/* eslint-disable-next-line @next/next/no-img-element -- responsive picture pair */}
        <img
          src={images.imgSrc}
          alt={label}
          className={[DEFAULT_IMG, imgClassName].filter(Boolean).join(" ")}
        />
      </picture>
    </a>
  );
}
