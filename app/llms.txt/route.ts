import { buildLlmsTxt } from "@/lib/seo/llms-txt";
import { getSiteIdentity } from "@/lib/site-identity/settings";

export const dynamic = "force-dynamic";

/** Alias for crawlers that expect /llms.txt (plural). */
export async function GET() {
  const identity = await getSiteIdentity();
  const body = buildLlmsTxt(identity);

  return new Response(body, {
    headers: {
      "Content-Type": "text/plain; charset=utf-8",
      "Cache-Control": "public, max-age=3600, s-maxage=86400",
    },
  });
}
