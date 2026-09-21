import type { Metadata } from "next";
import StaticWebPageJsonLd from "@/components/seo/StaticWebPageJsonLd";
import MinistryProgramsView from "@/components/public/MinistryProgramsView";
import { getPublishedMinistryPrograms } from "@/lib/data/ministry-programs";
import { buildStaticPageMetadata } from "@/lib/seo/metadata";

export const dynamic = "force-dynamic";

const TITLE = "Ministry Programs";
const DESCRIPTION =
  "Gospel-centered ministry broadcasts on FlashPoint Television Network.";

export async function generateMetadata(): Promise<Metadata> {
  return buildStaticPageMetadata({
    title: TITLE,
    description: DESCRIPTION,
    path: "/ministry-programs",
  });
}

export default async function MinistryProgramsPage() {
  const programs = await getPublishedMinistryPrograms();
  return (
    <>
      <StaticWebPageJsonLd
        title={TITLE}
        description={DESCRIPTION}
        path="/ministry-programs"
      />
      <MinistryProgramsView programs={programs} />
    </>
  );
}
