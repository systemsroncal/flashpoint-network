import PageContainer from "@/components/admin/shared/PageContainer";
import BannerWidgetsManager from "@/components/admin/banners/BannerWidgetsManager";
import { getAdminBannerWidgets } from "@/lib/admin/queries";
import type { BannerWidget } from "@/lib/banners/slots";

export const dynamic = "force-dynamic";

type Props = {
  searchParams?: Promise<Record<string, string | string[] | undefined>>;
};

export default async function AdminBannersPage({ searchParams }: Props) {
  const widgets = (await getAdminBannerWidgets()) as BannerWidget[];
  const params = (await searchParams) ?? {};
  const errorRaw = params.error;
  const savedRaw = params.saved;
  const error = Array.isArray(errorRaw) ? errorRaw[0] : errorRaw;
  const saved = savedRaw === "1" || savedRaw === "true";

  return (
    <PageContainer
      title="Banner widgets"
      description="Promo creatives for home, category, and article sidebars"
    >
      <BannerWidgetsManager
        widgets={widgets}
        flash={{ saved, error: error ?? null }}
      />
    </PageContainer>
  );
}
