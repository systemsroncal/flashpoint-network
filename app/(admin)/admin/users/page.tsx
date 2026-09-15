import PageContainer from "@/components/admin/shared/PageContainer";
import UsersTable from "@/components/admin/users/UsersTable";
import { getAdminProfiles } from "@/lib/admin/queries";

export const dynamic = "force-dynamic";

export default async function AdminUsersPage() {
  const users = await getAdminProfiles();
  return (
    <PageContainer title="Users" description="Profiles and roles">
      <UsersTable users={users} />
    </PageContainer>
  );
}
