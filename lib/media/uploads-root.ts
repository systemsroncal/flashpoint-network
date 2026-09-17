import path from "node:path";

/**
 * Disk root for admin Sharp uploads.
 * Override with UPLOADS_DIR when PM2 cwd is unreliable.
 * Default: `<cwd>/public/uploads` (also exposed as `/uploads/...`).
 */
export function getUploadsRoot(): string {
  const fromEnv = process.env.UPLOADS_DIR?.trim();
  if (fromEnv) return path.resolve(fromEnv);
  return path.resolve(process.cwd(), "public", "uploads");
}

export function assertUnderUploadsRoot(candidate: string): string {
  const root = getUploadsRoot();
  const resolved = path.resolve(candidate);
  const prefix = root.endsWith(path.sep) ? root : root + path.sep;
  if (resolved !== root && !resolved.startsWith(prefix)) {
    throw new Error("Invalid upload path.");
  }
  return resolved;
}
