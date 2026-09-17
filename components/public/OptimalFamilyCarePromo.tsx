type Props = {
  className?: string;
};

/** Sidebar Optimal Family Care ad — same creative/href as home Podcasts rail. */
export default function OptimalFamilyCarePromo({ className = "" }: Props) {
  return (
    <a
      href="https://optimalfc.com/"
      target="_blank"
      rel="noopener noreferrer sponsored"
      className={`relative block aspect-[371/389] w-full overflow-hidden rounded-[10px] bg-neutral-100 ${className}`.trim()}
      aria-label="Optimal Family Care advertisement — open optimalfc.com"
    >
      <picture className="absolute inset-0 block h-full w-full">
        <source
          srcSet="/brand/ads/optimal-family-care-banner.webp"
          type="image/webp"
        />
        {/* eslint-disable-next-line @next/next/no-img-element -- picture/webp fallback pair */}
        <img
          src="/brand/ads/optimal-family-care-banner.png"
          alt="Optimal Family Care — book an appointment"
          className="h-full w-full object-cover"
          width={371}
          height={389}
        />
      </picture>
    </a>
  );
}
