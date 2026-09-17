import { NextResponse } from "next/server";
import { requireStaffProfile } from "@/lib/auth/session";
import { listUploadLibrary } from "@/lib/media/library";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

function parseIntParam(raw: string | null): number | null {
  if (!raw?.trim()) return null;
  const n = Number.parseInt(raw, 10);
  return Number.isFinite(n) ? n : null;
}

export async function GET(request: Request) {
  const profile = await requireStaffProfile();
  if (!profile) {
    return NextResponse.json(
      { ok: false, error: "Unauthorized — staff login required." },
      { status: 401 },
    );
  }

  const { searchParams } = new URL(request.url);
  const q = searchParams.get("q") ?? "";
  const year = parseIntParam(searchParams.get("year"));
  const month = parseIntParam(searchParams.get("month"));
  const offset = Math.max(0, parseIntParam(searchParams.get("offset")) ?? 0);
  const limit = parseIntParam(searchParams.get("limit")) ?? 48;

  try {
    const result = await listUploadLibrary({ q, year, month, offset, limit });
    return NextResponse.json({ ok: true, ...result });
  } catch (err) {
    return NextResponse.json(
      {
        ok: false,
        error: err instanceof Error ? err.message : "Failed to list uploads",
      },
      { status: 500 },
    );
  }
}
