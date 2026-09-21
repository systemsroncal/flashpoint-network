import { brightcovePlayerSrc } from "@/lib/media/brightcove";

export default function BrightcoveLivePlayer({
  title = "FlashPoint Live",
  autoplay = false,
  muted = false,
  className,
}: {
  title?: string;
  autoplay?: boolean;
  muted?: boolean;
  className?: string;
}) {
  return (
    <div
      className={[
        "relative aspect-video w-full overflow-hidden bg-black",
        className,
      ]
        .filter(Boolean)
        .join(" ")}
    >
      <iframe
        src={brightcovePlayerSrc({ autoplay, muted })}
        title={title}
        allow="autoplay; encrypted-media; fullscreen; picture-in-picture"
        allowFullScreen
        className="absolute inset-0 h-full w-full border-0"
      />
    </div>
  );
}
