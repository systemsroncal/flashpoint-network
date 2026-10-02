import PageContainer from "@/components/admin/shared/PageContainer";
import FormEntriesPageChrome from "@/components/admin/forms/FormEntriesPageChrome";
import AdvertiseInquiriesTable from "@/components/admin/forms/AdvertiseInquiriesTable";
import {
  getAdminAdvertiseInquiries,
  getAdminFormSubmissionsSchemaReady,
} from "@/lib/admin/queries";

export const dynamic = "force-dynamic";

const ADVERTISE_SCHEMA_WARNING =
  "The advertising inquiries table is not available on this database. Run npm run db:apply (migration 20260930190000_advertise_inquiries.sql) on production.";

export default async function AdminAdvertiseFormEntriesPage() {
  const [inquiries, schema] = await Promise.all([
    getAdminAdvertiseInquiries(),
    getAdminFormSubmissionsSchemaReady(),
  ]);

  return (
    <PageContainer
      title="Advertising inquiry"
      description="Entries from /advertise"
    >
      <FormEntriesPageChrome
        backHref="/admin/forms"
        schemaWarning={schema.advertise ? null : ADVERTISE_SCHEMA_WARNING}
      />
      <AdvertiseInquiriesTable inquiries={inquiries} />
    </PageContainer>
  );
}
