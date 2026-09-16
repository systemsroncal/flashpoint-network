/** Extract an 11-char YouTube video id from common URL shapes or a bare id. */
export function extractYoutubeId(url: string): string | null {
  if (!url) return null;
  try {
    const u = new URL(url);
    if (u.hostname.includes("youtu.be")) {
      return u.pathname.replace(/^\//, "").slice(0, 11) || null;
    }
    if (u.searchParams.get("v")) return u.searchParams.get("v");
    const embed = u.pathname.match(/\/embed\/([^/?]+)/);
    if (embed) return embed[1];
    const shorts = u.pathname.match(/\/shorts\/([^/?]+)/);
    if (shorts) return shorts[1];
  } catch {
    /* plain id */
  }
  if (/^[\w-]{11}$/.test(url.trim())) return url.trim();
  return null;
}

/** hqdefault thumbnail URL, or null when the URL is not YouTube. */
export function youtubeThumbnailUrl(url: string | null | undefined): string | null {
  if (!url) return null;
  const id = extractYoutubeId(url);
  if (!id) return null;
  return `https://img.youtube.com/vi/${id}/hqdefault.jpg`;
}
