"use client";

import { useCallback, useEffect, useState } from "react";
import type { TopHeaderBannerSettings } from "@/lib/top-banner/constants";
import {
  dismissTopHeaderBannerFor24Hours,
  isTopHeaderBannerDismissed,
} from "@/lib/top-banner/dismiss";

type Props = {
  settings: TopHeaderBannerSettings;
};

export default function TopHeaderBanner({ settings }: Props) {
  const [hidden, setHidden] = useState(true);

  useEffect(() => {
    setHidden(isTopHeaderBannerDismissed());
  }, []);

  const close = useCallback(() => {
    dismissTopHeaderBannerFor24Hours();
    setHidden(true);
  }, []);

  if (hidden) return null;

  const desktop = settings.desktopImageUrl;
  const mobile = settings.mobileImageUrl;
  const imgSrc = desktop || mobile;
  if (!imgSrc) return null;

  const href = settings.href.trim();
  const linkProps = href
    ? {
        href,
        ...(settings.openInNewTab
          ? { target: "_blank" as const, rel: "noopener noreferrer" }
          : {}),
      }
    : null;

  const inner = (
    <picture className="block w-full">
      {mobile ? <source media="(max-width: 767px)" srcSet={mobile} /> : null}
      {desktop ? <source media="(min-width: 768px)" srcSet={desktop} /> : null}
      {/* eslint-disable-next-line @next/next/no-img-element -- responsive promo pair */}
      <img
        src={imgSrc}
        alt=""
        className="block h-auto w-full max-h-[140px] object-cover object-center sm:max-h-[160px] md:max-h-[200px]"
      />
    </picture>
  );

  return (
    <div className="relative w-full bg-[#0a0a0a]" role="region" aria-label="Site promotion">
      {linkProps ? (
        <a {...linkProps} className="block w-full">
          {inner}
        </a>
      ) : (
        inner
      )}
      <button
        type="button"
        onClick={close}
        className="absolute right-2 top-2 z-10 flex h-8 w-8 items-center justify-center rounded-full bg-black/55 text-lg leading-none text-white backdrop-blur-sm transition hover:bg-black/75"
        aria-label="Close promotion for 24 hours"
      >
        ×
      </button>
    </div>
  );
}
