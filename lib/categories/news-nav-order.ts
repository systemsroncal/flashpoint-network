import type { Category } from "@/lib/types/cms";
import { getRootCategories } from "@/lib/categories/hierarchy";

/** Desktop + mobile news nav: U.S. → Politics → Elections 2026, then the rest. */
const PINNED_ROOT_SLUGS = ["us", "politics", "elections"] as const;

function pinnedRank(slug: string): number {
  const idx = PINNED_ROOT_SLUGS.indexOf(slug as (typeof PINNED_ROOT_SLUGS)[number]);
  return idx >= 0 ? idx : PINNED_ROOT_SLUGS.length;
}

function compareNavRoots(a: Category, b: Category): number {
  const pa = pinnedRank(a.slug);
  const pb = pinnedRank(b.slug);
  if (pa !== pb) return pa - pb;
  return a.sort_order - b.sort_order || a.name.localeCompare(b.name);
}

export function orderRootCategoriesForNewsNav(categories: Category[]): Category[] {
  return [...getRootCategories(categories)].sort(compareNavRoots);
}

export function flattenCategoriesForNewsNav(categories: Category[]): Category[] {
  const roots = orderRootCategoriesForNewsNav(categories);
  const out: Category[] = [];
  for (const root of roots) {
    out.push(root);
    const children = categories
      .filter((c) => c.parent_id === root.id)
      .sort((a, b) => a.sort_order - b.sort_order || a.name.localeCompare(b.name));
    out.push(...children);
  }
  const listed = new Set(out.map((c) => c.id));
  for (const c of categories) {
    if (!listed.has(c.id)) out.push(c);
  }
  return out;
}

/** @deprecated Use orderRootCategoriesForNewsNav — kept for tests/callers expecting flatten name. */
export function orderCategoriesForNewsNav(categories: Category[]): Category[] {
  return flattenCategoriesForNewsNav(categories);
}
