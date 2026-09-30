import type { Metadata } from "next";
import StaticWebPageJsonLd from "@/components/seo/StaticWebPageJsonLd";
import AdvertiseForm from "@/components/public/AdvertiseForm";
import { buildStaticPageMetadata } from "@/lib/seo/metadata";

const TITLE = "Advertise with FPTN";
const DESCRIPTION =
  "Reach the FlashPoint Television Network audience — submit a simple inquiry for sponsorship and advertising opportunities.";

export async function generateMetadata(): Promise<Metadata> {
  return buildStaticPageMetadata({
    title: TITLE,
    description: DESCRIPTION,
    path: "/advertise",
  });
}

export default function AdvertisePage() {
  return (
    <>
      <StaticWebPageJsonLd
        title={TITLE}
        description={DESCRIPTION}
        path="/advertise"
      />
      <div className="mx-auto max-w-[774px] px-4 py-10 md:px-8 md:py-14">
        <h1 className="font-article text-[clamp(2rem,6vw,3rem)] font-black leading-tight text-black">
          Advertise with us
        </h1>
        <p className="mt-4 text-base leading-relaxed text-black/75 md:text-lg">
          Tell us about your brand and goals. Our team will respond with options
          for digital, video, and newsletter placements on FlashPoint Television
          Network.
        </p>
        <div className="mt-8 md:mt-10">
          <AdvertiseForm />
        </div>
      </div>
    </>
  );
}
