import type { Metadata } from "next";
import JsonLd from "@/components/seo/JsonLd";
import HomeView from "@/components/public/HomeView";
import { getBannerWidgetsBySlots } from "@/lib/data/banners";
import { getHomePayload } from "@/lib/data/home";
import { buildPublicPageMetadata } from "@/lib/seo/metadata";
import { buildCollectionPageJsonLd } from "@/lib/seo/web-page-json-ld";
import { getSiteIdentity } from "@/lib/site-identity/settings";

export const dynamic = "force-dynamic";

const NEWS_DESCRIPTION =
  "Breaking news, politics, and analysis from FlashPoint Television Network.";

export async function generateMetadata(): Promise<Metadata> {
  const identity = await getSiteIdentity();
  return buildPublicPageMetadata({
    title: "FPTN News",
    description: NEWS_DESCRIPTION,
    path: "/news",
    siteName: identity.siteName,
  });
}

export default async function FptnNewsPage() {
  const [data, banners] = await Promise.all([
    getHomePayload(),
    getBannerWidgetsBySlots([
      "home_above_podcasts",
      "home_above_latest",
      "home_patriot_banner",
    ]),
  ]);

  return (
    <>
      <JsonLd
        data={buildCollectionPageJsonLd({
          title: "FPTN News",
          description: NEWS_DESCRIPTION,
          path: "/news",
        })}
      />
      <HomeView data={data} banners={banners} />
    </>
  );
}
