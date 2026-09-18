import BrandImage from "@/components/public/BrandImage";
import type { ResponsiveLogoMaxWidth } from "@/lib/site-identity/logo-layout";
import { responsiveLogoMaxWidthStyle } from "@/lib/site-identity/logo-layout";

type Props = {
  src: string;
  alt: string;
  widths: ResponsiveLogoMaxWidth;
  className?: string;
  priority?: boolean;
  /** Base height utility; max-width is responsive via CSS variables. */
  heightClass?: string;
};

export default function SiteLogo({
  src,
  alt,
  widths,
  className = "",
  priority,
  heightClass = "h-8 sm:h-9 xl:h-[52px]",
}: Props) {
  return (
    <BrandImage
      src={src}
      alt={alt}
      width={240}
      height={64}
      priority={priority}
      className={`site-logo-responsive w-auto object-contain ${heightClass} ${className}`.trim()}
      style={responsiveLogoMaxWidthStyle(widths)}
    />
  );
}
