import { redirect } from "next/navigation";

/** Temporary gate for public login/register while email delivery is unstable. */
export const PUBLIC_AUTH_SECURITY_PARAM = "security";
export const PUBLIC_AUTH_SECURITY_VALUE = "1zlpoahjrmalosjqjpa81kaw3xa";

export function isPublicAuthUnlocked(
  value: string | string[] | undefined | null,
): boolean {
  const raw = Array.isArray(value) ? value[0] : value;
  return typeof raw === "string" && raw === PUBLIC_AUTH_SECURITY_VALUE;
}

/** Query string to append so auth pages stay unlocked across internal links. */
export function publicAuthAccessQuery(): string {
  return `${PUBLIC_AUTH_SECURITY_PARAM}=${PUBLIC_AUTH_SECURITY_VALUE}`;
}

export function withPublicAuthAccess(path: string): string {
  const [base, existing] = path.split("?");
  const params = new URLSearchParams(existing || "");
  params.set(PUBLIC_AUTH_SECURITY_PARAM, PUBLIC_AUTH_SECURITY_VALUE);
  const qs = params.toString();
  return qs ? `${base}?${qs}` : base;
}

/**
 * Server pages under /login, /register, /forgot-password must call this.
 * Missing or wrong `security` → home.
 */
export function requirePublicAuthAccess(
  security: string | string[] | undefined | null,
): void {
  if (!isPublicAuthUnlocked(security)) {
    redirect("/");
  }
}
