import Home2LiveHero from "@/components/public/Home2LiveHero";
import HomeNetworkMarketing from "@/components/public/HomeNetworkMarketing";
import HomeShowsCarousel from "@/components/public/HomeShowsCarousel";
import type { HomePayload, MinistryProgram } from "@/lib/types/cms";
import { getSiteIdentity } from "@/lib/site-identity/settings";
import { getSiteTimezone } from "@/lib/timezone/settings";

/**
 * Network landing for /home2 — full-width Figma layout (625:8349):
 * live hero → Original Live Shows → marketing blocks.
 * Does not include the news “Beyond the Broadcast” grid.
 */
export default async function Home2View({
  data,
  carouselShows,
}: {
  data: HomePayload;
  carouselShows: MinistryProgram[];
}) {
  const [timeZone, identity] = await Promise.all([
    getSiteTimezone(),
    getSiteIdentity(),
  ]);

  const showCarouselItems = carouselShows
    .filter((p) => p.carousel_image_url)
    .map((p) => ({
      id: p.id,
      title: p.title,
      hostName: p.host_name ?? null,
      imageUrl: p.carousel_image_url as string,
    }));

  const stayInformedPosts = [
    ...data.latest,
    ...data.politics,
    ...data.world,
  ]
    .filter(
      (post, index, all) => all.findIndex((p) => p.id === post.id) === index,
    )
    .slice(0, 4);

  return (
    <div className="w-full max-w-none bg-[#101011] text-white">
      <Home2LiveHero />
      <HomeShowsCarousel items={showCarouselItems} linkable={false} />
      <HomeNetworkMarketing
        newsPosts={stayInformedPosts}
        defaultFeatured={identity.defaultFeaturedImageUrl}
        timeZone={timeZone}
      />
    </div>
  );
}
