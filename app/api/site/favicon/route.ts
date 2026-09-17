import { NextResponse } from "next/server";
import { loadSiteFaviconOrFallback } from "@/lib/site-identity/load-favicon";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/** Legacy / bookmark URL (also targeted by next.config rewrite from /favicon.ico). */
export async function GET() {
  const { buffer, contentType } = await loadSiteFaviconOrFallback();
  return new NextResponse(new Uint8Array(buffer), {
    status: 200,
    headers: {
      "Content-Type": contentType,
      "Cache-Control": "public, max-age=300, stale-while-revalidate=86400",
    },
  });
}
