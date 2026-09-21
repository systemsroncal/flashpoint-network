import Image from "next/image";

/** Partner logos for /home2 hero (light background — no invert). */
const HERO_PARTNERS = [
  { src: "/brand/home/hero-logos/roku.svg", alt: "Roku", w: 108, h: 34 },
  { src: "/brand/home/hero-logos/xfinity.svg", alt: "Xfinity", w: 126, h: 44 },
  { src: "/brand/home/hero-logos/gtn.svg", alt: "GTN", w: 88, h: 34 },
  { src: "/brand/home/hero-logos/daystar.svg", alt: "Daystar", w: 128, h: 34 },
  { src: "/brand/home/hero-logos/ovtv.svg", alt: "OVTV", w: 76, h: 40 },
  { src: "/brand/home/hero-logos/pioneer-tv.svg", alt: "Pioneer TV", w: 56, h: 56 },
  { src: "/brand/home/hero-logos/dominion-tv.svg", alt: "Dominion TV Network", w: 170, h: 46 },
  { src: "/brand/home/hero-logos/now-network.svg", alt: "NOW Network", w: 92, h: 40 },
  { src: "/brand/home/hero-logos/faith-tv.svg", alt: "faith tv", w: 58, h: 58 },
  { src: "/brand/home/hero-logos/watchmen.svg", alt: "Watchmen Broadcasting", w: 120, h: 26 },
  { src: "/brand/home/hero-logos/wbna.svg", alt: "WBNA", w: 120, h: 36 },
  { src: "/brand/home/hero-logos/wbnm.svg", alt: "WBNM", w: 120, h: 40 },
  { src: "/brand/home/hero-logos/wjde.svg", alt: "WJDE", w: 120, h: 34 },
  { src: "/brand/home/hero-logos/kbpx.svg", alt: "KBPX", w: 120, h: 36 },
  { src: "/brand/home/hero-logos/fcc.svg", alt: "FCC", w: 120, h: 28 },
];

export default function Home2HeroLogos({ className = "" }: { className?: string }) {
  return (
    <div
      className={`flex flex-wrap items-center justify-center gap-x-8 gap-y-6 md:gap-x-10 ${className}`}
    >
      {HERO_PARTNERS.map((p) => (
        <div
          key={p.src}
          className="relative shrink-0 opacity-90"
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
