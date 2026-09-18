import BrandImage from "@/components/public/BrandImage";
import type { ResponsiveLogoMaxWidth } from "@/lib/site-identity/logo-layout";
import { responsiveLogoMaxWidthStyle } from "@/lib/site-identity/logo-layout";

type Props = {
  src: string;
  alt: string;
  widths: ResponsiveLogoMaxWidth;
  className?: string;
  priority?: boolean;
  /** Header: link fills width, image scales with height auto. */
  fluid?: boolean;
  /** Optional extra height utility when fluid is false. */
  heightClass?: string;
};

export default function SiteLogo({
  src,
  alt,
  widths,
  className = "",
  priority,
  fluid = true,
  heightClass = "h-auto",
}: Props) {
  const widthClass = fluid ? "w-full" : "w-auto";
  return (
    <BrandImage
      src={src}
      alt={alt}
      width={240}
      height={64}
      priority={priority}
      className={`site-logo-responsive ${widthClass} object-contain ${heightClass} ${className}`.trim()}
      style={{
        ...responsiveLogoMaxWidthStyle(widths),
        ...(fluid ? { width: "100%", height: "auto" } : {}),
      }}
    />
  );
}
