import type { Metadata } from "next";
import StaticWebPageJsonLd from "@/components/seo/StaticWebPageJsonLd";
import MinistryProgramsView from "@/components/public/MinistryProgramsView";
import { getPublishedMinistryPrograms } from "@/lib/data/ministry-programs";
import { buildStaticPageMetadata } from "@/lib/seo/metadata";
import { getSiteIdentity } from "@/lib/site-identity/settings";

export const dynamic = "force-dynamic";

const TITLE = "FPTN Shows";
const DESCRIPTION =
  "Rooted in the Word. Gospel-centered teaching, worship and revival on FlashPoint Television Network.";

export async function generateMetadata(): Promise<Metadata> {
  return buildStaticPageMetadata({
    title: TITLE,
    description: DESCRIPTION,
    path: "/network-programs",
  });
}

export default async function NetworkProgramsPage() {
  const [programs, identity] = await Promise.all([
    getPublishedMinistryPrograms(),
    getSiteIdentity(),
  ]);
  return (
    <>
      <StaticWebPageJsonLd
        title={TITLE}
        description={DESCRIPTION}
        path="/network-programs"
      />
      <MinistryProgramsView programs={programs} siteName={identity.siteName} />
    </>
  );
}
