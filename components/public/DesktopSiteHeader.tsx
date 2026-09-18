"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import HeaderSearch from "@/components/public/HeaderSearch";
import HeaderUserMenu, {
  type HeaderUser,
} from "@/components/public/HeaderUserMenu";
import SiteLogo from "@/components/public/SiteLogo";
import type { ResponsiveLogoMaxWidth } from "@/lib/site-identity/logo-layout";
import { isNewsSectionPath } from "@/lib/navigation/news-section";

export type DesktopCategoryNav = {
  id: string;
  name: string;
  slug: string;
  children: { id: string; name: string; slug: string }[];
};

type PrimaryLink = {
  label: string;
  href: string;
  match: (path: string) => boolean;
};

function categoryLabel(name: string, slug: string): string {
  if (slug === "elections") return "Elections 2026";
  return name;
}

function ChevronDown() {
  return (
    <svg width={10} height={6} viewBox="0 0 10 6" aria-hidden className="ml-1 shrink-0 opacity-90">
      <path d="M1 1l4 4 4-4" stroke="currentColor" strokeWidth="1.5" fill="none" />
    </svg>
  );
}

function CategoryNavItem({
  item,
  pathname,
}: {
  item: DesktopCategoryNav;
  pathname: string;
}) {
  const [open, setOpen] = useState(false);
  const href = `/category/${item.slug}`;
  const active =
    pathname === href || pathname.startsWith(`${href}/`);
  const hasChildren = item.children.length > 0;

  if (!hasChildren) {
    return (
      <Link
        href={href}
        className={`inline-flex items-center whitespace-nowrap px-2 py-2 text-[15px] font-bold transition-opacity hover:opacity-90 ${
          active ? "text-white" : "text-white/95"
        }`}
      >
        {categoryLabel(item.name, item.slug)}
      </Link>
    );
  }

  return (
    <div
      className="relative"
      onMouseEnter={() => setOpen(true)}
      onMouseLeave={() => setOpen(false)}
    >
      <Link
        href={href}
        className={`inline-flex items-center whitespace-nowrap px-2 py-2 text-[15px] font-bold transition-opacity hover:opacity-90 ${
          active ? "text-white" : "text-white/95"
        }`}
        aria-expanded={open}
        aria-haspopup="true"
      >
        {categoryLabel(item.name, item.slug)}
        <ChevronDown />
      </Link>
      {open ? (
        <div
          className="absolute left-0 top-full z-50 min-w-[200px] rounded-md border border-white/20 bg-[var(--fpn-navy)] py-1 shadow-lg"
          role="menu"
        >
          {item.children.map((child) => (
            <Link
              key={child.id}
              href={`/category/${child.slug}`}
              className="block px-4 py-2 text-[14px] font-semibold text-white hover:bg-white/10"
              role="menuitem"
            >
              {categoryLabel(child.name, child.slug)}
            </Link>
          ))}
        </div>
      ) : null}
    </div>
  );
}

export default function DesktopSiteHeader({
  siteName,
  logoSrc,
  logoWidths,
  logoClassName,
  categories,
  showSchedule,
  todayLabel,
  user,
}: {
  siteName: string;
  logoSrc: string;
  logoWidths: ResponsiveLogoMaxWidth;
  logoClassName: string;
  categories: DesktopCategoryNav[];
  showSchedule: boolean;
  todayLabel: string;
  user: HeaderUser | null;
}) {
  const pathname = usePathname() || "/";
  const showCategoryBar = isNewsSectionPath(pathname);
  const categoryNavPaddingLeft = `calc(${logoWidths.desktop} + 20px)`;

  const primaryLinks: PrimaryLink[] = [
    {
      label: "Home",
      href: "/",
      match: (p) => p === "/",
    },
    { label: "Watch Live", href: "/live", match: (p) => p.startsWith("/live") },
    {
      label: "FPTN News",
      href: "/news",
      match: (p) =>
        p === "/news" ||
        p.startsWith("/news/") ||
        p.startsWith("/category/") ||
        p.startsWith("/tag/") ||
        p.startsWith("/tags/") ||
        p.startsWith("/feed/") ||
        p.startsWith("/preview/news/"),
    },
    ...(showSchedule
      ? [
          {
            label: "Broadcast Schedule",
            href: "/schedule-programs",
            match: (p: string) => p.startsWith("/schedule-programs"),
          },
        ]
      : []),
    {
      label: "Shows",
      href: "/network-programs",
      match: (p) => p.startsWith("/network-programs"),
    },
    { label: "About", href: "/about", match: (p) => p.startsWith("/about") },
  ];

  return (
    <header className="sticky top-0 z-50 hidden w-full xl:block">
      <div className="relative bg-[var(--fpn-navy)] text-white">
        <div className="absolute inset-x-0 top-0 z-30 h-[3px] bg-[var(--fpn-rojo)]" />

        {/* Logo overlaps navy + sky bars when the news category strip is visible */}
        <Link
          href="/"
          className={`absolute left-4 z-20 block md:left-8 lg:left-10 ${
            showCategoryBar ? "top-2.5" : "top-1/2 -translate-y-1/2"
          }`}
          style={{ width: logoWidths.desktop, maxWidth: logoWidths.desktop }}
          aria-label={siteName}
        >
          <SiteLogo
            src={logoSrc}
            alt={siteName}
            widths={logoWidths}
            className={logoClassName}
            priority
          />
        </Link>

        <div className="relative mx-auto max-w-[1920px] px-4 py-3 pl-[min(220px,20vw)] md:px-8 md:pl-[min(240px,22vw)] lg:px-10">
          <div className="grid grid-cols-[1fr_auto] items-center gap-4">
            <nav
              className="flex flex-wrap items-center justify-center gap-x-5 gap-y-1 2xl:gap-x-10"
              aria-label="Primary"
            >
              {primaryLinks.map((link) => {
                const active = link.match(pathname);
                const isNews = link.label === "FPTN News";
                return (
                  <Link
                    key={link.href}
                    href={link.href}
                    className={`text-[length:clamp(0.9rem,1.1vw,1.2rem)] font-black tracking-tight transition-opacity hover:opacity-90 ${
                      active
                        ? isNews
                          ? "text-[var(--fpn-sky)]"
                          : "text-white"
                        : "text-white/75"
                    }`}
                  >
                    {link.label}
                  </Link>
                );
              })}
            </nav>

            <div className="flex items-center justify-end gap-3">
              <HeaderSearch tone="light" />
              <HeaderUserMenu user={user} tone="light" iconSize={24} />
            </div>
          </div>
        </div>
      </div>

      {showCategoryBar ? (
        <div className="bg-[var(--fpn-sky)] text-white">
          <div
            className="mx-auto flex max-w-[1920px] items-center justify-between gap-4 py-2 pr-4 md:pr-8 lg:pr-10"
            style={{ paddingLeft: categoryNavPaddingLeft }}
          >
            <nav
              className="flex min-w-0 flex-1 flex-wrap items-center gap-x-1 gap-y-0"
              aria-label="News categories"
            >
              {categories.map((item) => (
                <CategoryNavItem key={item.id} item={item} pathname={pathname} />
              ))}
            </nav>
            <p className="hidden shrink-0 text-[14px] font-medium text-white/95 sm:block">
              {todayLabel}
            </p>
          </div>
        </div>
      ) : null}
    </header>
  );
}
