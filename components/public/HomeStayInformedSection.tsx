import Image from "next/image";
import Link from "next/link";
import type { Post } from "@/lib/types/cms";
import { formatDate, formatReadTime } from "@/lib/format";
import { cardFeaturedImageUrl } from "@/lib/posts/media-layout";

export default function HomeStayInformedSection({
  newsPosts,
  defaultFeatured,
  timeZone,
  heading = "STAY INFORMED. GO DEEPER.",
}: {
  newsPosts: Post[];
  defaultFeatured: string | null;
  timeZone: string;
  heading?: string;
}) {
  if (newsPosts.length === 0) return null;

  return (
    <section className="w-full bg-white px-4 py-12 text-black md:px-8 md:py-16 lg:px-16 xl:px-20">
      <div className="mx-auto w-full max-w-[1920px]">
        <div className="flex flex-wrap items-end justify-between gap-3">
          <div>
            <h2 className="font-article text-[2rem] font-black tracking-tight md:text-[2.85rem]">
              {heading}
            </h2>
            <p className="mt-3 max-w-3xl text-[15px] text-black/70 md:text-[19px]">
              Watch the conversation live, then explore the stories, analysis,
              and articles behind the issues shaping America and the world.
            </p>
          </div>
          <Link
            href="/news"
            className="text-sm font-bold text-[#101011] hover:underline"
          >
            View More &gt;
          </Link>
        </div>
        <div className="mt-8 grid gap-6 sm:grid-cols-2 xl:grid-cols-3">
          {newsPosts.slice(0, 3).map((post) => {
            const thumb = cardFeaturedImageUrl(post, defaultFeatured);
            const category = post.category?.name?.toUpperCase() || "NEWS";
            return (
              <article key={post.id} className="min-w-0">
                <Link
                  href={`/news/${post.slug}`}
                  className="relative block aspect-[369/206] overflow-hidden rounded-[10px] bg-neutral-200"
                >
                  {thumb ? (
                    <Image
                      src={thumb}
                      alt=""
                      fill
                      className="object-cover"
                      sizes="(max-width:1280px) 50vw, 33vw"
                    />
                  ) : null}
                </Link>
                <p className="mt-3 text-[13px] font-medium uppercase tracking-wide text-[var(--fpn-rojo)]">
                  {category}
                </p>
                <Link href={`/news/${post.slug}`}>
                  <h3 className="mt-1 font-article text-xl font-black leading-snug tracking-tight hover:text-[var(--fpn-rojo)] md:text-[1.5rem]">
                    {post.title}
                  </h3>
                </Link>
                <div className="mt-3 flex items-center justify-between gap-3 text-sm text-[#929292]">
                  <span>{formatReadTime(post.reading_time_minutes)}</span>
                  <span className="text-[var(--fpn-rojo)]">
                    {formatDate(post.published_at, timeZone)}
                  </span>
                </div>
              </article>
            );
          })}
        </div>
      </div>
    </section>
  );
}
