import type { Metadata } from "next";
import StaticWebPageJsonLd from "@/components/seo/StaticWebPageJsonLd";
import BrightcoveLivePlayer from "@/components/public/BrightcoveLivePlayer";
import LiveHeroCopy, { LIVE_HEADLINE } from "@/components/public/LiveHeroCopy";
import { buildStaticPageMetadata } from "@/lib/seo/metadata";

export const dynamic = "force-dynamic";

const LIVE_DESCRIPTION = "Programming changes throughout the day.";

export async function generateMetadata(): Promise<Metadata> {
  return buildStaticPageMetadata({
    title: LIVE_HEADLINE,
    description: LIVE_DESCRIPTION,
    path: "/live",
  });
}

export default function LivePage() {
  return (
    <>
      <StaticWebPageJsonLd
        title={LIVE_HEADLINE}
        description={LIVE_DESCRIPTION}
        path="/live"
      />
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
    </>
  );
}
