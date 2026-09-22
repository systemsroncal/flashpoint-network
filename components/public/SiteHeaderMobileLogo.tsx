import Link from "next/link";
import SiteLogo from "@/components/public/SiteLogo";
import type { ResponsiveLogoMaxWidth } from "@/lib/site-identity/logo-layout";

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
  return (
    <Link
      href="/"
      className="block min-h-0 min-w-0 w-full max-w-full flex-1"
      aria-label={siteName}
    >
      <SiteLogo
        src={logoSrc}
        alt={siteName}
        widths={widths}
        className={className}
        priority
      />
    </Link>
  );
}
