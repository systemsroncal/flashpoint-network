export const TOP_HEADER_BANNER_SETTING = "top_header_banner";

export type TopHeaderBannerSettings = {
  active: boolean;
  href: string;
  desktopImageUrl: string | null;
  mobileImageUrl: string | null;
  /** CSS max-width for the centered banner shell (desktop, ≥768px). */
  desktopMaxWidth: string;
  /** CSS max-width for the centered banner shell (mobile, ≤767px). */
  mobileMaxWidth: string;
  openInNewTab: boolean;
};
