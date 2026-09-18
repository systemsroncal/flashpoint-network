import termsRaw from "@/lib/static-pages/generated/terms.json";
import privacyRaw from "@/lib/static-pages/generated/privacy.json";
import disclaimerRaw from "@/lib/static-pages/generated/disclaimer.json";
import copyrightRaw from "@/lib/static-pages/generated/copyright.json";

export type LegalPageKey = "terms" | "privacy" | "disclaimer" | "copyright";

export type LegalPageMeta = {
  key: LegalPageKey;
  title: string;
  lastUpdated: string;
  path: string;
  description: string;
};

export const LEGAL_PAGES: Record<LegalPageKey, LegalPageMeta> = {
  terms: {
    key: "terms",
    title: "Terms & Conditions",
    lastUpdated: "September, 2026",
    path: "/terms-and-conditions",
    description:
      "Terms of Service for FlashPoint Television Network websites, platforms, and programming.",
  },
  privacy: {
    key: "privacy",
    title: "Privacy Policy",
    lastUpdated: "September 4, 2026",
    path: "/privacy-policy",
    description:
      "How FlashPoint Television Network collects, uses, and protects your personal information.",
  },
  disclaimer: {
    key: "disclaimer",
    title: "Data Disclaimer",
    lastUpdated: "September 4, 2024",
    path: "/data-disclaimer",
    description:
      "Important information about financial, market, and third-party data on FlashPoint Television Network.",
  },
  copyright: {
    key: "copyright",
    title: "Copyright Policy and Infringement Notification",
    lastUpdated: "September 4, 2026",
    path: "/copyright-policy",
    description:
      "Copyright policy and DMCA infringement notification procedures for FlashPoint Television Network.",
  },
};

const RAW: Record<LegalPageKey, string[]> = {
  terms: termsRaw as string[],
  privacy: privacyRaw as string[],
  disclaimer: disclaimerRaw as string[],
  copyright: copyrightRaw as string[],
};

function sliceFrom(paras: string[], predicate: (p: string) => boolean): string[] {
  const i = paras.findIndex(predicate);
  return i >= 0 ? paras.slice(i) : paras;
}

export function getLegalParagraphs(key: LegalPageKey): string[] {
  const paras = RAW[key];
  switch (key) {
    case "terms":
      return sliceFrom(paras, (p) => p.startsWith("PLEASE READ"));
    case "privacy":
      return sliceFrom(paras, (p) => p.startsWith("Learn how FlashPoint"));
    case "disclaimer":
      return sliceFrom(paras, (p) => p.startsWith("Important information"));
    case "copyright":
      return sliceFrom(paras, (p) =>
        p.includes("respects the intellectual property rights"),
      );
    default:
      return paras;
  }
}

export function isLegalSectionHeading(text: string): boolean {
  const t = text.trim();
  if (/^\d{2}\.\s+[A-Z]/.test(t)) return true;
  if (/^\d+\.\s+[A-Z]/.test(t) && t.length < 120) return true;
  if (t === "CONTACT US") return true;
  return false;
}
