import Image from "next/image";
import Link from "next/link";
import type { Post } from "@/lib/types/cms";
import { formatDate, formatReadTime, formatViews } from "@/lib/format";

type Props = {
  post: Post;
  variant?: "hero" | "stack" | "grid" | "list" | "video" | "latest";
};

export default function PostCard({ post, variant = "grid" }: Props) {
  const href = `/news/${post.slug}`;
  const category = post.category?.name ?? "News";
  const meta = (
    <p className="mt-2 flex flex-wrap items-center gap-x-2 text-xs text-[#6B7280]">
      <span>{formatReadTime(post.reading_time_minutes)}</span>
      <span aria-hidden>·</span>
      <span>{formatViews(post.view_count)}</span>
      <span aria-hidden>·</span>
      <span>{formatDate(post.published_at)}</span>
    </p>
  );

  if (variant === "list" || variant === "latest") {
    return (
      <article className="border-b border-black/10 py-3 last:border-b-0">
        <p className="text-[11px] font-bold uppercase tracking-[0.1em] text-[var(--fpn-red)]">
          {category}
        </p>
        <Link href={href} className="group mt-1 block">
          <h3 className="font-article text-[15px] font-bold leading-snug text-black group-hover:text-[var(--fpn-orange)]">
            {post.title}
          </h3>
        </Link>
        {meta}
      </article>
    );
  }

  if (variant === "stack") {
    return (
      <article className="flex gap-3 border-b border-black/10 py-3 last:border-b-0">
        {post.featured_image_url ? (
          <Link
            href={href}
            className="relative h-[72px] w-[96px] shrink-0 overflow-hidden bg-neutral-200"
          >
            <Image
              src={post.featured_image_url}
              alt=""
              fill
              className="object-cover"
              sizes="96px"
            />
          </Link>
        ) : null}
        <div className="min-w-0">
      <p className="text-[11px] font-bold uppercase tracking-[0.1em] text-[var(--fpn-red)]">
          {category}
        </p>
        <Link
            href={href}
            className="mt-1 block font-article text-[15px] font-bold leading-snug text-black hover:text-[var(--fpn-orange)]"
          >
            {post.title}
          </Link>
          {meta}
        </div>
      </article>
    );
  }

  if (variant === "video") {
    return (
      <article className="group">
        <Link href={href} className="block">
          <div className="relative aspect-video overflow-hidden bg-neutral-900">
            {post.featured_image_url ? (
              <Image
                src={post.featured_image_url}
                alt=""
                fill
                className="object-cover opacity-90 transition group-hover:opacity-100"
                sizes="(max-width:768px) 100vw, 40vw"
              />
            ) : (
              <div className="h-full w-full bg-neutral-800" />
            )}
            <span className="absolute inset-0 flex items-center justify-center">
              <span className="flex h-11 w-11 items-center justify-center rounded-full border-2 border-white/80 bg-black/40 text-sm text-white">
                ▶
              </span>
            </span>
          </div>
          <p className="mt-2 text-[11px] font-bold uppercase tracking-[0.1em] text-[var(--fpn-red)]">
            {category}
          </p>
          <h3 className="mt-1 font-article text-base font-bold leading-snug text-black group-hover:text-[var(--fpn-orange)]">
            {post.title}
          </h3>
          {meta}
        </Link>
      </article>
    );
  }

  if (variant === "hero") {
    return (
      <article>
        <Link
          href={href}
          className="relative mb-4 block aspect-[16/10] overflow-hidden bg-neutral-200"
        >
          {post.featured_image_url ? (
            <Image
              src={post.featured_image_url}
              alt=""
              fill
              priority
              className="object-cover"
              sizes="(max-width:768px) 100vw, 50vw"
            />
          ) : null}
        </Link>
        <p className="text-[11px] font-bold uppercase tracking-[0.1em] text-[var(--fpn-red)]">
          {category}
        </p>
        <h2 className="mt-2 font-article text-[1.85rem] font-bold leading-[1.12] text-black md:text-[2.25rem]">
          <Link href={href} className="hover:text-[var(--fpn-orange)]">
            {post.title}
          </Link>
        </h2>
        {post.excerpt ? (
          <p className="mt-3 text-[15px] leading-7 text-[var(--fpn-ink)]/80">
            {post.excerpt}
          </p>
        ) : null}
        {meta}
      </article>
    );
  }

  return (
    <article className="group flex flex-col">
      <Link
        href={href}
        className="relative mb-3 aspect-[16/10] overflow-hidden bg-neutral-200"
      >
        {post.featured_image_url ? (
          <Image
            src={post.featured_image_url}
            alt=""
            fill
            className="object-cover transition duration-300 group-hover:scale-[1.02]"
            sizes="(max-width:768px) 100vw, 25vw"
          />
        ) : null}
        {post.is_video ? (
          <span className="absolute inset-0 flex items-center justify-center">
            <span className="flex h-10 w-10 items-center justify-center rounded-full border border-white/80 bg-black/35 text-xs text-white">
              ▶
            </span>
          </span>
        ) : null}
        {post.is_premium ? (
          <span className="absolute left-2 top-2 bg-black px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-white">
            Exclusive
          </span>
        ) : null}
      </Link>
      <p className="text-[11px] font-bold uppercase tracking-[0.1em] text-[var(--fpn-red)]">
        {category}
      </p>
      <h3 className="mt-1 font-article text-[17px] font-bold leading-snug text-black">
        <Link href={href} className="hover:text-[var(--fpn-orange)]">
          {post.title}
        </Link>
      </h3>
      {meta}
    </article>
  );
}
