const STORAGE_KEY = "fpn-live-pip-dismissed";

/** True after the user closes the floating live PiP (this browser tab/session). */
export function isLivePipDismissed(): boolean {
  if (typeof window === "undefined") return false;
  try {
    return sessionStorage.getItem(STORAGE_KEY) === "1";
  } catch {
    return false;
  }
}

export function dismissLivePip(): void {
  try {
    sessionStorage.setItem(STORAGE_KEY, "1");
  } catch {
    /* private mode / blocked storage */
  }
}

/** Re-enable sitewide PiP after the user scrolls past the live hero on / or /live. */
export function clearLivePipDismiss(): void {
  try {
    sessionStorage.removeItem(STORAGE_KEY);
  } catch {
    /* private mode / blocked storage */
  }
}

/** Marker for the main live player on home + /live (observed by GlobalLivePip). */
export const LIVE_HERO_ATTR = "data-live-hero";
