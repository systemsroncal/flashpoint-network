import { notFound } from "next/navigation";
import PageContainer from "@/components/admin/shared/PageContainer";
import PageSeoForm from "@/components/admin/pages/PageSeoForm";
import { getSiteUrl } from "@/lib/env";
import { getPublicPageByKey } from "@/lib/public-pages/registry";
import {
  getPublicPageSeoByKey,
  mergeSeoWithDefaults,
} from "@/lib/public-pages/seo-store";
import { getSiteIdentity } from "@/lib/site-identity/settings";

export const dynamic = "force-dynamic";

type Props = {
  params: Promise<{ key: string }>;
};

export default async function AdminPageSeoEditorPage({ params }: Props) {
  const { key } = await params;
  const def = getPublicPageByKey(key);
  if (!def) notFound();

  const [seo, identity] = await Promise.all([
    getPublicPageSeoByKey(key),
    getSiteIdentity(),
  ]);

  return (
    <PageContainer title="Page SEO" description="Meta tags for a public route">
      <PageSeoForm
        page={def}
        seo={mergeSeoWithDefaults(def, seo)}
        siteName={identity.siteName}
        siteUrl={getSiteUrl()}
        defaultFeaturedImageUrl={identity.defaultFeaturedImageUrl}
      />
    </PageContainer>
  );
}
