import Link from "next/link";
import { formatTickerDate, formatTickerTime } from "@/lib/format";
import type { Post } from "@/lib/types/cms";

/**
 * Static orange home bar — latest published story only (no carousel).
 */
export default function LatestNewsBar({ post }: { post: Post | null }) {
  const now = new Date();
  const when = post?.published_at
    ? formatTickerTime(new Date(post.published_at))
    : formatTickerTime(now);
  const category = (post?.category?.name ?? "FPN").trim();
  const headline = post?.title?.trim() || "FlashPoint coverage coming up";

  return (
    <div className="bg-[var(--fpn-rojo)] text-white">
      <div className="mx-auto flex max-w-[1440px] items-center gap-4 px-4 py-3 md:px-8 lg:px-10">
        <div className="min-w-0 flex-1 overflow-hidden">
          {post ? (
            <Link
              href={`/news/${post.slug}`}
              className="block truncate text-sm font-bold sm:text-base md:text-[18px] hover:underline"
            >
              Today {when} <span className="font-bold opacity-90">|</span>{" "}
              {category}: {headline}
            </Link>
          ) : (
            <p className="truncate text-sm font-bold sm:text-base md:text-[18px]">
              Today {when} <span className="font-bold opacity-90">|</span>{" "}
              FlashPoint coverage coming up
            </p>
          )}
        </div>
        <time
          dateTime={now.toISOString().slice(0, 10)}
          className="hidden shrink-0 text-[15px] font-medium tabular-nums sm:inline"
        >
          {formatTickerDate(now)}
        </time>
      </div>
    </div>
  );
}
