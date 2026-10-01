import {
  bannerLinkProps,
  resolveBannerImages,
} from "@/lib/banners/resolve";
import type { BannerWidget } from "@/lib/banners/slots";

type Props = {
  widget: BannerWidget | null | undefined;
};

/**
 * /news full-width Patriot promo — entire creative is the uploaded image (no HTML overlay).
 */
export default function PatriotHomeBanner({ widget }: Props) {
  if (!widget?.enabled) return null;
  const images = resolveBannerImages(widget);
  const link = bannerLinkProps(
    widget ?? { href: "https://app.fparmychapters.com/register", open_in_new_tab: true },
  );
  if (!images.imgSrc) return null;

  const label = widget.label || "Are You a Patriot? Join FP Army Chapters";

  return (
    <section className="mx-auto w-full max-w-[1282px]">
      <a
        {...link}
        className="block overflow-hidden rounded-[22px] bg-neutral-900"
        aria-label={label}
      >
        <picture className="block w-full">
          {images.mobile ? (
            <source media="(max-width: 767px)" srcSet={images.mobile} />
          ) : null}
          {images.desktop ? (
            <source media="(min-width: 768px)" srcSet={images.desktop} />
          ) : null}
          { }
          <img src={images.imgSrc} alt={label} className="h-auto w-full" />
        </picture>
      </a>
    </section>
  );
}
