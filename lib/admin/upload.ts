"use server";

import { revalidatePath } from "next/cache";
import { requireStaffProfile } from "@/lib/auth/session";
import { saveUploadedImage } from "@/lib/admin/upload-core";

/**
 * @deprecated Prefer POST /api/admin/media/upload — Server Actions cap bodies at 1MB
 * unless `experimental.serverActions.bodySizeLimit` is raised.
 */
export async function uploadMediaAction(formData: FormData): Promise<{
  ok: true;
  url: string;
  absoluteUrl: string;
} | {
  ok: false;
  error: string;
}> {
  try {
    const profile = await requireStaffProfile();
    if (!profile) {
      return { ok: false, error: "Unauthorized — staff login required." };
    }

    const file = formData.get("file");
    if (!(file instanceof File)) {
      return { ok: false, error: "Choose an image file to upload." };
    }

    const result = await saveUploadedImage(file);
    if (result.ok) {
      revalidatePath("/admin/media");
    }
    return result;
  } catch (err) {
    return {
      ok: false,
      error: err instanceof Error ? err.message : "Upload failed",
    };
  }
}
