import Image from "next/image";
import { resolveMediaUrl } from "@/lib/media/public-url";

export default function BrandImage({
  src,
  alt,
  width,
  height,
  className,
  style,
  priority,
}: {
  src: string | null | undefined;
  alt: string;
  width: number;
  height: number;
  className?: string;
  style?: React.CSSProperties;
  priority?: boolean;
}) {
  const resolved = resolveMediaUrl(src) ?? src?.trim();
  if (!resolved) return null;
  const isSvg = /\.svg(\?|#|$)/i.test(resolved);
  return (
    <Image
      src={resolved}
      alt={alt}
      width={width}
      height={height}
      className={className}
      style={style}
      priority={priority}
      unoptimized={isSvg}
    />
  );
}
