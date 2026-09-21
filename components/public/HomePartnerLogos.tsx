import Image from "next/image";

const PARTNERS = [
  { src: "/brand/home/partner-roku.png", alt: "Roku", w: 108, h: 34 },
  { src: "/brand/home/partner-xfinity.png", alt: "Xfinity", w: 120, h: 40 },
  { src: "/brand/home/partner-gtn.png", alt: "GTN", w: 88, h: 34 },
  { src: "/brand/home/daystar.svg", alt: "Daystar", w: 120, h: 34 },
  { src: "/brand/home/partner-ovtv.png", alt: "OVTV", w: 76, h: 40 },
  { src: "/brand/home/partner-circle.png", alt: "Partner", w: 56, h: 56 },
  { src: "/brand/home/partner-stream.png", alt: "Streaming partner", w: 150, h: 40 },
  { src: "/brand/home/partner-now.png", alt: "NOW Network", w: 90, h: 40 },
  { src: "/brand/home/partner-unnamed10.png", alt: "Partner", w: 56, h: 56 },
  { src: "/brand/home/partner-logo.png", alt: "Partner", w: 110, h: 26 },
  { src: "/brand/home/partner-wbna.png", alt: "WBNA", w: 110, h: 36 },
  { src: "/brand/home/partner-wbnm.png", alt: "WBNM", w: 110, h: 40 },
  { src: "/brand/home/partner-wjde.png", alt: "WJDE", w: 110, h: 34 },
  { src: "/brand/home/partner-kbpx.png", alt: "KBPX", w: 110, h: 36 },
  { src: "/brand/home/partner-fcc.png", alt: "FCC", w: 110, h: 28 },
];

export function PartnersGrid({
  className = "",
  align = "start",
}: {
  className?: string;
  align?: "start" | "center";
}) {
  const alignClass =
    align === "center" ? "justify-center" : "justify-center md:justify-start";

  return (
    <div
      className={`flex flex-wrap items-center gap-x-8 gap-y-6 ${alignClass} ${className}`}
    >
      {PARTNERS.map((p) => (
        <div
          key={p.src + p.alt}
          className="relative opacity-90 grayscale invert"
          style={{ width: p.w, height: p.h }}
        >
          <Image
            src={p.src}
            alt={p.alt}
            fill
            className="object-contain"
            sizes={`${p.w}px`}
          />
        </div>
      ))}
    </div>
  );
}
