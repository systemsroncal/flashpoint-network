const AMAZON_FLASHPOINT_REVIVAL =
  "https://www.amazon.com/Flashpoint-Revival-Awakening-Transformation-Nation/dp/1680318357";

type Props = {
  className?: string;
};

/**
 * Sidebar Special Offer — Flashpoint of Revival (Figma category 131:7101, 370×283).
 * Href is easy to swap; keep target=_blank + sponsored rel.
 */
export default function FlashpointRevivalPromo({ className = "" }: Props) {
  return (
    <a
      href={AMAZON_FLASHPOINT_REVIVAL}
      target="_blank"
      rel="noopener noreferrer sponsored"
      className={`relative block aspect-[370/283] w-full overflow-hidden rounded-[10px] bg-neutral-100 ${className}`.trim()}
      aria-label="Special offer — Flashpoint of Revival on Amazon"
    >
      <picture className="absolute inset-0 block h-full w-full">
        <source
          srcSet="/brand/ads/flashpoint-revival-promo.webp"
          type="image/webp"
        />
        {/* eslint-disable-next-line @next/next/no-img-element -- picture/webp fallback pair */}
        <img
          src="/brand/ads/flashpoint-revival-promo.png"
          alt="Special offer — Flashpoint of Revival by Gene Bailey"
          className="h-full w-full object-cover"
          width={370}
          height={283}
        />
      </picture>
    </a>
  );
}

export { AMAZON_FLASHPOINT_REVIVAL };
