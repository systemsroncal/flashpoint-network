import Image from "next/image";
import Link from "next/link";
import type { Post } from "@/lib/types/cms";
import { cardFeaturedImageUrl } from "@/lib/posts/media-layout";
import { getSiteIdentity } from "@/lib/site-identity/settings";

function authorByline(post: Post): string | null {
  const a = post.author;
  if (!a) return null;
  const name =
    a.full_name?.trim() ||
    [a.first_name, a.last_name].filter(Boolean).join(" ").trim();
  if (!name) return null;
  return `BY ${name.toUpperCase()}`;
}

export default async function CategorySpotlightCard({ post }: { post: Post }) {
  const { defaultFeaturedImageUrl } = await getSiteIdentity();
  const href = `/news/${post.slug}`;
  const featured = cardFeaturedImageUrl(post, defaultFeaturedImageUrl);
  const byline = authorByline(post);

  return (
    <article className="flex h-full flex-col text-center">
      <Link
        href={href}
        className="relative mb-5 block aspect-[4/3] overflow-hidden rounded-sm bg-neutral-200"
      >
        {featured ? (
          <Image
            src={featured}
            alt=""
            fill
            className="object-cover"
            sizes="(max-width: 768px) 100vw, 25vw"
          />
        ) : null}
      </Link>
      <h3 className="font-article text-[1.35rem] font-bold leading-[1.2] tracking-tight text-black md:text-[1.5rem]">
        <Link href={href} className="hover:text-[var(--fpn-rojo)]">
          {post.title}
        </Link>
      </h3>
      {post.excerpt ? (
        <p className="mt-3 text-[15px] leading-relaxed text-black/60 md:text-[16px]">
          {post.excerpt}
        </p>
      ) : null}
      {byline ? (
        <p className="mt-4 text-[11px] font-medium uppercase tracking-[0.12em] text-black/45">
          {byline}
        </p>
      ) : null}
    </article>
  );
}
