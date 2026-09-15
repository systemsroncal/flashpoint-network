import Image from "next/image";
import Link from "next/link";
import PostCard from "@/components/public/PostCard";
import type { HomePayload } from "@/lib/types/cms";
import { formatDate } from "@/lib/format";

export default function HomeView({ data }: { data: HomePayload }) {
  const mainVideo = data.mustWatch[0];
  const sideVideos = data.mustWatch.slice(1, 5);
  const mainExclusive = data.exclusives[0];
  const exclusiveList = data.exclusives.slice(1, 5);
  const exclusiveGrid = data.exclusives.slice(5, 9);
  const breaking =
    data.featured?.title ||
    data.liveEvent?.title ||
    "Outgoing Army secretary breaks silence after submitting resignation";

  return (
    <div className="bg-white text-black">
      {/* Breaking ticker */}
      <div className="bg-[#FF4500] text-white">
        <div className="mx-auto flex max-w-6xl items-center gap-3 px-4 py-2 text-xs font-medium sm:text-sm">
          <span className="shrink-0 font-bold uppercase tracking-wide">
            Today 10:00 PM
          </span>
          <span className="hidden h-4 w-px bg-white/40 sm:block" />
          <p className="min-w-0 flex-1 truncate">
            Public Defender: {breaking}
          </p>
          <span className="hidden shrink-0 sm:inline">September 2, 2026</span>
        </div>
      </div>

      {/* Live hero */}
      {data.liveEvent ? (
        <section className="bg-[#0B0F14] text-white">
          <div className="mx-auto grid max-w-6xl gap-6 px-4 py-8 md:grid-cols-[1.25fr_1fr] md:items-center">
            <Link
              href={`/events/${data.liveEvent.slug}`}
              className="relative aspect-video overflow-hidden bg-black"
            >
              {data.liveEvent.thumbnail_url ? (
                <Image
                  src={data.liveEvent.thumbnail_url}
                  alt=""
                  fill
                  priority
                  className="object-cover opacity-80"
                  sizes="(max-width:768px) 100vw, 55vw"
                />
              ) : null}
              <span className="absolute inset-0 flex items-center justify-center">
                <span className="flex h-16 w-16 items-center justify-center rounded-full border-2 border-white/70 bg-black/40 text-2xl">
                  ▶
                </span>
              </span>
            </Link>
            <div>
              <div className="flex flex-wrap items-center gap-2 text-xs font-bold uppercase tracking-wide">
                {data.liveEvent.is_live ? (
                  <span className="bg-[#E10600] px-2 py-1">On Live</span>
                ) : null}
                <span className="text-white/70">8:00 PM – 9:00 PM</span>
              </div>
              <p className="mt-3 text-sm text-white/70">
                Now: {data.liveEvent.host_name || "FlashPoint Live"}
              </p>
              <h1 className="mt-2 font-article text-3xl font-bold leading-tight md:text-4xl">
                <Link
                  href={`/events/${data.liveEvent.slug}`}
                  className="hover:text-[#FF4500]"
                >
                  {data.liveEvent.title}
                </Link>
              </h1>
              {data.liveEvent.description ? (
                <p className="mt-3 text-sm leading-6 text-white/70">
                  {data.liveEvent.description}
                </p>
              ) : null}
              <p className="mt-4 text-xs text-white/50">
                {formatDate(data.liveEvent.starts_at)}
                {data.liveEvent.ends_at
                  ? ` – ${formatDate(data.liveEvent.ends_at)}`
                  : ""}
              </p>
            </div>
          </div>
        </section>
      ) : null}

      <div className="mx-auto max-w-6xl space-y-10 px-4 py-8">
        {/* Top stories: featured + secondary + podcasts/latest */}
        <section className="grid gap-8 lg:grid-cols-[1.35fr_0.85fr_0.9fr]">
          <div>
            {data.featured ? (
              <PostCard post={data.featured} variant="hero" />
            ) : null}
          </div>
          <div className="flex flex-col">
            {data.secondary.map((post) => (
              <PostCard key={post.id} post={post} variant="stack" />
            ))}
          </div>
          <aside className="space-y-6">
            <div>
              <div className="mb-2 flex items-end justify-between border-b border-black/10 pb-2">
                <h2 className="font-article text-xl font-bold">
                  Podcasts
                </h2>
                <span className="text-[11px] font-semibold uppercase tracking-wide text-[#E85D04]">
                  See all
                </span>
              </div>
              {data.podcasts.map((post) => (
                <PostCard key={post.id} post={post} variant="stack" />
              ))}
            </div>
            <div>
              <div className="mb-2 border-b border-black/10 pb-2">
                <h2 className="font-article text-xl font-bold">
                  Latest News
                </h2>
              </div>
              {data.latest.map((post) => (
                <PostCard key={post.id} post={post} variant="latest" />
              ))}
            </div>
          </aside>
        </section>

        {/* Optional mid grid */}
        {data.grid.length > 0 ? (
          <section className="grid gap-6 sm:grid-cols-2 md:grid-cols-3">
            {data.grid.slice(0, 6).map((post) => (
              <PostCard key={post.id} post={post} />
            ))}
          </section>
        ) : null}

        {/* Subscribe banner */}
        <section className="flex flex-col items-center justify-between gap-4 bg-black px-6 py-7 text-white md:flex-row md:px-10">
          <div>
            <h2 className="font-article text-2xl font-bold md:text-3xl">
              Get The Full Story. As It Is.
            </h2>
            <p className="mt-1 text-sm text-white/70">
              Subscribe for complete FPN access.
            </p>
          </div>
          <Link
            href="/admin"
            className="inline-flex bg-[#FF4500] px-6 py-3 text-sm font-bold uppercase tracking-wide text-white hover:bg-[#e63e00]"
          >
            Subscribe
          </Link>
        </section>

        {/* Must-watch */}
        <section>
          <h2 className="mb-4 font-article text-2xl font-bold">
            Must-Watch Videos
          </h2>
          <div className="grid gap-5 md:grid-cols-[1.35fr_1fr]">
            {mainVideo ? <PostCard post={mainVideo} variant="video" /> : null}
            <div className="grid gap-4">
              {sideVideos.map((post) => (
                <PostCard key={post.id} post={post} variant="stack" />
              ))}
            </div>
          </div>
        </section>

        {/* Elections */}
        <section>
          <h2 className="mb-4 font-article text-2xl font-bold">
            Elections
          </h2>
          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
            {data.elections.map((post) => (
              <PostCard key={post.id} post={post} />
            ))}
          </div>
        </section>

        {/* Promo banner */}
        <section className="overflow-hidden bg-gradient-to-r from-[#4C1D95] via-[#3730A3] to-[#1E3A8A] text-white">
          <div className="flex flex-col items-start justify-between gap-4 px-6 py-8 md:flex-row md:items-center md:px-10">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.16em] text-white/70">
                Sponsored
              </p>
              <h2 className="mt-2 font-article text-2xl font-bold md:text-3xl">
                Cut your mobile bill in half
              </h2>
              <p className="mt-1 text-sm text-white/75">
                Limited-time offer for FPN readers.
              </p>
            </div>
            <span className="inline-flex bg-white px-5 py-2.5 text-sm font-bold text-[#1E3A8A]">
              Learn more
            </span>
          </div>
        </section>

        {/* Exclusive + popular */}
        <section className="grid gap-8 lg:grid-cols-[1.65fr_0.85fr]">
          <div>
            <div className="mb-4 flex items-center gap-2 bg-black px-3 py-2 text-white">
              <span className="text-[#FF4500]">★</span>
              <h2 className="font-article text-lg font-bold">
                Exclusive Content
              </h2>
            </div>
            {mainExclusive ? (
              <div className="mb-6 grid overflow-hidden bg-[#111] text-white md:grid-cols-2">
                <Link
                  href={`/news/${mainExclusive.slug}`}
                  className="relative aspect-[16/11] md:aspect-auto md:min-h-[260px]"
                >
                  {mainExclusive.featured_image_url ? (
                    <Image
                      src={mainExclusive.featured_image_url}
                      alt=""
                      fill
                      className="object-cover"
                      sizes="(max-width:768px) 100vw, 40vw"
                    />
                  ) : null}
                </Link>
                <div className="flex flex-col justify-center p-5 md:p-6">
                  <p className="text-[11px] font-semibold uppercase tracking-wide text-[#FF4500]">
                    {mainExclusive.category?.name ?? "Politics"}
                  </p>
                  <h3 className="mt-2 font-article text-2xl font-bold leading-tight">
                    <Link
                      href={`/news/${mainExclusive.slug}`}
                      className="hover:text-[#FF4500]"
                    >
                      {mainExclusive.title}
                    </Link>
                  </h3>
                  {mainExclusive.excerpt ? (
                    <p className="mt-3 text-sm leading-6 text-white/70">
                      {mainExclusive.excerpt}
                    </p>
                  ) : null}
                  <p className="mt-3 text-xs text-white/50">
                    {formatDate(mainExclusive.published_at)}
                  </p>
                </div>
              </div>
            ) : null}
            <div className="grid gap-6 md:grid-cols-2">
              <div className="bg-[#F3F4F6] p-4">
                {exclusiveList.map((post) => (
                  <PostCard key={post.id} post={post} variant="list" />
                ))}
              </div>
              <div className="grid grid-cols-2 gap-4">
                {exclusiveGrid.map((post) => (
                  <PostCard key={post.id} post={post} />
                ))}
              </div>
            </div>
          </div>

          <aside className="bg-[#F3F4F6] p-4">
            <h2 className="mb-3 font-article text-xl font-bold">
              Popular
            </h2>
            <ol>
              {data.popular.map((post, index) => (
                <li
                  key={post.id}
                  className="flex gap-3 border-b border-black/10 py-3 last:border-b-0"
                >
                  <span className="w-6 text-xl font-bold text-[#FF4500]">
                    {index + 1}
                  </span>
                  <Link
                    href={`/news/${post.slug}`}
                    className="font-article text-[15px] font-bold leading-snug text-black hover:text-[#E85D04]"
                  >
                    {post.title}
                  </Link>
                </li>
              ))}
            </ol>
          </aside>
        </section>

        {/* Newsletter */}
        <section className="border border-black/10 bg-white px-6 py-10 text-center">
          <h2 className="font-article text-2xl font-bold">
            The biggest stories of the day delivered to your inbox
          </h2>
          <form className="mx-auto mt-5 flex max-w-lg flex-col gap-2 sm:flex-row">
            <input
              type="email"
              required
              placeholder="Email address"
              className="flex-1 border border-black/20 px-3 py-2.5 text-sm outline-none focus:border-[#FF4500]"
            />
            <button
              type="submit"
              className="bg-[#FF4500] px-5 py-2.5 text-sm font-bold uppercase tracking-wide text-white hover:bg-[#e63e00]"
            >
              Sign me up
            </button>
          </form>
        </section>
      </div>
    </div>
  );
}
