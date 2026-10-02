import "server-only";

import { cache } from "react";
import { createAdminClient } from "@/lib/supabase/admin";
import type { PublicPageDefinition } from "@/lib/public-pages/registry";
import { PUBLIC_PAGES, getPublicPageByKey, normalizePublicPath } from "@/lib/public-pages/registry";

export type PublicPageSeoRecord = {
  page_key: string;
  path: string;
  seo_title: string | null;
  seo_description: string | null;
  seo_keywords: string | null;
  og_title: string | null;
  og_description: string | null;
  og_image_url: string | null;
  updated_at: string | null;
};

export type PublicPageSeoRow = PublicPageDefinition & {
  seo: PublicPageSeoRecord | null;
};

function emptySeo(def: PublicPageDefinition): PublicPageSeoRecord {
  return {
    page_key: def.key,
    path: def.path,
    seo_title: null,
    seo_description: null,
    seo_keywords: null,
    og_title: null,
    og_description: null,
    og_image_url: null,
    updated_at: null,
  };
}

export const getPublicPageSeoByPath = cache(
  async (path: string): Promise<PublicPageSeoRecord | null> => {
    const normalized = normalizePublicPath(path);
    const admin = createAdminClient();
    if (!admin) return null;

    const { data, error } = await admin
      .from("public_page_seo")
      .select(
        "page_key, path, seo_title, seo_description, seo_keywords, og_title, og_description, og_image_url, updated_at",
      )
      .eq("path", normalized)
      .maybeSingle();

    if (error) {
      if (/does not exist|schema cache/i.test(error.message)) return null;
      console.error("[public_page_seo] by path", error.message);
      return null;
    }
    return (data as PublicPageSeoRecord | null) ?? null;
  },
);

export async function getPublicPageSeoByKey(
  pageKey: string,
): Promise<PublicPageSeoRecord | null> {
  const def = getPublicPageByKey(pageKey);
  if (!def) return null;
  const byPath = await getPublicPageSeoByPath(def.path);
  if (byPath) return byPath;

  const admin = createAdminClient();
  if (!admin) return null;

  const { data, error } = await admin
    .from("public_page_seo")
    .select(
      "page_key, path, seo_title, seo_description, seo_keywords, og_title, og_description, og_image_url, updated_at",
    )
    .eq("page_key", pageKey)
    .maybeSingle();

  if (error) {
    if (/does not exist|schema cache/i.test(error.message)) return null;
    console.error("[public_page_seo] by key", error.message);
    return null;
  }
  return (data as PublicPageSeoRecord | null) ?? null;
}

export async function listPublicPagesForAdmin(): Promise<PublicPageSeoRow[]> {
  const admin = createAdminClient();
  let records: PublicPageSeoRecord[] = [];

  if (admin) {
    const { data, error } = await admin
      .from("public_page_seo")
      .select(
        "page_key, path, seo_title, seo_description, seo_keywords, og_title, og_description, og_image_url, updated_at",
      );
    if (!error && data) {
      records = data as PublicPageSeoRecord[];
    } else if (error && !/does not exist|schema cache/i.test(error.message)) {
      console.error("[public_page_seo] list", error.message);
    }
  }

  const byKey = new Map(records.map((r) => [r.page_key, r]));

  return PUBLIC_PAGES.map((def) => ({
    ...def,
    seo: byKey.get(def.key) ?? null,
  }));
}

export type PublicPageSeoInput = {
  page_key: string;
  seo_title: string | null;
  seo_description: string | null;
  seo_keywords: string | null;
  og_title: string | null;
  og_description: string | null;
  og_image_url: string | null;
};

export async function upsertPublicPageSeo(
  input: PublicPageSeoInput,
): Promise<{ ok: true } | { ok: false; error: string }> {
  const def = getPublicPageByKey(input.page_key);
  if (!def) return { ok: false, error: "Unknown page." };

  const admin = createAdminClient();
  if (!admin) return { ok: false, error: "Database admin client is not configured." };

  const row = {
    page_key: def.key,
    path: def.path,
    seo_title: input.seo_title,
    seo_description: input.seo_description,
    seo_keywords: input.seo_keywords,
    og_title: input.og_title,
    og_description: input.og_description,
    og_image_url: input.og_image_url,
    updated_at: new Date().toISOString(),
  };

  const { error } = await admin.from("public_page_seo").upsert(row, {
    onConflict: "page_key",
  });

  if (error) {
    console.error("[public_page_seo] upsert", error.message);
    return { ok: false, error: error.message };
  }
  return { ok: true };
}

export function mergeSeoWithDefaults(
  def: PublicPageDefinition,
  record: PublicPageSeoRecord | null,
): PublicPageSeoRecord {
  return record ?? emptySeo(def);
}
