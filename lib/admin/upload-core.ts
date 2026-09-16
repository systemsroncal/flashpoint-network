import { randomUUID } from "node:crypto";
import { mkdir, writeFile } from "node:fs/promises";
import path from "node:path";
import { optimizeImage } from "@/lib/images";
import { absoluteMediaUrl } from "@/lib/media/public-url";
import {
  assertUnderUploadsRoot,
  getUploadsRoot,
} from "@/lib/media/uploads-root";

const MAX_BYTES = 10 * 1024 * 1024;
const ALLOWED = new Set([
  "image/jpeg",
  "image/png",
  "image/webp",
  "image/gif",
  "image/avif",
]);

export type UploadResult =
  | { ok: true; url: string; absoluteUrl: string }
  | { ok: false; error: string };

/**
 * Sharp → WebP → `public/uploads/YYYY-MM-DD/<uuid>.webp`.
 * Returns root-relative `/uploads/...` plus absolute site URL for HTML/src.
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

  const root = getUploadsRoot();
  const targetDir = assertUnderUploadsRoot(path.join(root, day));
  await mkdir(targetDir, { recursive: true });
  const filePath = assertUnderUploadsRoot(path.join(targetDir, filename));
  await writeFile(filePath, optimized.buffer);

  const url = `/uploads/${day}/${filename}`;
  const absoluteUrl = absoluteMediaUrl(url) || url;
  return { ok: true, url, absoluteUrl };
}
