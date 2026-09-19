import { NextResponse } from "next/server";
import { requireStaffProfile } from "@/lib/auth/session";
import { getAdminMinistryPrograms } from "@/lib/admin/queries";
import { buildNetworkProgramsWorkbook } from "@/lib/admin/network-programs-excel";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET() {
  const profile = await requireStaffProfile();
  if (!profile) {
    return NextResponse.json({ ok: false, error: "Unauthorized" }, { status: 401 });
  }

  const programs = await getAdminMinistryPrograms();
  const buffer = await buildNetworkProgramsWorkbook(programs);
  const stamp = new Date().toISOString().slice(0, 10);

  return new NextResponse(new Uint8Array(buffer), {
    status: 200,
    headers: {
      "Content-Type":
        "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
      "Content-Disposition": `attachment; filename="network-programs-${stamp}.xlsx"`,
      "Cache-Control": "no-store",
    },
  });
}
