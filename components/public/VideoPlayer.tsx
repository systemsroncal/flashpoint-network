"use client";

import { useEffect, useId, useRef } from "react";
import { extractYoutubeId } from "@/lib/media/youtube";

export { extractYoutubeId } from "@/lib/media/youtube";

type Props = {
  url: string;
  title?: string;
  className?: string;
  poster?: string | null;
  /** Muted autoplay (required by browsers for autoplay without a gesture). */
  autoplay?: boolean;
  loop?: boolean;
};

/**
 * Plyr player for YouTube — loads Plyr only in the browser (avoids SSR `document`).
 */
export default function VideoPlayer({
  url,
  title,
  className,
  poster,
  autoplay = false,
  loop = false,
}: Props) {
  const wrapRef = useRef<HTMLDivElement>(null);
  const reactId = useId().replace(/:/g, "");
  const ytId = extractYoutubeId(url);

  useEffect(() => {
    const root = wrapRef.current;
    if (!root || !ytId) return;

    let destroyed = false;
    let player: { destroy: () => void; play?: () => void; muted?: boolean } | null =
      null;

    (async () => {
      await import("plyr/dist/plyr.css");
      const { default: Plyr } = await import("plyr");
      if (destroyed || !wrapRef.current) return;

      const autoParams = autoplay
        ? "&amp;autoplay=1&amp;mute=1"
        : "";
      const loopParams = loop && ytId ? `&amp;loop=1&amp;playlist=${ytId}` : "";

      root.innerHTML = "";
      const embed = document.createElement("div");
      embed.className = "plyr__video-embed";
      embed.id = `plyr-${reactId}`;
      embed.innerHTML = `<iframe
        src="https://www.youtube.com/embed/${ytId}?origin=${encodeURIComponent(window.location.origin)}&amp;iv_load_policy=3&amp;modestbranding=1&amp;playsinline=1&amp;showinfo=0&amp;rel=0&amp;enablejsapi=1${autoParams}${loopParams}"
        allowfullscreen
        allowtransparency
        allow="autoplay; encrypted-media; picture-in-picture"
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
        autoplay,
        muted: autoplay,
        loop: { active: loop },
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

      if (autoplay) {
        try {
          player.muted = true;
          player.play?.();
        } catch {
          /* browser may still block; muted iframe params cover most cases */
        }
      }
    })();

    return () => {
      destroyed = true;
      player?.destroy();
    };
  }, [ytId, reactId, title, poster, autoplay, loop]);

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
