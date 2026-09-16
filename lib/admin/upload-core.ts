import { randomUUID } from "node:crypto";
import { mkdir, writeFile } from "node:fs/promises";
import path from "node:path";
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

export type UploadResult =
  | { ok: true; url: string }
  | { ok: false; error: string };

/**
 * Sharp → WebP → `public/uploads/YYYY-MM-DD/<uuid>.webp`.
 * Shared by the Route Handler (preferred) and legacy Server Action.
 */
export async function saveUploadedImage(file: File): Promise<UploadResult> {
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

  return { ok: true, url: `/uploads/${day}/${filename}` };
}
