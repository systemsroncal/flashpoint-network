import type { SiteIdentity } from "@/lib/site-identity/constants";
import { DEFAULT_FOOTER_MARK_URL } from "@/lib/site-identity/constants";
import { absoluteMediaUrl } from "@/lib/media/public-url";
import { compactJsonLd } from "@/lib/seo/json-ld";
import { absoluteSiteUrl } from "@/lib/seo/urls";

const SITE_TAGLINE =
  "FlashPoint Television Network — digital newspaper. Get The Full Story. As It Is.";

export function buildOrganizationJsonLd(identity: SiteIdentity, siteUrl: string) {
  const logo =
    absoluteMediaUrl(identity.headerLogoUrl) ||
    `${siteUrl}${DEFAULT_FOOTER_MARK_URL}`;

  return compactJsonLd({
    "@context": "https://schema.org",
    "@type": "NewsMediaOrganization",
    "@id": `${siteUrl}/#organization`,
    name: identity.siteName,
    url: siteUrl,
    logo: {
      "@type": "ImageObject",
      url: logo,
    },
    description: SITE_TAGLINE,
  });
}

export function buildWebSiteJsonLd(identity: SiteIdentity, siteUrl: string) {
  return compactJsonLd({
    "@context": "https://schema.org",
    "@type": "WebSite",
    "@id": `${siteUrl}/#website`,
    name: identity.siteName,
    url: siteUrl,
    description: SITE_TAGLINE,
    publisher: { "@id": `${siteUrl}/#organization` },
    potentialAction: {
      "@type": "SearchAction",
      target: {
        "@type": "EntryPoint",
        urlTemplate: `${siteUrl}/search?q={search_term_string}`,
      },
      "query-input": "required name=search_term_string",
    },
  });
}

export function buildSiteGraphJsonLd(identity: SiteIdentity) {
  const siteUrl = absoluteSiteUrl("");
  return [
    buildOrganizationJsonLd(identity, siteUrl),
    buildWebSiteJsonLd(identity, siteUrl),
  ];
}
