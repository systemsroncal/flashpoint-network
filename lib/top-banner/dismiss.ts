const STORAGE_KEY = "fpn-top-header-banner-dismissed-until";
const TWENTY_FOUR_H_MS = 24 * 60 * 60 * 1000;

export function isTopHeaderBannerDismissed(): boolean {
  if (typeof window === "undefined") return false;
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return false;
    const until = Number.parseInt(raw, 10);
    if (!Number.isFinite(until)) return false;
    if (Date.now() >= until) {
      localStorage.removeItem(STORAGE_KEY);
      return false;
    }
    return true;
  } catch {
    return false;
  }
}

export function dismissTopHeaderBannerFor24Hours(): void {
  try {
    localStorage.setItem(STORAGE_KEY, String(Date.now() + TWENTY_FOUR_H_MS));
  } catch {
    /* private mode */
  }
}
