import Image from "next/image";

type HeroLogo = { src: string; alt: string; w: number; h: number };

/** Figma 640:10245 — row 1: nine logos; row 2: six logos. */
const ROW_TOP: HeroLogo[] = [
  { src: "/brand/home/hero-logos/roku.svg", alt: "Roku", w: 108, h: 34 },
  { src: "/brand/home/hero-logos/xfinity.svg", alt: "Xfinity", w: 127, h: 44 },
  { src: "/brand/home/hero-logos/gtn.svg", alt: "GTN", w: 88, h: 34 },
  { src: "/brand/home/hero-logos/daystar.svg", alt: "Daystar", w: 128, h: 34 },
  { src: "/brand/home/hero-logos/ovtv.svg", alt: "OVTV", w: 76, h: 41 },
  { src: "/brand/home/hero-logos/pioneer-tv.svg", alt: "Pioneer TV", w: 57, h: 57 },
  { src: "/brand/home/hero-logos/dominion-tv.svg", alt: "Dominion TV Network", w: 170, h: 46 },
  { src: "/brand/home/hero-logos/now-network.svg", alt: "NOW Network", w: 92, h: 40 },
  { src: "/brand/home/hero-logos/faith-tv.svg", alt: "faith tv", w: 58, h: 58 },
];

const ROW_BOTTOM: HeroLogo[] = [
  { src: "/brand/home/hero-logos/watchmen.svg", alt: "Watchmen Broadcasting", w: 120, h: 26 },
  { src: "/brand/home/hero-logos/wbna.svg", alt: "WBNA", w: 120, h: 36 },
  { src: "/brand/home/hero-logos/wbnm.svg", alt: "WBNM", w: 120, h: 41 },
  { src: "/brand/home/hero-logos/wjde.svg", alt: "WJDE", w: 120, h: 34 },
  { src: "/brand/home/hero-logos/kbpx.svg", alt: "KBPX", w: 120, h: 36 },
  { src: "/brand/home/hero-logos/fcc.svg", alt: "FCC", w: 120, h: 27 },
];

function LogoCell({ logo }: { logo: HeroLogo }) {
  return (
    <div
      className="relative mx-auto shrink-0"
      style={{ width: logo.w, height: logo.h, maxWidth: "100%" }}
    >
      <Image
        src={logo.src}
        alt={logo.alt}
        fill
        className="object-contain object-center"
        sizes={`${logo.w}px`}
      />
    </div>
  );
}

export default function Home2HeroLogos({ className = "" }: { className?: string }) {
  return (
    <div
      className={`container-hero-player mx-auto w-full max-w-[1230px] px-2 ${className}`}
    >
      <div
        className="grid grid-cols-3 place-items-center gap-x-5 gap-y-5 sm:grid-cols-5 md:grid-cols-9 md:gap-x-8 md:gap-y-0"
      >
        {ROW_TOP.map((logo) => (
          <LogoCell key={logo.src} logo={logo} />
        ))}
      </div>
      <div
        className="mt-6 grid grid-cols-3 place-items-center gap-x-5 gap-y-5 sm:grid-cols-3 md:mt-8 md:grid-cols-6 md:gap-x-8"
      >
        {ROW_BOTTOM.map((logo) => (
          <LogoCell key={logo.src} logo={logo} />
        ))}
      </div>
    </div>
  );
}
