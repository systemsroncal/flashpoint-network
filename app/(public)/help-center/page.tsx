import type { Metadata } from "next";
import StaticWebPageJsonLd from "@/components/seo/StaticWebPageJsonLd";
import HelpCenterForm from "@/components/public/HelpCenterForm";
import { buildStaticPageMetadata } from "@/lib/seo/metadata";

const TITLE = "Help Center";
const DESCRIPTION =
  "Submit a support request to FlashPoint Television Network — account help, journalism inquiries, and technical support.";

export async function generateMetadata(): Promise<Metadata> {
  return buildStaticPageMetadata({
    title: TITLE,
    description: DESCRIPTION,
    path: "/help-center",
  });
}

export default function HelpCenterPage() {
  return (
    <>
      <StaticWebPageJsonLd
        title={TITLE}
        description={DESCRIPTION}
        path="/help-center"
      />
      <div className="mx-auto max-w-[774px] px-4 py-10 md:px-8 md:py-14">
        <h1
          className="text-[length:clamp(2rem,6vw,3.65rem)] font-bold leading-tight text-black"
        >
          Submit a request
        </h1>
        <div className="mt-8 md:mt-10">
          <HelpCenterForm />
        </div>
      </div>
    </>
  );
}
