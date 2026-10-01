"use client";

import Image from "next/image";

type Props = {
  name: string;
  initials: string;
  avatarUrl?: string | null;
  size?: "sm" | "md";
};

const sizes = {
  sm: { box: "h-8 w-8 text-[11px]", img: 32 },
  md: { box: "h-10 w-10 text-xs", img: 40 },
};

export default function CommentUserAvatar({
  name,
  initials,
  avatarUrl,
  size = "md",
}: Props) {
  const dim = sizes[size];
  const src = avatarUrl?.trim();

  return (
    <div
      className={`relative shrink-0 overflow-hidden rounded-full bg-[var(--fpn-rojo)] font-bold text-white ${dim.box} flex items-center justify-center`}
      aria-label={name}
      role="img"
    >
      {src ? (
        <Image
          src={src}
          alt=""
          width={dim.img}
          height={dim.img}
          className="h-full w-full object-cover"
        />
      ) : (
        <span>{initials}</span>
      )}
    </div>
  );
}
