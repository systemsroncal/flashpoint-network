import type { Metadata } from "next";
import StaticWebPageJsonLd from "@/components/seo/StaticWebPageJsonLd";
import LegalDocumentView from "@/components/public/static/LegalDocumentView";
import { buildStaticPageMetadata } from "@/lib/seo/metadata";
import { LEGAL_PAGES } from "@/lib/static-pages/legal";

const meta = LEGAL_PAGES.privacy;

export async function generateMetadata(): Promise<Metadata> {
  return buildStaticPageMetadata({
    title: meta.title,
    description: meta.description,
    path: meta.path,
  });
}

export default function PrivacyPolicyPage() {
  return (
    <>
      <StaticWebPageJsonLd
        title={meta.title}
        description={meta.description}
        path={meta.path}
      />
      <LegalDocumentView pageKey="privacy" />
    </>
  );
}
