import HomeView from "@/components/public/HomeView";
import MobileFeedList from "@/components/public/MobileFeedList";
import { getBannerWidgetsBySlots } from "@/lib/data/banners";
import { getFeedPosts, getHomePayload } from "@/lib/data/home";
import { getSiteTimezone } from "@/lib/timezone/settings";

export const dynamic = "force-dynamic";

export default async function HomePage() {
  const [data, banners, latestPosts, timeZone] = await Promise.all([
    getHomePayload(),
    getBannerWidgetsBySlots([
      "home_above_podcasts",
      "home_above_latest",
      "home_patriot_banner",
    ]),
    getFeedPosts("latest", 30),
    getSiteTimezone(),
  ]);

  return (
    <>
      <div className="bg-white xl:hidden">
        <MobileFeedList
          posts={latestPosts}
          timeZone={timeZone}
          emptyTitle="Stories are on the way"
          emptyBody="The newsroom hasn&apos;t published coverage yet."
        />
      </div>
      <div className="hidden xl:block">
        <HomeView data={data} banners={banners} />
      </div>
    </>
  );
}
