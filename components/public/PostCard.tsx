import Image from "next/image";
import Link from "next/link";
import VideoPlayer from "@/components/public/VideoPlayer";
import type { Post } from "@/lib/types/cms";
import { formatDate, formatReadTime, formatViews } from "@/lib/format";

type Props = {
  post: Post;
  variant?: "hero" | "stack" | "grid" | "list" | "video" | "latest" | "podcast";
};

function MetaRow({
  post,
  dateRight = false,
}: {
  post: Post;
  dateRight?: boolean;
}) {
  return (
    <div
      className={`mt-2 flex flex-wrap items-center gap-x-3 gap-y-1 text-[13px] text-[var(--fpn-meta)] ${
        dateRight ? "justify-between" : ""
      }`}
    >
      <span className="inline-flex items-center gap-3">
        <span className="inline-flex items-center gap-1.5">
          <Image src="/brand/icon-clock.svg" alt="" width={16} height={16} />
          {formatReadTime(post.reading_time_minutes)}
        </span>
        <span className="inline-flex items-center gap-1.5">
          <Image src="/brand/icon-comments.svg" alt="" width={15} height={15} />
          {formatViews(post.view_count)}
        </span>
      </span>
      <span className="font-normal text-[var(--fpn-rojo)]">
        {formatDate(post.published_at)}
      </span>
    </div>
  );
}

export default function PostCard({ post, variant = "grid" }: Props) {
  const href = `/news/${post.slug}`;
  const category = (post.category?.name ?? "News").toUpperCase();

  if (variant === "list" || variant === "latest") {
    return (
      <article className="border-b border-[#ccc]/80 py-4 last:border-b-0">
        <p className="text-[12px] font-medium uppercase tracking-wide text-[var(--fpn-rojo)]">
          {category}
        </p>
        <Link href={href} className="group mt-1 block">
          <h3 className="font-article text-[17px] font-black leading-snug tracking-tight text-black group-hover:text-[var(--fpn-rojo)]">
            {post.title}
          </h3>
        </Link>
        <MetaRow post={post} dateRight />
      </article>
    );
  }

  if (variant === "podcast") {
    return (
      <article className="flex gap-3 border-b border-[#ccc]/80 py-3 last:border-b-0">
        <Link
          href={href}
          className="relative h-[72px] w-[72px] shrink-0 overflow-hidden rounded-md bg-neutral-200"
        >
          {post.featured_image_url ? (
            <Image
              src={post.featured_image_url}
              alt=""
              fill
              className="object-cover"
              sizes="72px"
            />
          ) : null}
        </Link>
        <div className="min-w-0">
          <p className="text-[11px] font-medium uppercase tracking-wide text-[var(--fpn-rojo)]">
            {category}
          </p>
          <Link
            href={href}
            className="mt-0.5 block font-article text-[15px] font-black leading-snug text-black hover:text-[var(--fpn-rojo)]"
          >
            {post.title}
          </Link>
        </div>
      </article>
    );
  }

  if (variant === "stack") {
    return (
      <article className="border-b border-[#ccc]/80 py-4 last:border-b-0">
        <Link
          href={href}
          className="relative mb-3 block aspect-[16/10] overflow-hidden rounded-[12px] bg-neutral-200"
        >
          {post.featured_image_url ? (
            <Image
              src={post.featured_image_url}
              alt=""
              fill
              className="object-cover"
              sizes="(max-width:1024px) 100vw, 28vw"
            />
          ) : null}
        </Link>
        <div className="flex flex-wrap items-center gap-x-3 gap-y-1">
          <p className="text-[12px] font-medium uppercase tracking-wide text-[var(--fpn-rojo)]">
            {category}
          </p>
          <span className="inline-flex items-center gap-1.5 text-[12px] text-[var(--fpn-meta)]">
            <Image src="/brand/icon-clock.svg" alt="" width={14} height={14} />
            {formatReadTime(post.reading_time_minutes)}
          </span>
          <span className="inline-flex items-center gap-1.5 text-[12px] text-[var(--fpn-meta)]">
            <Image src="/brand/icon-comments.svg" alt="" width={13} height={13} />
            {formatViews(post.view_count)}
          </span>
        </div>
        <Link
          href={href}
          className="mt-1.5 block font-article text-[1.15rem] font-black leading-snug tracking-tight text-black hover:text-[var(--fpn-rojo)]"
        >
          {post.title}
        </Link>
        <p className="mt-2 text-[13px] text-[var(--fpn-rojo)]">
          {formatDate(post.published_at)}
        </p>
      </article>
    );
  }

  if (variant === "video") {
    return (
      <article className="group">
        <div className="relative overflow-hidden rounded-[12px] bg-neutral-900 md:min-h-[360px]">
          {post.video_url ? (
            <VideoPlayer
              url={post.video_url}
              title={post.title}
              poster={post.featured_image_url}
              className="aspect-video w-full md:min-h-[360px]"
            />
          ) : (
            <Link href={href} className="block">
              <div className="relative aspect-[4/5] md:aspect-[16/11] md:min-h-[360px]">
                {post.featured_image_url ? (
                  <Image
                    src={post.featured_image_url}
                    alt=""
                    fill
                    className="object-cover opacity-95 transition group-hover:opacity-100"
                    sizes="(max-width:768px) 100vw, 55vw"
                  />
                ) : (
                  <div className="h-full w-full bg-neutral-800" />
                )}
                <span className="absolute bottom-4 left-4">
                  <Image src="/brand/play-btn.svg" alt="" width={56} height={56} />
                </span>
              </div>
            </Link>
          )}
        </div>
        <Link href={href} className="block">
          <p className="mt-3 text-[12px] font-medium uppercase tracking-wide text-[var(--fpn-rojo)]">
            {category}
          </p>
          <h3 className="mt-1 font-article text-xl font-black leading-snug tracking-tight text-black group-hover:text-[var(--fpn-rojo)]">
            {post.title}
          </h3>
          <MetaRow post={post} dateRight />
        </Link>
      </article>
    );
  }

  if (variant === "hero") {
    return (
      <article>
        <Link
          href={href}
          className="relative mb-4 block aspect-[16/10] overflow-hidden rounded-[15px] bg-neutral-200"
        >
          {post.featured_image_url ? (
            <Image
              src={post.featured_image_url}
              alt=""
              fill
              priority
              className="object-cover"
              sizes="(max-width:768px) 100vw, 42vw"
            />
          ) : null}
        </Link>
        <div className="flex flex-wrap items-center gap-x-3 gap-y-1">
          <p className="text-[13px] font-medium uppercase tracking-wide text-[var(--fpn-rojo)]">
            {category}
          </p>
          <span className="inline-flex items-center gap-1.5 text-[13px] text-[var(--fpn-meta)]">
            <Image src="/brand/icon-clock.svg" alt="" width={16} height={16} />
            {formatReadTime(post.reading_time_minutes)}
          </span>
          <span className="inline-flex items-center gap-1.5 text-[13px] text-[var(--fpn-meta)]">
            <Image src="/brand/icon-comments.svg" alt="" width={15} height={15} />
            {formatViews(post.view_count)}
          </span>
        </div>
        <h2 className="mt-2 font-article text-[1.75rem] font-black leading-[1.12] tracking-tight text-black md:text-[2.15rem]">
          <Link href={href} className="hover:text-[var(--fpn-rojo)]">
            {post.title}
          </Link>
        </h2>
        {post.excerpt ? (
          <p className="mt-3 text-[15px] leading-7 text-[var(--fpn-ink)]/85">
            {post.excerpt}
          </p>
        ) : null}
        <p className="mt-3 text-[14px] text-[var(--fpn-rojo)]">
          {formatDate(post.published_at)}
        </p>
      </article>
    );
  }

  return (
    <article className="group flex flex-col">
      <Link
        href={href}
        className="relative mb-3 aspect-[16/10] overflow-hidden rounded-[12px] bg-neutral-200"
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
          <span className="absolute bottom-3 left-3">
            <Image src="/brand/play-btn.svg" alt="" width={40} height={40} />
          </span>
        ) : null}
      </Link>
      <p className="text-[12px] font-medium uppercase tracking-wide text-[var(--fpn-rojo)]">
        {category}
      </p>
      <h3 className="mt-1 font-article text-[17px] font-black leading-snug tracking-tight text-black">
        <Link href={href} className="hover:text-[var(--fpn-rojo)]">
          {post.title}
        </Link>
      </h3>
      <MetaRow post={post} dateRight />
    </article>
  );
}
