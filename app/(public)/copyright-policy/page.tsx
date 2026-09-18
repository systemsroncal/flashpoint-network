import type { Metadata } from "next";
import LegalDocumentView from "@/components/public/static/LegalDocumentView";
import { LEGAL_PAGES } from "@/lib/static-pages/legal";

const meta = LEGAL_PAGES.copyright;

export const metadata: Metadata = {
  title: meta.title,
  description: meta.description,
};

export default function CopyrightPolicyPage() {
  return <LegalDocumentView pageKey="copyright" />;
}
