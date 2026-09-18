import BrightcoveLivePlayer from "@/components/public/BrightcoveLivePlayer";
import LiveHeroCopy, { LIVE_HEADLINE } from "@/components/public/LiveHeroCopy";

export const dynamic = "force-dynamic";

export async function generateMetadata() {
  return {
    title: LIVE_HEADLINE,
    description: "Programming changes throughout the day.",
  };
}

export default function LivePage() {
  return (
    <article className="bg-[#070b14] text-white">
      <div className="mx-auto flex max-w-[1100px] flex-col gap-6 px-4 py-8 md:gap-8 md:px-8 md:py-12">
        <LiveHeroCopy />
        <div data-live-hero="">
          <BrightcoveLivePlayer
            title={LIVE_HEADLINE}
            autoplay
            className="overflow-hidden rounded-[15px]"
          />
        </div>
      </div>
    </article>
  );
}
