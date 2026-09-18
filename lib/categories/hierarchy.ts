import type { Category } from "@/lib/types/cms";

export function getChildCategories(
  categories: Category[],
  parentId: string,
): Category[] {
  return categories
    .filter((c) => c.parent_id === parentId)
    .sort((a, b) => a.sort_order - b.sort_order || a.name.localeCompare(b.name));
}

export function getRootCategories(categories: Category[]): Category[] {
  return categories
    .filter((c) => !c.parent_id)
    .sort((a, b) => a.sort_order - b.sort_order || a.name.localeCompare(b.name));
}

/** Depth-first list: parent, then its children, then next parent. */
export function flattenCategoriesHierarchy(categories: Category[]): Category[] {
  const roots = getRootCategories(categories);
  const out: Category[] = [];
  for (const root of roots) {
    out.push(root);
    out.push(...getChildCategories(categories, root.id));
  }
  const listed = new Set(out.map((c) => c.id));
  for (const c of categories) {
    if (!listed.has(c.id)) out.push(c);
  }
  return out;
}

export function getDescendantCategoryIds(
  categories: Category[],
  rootId: string,
): string[] {
  const ids: string[] = [rootId];
  const queue = [rootId];
  while (queue.length > 0) {
    const current = queue.shift()!;
    for (const child of getChildCategories(categories, current)) {
      ids.push(child.id);
      queue.push(child.id);
    }
  }
  return ids;
}

export function categoryOptionLabel(
  category: Category,
  categories: Category[],
): string {
  if (!category.parent_id) return category.name;
  const parent = categories.find((c) => c.id === category.parent_id);
  return parent ? `${parent.name} › ${category.name}` : category.name;
}

/** Prevent assigning a category as parent of its own descendant. */
export function wouldCreateCategoryCycle(
  categories: Category[],
  categoryId: string,
  newParentId: string | null,
): boolean {
  if (!newParentId || newParentId === categoryId) return true;
  const descendants = getDescendantCategoryIds(categories, categoryId);
  return descendants.includes(newParentId);
}
