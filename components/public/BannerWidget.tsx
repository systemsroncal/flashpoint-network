import {
  bannerLinkProps,
  resolveBannerImages,
} from "@/lib/banners/resolve";
import type { BannerWidget } from "@/lib/banners/slots";

type Props = {
  widget: BannerWidget | null | undefined;
  className?: string;
  /** Extra classes on the inner img. */
  imgClassName?: string;
  alt?: string;
  aspectClassName?: string;
};

/**
 * CMS promo banner: `<picture>` with max-width 767 (mobile) / min-width 768 (desktop).
 * Falls back per rules in resolveBannerImages; renders nothing if no image.
 */
export default function BannerWidget({
  widget,
  className = "",
  imgClassName = "h-full w-full object-cover",
  alt,
  aspectClassName = "aspect-[370/283]",
}: Props) {
  if (!widget?.enabled) return null;
  const images = resolveBannerImages(widget);
  if (!images.imgSrc) return null;

  const link = bannerLinkProps(widget);
  const label = alt || widget.label || "Advertisement";

  return (
    <a
      {...link}
      className={`relative block w-full overflow-hidden rounded-[10px] bg-neutral-100 ${aspectClassName} ${className}`.trim()}
      aria-label={label}
    >
      <picture className="absolute inset-0 block h-full w-full">
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
          className={imgClassName}
        />
      </picture>
    </a>
  );
}
