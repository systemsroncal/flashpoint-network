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

const IMG_CLASS =
  "block h-auto w-full max-h-[100px] object-contain object-center sm:max-h-[110px] md:max-h-[130px]";

function BannerPicture({
  desktop,
  mobile,
  imgSrc,
}: {
  desktop: string | null;
  mobile: string | null;
  imgSrc: string;
}) {
  return (
    <picture className="block w-full">
      {mobile ? <source media="(max-width: 767px)" srcSet={mobile} /> : null}
      {desktop ? <source media="(min-width: 768px)" srcSet={desktop} /> : null}
      {/* eslint-disable-next-line @next/next/no-img-element -- responsive promo pair */}
      <img src={imgSrc} alt="" className={IMG_CLASS} />
    </picture>
  );
}

function BannerShell({
  maxWidth,
  href,
  openInNewTab,
  desktop,
  mobile,
  imgSrc,
  onClose,
}: {
  maxWidth: string;
  href: string;
  openInNewTab: boolean;
  desktop: string | null;
  mobile: string | null;
  imgSrc: string;
  onClose: () => void;
}) {
  const inner = (
    <BannerPicture desktop={desktop} mobile={mobile} imgSrc={imgSrc} />
  );

  return (
    <div
      className="relative mx-auto w-full bg-[#0a0a0a]"
      style={{ maxWidth }}
    >
      {href ? (
        <a
          href={href}
          className="block w-full"
          {...(openInNewTab
            ? { target: "_blank", rel: "noopener noreferrer" }
            : {})}
        >
          {inner}
        </a>
      ) : (
        inner
      )}
      <button
        type="button"
        onClick={onClose}
        className="absolute right-2 top-2 z-10 flex h-8 w-8 items-center justify-center rounded-full bg-black/55 text-lg leading-none text-white backdrop-blur-sm transition hover:bg-black/75"
        aria-label="Close promotion for 24 hours"
      >
        ×
      </button>
    </div>
  );
}

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
  const desktopSrc = desktop || mobile;
  const mobileSrc = mobile || desktop;
  if (!desktopSrc && !mobileSrc) return null;

  const href = settings.href.trim();

  return (
    <div className="w-full bg-[#0a0a0a]" role="region" aria-label="Site promotion">
      {mobileSrc ? (
        <div className="md:hidden">
          <BannerShell
            maxWidth={settings.mobileMaxWidth}
            href={href}
            openInNewTab={settings.openInNewTab}
            desktop={desktop}
            mobile={mobile}
            imgSrc={mobileSrc}
            onClose={close}
          />
        </div>
      ) : null}
      {desktopSrc ? (
        <div className="hidden md:block">
          <BannerShell
            maxWidth={settings.desktopMaxWidth}
            href={href}
            openInNewTab={settings.openInNewTab}
            desktop={desktop}
            mobile={mobile}
            imgSrc={desktopSrc}
            onClose={close}
          />
        </div>
      ) : null}
    </div>
  );
}
