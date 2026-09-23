/** Legacy query param kept for bookmarked auth URLs; gate is open. */
export const PUBLIC_AUTH_SECURITY_PARAM = "security";
export const PUBLIC_AUTH_SECURITY_VALUE = "1zlpoahjrmalosjqjpa81kaw3xa";

export function isPublicAuthUnlocked(
  _value: string | string[] | undefined | null,
): boolean {
  return true;
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

/** Server pages under /login, /register, /forgot-password — public access. */
export function requirePublicAuthAccess(
  _security: string | string[] | undefined | null,
): void {
  // no-op
}
