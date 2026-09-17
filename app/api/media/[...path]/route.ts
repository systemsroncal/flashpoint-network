import { readFile } from "node:fs/promises";
import path from "node:path";
import { NextResponse } from "next/server";
import {
  assertUnderUploadsRoot,
  getUploadsRoot,
} from "@/lib/media/uploads-root";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const CONTENT_TYPES: Record<string, string> = {
  ".webp": "image/webp",
  ".jpg": "image/jpeg",
  ".jpeg": "image/jpeg",
  ".png": "image/png",
  ".gif": "image/gif",
  ".avif": "image/avif",
  ".svg": "image/svg+xml",
};

type Ctx = { params: Promise<{ path?: string[] }> };

/**
 * Serve files from the uploads disk root.
 * Used via rewrite `/uploads/:path*` → `/api/media/:path*` so OLS/CyberPanel
 * static docroots cannot 404 before the request reaches Next.
 */
export async function GET(_request: Request, context: Ctx) {
  const segments = (await context.params).path ?? [];
  if (segments.length === 0) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  for (const part of segments) {
    if (!part || part === "." || part === ".." || part.includes("\0")) {
      return NextResponse.json({ error: "Invalid path" }, { status: 400 });
    }
  }

  const relative = segments.join("/");
  let filePath: string;
  try {
    filePath = assertUnderUploadsRoot(path.join(getUploadsRoot(), relative));
  } catch {
    return NextResponse.json({ error: "Invalid path" }, { status: 400 });
  }

  try {
    const buffer = await readFile(filePath);
    const ext = path.extname(filePath).toLowerCase();
    const contentType = CONTENT_TYPES[ext] || "application/octet-stream";

    return new NextResponse(buffer, {
      status: 200,
      headers: {
        "Content-Type": contentType,
        "Content-Length": String(buffer.byteLength),
        "Cache-Control": "public, max-age=31536000, immutable",
      },
    });
  } catch {
    return NextResponse.json(
      {
        error: "Not found",
        hint: "Check public/uploads on the VPS (UPLOADS_DIR / process cwd).",
      },
      { status: 404 },
    );
  }
}
