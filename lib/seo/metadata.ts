import type { Metadata } from "next";
import { absoluteSiteUrl } from "@/lib/seo/urls";
import { getSiteIdentity } from "@/lib/site-identity/settings";

export type PublicPageMetaInput = {
  title: string;
  description?: string;
  path: string;
  siteName: string;
  ogImage?: string;
  noIndex?: boolean;
};

export function buildPublicPageMetadata(input: PublicPageMetaInput): Metadata {
  const url = absoluteSiteUrl(input.path);
  const description = input.description?.trim();

  return {
    title: input.title,
    description,
    alternates: { canonical: url },
    robots: input.noIndex
      ? { index: false, follow: false }
      : { index: true, follow: true },
    openGraph: {
      type: "website",
      locale: "en_US",
      siteName: input.siteName,
      title: input.title,
      description,
      url,
      images: input.ogImage ? [{ url: input.ogImage }] : undefined,
    },
    twitter: {
      card: input.ogImage ? "summary_large_image" : "summary",
      title: input.title,
      description,
      images: input.ogImage ? [input.ogImage] : undefined,
    },
  };
}

/** Like buildPublicPageMetadata but loads site name from settings. */
export async function buildStaticPageMetadata(
  input: Omit<PublicPageMetaInput, "siteName">,
): Promise<Metadata> {
  const identity = await getSiteIdentity();
  return buildPublicPageMetadata({
    ...input,
    siteName: identity.siteName,
  });
}
