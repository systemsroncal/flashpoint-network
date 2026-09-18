import HomeView from "@/components/public/HomeView";
import { getBannerWidgetsBySlots } from "@/lib/data/banners";
import { getHomePayload } from "@/lib/data/home";
import type { Metadata } from "next";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "FPTN News",
  description:
    "Breaking news, politics, and analysis from FlashPoint Television Network.",
};

export default async function FptnNewsPage() {
  const [data, banners] = await Promise.all([
    getHomePayload(),
    getBannerWidgetsBySlots([
      "home_above_podcasts",
      "home_above_latest",
      "home_patriot_banner",
    ]),
  ]);

  return <HomeView data={data} banners={banners} />;
}
