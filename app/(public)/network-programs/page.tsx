import type { Metadata } from "next";
import MinistryProgramsView from "@/components/public/MinistryProgramsView";
import { getPublishedMinistryPrograms } from "@/lib/data/ministry-programs";
import { getSiteIdentity } from "@/lib/site-identity/settings";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "FPTN Shows",
  description:
    "Rooted in the Word. Gospel-centered teaching, worship and revival on FlashPoint Television Network.",
};

export default async function MinistryProgramsPage() {
  const [programs, identity] = await Promise.all([
    getPublishedMinistryPrograms(),
    getSiteIdentity(),
  ]);
  return (
    <MinistryProgramsView programs={programs} siteName={identity.siteName} />
  );
}
