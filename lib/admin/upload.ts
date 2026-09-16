"use server";

import { randomUUID } from "node:crypto";
import { mkdir, writeFile } from "node:fs/promises";
import path from "node:path";
import { revalidatePath } from "next/cache";
import { requireStaffProfile } from "@/lib/auth/session";
import { optimizeImage } from "@/lib/images";

const MAX_BYTES = 10 * 1024 * 1024;
const ALLOWED = new Set([
  "image/jpeg",
  "image/png",
  "image/webp",
  "image/gif",
  "image/avif",
]);

/** Absolute root for runtime uploads (served as `/uploads/...`). */
const UPLOADS_ROOT = path.join(process.cwd(), "public", "uploads");

function assertUnderUploadsRoot(candidate: string): string {
  const root = path.resolve(UPLOADS_ROOT);
  const resolved = path.resolve(candidate);
  const prefix = root.endsWith(path.sep) ? root : root + path.sep;
  if (resolved !== root && !resolved.startsWith(prefix)) {
    throw new Error("Invalid upload path.");
  }
  return resolved;
}

/**
 * Upload an image via Sharp → local disk under `public/uploads/`.
 * Returns a public site-relative URL (`/uploads/...`).
 * Existing Supabase Storage URLs on older posts are left unchanged.
 */
export async function uploadMediaAction(formData: FormData): Promise<{
  ok: true;
  url: string;
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
    if (!(file instanceof File) || file.size === 0) {
      return { ok: false, error: "Choose an image file to upload." };
    }
    if (file.size > MAX_BYTES) {
      return { ok: false, error: "Image must be 10MB or smaller." };
    }
    if (file.type && !ALLOWED.has(file.type)) {
      return {
        ok: false,
        error: "Supported types: JPEG, PNG, WebP, GIF, AVIF.",
      };
    }

    const input = Buffer.from(await file.arrayBuffer());
    const optimized = await optimizeImage(input);

    // Date folder + UUID filename only (never trust client path/name).
    const day = new Date().toISOString().slice(0, 10);
    if (!/^\d{4}-\d{2}-\d{2}$/.test(day)) {
      return { ok: false, error: "Invalid upload date segment." };
    }
    const filename = `${randomUUID()}.${optimized.extension}`;
    if (!/^[0-9a-f-]{36}\.webp$/i.test(filename)) {
      return { ok: false, error: "Invalid upload filename." };
    }

    const targetDir = assertUnderUploadsRoot(path.join(UPLOADS_ROOT, day));
    await mkdir(targetDir, { recursive: true });
    const filePath = assertUnderUploadsRoot(path.join(targetDir, filename));
    await writeFile(filePath, optimized.buffer);

    const publicUrl = `/uploads/${day}/${filename}`;
    revalidatePath("/admin/media");
    return { ok: true, url: publicUrl };
  } catch (err) {
    return {
      ok: false,
      error: err instanceof Error ? err.message : "Upload failed",
    };
  }
}
