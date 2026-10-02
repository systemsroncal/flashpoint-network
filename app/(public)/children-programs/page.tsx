import type { Metadata } from "next";
import StaticWebPageJsonLd from "@/components/seo/StaticWebPageJsonLd";
import ChildrenProgramsView from "@/components/public/ChildrenProgramsView";
import { getPublishedChildrenPrograms } from "@/lib/data/children-programs";
import { buildStaticPageMetadata } from "@/lib/seo/metadata";

export const dynamic = "force-dynamic";

const TITLE = "Children Programs";
const DESCRIPTION =
  "Family-friendly shows, Bible stories and timeless favorites for kids on FlashPoint Television Network.";

export async function generateMetadata(): Promise<Metadata> {
  return buildStaticPageMetadata({
    title: TITLE,
    description: DESCRIPTION,
    path: "/children-programs",
  });
}

export default async function ChildrenProgramsPage() {
  const programs = await getPublishedChildrenPrograms();
  return (
    <>
      <StaticWebPageJsonLd
        title={TITLE}
        description={DESCRIPTION}
        path="/children-programs"
      />
      <ChildrenProgramsView programs={programs} />
    </>
  );
}
