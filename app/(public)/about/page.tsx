import type { Metadata } from "next";
import AboutView from "@/components/public/static/AboutView";

export const metadata: Metadata = {
  title: "About",
  description:
    "Learn about FlashPoint Television Network, Gene Bailey, Teri Bailey, and our mission.",
};

export default function AboutPage() {
  return <AboutView />;
}
