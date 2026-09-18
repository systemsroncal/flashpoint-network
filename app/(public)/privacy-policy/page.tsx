import type { Metadata } from "next";
import LegalDocumentView from "@/components/public/static/LegalDocumentView";
import { LEGAL_PAGES } from "@/lib/static-pages/legal";

const meta = LEGAL_PAGES.privacy;

export const metadata: Metadata = {
  title: meta.title,
  description: meta.description,
};

export default function PrivacyPolicyPage() {
  return <LegalDocumentView pageKey="privacy" />;
}
