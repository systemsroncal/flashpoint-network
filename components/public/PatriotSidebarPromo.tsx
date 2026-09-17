type Props = {
  className?: string;
};

/** Sidebar “Are You a Patriot” square — FP Army Chapters register. */
export default function PatriotSidebarPromo({ className = "" }: Props) {
  return (
    <a
      href="https://app.fparmychapters.com/register"
      target="_blank"
      rel="noopener noreferrer sponsored"
      className={`relative block aspect-[370/340] w-full overflow-hidden rounded-[10px] bg-[#2c372a] ${className}`.trim()}
      aria-label="Are You a Patriot? Join FP Army Chapters"
    >
      <picture className="absolute inset-0 block h-full w-full">
        <source
          srcSet="/brand/ads/patriot-sidebar-square.webp"
          type="image/webp"
        />
        {/* eslint-disable-next-line @next/next/no-img-element -- picture/webp fallback pair */}
        <img
          src="/brand/ads/patriot-sidebar-square.png"
          alt="Are You a Patriot? Join FP Army Chapters"
          className="h-full w-full object-cover"
          width={370}
          height={340}
        />
      </picture>
    </a>
  );
}
