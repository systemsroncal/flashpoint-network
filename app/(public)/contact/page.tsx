import type { Metadata } from "next";
import StaticWebPageJsonLd from "@/components/seo/StaticWebPageJsonLd";
import ContactView from "@/components/public/static/ContactView";
import { buildStaticPageMetadata } from "@/lib/seo/metadata";

const TITLE = "Contact";
const DESCRIPTION =
  "Contact FlashPoint Television Network — customer service, editorial, media, and partnerships.";

export async function generateMetadata(): Promise<Metadata> {
  return buildStaticPageMetadata({
    title: TITLE,
    description: DESCRIPTION,
    path: "/contact",
  });
}

export default function ContactPage() {
  return (
    <>
      <StaticWebPageJsonLd
        title={TITLE}
        description={DESCRIPTION}
        path="/contact"
      />
      <ContactView />
    </>
  );
}
