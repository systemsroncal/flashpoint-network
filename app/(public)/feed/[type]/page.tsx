import Link from "next/link";
import { notFound } from "next/navigation";
import NewsletterSignup from "@/components/public/NewsletterSignup";
import PostCard from "@/components/public/PostCard";
import { getFeedPosts, type FeedKind } from "@/lib/data/home";

export const dynamic = "force-dynamic";

const FEEDS: Record<
  FeedKind,
  { title: string; description: string }
> = {
  latest: {
    title: "Latest News",
    description: "The newest published stories from Flash Point Network.",
  },
  podcasts: {
    title: "Podcasts",
    description: "All podcast episodes, newest first.",
  },
  videos: {
    title: "Must-Watch Videos",
    description: "Video stories and must-watch coverage, newest first.",
  },
  premium: {
    title: "Exclusive Content",
    description: "Premium and exclusive FPN stories, newest first.",
  },
  popular: {
    title: "Popular",
    description: "Editor-flagged popular stories, newest first.",
  },
};

type Props = {
  params: Promise<{ type: string }>;
};

export async function generateMetadata({ params }: Props) {
  const { type } = await params;
  const meta = FEEDS[type as FeedKind];
  if (!meta) return { title: "Feed not found" };
  return { title: meta.title, description: meta.description };
}

export default async function FeedPage({ params }: Props) {
  const { type } = await params;
  const kind = type as FeedKind;
  if (!FEEDS[kind]) notFound();

  const posts = await getFeedPosts(kind, 48);
  const meta = FEEDS[kind];

  return (
    <div className="bg-white text-black">
      <div className="mx-auto max-w-[1440px] px-4 py-10 md:px-8 lg:px-10 lg:py-12">
        <p className="text-[12px] font-bold uppercase tracking-[0.12em] text-[var(--fpn-rojo)]">
          <Link href="/" className="hover:underline">
            Home
          </Link>
          <span className="mx-2 text-black/30">/</span>
          {meta.title}
        </p>
        <h1 className="mt-3 font-article text-[2.4rem] font-black tracking-tight md:text-[3rem]">
          {meta.title}
        </h1>
        <p className="mt-2 max-w-2xl text-sm text-black/65 md:text-base">
          {meta.description}
        </p>

        {posts.length === 0 ? (
          <div className="mt-10 rounded-[12px] border border-dashed border-black/15 px-6 py-14 text-center">
            <h2 className="font-article text-2xl font-black tracking-tight">
              No stories yet
            </h2>
            <p className="mx-auto mt-2 max-w-md text-sm text-black/60">
              Nothing is published in this feed right now.
            </p>
            <Link
              href="/"
              className="mt-6 inline-flex rounded-md bg-[var(--fpn-rojo)] px-5 py-2.5 text-sm font-bold text-white"
            >
              Back to home
            </Link>
          </div>
        ) : (
          <section className="mt-10 grid gap-x-6 gap-y-8 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {posts.map((post) => (
              <PostCard
                key={post.id}
                post={
                  kind === "videos" || kind === "podcasts"
                    ? { ...post, is_video: true }
                    : post
                }
              />
            ))}
          </section>
        )}

        <section className="mt-14 border border-black/10 bg-[#F7F7F7] px-6 py-12 text-center">
          <h2 className="mx-auto max-w-xl font-article text-[1.75rem] font-black leading-snug tracking-tight">
            The biggest stories of the day delivered to your inbox
          </h2>
          <NewsletterSignup />
        </section>
      </div>
    </div>
  );
}
