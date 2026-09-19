/**
 * Prefer files vendored under `public/media/` over hotlinked Storage URLs.
 * Storage public URLs look like:
 *   https://PROJECT.supabase.co/storage/v1/object/public/media/programs/...
 */
const STORAGE_PUBLIC = "/storage/v1/object/public/media/";

export function preferLocalMediaUrl(
  url: string | null | undefined,
): string | null {
  if (!url) return null;
  const trimmed = url.trim();
  if (!trimmed) return null;
  const idx = trimmed.indexOf(STORAGE_PUBLIC);
  if (idx !== -1) {
    return `/media/${trimmed.slice(idx + STORAGE_PUBLIC.length)}`;
  }
  return trimmed;
}

export function withLocalFeaturedImage<T extends { featured_image_url?: string | null }>(
  row: T,
): T {
  return {
    ...row,
    featured_image_url: preferLocalMediaUrl(row.featured_image_url ?? null),
  };
}

export function withLocalProgramImages<
  T extends {
    featured_image_url?: string | null;
    carousel_image_url?: string | null;
  },
>(row: T): T {
  return {
    ...row,
    featured_image_url: preferLocalMediaUrl(row.featured_image_url ?? null),
    carousel_image_url: preferLocalMediaUrl(row.carousel_image_url ?? null),
  };
}
