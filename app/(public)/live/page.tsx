import BrightcoveLivePlayer from "@/components/public/BrightcoveLivePlayer";
import LiveTvIcon from "@/components/public/LiveTvIcon";
import { formatLiveHeadlineDate } from "@/lib/format";
import { getSiteTimezone } from "@/lib/timezone/settings";

export const dynamic = "force-dynamic";

export async function generateMetadata() {
  return {
    title: "Watch Live",
    description: "Watch FlashPoint Live on Flash Point Network.",
  };
}

export default async function LivePage() {
  const timeZone = await getSiteTimezone();
  const headlineDate = formatLiveHeadlineDate(new Date(), timeZone);
  const headline = `FlashPoint Live | ${headlineDate}`;

  return (
    <article className="bg-[#070b14] text-white">
      <div className="mx-auto max-w-[1100px] px-4 py-8 md:px-8 md:py-12">
        <div className="fpn-live-cta fpn-live-cta--hero">
          <LiveTvIcon />
          Watch Live
        </div>
        <p className="mt-5 text-[22px] font-extrabold italic leading-tight tracking-tight md:text-[29px]">
          Now: FlashPoint Live
        </p>
        <h1 className="mt-3 font-article text-[2rem] font-bold leading-tight md:text-[2.75rem]">
          {headline}
        </h1>
        <BrightcoveLivePlayer
          title={headline}
          autoplay
          className="mt-8 overflow-hidden rounded-[15px]"
        />
      </div>
    </article>
  );
}
