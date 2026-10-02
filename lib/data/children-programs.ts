import "server-only";

import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import type {
  ClassicProgram,
  ClassicProgramsSortMode,
} from "@/lib/types/cms";
import { withLocalFeaturedImage } from "@/lib/media/prefer-local";

async function db() {
  return (await createClient()) ?? createAdminClient();
}

function parseSortMode(value: unknown): ClassicProgramsSortMode {
  const raw =
    typeof value === "string"
      ? value.replace(/^"|"$/g, "")
      : String(value ?? "manual").replace(/^"|"$/g, "");
  if (["manual", "a_z", "z_a", "random", "newest"].includes(raw)) {
    return raw as ClassicProgramsSortMode;
  }
  return "manual";
}

export async function getPublicChildrenProgramsSortMode(): Promise<ClassicProgramsSortMode> {
  const supabase = await db();
  if (!supabase) return "manual";
  const { data } = await supabase
    .from("site_settings")
    .select("value")
    .eq("key", "children_programs_sort")
    .maybeSingle();
  return parseSortMode(data?.value);
}

export async function getPublishedChildrenPrograms(): Promise<ClassicProgram[]> {
  const supabase = await db();
  if (!supabase) return [];
  const mode = await getPublicChildrenProgramsSortMode();

  let query = supabase
    .from("children_programs")
    .select(
      "id, title, slug, excerpt, description, body, featured_image_url, external_url, schedule_note, genre, genres_label, schedule_line, sort_order, status, source_url, created_at, updated_at",
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
  let rows = (data as ClassicProgram[]) ?? [];
  if (mode === "random") {
    rows = [...rows].sort(() => Math.random() - 0.5);
  }
  return rows.map((row) => withLocalFeaturedImage(row));
}
