import { loadSiteFaviconOrFallback } from "@/lib/site-identity/load-favicon";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";
export const size = { width: 180, height: 180 };

export default async function AppleIcon() {
  const { buffer, contentType } = await loadSiteFaviconOrFallback();
  return new Response(new Uint8Array(buffer), {
    headers: {
      "Content-Type": contentType,
      "Cache-Control": "public, max-age=300, stale-while-revalidate=86400",
    },
  });
}
