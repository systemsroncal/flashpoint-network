import type { Metadata } from "next";
import StaticWebPageJsonLd from "@/components/seo/StaticWebPageJsonLd";
import AboutView from "@/components/public/static/AboutView";
import { buildStaticPageMetadata } from "@/lib/seo/metadata";

const TITLE = "About";
const DESCRIPTION =
  "Learn about FlashPoint Television Network, Gene Bailey, Teri Bailey, and our mission.";

export async function generateMetadata(): Promise<Metadata> {
  return buildStaticPageMetadata({
    title: TITLE,
    description: DESCRIPTION,
    path: "/about",
  });
}

export default function AboutPage() {
  return (
    <>
      <StaticWebPageJsonLd
        title={TITLE}
        description={DESCRIPTION}
        path="/about"
      />
      <AboutView />
    </>
  );
}
