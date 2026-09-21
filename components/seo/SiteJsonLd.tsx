import JsonLd from "@/components/seo/JsonLd";
import { buildSiteGraphJsonLd } from "@/lib/seo/site-json-ld";
import { getSiteIdentity } from "@/lib/site-identity/settings";

export default async function SiteJsonLd() {
  const identity = await getSiteIdentity();
  return <JsonLd data={buildSiteGraphJsonLd(identity)} />;
}
