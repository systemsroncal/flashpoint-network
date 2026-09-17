import HomeView from "@/components/public/HomeView";
import { getBannerWidgetsBySlots } from "@/lib/data/banners";
import { getHomePayload } from "@/lib/data/home";

export const dynamic = "force-dynamic";

export default async function HomePage() {
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
