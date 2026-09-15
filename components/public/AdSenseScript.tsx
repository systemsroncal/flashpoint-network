import Script from "next/script";
import { getAdSenseSettings } from "@/lib/paywall/settings";

export default async function AdSenseScript() {
  const settings = await getAdSenseSettings();
  if (!settings.enabled || !settings.clientId) return null;

  return (
    <Script
      id="adsense-loader"
      async
      strategy="afterInteractive"
      src={`https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=${encodeURIComponent(settings.clientId)}`}
      crossOrigin="anonymous"
    />
  );
}
