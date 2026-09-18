import type { Metadata } from "next";
import HelpCenterForm from "@/components/public/HelpCenterForm";

export const metadata: Metadata = {
  title: "Help Center",
  description:
    "Submit a support request to FlashPoint Television Network — account help, journalism inquiries, and technical support.",
};

export default function HelpCenterPage() {
  return (
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
  );
}