import Link from "next/link";
import LiveTvIcon from "@/components/public/LiveTvIcon";

export const LIVE_HEADLINE = "Watch FlashPoint Television Network Live";
export const LIVE_DESCRIPTION = "Programming changes throughout the day.";

export default function LiveHeroCopy({ href }: { href?: string }) {
  const capsule = (
    <span className="fpn-live-cta fpn-live-cta--hero">
      <LiveTvIcon />
      WE ARE LIVE
    </span>
  );

  return (
    <div className="w-full md:flex-1 md:max-w-[602px]">
      {href ? (
        <Link href={href} className="inline-flex">
          {capsule}
        </Link>
      ) : (
        capsule
      )}
      <h1 className="mt-4 max-w-xl font-article text-[1.75rem] font-bold leading-[1.15] tracking-tight text-white md:mt-5 md:text-[2.75rem]">
        {LIVE_HEADLINE}
      </h1>
      <p className="mt-3 max-w-xl text-[15px] leading-relaxed text-white/80 md:mt-4 md:text-[17px]">
        {LIVE_DESCRIPTION}
      </p>
    </div>
  );
}
