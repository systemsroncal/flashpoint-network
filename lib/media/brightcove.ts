export const BRIGHTCOVE_ACCOUNT_ID = "6057949400001";
export const BRIGHTCOVE_PLAYER_ID = "default_default";
export const BRIGHTCOVE_LIVE_VIDEO_ID = "6377204135112";

export function brightcovePlayerSrc(options?: {
  videoId?: string;
  autoplay?: boolean;
}): string {
  const videoId = options?.videoId ?? BRIGHTCOVE_LIVE_VIDEO_ID;
  const params = new URLSearchParams({ videoId });
  if (options?.autoplay) {
    params.set("autoplay", "true");
  }
  return `https://players.brightcove.net/${BRIGHTCOVE_ACCOUNT_ID}/${BRIGHTCOVE_PLAYER_ID}/index.html?${params.toString()}`;
}
