import Home2View from "@/components/public/Home2View";
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
  const [data, carouselShows] = await Promise.all([
    getHomePayload(),
    getNetworkProgramsForHomeCarousel(),
  ]);

  return <Home2View data={data} carouselShows={carouselShows} />;
}
