import { getAdSenseSettings } from "@/lib/paywall/settings";

export async function GET() {
  const settings = await getAdSenseSettings();
  const body = `${settings.adsTxt.trim()}\n`;
  return new Response(body, {
    headers: {
      "Content-Type": "text/plain; charset=utf-8",
      "Cache-Control": "public, max-age=3600, s-maxage=3600",
    },
  });
}
