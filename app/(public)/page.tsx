import type { Metadata } from "next";
import StaticWebPageJsonLd from "@/components/seo/StaticWebPageJsonLd";
import Home2View from "@/components/public/Home2View";
import { getHomePayload } from "@/lib/data/home";
import { getNetworkProgramsForHomeCarousel } from "@/lib/data/ministry-programs";
import { buildStaticPageMetadata } from "@/lib/seo/metadata";

export const dynamic = "force-dynamic";

const TITLE = "Home";
const DESCRIPTION =
  "Watch FlashPoint live, browse original shows, and stay informed with FPTN News.";

export async function generateMetadata(): Promise<Metadata> {
  return buildStaticPageMetadata({
    title: TITLE,
    description: DESCRIPTION,
    path: "/",
  });
}

export default async function HomePage() {
  const [data, carouselShows] = await Promise.all([
    getHomePayload(),
    getNetworkProgramsForHomeCarousel(),
  ]);

  return (
    <>
      <StaticWebPageJsonLd
        title={TITLE}
        description={DESCRIPTION}
        path="/"
      />
      <Home2View data={data} carouselShows={carouselShows} />
    </>
  );
}
