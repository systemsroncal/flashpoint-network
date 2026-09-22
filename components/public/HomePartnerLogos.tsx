import Image from "next/image";

type PartnerLogo = {
  src: string;
  alt: string;
  w: number;
  h: number;
};

/** Color logos for Watch FlashPoint Anywhere only (Figma desktop 5×3 / mobile 3×5). */
const WATCH_ANYWHERE_LOGOS: PartnerLogo[] = [
  { src: "/brand/home/watch-anywhere-logos/roku.svg", alt: "Roku", w: 108, h: 34 },
  { src: "/brand/home/watch-anywhere-logos/xfinity.svg", alt: "Xfinity", w: 127, h: 44 },
  { src: "/brand/home/watch-anywhere-logos/gtn.svg", alt: "GTN", w: 88, h: 34 },
  { src: "/brand/home/watch-anywhere-logos/daystar.svg", alt: "Daystar", w: 128, h: 34 },
  { src: "/brand/home/watch-anywhere-logos/ovtv.svg", alt: "OVTV", w: 76, h: 41 },
  { src: "/brand/home/watch-anywhere-logos/pioneer.svg", alt: "Pioneer Network", w: 57, h: 57 },
  {
    src: "/brand/home/watch-anywhere-logos/dominion.svg",
    alt: "Dominion TV Network",
    w: 170,
    h: 46,
  },
  { src: "/brand/home/watch-anywhere-logos/now-network.svg", alt: "NOW Network", w: 92, h: 40 },
  { src: "/brand/home/watch-anywhere-logos/faith-tv.svg", alt: "faith tv", w: 58, h: 58 },
  {
    src: "/brand/home/watch-anywhere-logos/watchmen.svg",
    alt: "Watchmen Broadcasting",
    w: 120,
    h: 26,
  },
  { src: "/brand/home/watch-anywhere-logos/wbna.svg", alt: "WBNA 21", w: 120, h: 36 },
  { src: "/brand/home/watch-anywhere-logos/wbnm.svg", alt: "WBNM 50", w: 120, h: 41 },
  { src: "/brand/home/watch-anywhere-logos/wjde.svg", alt: "WJDE 31", w: 120, h: 34 },
  { src: "/brand/home/watch-anywhere-logos/kbpx.svg", alt: "KBPX 46 and 27", w: 120, h: 36 },
  { src: "/brand/home/watch-anywhere-logos/whfl.svg", alt: "WHFL 43", w: 120, h: 27 },
];

function PartnerLogoCell({ logo }: { logo: PartnerLogo }) {
  return (
    <div className="flex h-11 w-full items-center justify-center sm:h-12 lg:h-[52px]">
      <Image
        src={logo.src}
        alt={logo.alt}
        width={logo.w}
        height={logo.h}
        className="max-h-full w-auto max-w-[min(100%,120px)] object-contain object-center lg:max-w-[min(100%,140px)]"
      />
    </div>
  );
}

export function PartnersGrid({ className = "" }: { className?: string }) {
  return (
    <div className={className}>
      <div className="grid grid-cols-3 place-items-center gap-x-3 gap-y-6 sm:gap-x-5 sm:gap-y-7 lg:hidden">
        {WATCH_ANYWHERE_LOGOS.map((logo) => (
          <PartnerLogoCell key={logo.src} logo={logo} />
        ))}
      </div>
      <div className="hidden grid-cols-5 gap-x-5 gap-y-8 lg:grid">
        {WATCH_ANYWHERE_LOGOS.map((logo) => (
          <PartnerLogoCell key={logo.src} logo={logo} />
        ))}
      </div>
    </div>
  );
}
