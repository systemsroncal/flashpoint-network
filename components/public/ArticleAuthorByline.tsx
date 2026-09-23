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
      <div
        className="flex h-11 w-11 shrink-0 items-center justify-center overflow-hidden rounded-full bg-neutral-200 xl:h-[55px] xl:w-[55px]"
      >
        {/* Native size — no object-cover crop; crisp at 55px desktop */}
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={avatarSrc}
          alt=""
          width={55}
          height={55}
          className="max-h-none max-w-none shrink-0 xl:h-[55px] xl:w-[55px]"
          decoding="async"
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
