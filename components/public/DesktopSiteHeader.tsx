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

const NEWS_CATEGORY_BAR_EXCLUDE = new Set(["elections", "video"]);

function categoryLabel(name: string, slug: string): string {
  if (slug === "elections") return "Elections 2026";
  return name;
}

function ChevronDown() {
  return (
    <svg
      width={8}
      height={5}
      viewBox="0 0 10 6"
      aria-hidden
      className="ml-0.5 shrink-0"
    >
      <path d="M1 1l4 4 4-4" stroke="currentColor" strokeWidth="1.6" fill="none" />
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
  const active = pathname === href || pathname.startsWith(`${href}/`);
  const hasChildren = item.children.length > 0;

  return (
    <div
      className="relative"
      onMouseEnter={() => hasChildren && setOpen(true)}
      onMouseLeave={() => setOpen(false)}
    >
      <Link
        href={href}
        className={`inline-flex items-center whitespace-nowrap py-3 text-[15px] font-bold tracking-tight transition-opacity hover:opacity-75 ${
          active ? "text-black" : "text-black"
        }`}
        aria-expanded={hasChildren ? open : undefined}
        aria-haspopup={hasChildren ? "true" : undefined}
      >
        {categoryLabel(item.name, item.slug)}
        {hasChildren ? <ChevronDown /> : null}
      </Link>
      {open && hasChildren ? (
        <div
          className="absolute left-0 top-full z-50 min-w-[200px] rounded-md border border-black/10 bg-white py-1 shadow-lg"
          role="menu"
        >
          {item.children.map((child) => (
            <Link
              key={child.id}
              href={`/category/${child.slug}`}
              className="block px-4 py-2 text-[14px] font-semibold text-black hover:bg-black/5"
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

function PrimaryNav({
  links,
  pathname,
  activeHighlight = "white",
}: {
  links: PrimaryLink[];
  pathname: string;
  activeHighlight?: "white" | "cyan";
}) {
  return (
    <nav
      className="flex flex-wrap items-center justify-center gap-x-5 gap-y-1 2xl:gap-x-10"
      aria-label="Primary"
    >
      {links.map((link) => {
        const active = link.match(pathname);
        const activeClass =
          activeHighlight === "cyan"
            ? "font-black text-[#0035FC]"
            : "font-black text-white";
        return (
          <Link
            key={link.href}
            href={link.href}
            className={`text-[length:clamp(0.9rem,1.1vw,1.2rem)] tracking-tight transition-opacity hover:opacity-90 ${
              active ? activeClass : "font-black text-white/75"
            }`}
          >
            {link.label}
          </Link>
        );
      })}
    </nav>
  );
}

function buildPrimaryLinks(showSchedule: boolean, newsLayout: boolean): PrimaryLink[] {
  const newsMatch = (p: string) =>
    p === "/news" ||
    p.startsWith("/news/") ||
    p.startsWith("/category/") ||
    p.startsWith("/tag/") ||
    p.startsWith("/tags/") ||
    p.startsWith("/feed/") ||
    p.startsWith("/preview/news/");

  const links: PrimaryLink[] = [
    { label: "Home", href: "/", match: (p) => p === "/" },
    { label: "Watch Live", href: "/live", match: (p) => p.startsWith("/live") },
    { label: "FPTN News", href: "/news", match: newsMatch },
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
    { label: "Advertise", href: "/contact", match: (p) => p.startsWith("/contact") },
    ...(newsLayout
      ? []
      : [{ label: "About", href: "/about", match: (p: string) => p.startsWith("/about") }]),
  ];

  return links;
}

function LogoLink({
  siteName,
  logoSrc,
  logoWidths,
  logoClassName,
  variant = "inline",
  positionClassName = "",
}: {
  siteName: string;
  logoSrc: string;
  logoWidths: ResponsiveLogoMaxWidth;
  logoClassName: string;
  variant?: "inline" | "overlap" | "hang";
  positionClassName?: string;
}) {
  const variantClass =
    variant === "overlap"
      ? "absolute top-1/2 z-50 -translate-y-1/2"
      : variant === "hang"
        ? "relative z-40 -mb-8 flex items-start self-start"
        : "";

  const logoSizeClass =
    variant === "overlap"
      ? "!max-h-[108px] object-left object-contain"
      : variant === "hang"
        ? "!max-h-[118px] object-left object-contain"
        : "";

  return (
    <Link
      href="/"
      className={`relative z-30 block shrink-0 ${variantClass} ${positionClassName}`}
      style={{
        width: logoWidths.desktop,
        maxWidth: logoWidths.desktop,
      }}
      aria-label={siteName}
    >
      <SiteLogo
        src={logoSrc}
        alt={siteName}
        widths={logoWidths}
        className={`${logoClassName} ${logoSizeClass}`}
        priority
      />
    </Link>
  );
}

export default function DesktopSiteHeader({
  siteName,
  logoSrc,
  logoWidths,
  logoClassName,
  categories,
  showSchedule,
  user,
}: {
  siteName: string;
  logoSrc: string;
  logoWidths: ResponsiveLogoMaxWidth;
  logoClassName: string;
  categories: DesktopCategoryNav[];
  showSchedule: boolean;
  user: HeaderUser | null;
}) {
  const pathname = usePathname() || "/";
  const showCategoryBar = isNewsSectionPath(pathname);
  const primaryLinks = buildPrimaryLinks(showSchedule, showCategoryBar);
  const newsCategories = categories.filter(
    (c) => !NEWS_CATEGORY_BAR_EXCLUDE.has(c.slug),
  );

  if (showCategoryBar) {
    const categoryBarInset = `calc(${logoWidths.desktop} + 50px)`;

    return (
      <header className="relative hidden w-full xl:block">
        <div className="absolute inset-x-0 top-0 z-40 h-[3px] bg-black" />
        <div className="relative w-full pt-[3px]">
          <LogoLink
            siteName={siteName}
            logoSrc={logoSrc}
            logoWidths={logoWidths}
            logoClassName={logoClassName}
            variant="overlap"
            positionClassName="left-4 md:left-8 lg:left-10"
          />

          <div className="w-full border-b-[5px] border-[#E1B647] bg-[#000D3C] text-white">
            <div className="mx-auto flex max-w-[1920px] items-center gap-4 px-4 py-3 md:px-8 lg:px-10">
              <div className="flex min-w-0 flex-1 items-center justify-center">
                <PrimaryNav
                  links={primaryLinks}
                  pathname={pathname}
                  activeHighlight="white"
                />
              </div>
              <div className="flex shrink-0 items-center justify-end gap-3">
                <HeaderSearch tone="light" />
                <HeaderUserMenu user={user} tone="light" iconSize={24} />
              </div>
            </div>
          </div>

          <div className="w-full bg-white text-black">
            <div className="mx-auto max-w-[1920px] px-4 md:px-8 lg:px-10">
              <nav
                className="flex min-w-0 items-center justify-between gap-x-3 overflow-x-auto py-0.5 scrollbar-none [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
                style={{ paddingLeft: categoryBarInset }}
                aria-label="News categories"
              >
                {newsCategories.map((item) => (
                  <CategoryNavItem
                    key={item.id}
                    item={item}
                    pathname={pathname}
                  />
                ))}
              </nav>
            </div>
          </div>
        </div>
      </header>
    );
  }

  return (
    <header className="relative z-50 hidden w-full overflow-visible xl:block">
      <div className="relative overflow-visible border-b-[5px] border-[#E1B647] bg-[#000D3C] text-white">
        <div className="absolute inset-x-0 top-0 z-30 h-[3px] bg-black" />
        <div className="relative mx-auto flex max-w-[1920px] items-center gap-6 overflow-visible px-4 pb-3 pt-[calc(3px+0.75rem)] md:gap-8 md:px-8 lg:px-10">
          <LogoLink
            siteName={siteName}
            logoSrc={logoSrc}
            logoWidths={logoWidths}
            logoClassName={logoClassName}
            variant="hang"
          />

          <div className="flex min-w-0 flex-1 items-center justify-center">
            <PrimaryNav
              links={primaryLinks}
              pathname={pathname}
              activeHighlight="cyan"
            />
          </div>

          <div className="flex shrink-0 items-center justify-end gap-3">
            <HeaderSearch tone="light" />
            <HeaderUserMenu user={user} tone="light" iconSize={24} />
          </div>
        </div>
      </div>
    </header>
  );
}
