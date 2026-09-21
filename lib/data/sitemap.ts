import { createAdminClient } from "@/lib/supabase/admin";
import { createClient } from "@/lib/supabase/server";

export type SitemapEntry = {
  path: string;
  lastModified?: Date;
};

const STATIC_PATHS: string[] = [
  "/",
  "/news",
  "/live",
  "/about",
  "/contact",
  "/search",
  "/events",
  "/schedule-programs",
  "/network-programs",
  "/classic-programs",
  "/ministry-programs",
  "/privacy-policy",
  "/terms-and-conditions",
  "/copyright-policy",
  "/data-disclaimer",
  "/help-center",
];

export async function getSitemapEntries(): Promise<SitemapEntry[]> {
  const entries: SitemapEntry[] = STATIC_PATHS.map((path) => ({ path }));

  const supabase = (await createClient()) ?? createAdminClient();
  if (!supabase) return entries;

  const [postsRes, categoriesRes, eventsRes, networkRes, classicRes, ministryProgramsRes] =
    await Promise.all([
      supabase
        .from("posts")
        .select("slug, published_at, updated_at")
        .eq("status", "published")
        .order("published_at", { ascending: false })
        .limit(5000),
      supabase.from("categories").select("slug, updated_at"),
      supabase.from("events").select("slug, updated_at").limit(500),
      supabase
        .from("ministry_programs")
        .select("slug, updated_at")
        .eq("status", "published"),
      supabase
        .from("classic_programs")
        .select("slug, updated_at")
        .eq("status", "published"),
      supabase
        .from("ministry_programs")
        .select("slug, updated_at")
        .eq("status", "published"),
    ]);

  for (const row of postsRes.data ?? []) {
    if (!row.slug) continue;
    const lm = row.updated_at || row.published_at;
    entries.push({
      path: `/news/${row.slug}`,
      lastModified: lm ? new Date(lm) : undefined,
    });
  }

  for (const row of categoriesRes.data ?? []) {
    if (!row.slug) continue;
    entries.push({
      path: `/category/${row.slug}`,
      lastModified: row.updated_at ? new Date(row.updated_at) : undefined,
    });
  }

  for (const row of eventsRes.data ?? []) {
    if (!row.slug) continue;
    entries.push({
      path: `/events/${row.slug}`,
      lastModified: row.updated_at ? new Date(row.updated_at) : undefined,
    });
  }

  for (const row of networkRes.data ?? []) {
    if (!row.slug) continue;
    entries.push({
      path: `/network-programs/${row.slug}`,
      lastModified: row.updated_at ? new Date(row.updated_at) : undefined,
    });
  }

  for (const row of classicRes.data ?? []) {
    if (!row.slug) continue;
    entries.push({
      path: `/classic-programs/${row.slug}`,
      lastModified: row.updated_at ? new Date(row.updated_at) : undefined,
    });
  }

  for (const row of ministryProgramsRes.data ?? []) {
    if (!row.slug) continue;
    entries.push({
      path: `/ministry-programs/${row.slug}`,
      lastModified: row.updated_at ? new Date(row.updated_at) : undefined,
    });
  }

  return entries;
}
