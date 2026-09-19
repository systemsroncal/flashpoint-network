import { NextResponse } from "next/server";
import { revalidatePath } from "next/cache";
import { requireStaffProfile } from "@/lib/auth/session";
import { createAdminClient } from "@/lib/supabase/admin";
import { parseNetworkProgramsWorkbook } from "@/lib/admin/network-programs-excel";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

function uniqueSlug(): string {
  return `np-${crypto.randomUUID().replace(/-/g, "").slice(0, 12)}`;
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

  let rows;
  try {
    const buffer = Buffer.from(await file.arrayBuffer());
    rows = await parseNetworkProgramsWorkbook(buffer);
  } catch (err) {
    const message =
      err instanceof Error ? err.message : "Could not read the Excel file.";
    return NextResponse.json({ ok: false, error: message }, { status: 400 });
  }

  if (rows.length === 0) {
    return NextResponse.json(
      { ok: false, error: "No program rows found (need a title column)." },
      { status: 400 },
    );
  }

  let created = 0;
  let updated = 0;
  const errors: string[] = [];

  for (const row of rows) {
    const fields = {
      title: row.title,
      host_name: row.host_name || null,
      schedule_detail: row.schedule_detail || null,
      featured_image_url: row.featured_image_url || null,
      sort_order: row.sort_order,
      status: row.status,
    };

    if (row.id) {
      const { data: existing, error: lookupError } = await supabase
        .from("ministry_programs")
        .select("id")
        .eq("id", row.id)
        .maybeSingle();
      if (lookupError) {
        errors.push(`${row.title}: ${lookupError.message}`);
        continue;
      }
      if (existing) {
        const { error } = await supabase
          .from("ministry_programs")
          .update(fields)
          .eq("id", row.id);
        if (error) {
          errors.push(`${row.title}: ${error.message}`);
          continue;
        }
        updated += 1;
        continue;
      }
    }

    const { error } = await supabase.from("ministry_programs").insert({
      ...fields,
      slug: uniqueSlug(),
      excerpt: null,
      description: null,
      body: null,
      external_url: null,
      schedule_note: null,
      genre: null,
      genres_label: null,
      schedule_line: null,
      source_url: null,
    });
    if (error) {
      errors.push(`${row.title}: ${error.message}`);
      continue;
    }
    created += 1;
  }

  revalidatePath("/network-programs");
  revalidatePath("/admin/network-programs");

  return NextResponse.json({
    ok: errors.length === 0,
    created,
    updated,
    errors,
  });
}
