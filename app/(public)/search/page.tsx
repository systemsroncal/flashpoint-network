import type { Metadata } from "next";
import Link from "next/link";
import PostCard from "@/components/public/PostCard";
import { searchPosts } from "@/lib/data/home";

export const dynamic = "force-dynamic";

type Props = {
  searchParams: Promise<{ q?: string }>;
};

export async function generateMetadata({ searchParams }: Props): Promise<Metadata> {
  const sp = await searchParams;
  const q = (sp.q || "").trim();
  return {
    title: q ? `Search: ${q}` : "Search",
    description: "Search FlashPoint Network news.",
  };
}

export default async function SearchPage({ searchParams }: Props) {
  const sp = await searchParams;
  const q = (sp.q || "").trim();
  const posts = q ? await searchPosts(q, 40) : [];

  return (
    <div className="bg-white text-black">
      <div className="border-b border-black/10 bg-[var(--fpn-navy)] text-white">
        <div className="mx-auto max-w-[1440px] px-4 py-10 md:px-8 lg:px-10">
          <p className="text-xs font-bold uppercase tracking-[0.18em] text-[var(--fpn-rojo)]">
            Search
          </p>
          <h1 className="mt-2 font-article text-3xl font-black tracking-tight md:text-4xl">
            {q ? `Results for “${q}”` : "Search the newsroom"}
          </h1>
          <form action="/search" method="get" className="mt-6 flex max-w-xl gap-2">
            <input
              type="search"
              name="q"
              defaultValue={q}
              placeholder="Search by title or excerpt…"
              className="min-w-0 flex-1 rounded-md border border-white/20 bg-white/10 px-4 py-2.5 text-sm text-white outline-none placeholder:text-white/50 focus:border-white/40"
              autoComplete="off"
            />
            <button
              type="submit"
              className="rounded-md bg-[var(--fpn-rojo)] px-5 py-2.5 text-sm font-bold text-white hover:brightness-110"
            >
              Search
            </button>
          </form>
        </div>
      </div>

      <div className="mx-auto max-w-[1440px] px-4 py-10 md:px-8 lg:px-10">
        {!q ? (
          <p className="text-sm text-black/65">
            Enter a keyword to find published stories.
          </p>
        ) : posts.length === 0 ? (
          <div className="rounded-[12px] border border-dashed border-black/15 px-6 py-16 text-center">
            <h2 className="font-article text-2xl font-black tracking-tight">
              No stories matched
            </h2>
            <p className="mx-auto mt-2 max-w-md text-sm text-black/60">
              Try a shorter keyword or browse categories from the header.
            </p>
            <Link
              href="/"
              className="mt-6 inline-flex rounded-md bg-[var(--fpn-rojo)] px-5 py-2.5 text-sm font-bold text-white"
            >
              Back to home
            </Link>
          </div>
        ) : (
          <>
            <p className="mb-6 text-sm text-black/55">
              {posts.length} result{posts.length === 1 ? "" : "s"}
            </p>
            <ul className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {posts.map((post) => (
                <li key={post.id}>
                  <PostCard post={post} />
                </li>
              ))}
            </ul>
          </>
        )}
      </div>
    </div>
  );
}
