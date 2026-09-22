"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import SiteLogo from "@/components/public/SiteLogo";
import type { ResponsiveLogoMaxWidth } from "@/lib/site-identity/logo-layout";
import { isNewsSectionPath } from "@/lib/navigation/news-section";

export default function SiteHeaderMobileLogo({
  siteName,
  logoSrc,
  widths,
  className = "",
}: {
  siteName: string;
  logoSrc: string;
  widths: ResponsiveLogoMaxWidth;
  className?: string;
}) {
  const pathname = usePathname() || "/";
  const hang = !isNewsSectionPath(pathname);

  return (
    <Link
      href="/"
      className={`block min-w-0 w-full flex-1 ${hang ? "relative z-40 -mb-6" : ""}`}
      aria-label={siteName}
    >
      <SiteLogo
        src={logoSrc}
        alt={siteName}
        widths={widths}
        className={`${className} ${hang ? "!max-h-[92px] object-contain object-left" : ""}`}
        priority
      />
    </Link>
  );
}
