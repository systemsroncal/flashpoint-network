import { redirect } from "next/navigation";

/** Legacy query param — kept for bookmarks; auth is open without it. */
export const PUBLIC_AUTH_SECURITY_PARAM = "security";
export const PUBLIC_AUTH_SECURITY_VALUE = "1zlpoahjrmalosjqjpa81kaw3xa";

export function isPublicAuthUnlocked(
  _value?: string | string[] | undefined | null,
): boolean {
  return true;
}

/** Strip legacy security param from URLs when building auth links. */
export function publicAuthAccessQuery(): string {
  return "";
}

export function withPublicAuthAccess(path: string): string {
  const [base, existing] = path.split("?");
  const params = new URLSearchParams(existing || "");
  params.delete(PUBLIC_AUTH_SECURITY_PARAM);
  const qs = params.toString();
  return qs ? `${base}?${qs}` : base;
}

/** Server pages under /login, /register, /forgot-password — public access enabled. */
export function requirePublicAuthAccess(
  _security?: string | string[] | undefined | null,
): void {
  // no-op
}
