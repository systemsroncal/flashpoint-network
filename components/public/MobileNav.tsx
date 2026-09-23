"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import SiteLogo from "@/components/public/SiteLogo";
import type { ResponsiveLogoMaxWidth } from "@/lib/site-identity/logo-layout";

type NavCategory = {
  id: string;
  name: string;
  slug: string;
  parent_id?: string | null;
};

type MenuLink = {
  label: string;
  href: string;
};

const PRIMARY_LINKS: MenuLink[] = [
  { label: "Watch Live", href: "/live" },
  { label: "Broadcast Schedule", href: "/schedule-programs" },
  { label: "Shows", href: "/network-programs" },
];

const FPTN_NEWS: MenuLink = { label: "FPTN News", href: "/news" };

/** Enable when the advertise landing page ships. */
const ADVERTISE_LINK: MenuLink | null = null;

const FOOTER_LINKS: MenuLink[] = [
  { label: "About", href: "/about" },
  { label: "Contact Us", href: "/contact" },
  { label: "Copyright Policy", href: "/copyright-policy" },
  { label: "Terms & Conditions", href: "/terms-and-conditions" },
  { label: "Privacy Policy", href: "/privacy-policy" },
];

const primaryRowClass =
  "flex items-center justify-between py-3.5 text-[length:clamp(1.125rem,4.5vw,1.65rem)] font-black uppercase leading-tight tracking-wide";
const subNewsRowClass =
  "flex items-center justify-between py-2.5 pl-3 text-[length:clamp(0.975rem,3.8vw,1.2rem)] font-bold leading-snug tracking-tight text-white/95";
const footerRowClass =
  "flex items-center justify-between py-2.5 text-[length:clamp(0.8125rem,3.2vw,0.9375rem)] font-medium leading-snug text-white/80";

function categoryLabel(name: string, slug: string): string {
  if (slug === "elections") return "Elections 2026";
  return name;
}

function RowArrow() {
  return <span className="shrink-0 text-[0.85em] opacity-50" aria-hidden>→</span>;
}

export default function MobileNav({
  topCategories,
  showSchedule = true,
  isLoggedIn = false,
  isStaff = false,
  tone = "light",
  logoSrc,
  logoAlt,
  logoWidths,
  logoClassName = "",
}: {
  topCategories: NavCategory[];
  showSchedule?: boolean;
  isLoggedIn?: boolean;
  isStaff?: boolean;
  /** `light` = white bars (navy header); `dark` = black bars (WaPo mobile). */
  tone?: "light" | "dark";
  logoSrc?: string;
  logoAlt?: string;
  logoWidths?: ResponsiveLogoMaxWidth;
  logoClassName?: string;
}) {
  const [open, setOpen] = useState(false);
  const barClass = tone === "dark" ? "bg-black" : "bg-white";
  const close = () => setOpen(false);

  const primaryLinks = PRIMARY_LINKS.filter(
    (link) => link.label !== "Broadcast Schedule" || showSchedule,
  );

  const footerLinks = ADVERTISE_LINK
    ? [ADVERTISE_LINK, ...FOOTER_LINKS]
    : FOOTER_LINKS;

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false);
    };
    document.addEventListener("keydown", onKey);
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = prev;
    };
  }, [open]);

  return (
    <div className="xl:hidden">
      <button
        type="button"
        aria-label={open ? "Close menu" : "Open menu"}
        aria-expanded={open}
        onClick={() => setOpen((v) => !v)}
        className={`inline-flex h-9 w-9 items-center justify-center ${
          tone === "dark"
            ? "text-black"
            : "rounded-md border border-white/40 text-white"
        }`}
      >
        <span className="sr-only">Menu</span>
        <span className="flex flex-col gap-1.5" aria-hidden>
          <span
            className={`block h-0.5 w-4 transition ${barClass} ${open ? "translate-y-[7px] rotate-45" : ""}`}
          />
          <span
            className={`block h-0.5 w-4 transition ${barClass} ${open ? "opacity-0" : ""}`}
          />
          <span
            className={`block h-0.5 w-4 transition ${barClass} ${open ? "-translate-y-[7px] -rotate-45" : ""}`}
          />
        </span>
      </button>

      {open ? (
        <div className="fixed inset-0 z-50 flex flex-col bg-[#000D3C] text-white">
          <div className="mx-auto flex w-full max-w-[1440px] items-center justify-between gap-3 px-4 py-4 md:px-8">
            {logoSrc && logoWidths ? (
              <Link
                href="/"
                onClick={close}
                className="block max-w-[min(52vw,200px)]"
                aria-label={logoAlt ?? "Home"}
              >
                <SiteLogo
                  src={logoSrc}
                  alt={logoAlt ?? ""}
                  widths={logoWidths}
                  className={logoClassName}
                />
              </Link>
            ) : (
              <span className="text-sm font-bold uppercase tracking-[0.18em]">
                Menu
              </span>
            )}
            <button
              type="button"
              aria-label="Close menu"
              onClick={close}
              className="inline-flex h-10 w-10 items-center justify-center text-2xl leading-none text-white"
            >
              ×
            </button>
          </div>

          <nav
            className="mx-auto w-full max-w-[1440px] flex-1 overflow-y-auto px-4 pb-10 md:px-8"
            aria-label="Mobile"
          >
            <ul>
              {primaryLinks.map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    onClick={close}
                    className={primaryRowClass}
                  >
                    {link.label}
                    <RowArrow />
                  </Link>
                </li>
              ))}

              <li>
                <Link
                  href={FPTN_NEWS.href}
                  onClick={close}
                  className={primaryRowClass}
                >
                  {FPTN_NEWS.label}
                  <RowArrow />
                </Link>
                {topCategories.length > 0 ? (
                  <ul className="pb-2">
                    {topCategories.map((item) => (
                      <li key={item.id}>
                        <Link
                          href={`/category/${item.slug}`}
                          onClick={close}
                          className={`${subNewsRowClass} ${item.parent_id ? "pl-6" : "pl-3"}`}
                        >
                          {categoryLabel(item.name, item.slug)}
                          <RowArrow />
                        </Link>
                      </li>
                    ))}
                  </ul>
                ) : null}
              </li>
            </ul>

            <div className="mt-6 pt-2">
              <ul>
                {footerLinks.map((link) => (
                  <li key={link.href}>
                    <Link
                      href={link.href}
                      onClick={close}
                      className={footerRowClass}
                    >
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>

          </nav>
        </div>
      ) : null}
    </div>
  );
}
