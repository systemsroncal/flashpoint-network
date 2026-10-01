import { NextResponse } from "next/server";
import { revalidatePath } from "next/cache";
import { requireStaffProfile } from "@/lib/auth/session";
import { createAdminClient } from "@/lib/supabase/admin";
import { parseScheduleProgramsWorkbook } from "@/lib/admin/schedule-programs-excel";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

function parseYearMonth(formData: FormData): { year: number; month: number } | null {
  const year = Number(formData.get("year"));
  const month = Number(formData.get("month"));
  if (!Number.isInteger(year) || year < 2000 || year > 2100) return null;
  if (!Number.isInteger(month) || month < 1 || month > 12) return null;
  return { year, month };
}

export async function POST(request: Request) {
  const profile = await requireStaffProfile();
  if (!profile) {
    return NextResponse.json({ ok: false, error: "Unauthorized" }, { status: 401 });
  }

  const supabase = createAdminClient();
  if (!supabase) {
    return NextResponse.json(
      { ok: false, error: "Supabase admin client is not configured" },
      { status: 500 },
    );
  }

  let formData: FormData;
  try {
    formData = await request.formData();
  } catch {
    return NextResponse.json(
      { ok: false, error: "Invalid multipart body." },
      { status: 400 },
    );
  }

  const period = parseYearMonth(formData);
  if (!period) {
    return NextResponse.json(
      { ok: false, error: "Choose a valid year and month for this import." },
      { status: 400 },
    );
  }

  const file = formData.get("file");
  if (!(file instanceof File)) {
    return NextResponse.json(
      { ok: false, error: "Choose an Excel (.xlsx) file to import." },
      { status: 400 },
    );
  }

  const name = file.name.toLowerCase();
  if (!name.endsWith(".xlsx") && !name.endsWith(".xlsm")) {
    return NextResponse.json(
      { ok: false, error: "Only .xlsx Excel files are supported." },
      { status: 400 },
    );
  }

  const { year, month } = period;
  let entries;
  try {
    const buffer = Buffer.from(await file.arrayBuffer());
    entries = await parseScheduleProgramsWorkbook(buffer, year, month);
  } catch (err) {
    const message =
      err instanceof Error ? err.message : "Could not read the Excel file.";
    return NextResponse.json({ ok: false, error: message }, { status: 400 });
  }

  const from = `${year}-${String(month).padStart(2, "0")}-01`;
  const lastDay = new Date(year, month, 0).getDate();
  const to = `${year}-${String(month).padStart(2, "0")}-${String(lastDay).padStart(2, "0")}`;

  const { error: delErr } = await supabase
    .from("schedule_entries")
    .delete()
    .gte("air_date", from)
    .lte("air_date", to);
  if (delErr) {
    return NextResponse.json({ ok: false, error: delErr.message }, { status: 500 });
  }

  const chunk = 200;
  let inserted = 0;
  for (let i = 0; i < entries.length; i += chunk) {
    const batch = entries.slice(i, i + chunk);
    const { error } = await supabase.from("schedule_entries").insert(batch);
    if (error) {
      return NextResponse.json({ ok: false, error: error.message }, { status: 500 });
    }
    inserted += batch.length;
  }

  revalidatePath("/schedule-programs");
  revalidatePath("/admin/schedule-programs");

  return NextResponse.json({
    ok: true,
    year,
    month,
    inserted,
  });
}
