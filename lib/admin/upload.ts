"use server";

import { randomUUID } from "node:crypto";
import { revalidatePath } from "next/cache";
import { createAdminClient } from "@/lib/supabase/admin";
import { optimizeImage } from "@/lib/images";

const BUCKET = "media";
const MAX_BYTES = 10 * 1024 * 1024;
const ALLOWED = new Set([
  "image/jpeg",
  "image/png",
  "image/webp",
  "image/gif",
  "image/avif",
]);

function requireAdmin() {
  const client = createAdminClient();
  if (!client) throw new Error("Supabase admin client is not configured");
  return client;
}

async function ensureMediaBucket(
  supabase: NonNullable<ReturnType<typeof createAdminClient>>,
) {
  const { data: buckets } = await supabase.storage.listBuckets();
  if (!buckets?.some((b) => b.id === BUCKET || b.name === BUCKET)) {
    await supabase.storage.createBucket(BUCKET, {
      public: true,
      fileSizeLimit: MAX_BYTES,
      allowedMimeTypes: [...ALLOWED],
    });
  }
}

/**
 * Upload an image via Sharp → Supabase Storage (`media` bucket).
 * Returns the public URL string.
 */
export async function uploadMediaAction(formData: FormData): Promise<{
  ok: true;
  url: string;
} | {
  ok: false;
  error: string;
}> {
  try {
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

    const supabase = requireAdmin();
    await ensureMediaBucket(supabase);

    const input = Buffer.from(await file.arrayBuffer());
    const optimized = await optimizeImage(input);
    const path = `uploads/${new Date().toISOString().slice(0, 10)}/${randomUUID()}.${optimized.extension}`;

    const { error: uploadError } = await supabase.storage
      .from(BUCKET)
      .upload(path, optimized.buffer, {
        contentType: optimized.contentType,
        upsert: false,
        cacheControl: "31536000",
      });

    if (uploadError) {
      return { ok: false, error: uploadError.message };
    }

    const { data } = supabase.storage.from(BUCKET).getPublicUrl(path);
    revalidatePath("/admin/media");
    return { ok: true, url: data.publicUrl };
  } catch (err) {
    return {
      ok: false,
      error: err instanceof Error ? err.message : "Upload failed",
    };
  }
}
