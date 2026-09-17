/** Fixed placement keys for promo banner widgets. */
export const BANNER_SLOT_KEYS = [
  "home_above_podcasts",
  "home_above_latest",
  "home_patriot_banner",
  "category_above_popular",
  "article_above_latest_patriot",
  "article_above_latest_ofc",
] as const;

export type BannerSlot = (typeof BANNER_SLOT_KEYS)[number];

export type BannerWidget = {
  id: string;
  slot: BannerSlot | string;
  label: string;
  desktop_image_url: string | null;
  mobile_image_url: string | null;
  href: string;
  open_in_new_tab: boolean;
  enabled: boolean;
  sort_order: number;
  created_at?: string;
  updated_at?: string;
};

export function isBannerSlot(value: string): value is BannerSlot {
  return (BANNER_SLOT_KEYS as readonly string[]).includes(value);
}
