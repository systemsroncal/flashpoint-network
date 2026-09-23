import Image from "next/image";

const DEFAULT_AUTHOR_LABEL = "FlashPoint News Staff Writers";
const DEFAULT_AUTHOR_AVATAR = "/brand/news/staff-author-avatar.png";

/** WaPo-style byline above article body (default staff author until CMS author UI ships). */
export default function ArticleAuthorByline({
  name = DEFAULT_AUTHOR_LABEL,
  avatarSrc = DEFAULT_AUTHOR_AVATAR,
}: {
  name?: string;
  avatarSrc?: string;
}) {
  return (
    <div className="mb-6 flex items-center gap-3">
      <div className="relative h-11 w-11 shrink-0 overflow-hidden rounded-full bg-neutral-200 sm:h-12 sm:w-12">
        <Image
          src={avatarSrc}
          alt=""
          fill
          className="object-cover"
          sizes="48px"
        />
      </div>
      <p className="text-[15px] leading-snug text-black sm:text-base">
        By{" "}
        <span className="font-medium underline decoration-black/80 underline-offset-2">
          {name}
        </span>
      </p>
    </div>
  );
}
