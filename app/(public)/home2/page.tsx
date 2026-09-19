import HomeView from "@/components/public/HomeView";
import { getBannerWidgetsBySlots } from "@/lib/data/banners";
import { getHomePayload } from "@/lib/data/home";
import { getNetworkProgramsForHomeCarousel } from "@/lib/data/ministry-programs";
import type { Metadata } from "next";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Home",
  description:
    "Watch FlashPoint live, browse original shows, and stay informed with FPTN News.",
};

export default async function Home2Page() {
  const [data, banners, carouselShows] = await Promise.all([
    getHomePayload(),
    getBannerWidgetsBySlots([
      "home_above_podcasts",
      "home_above_latest",
      "home_patriot_banner",
    ]),
    getNetworkProgramsForHomeCarousel(),
  ]);

  return (
    <HomeView
      data={data}
      banners={banners}
      carouselShows={carouselShows}
      showNetworkExtras
    />
  );
}
