export const TOP_HEADER_BANNER_SETTING = "top_header_banner";

export type TopHeaderBannerSettings = {
  active: boolean;
  href: string;
  desktopImageUrl: string | null;
  mobileImageUrl: string | null;
  openInNewTab: boolean;
};
