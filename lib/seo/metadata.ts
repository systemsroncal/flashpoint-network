import type { Metadata } from "next";
import { absoluteMediaUrl } from "@/lib/media/public-url";
import { getPublicPageByPath, normalizePublicPath } from "@/lib/public-pages/registry";
import { getPublicPageSeoByPath } from "@/lib/public-pages/seo-store";
import { absoluteSiteUrl } from "@/lib/seo/urls";
import { getSiteIdentity } from "@/lib/site-identity/settings";

export type PublicPageMetaInput = {
  title: string;
  description?: string;
  path: string;
  siteName: string;
  ogImage?: string;
  ogTitle?: string;
  ogDescription?: string;
  keywords?: string[];
  noIndex?: boolean;
};

export function buildPublicPageMetadata(input: PublicPageMetaInput): Metadata {
  const url = absoluteSiteUrl(input.path);
  const description = input.description?.trim();
  const ogTitle = (input.ogTitle || input.title).trim();
  const ogDescription = (input.ogDescription || description || "").trim() || undefined;

  return {
    title: input.title,
    description: description || undefined,
    keywords: input.keywords?.length ? input.keywords : undefined,
    alternates: { canonical: url },
    robots: input.noIndex
      ? { index: false, follow: false }
      : { index: true, follow: true },
    openGraph: {
      type: "website",
      locale: "en_US",
      siteName: input.siteName,
      title: ogTitle,
      description: ogDescription,
      url,
      images: input.ogImage ? [{ url: input.ogImage }] : undefined,
    },
    twitter: {
      card: input.ogImage ? "summary_large_image" : "summary",
      title: ogTitle,
      description: ogDescription,
      images: input.ogImage ? [input.ogImage] : undefined,
    },
  };
}

/** Loads site name, DB SEO overrides, and default featured image for static routes. */
export async function buildStaticPageMetadata(
  input: Omit<PublicPageMetaInput, "siteName"> & { pageKey?: string },
): Promise<Metadata> {
  const identity = await getSiteIdentity();
  const path = normalizePublicPath(input.path);
  const def = getPublicPageByPath(path);
  const stored = await getPublicPageSeoByPath(path);

  const fallbackTitle = input.title || def?.defaultTitle || identity.siteName;
  const fallbackDescription =
    input.description?.trim() || def?.defaultDescription || undefined;

  const title = stored?.seo_title?.trim() || fallbackTitle;
  const description =
    stored?.seo_description?.trim() || fallbackDescription || undefined;

  const keywords = stored?.seo_keywords
    ?.split(",")
    .map((k) => k.trim())
    .filter(Boolean);

  const ogTitle =
    stored?.og_title?.trim() || input.ogTitle?.trim() || title;
  const ogDescription =
    stored?.og_description?.trim() ||
    input.ogDescription?.trim() ||
    description;

  const defaultOg =
    absoluteMediaUrl(identity.defaultFeaturedImageUrl)?.trim() || undefined;
  const ogImage =
    absoluteMediaUrl(stored?.og_image_url)?.trim() ||
    input.ogImage?.trim() ||
    defaultOg ||
    undefined;

  return buildPublicPageMetadata({
    title,
    description,
    path,
    siteName: identity.siteName,
    ogImage,
    ogTitle,
    ogDescription,
    keywords: keywords?.length ? keywords : undefined,
    noIndex: input.noIndex,
  });
}
