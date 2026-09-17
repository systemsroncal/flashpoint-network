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

  // Mobile and desktop share HomeView sections. The WaPo compact list
  // (title + thumb + relative time) is only for category / feed taps in
  // the mobile header bar — never for the home landing ("Latest").
  return <HomeView data={data} banners={banners} />;
}
