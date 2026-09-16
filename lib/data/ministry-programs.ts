import "server-only";

import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import type {
  MinistryProgram,
  MinistryProgramsSortMode,
} from "@/lib/types/cms";
import { withLocalFeaturedImage } from "@/lib/media/prefer-local";

async function db() {
  return (await createClient()) ?? createAdminClient();
}

function parseSortMode(value: unknown): MinistryProgramsSortMode {
  const raw =
    typeof value === "string"
      ? value.replace(/^"|"$/g, "")
      : String(value ?? "manual").replace(/^"|"$/g, "");
  if (["manual", "a_z", "z_a", "random", "newest"].includes(raw)) {
    return raw as MinistryProgramsSortMode;
  }
  return "manual";
}

export async function getPublicMinistryProgramsSortMode(): Promise<MinistryProgramsSortMode> {
  const supabase = await db();
  if (!supabase) return "manual";
  const { data } = await supabase
    .from("site_settings")
    .select("value")
    .eq("key", "ministry_programs_sort")
    .maybeSingle();
  return parseSortMode(data?.value);
}

export async function getPublishedMinistryPrograms(): Promise<MinistryProgram[]> {
  const supabase = await db();
  if (!supabase) return [];
  const mode = await getPublicMinistryProgramsSortMode();

  let query = supabase
    .from("ministry_programs")
    .select(
      "id, title, slug, excerpt, description, body, featured_image_url, external_url, schedule_note, sort_order, status, source_url, created_at, updated_at",
    )
    .eq("status", "published");

  if (mode === "a_z") {
    query = query.order("title", { ascending: true });
  } else if (mode === "z_a") {
    query = query.order("title", { ascending: false });
  } else if (mode === "newest") {
    query = query.order("created_at", { ascending: false });
  } else {
    query = query
      .order("sort_order", { ascending: true })
      .order("title", { ascending: true });
  }

  const { data, error } = await query;
  if (error) throw new Error(error.message);
  let rows = (data as MinistryProgram[]) ?? [];
  if (mode === "random") {
    rows = [...rows].sort(() => Math.random() - 0.5);
  }
  return rows.map((row) => withLocalFeaturedImage(row));
}

export async function getMinistryProgramBySlug(
  slug: string,
): Promise<MinistryProgram | null> {
  const supabase = await db();
  if (!supabase) return null;
  const { data } = await supabase
    .from("ministry_programs")
    .select(
      "id, title, slug, excerpt, description, body, featured_image_url, external_url, schedule_note, sort_order, status, source_url, created_at, updated_at",
    )
    .eq("slug", slug)
    .eq("status", "published")
    .maybeSingle();
  return data ? withLocalFeaturedImage(data as MinistryProgram) : null;
}
