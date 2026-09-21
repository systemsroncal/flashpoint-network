import { compactJsonLd } from "@/lib/seo/json-ld";
import { absoluteSiteUrl } from "@/lib/seo/urls";

export function buildWebPageJsonLd(input: {
  title: string;
  description?: string;
  path: string;
}) {
  const url = absoluteSiteUrl(input.path);
  const siteUrl = absoluteSiteUrl("");

  return compactJsonLd({
    "@context": "https://schema.org",
    "@type": "WebPage",
    "@id": `${url}#webpage`,
    url,
    name: input.title,
    description: input.description,
    isPartOf: { "@id": `${siteUrl}/#website` },
    inLanguage: "en-US",
  });
}

export function buildCollectionPageJsonLd(input: {
  title: string;
  description?: string;
  path: string;
}) {
  const url = absoluteSiteUrl(input.path);
  const siteUrl = absoluteSiteUrl("");

  return compactJsonLd({
    "@context": "https://schema.org",
    "@type": "CollectionPage",
    "@id": `${url}#collection`,
    url,
    name: input.title,
    description: input.description,
    isPartOf: { "@id": `${siteUrl}/#website` },
    inLanguage: "en-US",
  });
}
