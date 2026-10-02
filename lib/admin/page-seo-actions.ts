"use server";

import { revalidatePath } from "next/cache";
import { requireStaffProfile } from "@/lib/auth/session";
import { getPublicPageByKey } from "@/lib/public-pages/registry";
import { upsertPublicPageSeo } from "@/lib/public-pages/seo-store";

function strOrNull(raw: FormDataEntryValue | null): string | null {
  const t = String(raw ?? "").trim();
  return t || null;
}

export async function savePublicPageSeoAction(
  formData: FormData,
): Promise<{ ok: true } | { ok: false; error: string }> {
  const profile = await requireStaffProfile();
  if (!profile) return { ok: false, error: "Unauthorized." };

  const pageKey = String(formData.get("page_key") || "").trim();
  const def = getPublicPageByKey(pageKey);
  if (!def) return { ok: false, error: "Unknown page." };

  const result = await upsertPublicPageSeo({
    page_key: pageKey,
    seo_title: strOrNull(formData.get("seo_title")),
    seo_description: strOrNull(formData.get("seo_description")),
    seo_keywords: strOrNull(formData.get("seo_keywords")),
    og_title: strOrNull(formData.get("og_title")),
    og_description: strOrNull(formData.get("og_description")),
    og_image_url: strOrNull(formData.get("og_image_url")),
  });

  if (!result.ok) return result;

  revalidatePath(def.path);
  revalidatePath("/admin/pages");
  revalidatePath(`/admin/pages/${pageKey}`);
  return { ok: true };
}
