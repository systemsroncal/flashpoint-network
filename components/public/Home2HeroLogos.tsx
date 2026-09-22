import Image from "next/image";

type HeroLogo = { src: string; alt: string; w: number; h: number };

const ROKU: HeroLogo = { src: "/brand/home/hero-logos/roku.svg", alt: "Roku", w: 108, h: 34 };
const XFINITY: HeroLogo = { src: "/brand/home/hero-logos/xfinity.svg", alt: "Xfinity", w: 127, h: 44 };
const GTN: HeroLogo = { src: "/brand/home/hero-logos/gtn.svg", alt: "GTN", w: 88, h: 34 };
const DAYSTAR: HeroLogo = { src: "/brand/home/hero-logos/daystar.svg", alt: "Daystar", w: 128, h: 34 };
const OVTV: HeroLogo = { src: "/brand/home/hero-logos/ovtv.svg", alt: "OVTV", w: 76, h: 41 };
const PIONEER: HeroLogo = { src: "/brand/home/hero-logos/pioneer-tv.svg", alt: "Pioneer TV", w: 57, h: 57 };
const DOMINION: HeroLogo = { src: "/brand/home/hero-logos/dominion-tv.svg", alt: "Dominion TV Network", w: 170, h: 46 };
const NOW: HeroLogo = { src: "/brand/home/hero-logos/now-network.svg", alt: "NOW Network", w: 92, h: 40 };
const FAITH: HeroLogo = { src: "/brand/home/hero-logos/faith-tv.svg", alt: "faith tv", w: 58, h: 58 };
const WATCHMEN: HeroLogo = { src: "/brand/home/hero-logos/watchmen.svg", alt: "Watchmen Broadcasting", w: 120, h: 26 };
const WBNA: HeroLogo = { src: "/brand/home/hero-logos/wbna.svg", alt: "WBNA", w: 120, h: 36 };
const WBNM: HeroLogo = { src: "/brand/home/hero-logos/wbnm.svg", alt: "WBNM", w: 120, h: 41 };
const WJDE: HeroLogo = { src: "/brand/home/hero-logos/wjde.svg", alt: "WJDE", w: 120, h: 34 };
const KBPX: HeroLogo = { src: "/brand/home/hero-logos/kbpx.svg", alt: "KBPX", w: 120, h: 36 };
const WHFEL: HeroLogo = { src: "/brand/home/hero-logos/fcc.svg", alt: "WHFEL", w: 120, h: 27 };

/** Desktop Figma 640:10245 — row 1: nine logos; row 2: six logos. */
const ROW_TOP: HeroLogo[] = [
  ROKU,
  XFINITY,
  GTN,
  DAYSTAR,
  OVTV,
  PIONEER,
  DOMINION,
  NOW,
  FAITH,
];

const ROW_BOTTOM: HeroLogo[] = [WATCHMEN, WBNA, WBNM, WJDE, KBPX, WHFEL];

/** Mobile: four rows, matching the home mock (4 + 4 + 4 + 3). */
const MOBILE_ROWS: HeroLogo[][] = [
  [ROKU, XFINITY, GTN, DAYSTAR],
  [OVTV, PIONEER, DOMINION, NOW],
  [FAITH, WATCHMEN, WBNA, WBNM],
  [WJDE, KBPX, WHFEL],
];

function LogoCell({
  logo,
  compact = false,
}: {
  logo: HeroLogo;
  compact?: boolean;
}) {
  return (
    <div
      className="relative mx-auto w-full max-w-full"
      style={
        compact
          ? { height: 36, maxWidth: Math.min(logo.w, 88) }
          : { width: logo.w, height: logo.h, maxWidth: "100%" }
      }
    >
      <Image
        src={logo.src}
        alt={logo.alt}
        fill
        className="object-contain object-center"
        sizes={compact ? "88px" : `${logo.w}px`}
      />
    </div>
  );
}

export default function Home2HeroLogos({ className = "" }: { className?: string }) {
  return (
    <div className={`mx-auto w-full max-w-[1230px] px-2 ${className}`}>
      <div className="flex flex-col gap-5 md:hidden">
        {MOBILE_ROWS.map((row, index) => (
          <div
            key={index}
            className={
              row.length === 4
                ? "grid grid-cols-4 place-items-center gap-x-3"
                : "mx-auto grid w-[75%] grid-cols-3 place-items-center gap-x-3"
            }
          >
            {row.map((logo) => (
              <LogoCell key={logo.src} logo={logo} compact />
            ))}
          </div>
        ))}
      </div>

      <div className="hidden md:block">
        <div className="grid grid-cols-9 place-items-center gap-x-8">
          {ROW_TOP.map((logo) => (
            <LogoCell key={logo.src} logo={logo} />
          ))}
        </div>
        <div className="mt-8 grid grid-cols-6 place-items-center gap-x-8">
          {ROW_BOTTOM.map((logo) => (
            <LogoCell key={logo.src} logo={logo} />
          ))}
        </div>
      </div>
    </div>
  );
}
