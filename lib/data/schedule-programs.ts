import "server-only";

import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import type {
  ScheduleDisplayMode,
  ScheduleEntry,
  ScheduleLayoutTemplate,
  SchedulePdf,
} from "@/lib/types/cms";

async function db() {
  return (await createClient()) ?? createAdminClient();
}

function parseDisplayMode(value: unknown): ScheduleDisplayMode {
  const raw =
    typeof value === "string"
      ? value.replace(/^"|"$/g, "")
      : String(value ?? "dynamic").replace(/^"|"$/g, "");
  if (raw === "pdf" || raw === "both" || raw === "dynamic") return raw;
  return "dynamic";
}

export async function getScheduleDisplayMode(): Promise<ScheduleDisplayMode> {
  const supabase = await db();
  if (!supabase) return "dynamic";
  const { data } = await supabase
    .from("site_settings")
    .select("value")
    .eq("key", "schedule_display_mode")
    .maybeSingle();
  return parseDisplayMode(data?.value);
}

function parseLayoutTemplate(value: unknown): ScheduleLayoutTemplate {
  const raw =
    typeof value === "string"
      ? value.replace(/^"|"$/g, "")
      : String(value ?? "template_1").replace(/^"|"$/g, "");
  return raw === "template_2" ? "template_2" : "template_1";
}

export async function getScheduleLayoutTemplate(): Promise<ScheduleLayoutTemplate> {
  const supabase = await db();
  if (!supabase) return "template_1";
  const { data } = await supabase
    .from("site_settings")
    .select("value")
    .eq("key", "schedule_layout_template")
    .maybeSingle();
  return parseLayoutTemplate(data?.value);
}

export async function getSchedulePdf(
  year: number,
  month: number,
): Promise<SchedulePdf | null> {
  const supabase = await db();
  if (!supabase) return null;
  const { data } = await supabase
    .from("schedule_pdfs")
    .select("id, year, month, title, pdf_url, created_at, updated_at")
    .eq("year", year)
    .eq("month", month)
    .maybeSingle();
  return (data as SchedulePdf) ?? null;
}

export async function getScheduleEntriesForMonth(
  year: number,
  month: number,
): Promise<ScheduleEntry[]> {
  const supabase = await db();
  if (!supabase) return [];
  const from = `${year}-${String(month).padStart(2, "0")}-01`;
  const lastDay = new Date(year, month, 0).getDate();
  const to = `${year}-${String(month).padStart(2, "0")}-${String(lastDay).padStart(2, "0")}`;
  const { data, error } = await supabase
    .from("schedule_entries")
    .select(
      "id, air_date, start_time, end_time, title, description, category, color, created_at, updated_at",
    )
    .gte("air_date", from)
    .lte("air_date", to)
    .order("air_date", { ascending: true })
    .order("start_time", { ascending: true });
  if (error) throw new Error(error.message);
  return (data as ScheduleEntry[]) ?? [];
}

export async function getScheduleEntriesForDate(
  airDate: string,
): Promise<ScheduleEntry[]> {
  const supabase = await db();
  if (!supabase) return [];
  const { data, error } = await supabase
    .from("schedule_entries")
    .select(
      "id, air_date, start_time, end_time, title, description, category, color, created_at, updated_at",
    )
    .eq("air_date", airDate)
    .order("start_time", { ascending: true });
  if (error) throw new Error(error.message);
  return (data as ScheduleEntry[]) ?? [];
}
