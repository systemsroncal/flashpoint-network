import type { BannerWidget } from "@/lib/banners/slots";
import { resolveMediaUrl } from "@/lib/media/public-url";

export type ResolvedBannerImages = {
  desktop: string | null;
  mobile: string | null;
  /** Fallback `<img src>` after desktop/mobile rules. */
  imgSrc: string | null;
};

/** Apply desktop ≥768 / mobile ≤767 fallback rules. */
export function resolveBannerImages(
  widget: Pick<BannerWidget, "desktop_image_url" | "mobile_image_url"> | null | undefined,
): ResolvedBannerImages {
  const desktop = resolveMediaUrl(widget?.desktop_image_url) || null;
  const mobile = resolveMediaUrl(widget?.mobile_image_url) || null;
  if (!desktop && !mobile) {
    return { desktop: null, mobile: null, imgSrc: null };
  }
  // img: prefer desktop, else mobile (covers “no desktop → use responsive on desktop”)
  return {
    desktop: desktop || mobile,
    mobile: mobile || desktop,
    imgSrc: desktop || mobile,
  };
}

export function bannerLinkProps(widget: Pick<BannerWidget, "href" | "open_in_new_tab">) {
  const href = (widget.href || "#").trim() || "#";
  if (widget.open_in_new_tab) {
    return {
      href,
      target: "_blank" as const,
      rel: "noopener noreferrer sponsored" as const,
    };
  }
  return { href };
}
