/** Extract an 11-char YouTube video id from common URL shapes or a bare id. */
export function extractYoutubeId(url: string): string | null {
  if (!url) return null;
  const asId = (raw: string | null | undefined) => {
    if (!raw) return null;
    const id = raw.trim().split(/[?#&]/)[0];
    return /^[\w-]{11}$/.test(id) ? id : null;
  };

  try {
    const u = new URL(url.trim());
    const host = u.hostname.replace(/^www\./, "");

    if (host === "youtu.be") {
      return asId(u.pathname.replace(/^\//, ""));
    }

    if (host.endsWith("youtube.com") || host.endsWith("youtube-nocookie.com")) {
      const fromV = asId(u.searchParams.get("v"));
      if (fromV) return fromV;

      // /embed/ID, /shorts/ID, /live/ID, /v/ID, /watch/ID (rare)
      const fromPath = u.pathname.match(
        /\/(?:embed|shorts|live|v|watch)\/([^/?#]+)/i,
      );
      if (fromPath) return asId(fromPath[1]);
    }
  } catch {
    /* plain id */
  }

  return asId(url);
}

/** hqdefault thumbnail URL, or null when the URL is not YouTube. */
export function youtubeThumbnailUrl(url: string | null | undefined): string | null {
  if (!url) return null;
  const id = extractYoutubeId(url);
  if (!id) return null;
  return `https://img.youtube.com/vi/${id}/hqdefault.jpg`;
}
