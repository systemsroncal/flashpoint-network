import type { Metadata } from "next";
import StaticWebPageJsonLd from "@/components/seo/StaticWebPageJsonLd";
import LivePageView from "@/components/public/LivePageView";
import { buildStaticPageMetadata } from "@/lib/seo/metadata";

export const dynamic = "force-dynamic";

const LIVE_PAGE_TITLE = "Streaming Now: Watch Live";
const LIVE_DESCRIPTION =
  "Watch FlashPoint Television Network live — faith-based programming, news, and original shows on FPTN.com.";

export async function generateMetadata(): Promise<Metadata> {
  return buildStaticPageMetadata({
    title: LIVE_PAGE_TITLE,
    description: LIVE_DESCRIPTION,
    path: "/live",
  });
}

export default function LivePage() {
  return (
    <>
      <StaticWebPageJsonLd
        title={LIVE_PAGE_TITLE}
        description={LIVE_DESCRIPTION}
        path="/live"
      />
      <LivePageView />
    </>
  );
}
