import { randomUUID } from "node:crypto";
import { mkdir, writeFile } from "node:fs/promises";
import path from "node:path";
import {
  assertUnderUploadsRoot,
  getUploadsRoot,
} from "@/lib/media/uploads-root";

const MAX_BYTES = 10 * 1024 * 1024;
const MAX_FILES = 5;

const ALLOWED = new Set([
  "image/jpeg",
  "image/png",
  "image/webp",
  "image/gif",
  "application/pdf",
  "text/plain",
  "application/msword",
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
]);

function safeFilename(name: string): string {
  const base = path.basename(name).replace(/[^\w.\-()+ ]+/g, "_").slice(0, 120);
  return base || "attachment";
}

export async function saveHelpCenterAttachments(
  files: File[],
): Promise<{ ok: true; paths: string[] } | { ok: false; error: string }> {
  const list = files.filter((f) => f instanceof File && f.size > 0).slice(0, MAX_FILES);
  if (files.length > MAX_FILES) {
    return { ok: false, error: `You can attach up to ${MAX_FILES} files.` };
  }

  const day = new Date().toISOString().slice(0, 10);
  if (!/^\d{4}-\d{2}-\d{2}$/.test(day)) {
    return { ok: false, error: "Invalid upload date." };
  }

  const paths: string[] = [];
  const root = getUploadsRoot();
  const targetDir = assertUnderUploadsRoot(path.join(root, day, "help-center"));
  await mkdir(targetDir, { recursive: true });

  for (const file of list) {
    if (file.size > MAX_BYTES) {
      return { ok: false, error: "Each file must be 10MB or smaller." };
    }
    if (file.type && !ALLOWED.has(file.type)) {
      return {
        ok: false,
        error: "Supported attachments: images, PDF, Word, or plain text.",
      };
    }
    const stored = `${randomUUID()}-${safeFilename(file.name)}`;
    const filePath = assertUnderUploadsRoot(path.join(targetDir, stored));
    const buffer = Buffer.from(await file.arrayBuffer());
    await writeFile(filePath, buffer);
    paths.push(`/uploads/${day}/help-center/${stored}`);
  }

  return { ok: true, paths };
}
