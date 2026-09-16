"use client";

import { useEffect, useId, useRef } from "react";
import { extractYoutubeId } from "@/lib/media/youtube";

export { extractYoutubeId } from "@/lib/media/youtube";

type Props = {
  url: string;
  title?: string;
  className?: string;
  poster?: string | null;
};

/**
 * Plyr player for YouTube — loads Plyr only in the browser (avoids SSR `document`).
 */
export default function VideoPlayer({ url, title, className, poster }: Props) {
  const wrapRef = useRef<HTMLDivElement>(null);
  const reactId = useId().replace(/:/g, "");
  const ytId = extractYoutubeId(url);

  useEffect(() => {
    const root = wrapRef.current;
    if (!root || !ytId) return;

    let destroyed = false;
    let player: { destroy: () => void } | null = null;

    (async () => {
      await import("plyr/dist/plyr.css");
      const { default: Plyr } = await import("plyr");
      if (destroyed || !wrapRef.current) return;

      root.innerHTML = "";
      const embed = document.createElement("div");
      embed.className = "plyr__video-embed";
      embed.id = `plyr-${reactId}`;
      embed.innerHTML = `<iframe
        src="https://www.youtube.com/embed/${ytId}?origin=${encodeURIComponent(window.location.origin)}&amp;iv_load_policy=3&amp;modestbranding=1&amp;playsinline=1&amp;showinfo=0&amp;rel=0&amp;enablejsapi=1"
        allowfullscreen
        allowtransparency
        allow="autoplay"
        title="${(title || "Video").replace(/"/g, "&quot;")}"
      ></iframe>`;
      root.appendChild(embed);

      player = new Plyr(embed, {
        youtube: {
          noCookie: false,
          rel: 0,
          showinfo: 0,
          iv_load_policy: 3,
          modestbranding: 1,
        },
        controls: [
          "play-large",
          "play",
          "progress",
          "current-time",
          "mute",
          "volume",
          "fullscreen",
        ],
        ratio: "16:9",
        ...(poster ? { poster } : {}),
      });
    })();

    return () => {
      destroyed = true;
      player?.destroy();
    };
  }, [ytId, reactId, title, poster]);

  if (!ytId) {
    return (
      <p className="text-sm text-black/60">
        <a
          href={url}
          target="_blank"
          rel="noopener noreferrer"
          className="font-semibold text-[var(--fpn-rojo)] underline"
        >
          Open video
        </a>
      </p>
    );
  }

  return (
    <div
      ref={wrapRef}
      className={[
        "overflow-hidden rounded-[12px] bg-black [&_.plyr]:rounded-[12px]",
        className,
      ]
        .filter(Boolean)
        .join(" ")}
    />
  );
}
