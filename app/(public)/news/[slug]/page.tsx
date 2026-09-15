import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import RichHtml from "@/components/public/RichHtml";
import { getPostBySlug } from "@/lib/data/home";
import { formatDate, formatReadTime, formatViews } from "@/lib/format";

export const dynamic = "force-dynamic";

type Props = {
  params: Promise<{ slug: string }>;
};

export async function generateMetadata({ params }: Props) {
  const { slug } = await params;
  const post = await getPostBySlug(slug);
  if (!post) return { title: "Not found" };
  return {
    title: post.title,
    description: post.excerpt ?? undefined,
  };
}

export default async function NewsArticlePage({ params }: Props) {
  const { slug } = await params;
  const post = await getPostBySlug(slug);
  if (!post) notFound();

  const category = post.category?.name ?? "News";
  const author =
    post.author?.full_name ||
    [post.author?.first_name, post.author?.last_name].filter(Boolean).join(" ") ||
    "FPN Desk";

  return (
    <article className="bg-white">
      <div className="mx-auto max-w-3xl px-4 py-8">
        <p className="text-xs font-semibold uppercase tracking-wide text-[#E10600]">
          {category}
        </p>
        <h1 className="mt-3 font-article text-4xl font-bold leading-tight text-black md:text-5xl">
          {post.title}
        </h1>
        {post.excerpt ? (
          <p className="mt-4 text-lg leading-8 text-[#4B5563]">{post.excerpt}</p>
        ) : null}
        <div className="mt-5 flex flex-wrap items-center gap-x-3 gap-y-1 border-b border-black/10 pb-5 text-sm text-[#6B7280]">
          <span className="font-medium text-black">{author}</span>
          <span aria-hidden>·</span>
          <span>{formatDate(post.published_at)}</span>
          <span aria-hidden>·</span>
          <span>{formatReadTime(post.reading_time_minutes)}</span>
          <span aria-hidden>·</span>
          <span>{formatViews(post.view_count)} views</span>
          {post.is_premium ? (
            <>
              <span aria-hidden>·</span>
              <span className="font-semibold text-[#E85D04]">Exclusive</span>
            </>
          ) : null}
        </div>

        {post.featured_image_url ? (
          <div className="relative mt-6 aspect-[16/9] overflow-hidden bg-neutral-200">
            <Image
              src={post.featured_image_url}
              alt=""
              fill
              priority
              className="object-cover"
              sizes="(max-width:768px) 100vw, 768px"
            />
          </div>
        ) : null}

        <RichHtml
          html={post.body || (post.excerpt ? `<p>${post.excerpt}</p>` : "")}
          className="fpn-rich-html mt-8 font-serif text-lg leading-8 text-[#1F2937]"
        />

        <div className="mt-10 border-t border-black/10 pt-6">
          <Link
            href="/"
            className="text-sm font-semibold uppercase tracking-wide text-[#E85D04] hover:underline"
          >
            ← Back to home
          </Link>
        </div>
      </div>
    </article>
  );
}
