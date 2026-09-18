import LoginForm from "@/components/auth/LoginForm";
import { requirePublicAuthAccess } from "@/lib/auth/public-auth-gate";
import { safeNext } from "@/lib/auth/safe-next";

export const dynamic = "force-dynamic";

type Props = {
  searchParams: Promise<{
    error?: string;
    next?: string;
    registered?: string;
    security?: string;
  }>;
};

export default async function LoginPage({ searchParams }: Props) {
  let params: {
    error?: string;
    next?: string;
    registered?: string;
    security?: string;
  } = {};
  try {
    params = (await searchParams) || {};
  } catch (err) {
    console.error("[auth] login searchParams", err);
  }

  requirePublicAuthAccess(params.security);

  const next = safeNext(params.next);
  const error =
    typeof params.error === "string" && params.error.trim()
      ? params.error.trim().slice(0, 500)
      : null;

  return (
    <LoginForm
      next={next}
      initialError={error}
      registered={Boolean(params.registered)}
    />
  );
}
