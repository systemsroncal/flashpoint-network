import Image from "next/image";
import {
  bannerLinkProps,
  resolveBannerImages,
} from "@/lib/banners/resolve";
import type { BannerWidget } from "@/lib/banners/slots";

type Props = {
  widget: BannerWidget | null | undefined;
};

/**
 * Home full-width Patriot section: mobile = full creative; desktop = photo + copy + CTA.
 * Images + href + new-tab come from the CMS banner widget.
 */
export default function PatriotHomeBanner({ widget }: Props) {
  const images = resolveBannerImages(widget);
  const link = bannerLinkProps(
    widget ?? { href: "https://app.fparmychapters.com/register", open_in_new_tab: true },
  );
  const mobileSrc = images.mobile;
  const desktopSrc = images.desktop;

  if (!mobileSrc && !desktopSrc) return null;

  return (
    <section className="mx-auto w-full max-w-[1282px] overflow-hidden rounded-[22px] bg-[#2c372a] text-white">
      {mobileSrc ? (
        <a {...link} className="block md:hidden">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={mobileSrc}
            alt="Are You a Patriot? Join FP Army Chapters"
            className="h-auto w-full"
          />
        </a>
      ) : null}

      {desktopSrc ? (
        <div className="hidden md:grid md:grid-cols-2">
          <div className="relative min-h-[291px]">
            <Image
              src={desktopSrc}
              alt="FP Army community"
              fill
              className="object-cover object-left"
              sizes="641px"
              unoptimized={
                desktopSrc.startsWith("/uploads/") || desktopSrc.startsWith("http")
              }
            />
            <span className="absolute inset-0 bg-gradient-to-r from-transparent via-[#2c372a]/40 to-[#2c372a]" />
          </div>
          <div className="flex flex-col justify-center gap-4 px-8 py-8">
            <div className="flex items-center gap-3.5">
              <span className="inline-flex size-[50px] items-center justify-center rounded-[12px] border border-[#4e4d4d] bg-[#363636]">
                <Image
                  src="/brand/banners/fpn-army-mark.svg"
                  alt=""
                  width={36}
                  height={34}
                />
              </span>
              <div>
                <p className="text-[1.7rem] font-black leading-none tracking-tight">
                  FP ARMY
                </p>
                <p className="mt-1 text-[10px] font-medium uppercase tracking-[0.35em] text-[#989898]">
                  Chapters
                </p>
              </div>
            </div>
            <h2 className="text-[2.4rem] font-black uppercase leading-none tracking-[0.04em]">
              Are You a <span className="text-[#ffcb2c]">Patriot?</span>
            </h2>
            <p className="max-w-md text-[17px] leading-relaxed tracking-wide text-white/90">
              Connect locally. Stand for faith, freedom, and truth. Be part of
              something bigger.
            </p>
            <a
              {...link}
              className="inline-flex w-fit items-center gap-2 rounded-[12px] border border-[#ffcb2c] bg-[#0d0d0d] px-5 py-3 text-[15px] font-bold tracking-wide text-white hover:bg-black"
            >
              Join a Chapter
              <span aria-hidden className="text-[#ffcb2c]">
                ›
              </span>
            </a>
          </div>
        </div>
      ) : null}
    </section>
  );
}
