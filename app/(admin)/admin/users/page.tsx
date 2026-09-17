import PageContainer from "@/components/admin/shared/PageContainer";
import UsersTable from "@/components/admin/users/UsersTable";
import { getAdminProfiles } from "@/lib/admin/queries";

export const dynamic = "force-dynamic";

type Props = {
  searchParams?: Promise<Record<string, string | string[] | undefined>>;
};

export default async function AdminUsersPage({ searchParams }: Props) {
  const users = await getAdminProfiles();
  const params = (await searchParams) ?? {};
  const createdRaw = params.created;
  const errorRaw = params.error;
  const emailRaw = params.email;
  const created =
    createdRaw === "1" || createdRaw === "true"
      ? Array.isArray(emailRaw)
        ? emailRaw[0]
        : emailRaw
      : null;
  const error = Array.isArray(errorRaw) ? errorRaw[0] : errorRaw;

  return (
    <PageContainer title="Users" description="Profiles and roles">
      <UsersTable
        users={users}
        flash={{
          createdEmail: created ?? null,
          error: error ?? null,
        }}
      />
    </PageContainer>
  );
}
