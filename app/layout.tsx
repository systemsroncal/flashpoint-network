import type { Metadata } from "next";
import { Fraunces, Geist, Geist_Mono, Noto_Serif, Roboto } from "next/font/google";
import PerformanceMeasureGuard from "@/components/dev/PerformanceMeasureGuard";
import { getSiteUrl } from "@/lib/env";
import { buildSiteFaviconMetadata } from "@/lib/site-identity/favicon-metadata";
import { getSiteIdentity } from "@/lib/site-identity/settings";
import "./globals.css";

function safeMetadataBase(): URL {
  try {
    return new URL(getSiteUrl());
  } catch {
    return new URL("http://127.0.0.1:43125");
  }
}

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

const fraunces = Fraunces({
  variable: "--font-fraunces",
  subsets: ["latin"],
  weight: ["600", "700"],
});

const notoSerif = Noto_Serif({
  variable: "--font-noto-serif",
  subsets: ["latin"],
  // 500 = Medium for article body; 700/900 for emphasis and display
  weight: ["400", "500", "700", "900"],
});

const roboto = Roboto({
  variable: "--font-roboto",
  subsets: ["latin"],
  weight: ["100", "400", "500", "700", "900"],
});

export const dynamic = "force-dynamic";

export async function generateMetadata(): Promise<Metadata> {
  const identity = await getSiteIdentity();
  return {
    metadataBase: safeMetadataBase(),
    title: {
      default: identity.siteName,
      template: `%s · ${identity.siteName}`,
    },
    description:
      "FlashPoint Television Network — digital newspaper. Get The Full Story. As It Is.",
    icons: buildSiteFaviconMetadata(identity),
    robots: { index: true, follow: true },
    openGraph: {
      type: "website",
      locale: "en_US",
      siteName: identity.siteName,
      title: identity.siteName,
      description:
        "FlashPoint Television Network — digital newspaper. Get The Full Story. As It Is.",
    },
    twitter: {
      card: "summary_large_image",
      title: identity.siteName,
      description:
        "FlashPoint Television Network — digital newspaper. Get The Full Story. As It Is.",
    },
  };
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} ${fraunces.variable} ${notoSerif.variable} ${roboto.variable} min-h-dvh h-full antialiased`}
    >
      <body className="flex min-h-dvh min-h-full w-full max-w-none flex-col bg-white text-[#111111]">
        {process.env.NODE_ENV !== "production" ? (
          <script
            dangerouslySetInnerHTML={{
              __html: `(function(){try{if(typeof performance==="undefined"||typeof performance.measure!=="function"||performance.__fpnMeasurePatched)return;performance.__fpnMeasurePatched=true;var o=performance.measure.bind(performance);performance.measure=function(){try{return o.apply(performance,arguments);}catch(e){if(e&&e.message&&/negative time stamp/i.test(e.message))return;throw e;}};}catch(_){}})();`,
            }}
          />
        ) : null}
        <PerformanceMeasureGuard />
        {children}
      </body>
    </html>
  );
}
