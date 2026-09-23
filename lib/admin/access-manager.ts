export const ADMIN_ACCESS_QUERY_PARAM = "access";
export const ADMIN_ACCESS_QUERY_VALUE = "manager";
export const ADMIN_ACCESS_COOKIE = "fpn_admin_access";

export function isAdminAccessGranted(
  accessParam: string | null | undefined,
  cookieValue: string | null | undefined,
): boolean {
  if (accessParam === ADMIN_ACCESS_QUERY_VALUE) return true;
  return cookieValue === ADMIN_ACCESS_QUERY_VALUE;
}
