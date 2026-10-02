import type { Metadata } from "next";
import StaticWebPageJsonLd from "@/components/seo/StaticWebPageJsonLd";
import ClassicProgramsView from "@/components/public/ClassicProgramsView";
import { getPublishedClassicPrograms } from "@/lib/data/classic-programs";
import { buildStaticPageMetadata } from "@/lib/seo/metadata";

export const dynamic = "force-dynamic";

const TITLE = "Your Classic Favorites";
const DESCRIPTION =
  "Great television and timeless stories — weekday classics on FlashPoint Television Network.";

export async function generateMetadata(): Promise<Metadata> {
  return buildStaticPageMetadata({
    title: TITLE,
    description: DESCRIPTION,
    path: "/classic-programs",
  });
}

export default async function ClassicProgramsPage() {
  const programs = await getPublishedClassicPrograms();
  return (
    <>
      <StaticWebPageJsonLd
        title={TITLE}
        description={DESCRIPTION}
        path="/classic-programs"
      />
      <ClassicProgramsView programs={programs} />
    </>
  );
}
