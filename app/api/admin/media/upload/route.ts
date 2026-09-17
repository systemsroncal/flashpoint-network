import { NextResponse } from "next/server";
import { revalidatePath } from "next/cache";
import { requireStaffProfile } from "@/lib/auth/session";
import { saveUploadedImage } from "@/lib/admin/upload-core";
import { invalidateUploadLibraryIndex } from "@/lib/media/library";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/**
 * Admin image upload via Route Handler (not a Server Action).
 * Avoids the default 1MB Server Action body limit and CSRF Origin
 * `new URL(...)` failures when OLS/CyberPanel duplicates the Origin header.
 */
export async function POST(request: Request) {
  const profile = await requireStaffProfile();
  if (!profile) {
    return NextResponse.json(
      { ok: false, error: "Unauthorized — staff login required." },
      { status: 401 },
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
      { ok: false, error: "Choose an image file to upload." },
      { status: 400 },
    );
  }

  try {
    const result = await saveUploadedImage(file);
    if (!result.ok) {
      return NextResponse.json(result, { status: 400 });
    }
    invalidateUploadLibraryIndex();
    revalidatePath("/admin/media");
    return NextResponse.json(result);
  } catch (err) {
    return NextResponse.json(
      {
        ok: false,
        error: err instanceof Error ? err.message : "Upload failed",
      },
      { status: 500 },
    );
  }
}
