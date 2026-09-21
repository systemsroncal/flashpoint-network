import type { MetadataRoute } from "next";
import { getSitemapEntries } from "@/lib/data/sitemap";
import { absoluteSiteUrl } from "@/lib/seo/urls";

export const dynamic = "force-dynamic";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const entries = await getSitemapEntries();

  return entries.map((entry) => ({
    url:
      entry.path === "/"
        ? absoluteSiteUrl("")
        : absoluteSiteUrl(entry.path),
    lastModified: entry.lastModified,
    changeFrequency: entry.path.startsWith("/news/") ? "daily" : "weekly",
    priority: entry.path === "/" ? 1 : entry.path.startsWith("/news/") ? 0.8 : 0.6,
  }));
}
