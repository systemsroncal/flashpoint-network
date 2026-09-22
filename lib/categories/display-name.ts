/** Frontend label overrides (CMS name may stay "Elections"). */
export function categoryDisplayName(
  name: string,
  slug?: string | null,
): string {
  if (slug === "elections") return "Elections 2026";
  return name;
}

export function categoryDisplayNameUpper(
  name: string,
  slug?: string | null,
): string {
  return categoryDisplayName(name, slug).toUpperCase();
}
