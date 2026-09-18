import Image from "next/image";
import Link from "next/link";
import type { Post } from "@/lib/types/cms";
import { formatRelativeTime } from "@/lib/format";
import { cardFeaturedImageUrl } from "@/lib/posts/media-layout";

type Props = {
  posts: Post[];
  timeZone: string;
  defaultFeaturedImageUrl?: string | null;
  emptyTitle?: string;
  emptyBody?: string;
};

export default function MobileFeedList({
  posts,
  timeZone,
  defaultFeaturedImageUrl = null,
  emptyTitle = "No stories yet",
  emptyBody = "Check back soon for new coverage.",
}: Props) {
  if (posts.length === 0) {
    return (
      <div className="px-4 py-14 text-center">
        <h2 className="font-article text-2xl font-black tracking-tight">
          {emptyTitle}
        </h2>
        <p className="mx-auto mt-2 max-w-sm text-sm text-black/60">{emptyBody}</p>
        <Link
          href="/"
          className="mt-6 inline-flex rounded-md bg-[var(--fpn-rojo)] px-5 py-2.5 text-sm font-bold text-white"
        >
          Back to Latest
        </Link>
      </div>
    );
  }

  return (
    <ul className="w-full max-w-none divide-y divide-[#E5E5E5] border-b border-[#E5E5E5]">
      {posts.map((post) => {
        const thumb = cardFeaturedImageUrl(post, defaultFeaturedImageUrl);
        return (
          <li key={post.id} className="w-full">
            <Link
              href={`/news/${post.slug}`}
              className="flex w-full items-start gap-3 px-4 py-4"
            >
              <div className="min-w-0 flex-1">
                <h2 className="font-article text-[1.05rem] font-bold leading-snug tracking-tight text-black">
                  {post.title}
                </h2>
                <p className="mt-1.5 text-[13px] leading-none text-[#8A8A8A]">
                  {formatRelativeTime(post.published_at, timeZone)}
                </p>
              </div>
              <div className="relative mt-0.5 aspect-[4/3] w-[28%] shrink-0 overflow-hidden bg-neutral-200">
                {thumb ? (
                  <Image
                    src={thumb}
                    alt=""
                    fill
                    className="object-cover"
                    sizes="112px"
                  />
                ) : null}
              </div>
            </Link>
          </li>
        );
      })}
    </ul>
  );
}
