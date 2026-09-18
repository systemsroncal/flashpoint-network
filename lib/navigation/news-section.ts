/** Paths where the cyan news category bar is shown (desktop + mobile). */
export function isNewsSectionPath(pathname: string): boolean {
  const path = pathname.split("?")[0] || "/";
  if (path === "/" || path === "/news") return true;
  if (path.startsWith("/news/")) return true;
  if (path.startsWith("/category/")) return true;
  if (path.startsWith("/tag/") || path.startsWith("/tags/")) return true;
  if (path.startsWith("/feed/")) return true;
  if (path.startsWith("/preview/news/")) return true;
  return false;
}
