import "server-only";

import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import type {
  MinistryProgram,
  MinistryProgramsSortMode,
} from "@/lib/types/cms";
import { withLocalProgramImages } from "@/lib/media/prefer-local";

const MINISTRY_SELECT_BASE =
  "id, title, slug, excerpt, description, body, featured_image_url, external_url, schedule_note, genre, genres_label, schedule_line, host_name, schedule_detail, sort_order, status, source_url, created_at, updated_at";

const MINISTRY_SELECT_WITH_CAROUSEL = `${MINISTRY_SELECT_BASE}, carousel_image_url`;

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

function isMissingCarouselColumn(error: { message?: string } | null): boolean {
  return /carousel_image_url/i.test(error?.message || "");
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

  async function run(selectCols: string) {
    let query = supabase!
      .from("ministry_programs")
      .select(selectCols)
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

    return query;
  }

  const primary = await run(MINISTRY_SELECT_WITH_CAROUSEL);
  let rawRows: unknown[] | null = primary.data as unknown[] | null;
  let error = primary.error;
  if (error && isMissingCarouselColumn(error)) {
    const fallback = await run(MINISTRY_SELECT_BASE);
    rawRows = fallback.data as unknown[] | null;
    error = fallback.error;
  }
  if (error) throw new Error(error.message);
  let rows = ((rawRows ?? []) as MinistryProgram[]).map((row) => ({
    ...row,
    carousel_image_url: row.carousel_image_url ?? null,
  }));
  if (mode === "random") {
    rows = [...rows].sort(() => Math.random() - 0.5);
  }
  return rows.map((row) => withLocalProgramImages(row));
}

export async function getMinistryProgramBySlug(
  slug: string,
): Promise<MinistryProgram | null> {
  const supabase = await db();
  if (!supabase) return null;
  const primary = await supabase
    .from("ministry_programs")
    .select(MINISTRY_SELECT_WITH_CAROUSEL)
    .eq("slug", slug)
    .eq("status", "published")
    .maybeSingle();
  let raw: unknown = primary.data;
  let error = primary.error;
  if (error && isMissingCarouselColumn(error)) {
    const fallback = await supabase
      .from("ministry_programs")
      .select(MINISTRY_SELECT_BASE)
      .eq("slug", slug)
      .eq("status", "published")
      .maybeSingle();
    raw = fallback.data;
    error = fallback.error;
  }
  if (error) throw new Error(error.message);
  if (!raw) return null;
  const row = raw as MinistryProgram;
  return withLocalProgramImages({
    ...row,
    carousel_image_url: row.carousel_image_url ?? null,
  });
}

/** Published shows that have a home-carousel image set. */
export async function getNetworkProgramsForHomeCarousel(): Promise<
  MinistryProgram[]
> {
  try {
    const programs = await getPublishedMinistryPrograms();
    return programs.filter((p) => Boolean(p.carousel_image_url?.trim()));
  } catch (error) {
    if (isMissingCarouselColumn(error as { message?: string })) return [];
    throw error;
  }
}
