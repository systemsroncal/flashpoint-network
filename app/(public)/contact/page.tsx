import type { Metadata } from "next";
import ContactView from "@/components/public/static/ContactView";

export const metadata: Metadata = {
  title: "Contact",
  description:
    "Contact FlashPoint Television Network — customer service, editorial, media, and partnerships.",
};

export default function ContactPage() {
  return <ContactView />;
}
