import Image from "next/image";
import Link from "next/link";
import { categoryDisplayName } from "@/lib/categories/display-name";
import type { Post } from "@/lib/types/cms";
import { cardFeaturedImageUrl } from "@/lib/posts/media-layout";
import { getSiteIdentity } from "@/lib/site-identity/settings";

export default async function CategorySpotlightCard({ post }: { post: Post }) {
  const { defaultFeaturedImageUrl } = await getSiteIdentity();
  const href = `/news/${post.slug}`;
  const featured = cardFeaturedImageUrl(post, defaultFeaturedImageUrl);
  const categoryLabel = categoryDisplayName(
    post.category?.name ?? "News",
    post.category?.slug,
  );

  return (
    <article className="flex h-full flex-col overflow-hidden rounded-md bg-[#e8e8e8] p-3 text-center shadow-none">
      <Link
        href={href}
        className="relative block aspect-[4/3] shrink-0 overflow-hidden rounded-sm bg-neutral-300"
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
      <div className="flex flex-1 flex-col px-4 pb-5 pt-4 md:px-5 md:pb-6 md:pt-5">
        <h3 className="font-article text-[1.25rem] font-bold leading-[1.2] tracking-tight text-black md:text-[1.35rem]">
          <Link href={href} className="hover:text-[var(--fpn-rojo)]">
            {post.title}
          </Link>
        </h3>
        <p className="mt-2 text-[10px] font-semibold uppercase tracking-[0.14em] text-[var(--fpn-rojo)] md:text-[11px]">
          {categoryLabel}
        </p>
        {post.excerpt ? (
          <p className="mt-2 line-clamp-3 text-[14px] leading-relaxed text-black/60 md:text-[15px]">
            {post.excerpt}
          </p>
        ) : null}
      </div>
    </article>
  );
}
