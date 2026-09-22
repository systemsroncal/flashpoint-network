import Link from "next/link";
import HeaderSearch from "@/components/public/HeaderSearch";
import HeaderUserMenu, {
  type HeaderUser,
} from "@/components/public/HeaderUserMenu";
import DesktopSiteHeader, {
  type DesktopCategoryNav,
} from "@/components/public/DesktopSiteHeader";
import NewsSectionMobileCategoryBar from "@/components/public/NewsSectionMobileCategoryBar";
import MobileNav from "@/components/public/MobileNav";
import SiteHeaderMobileLogo from "@/components/public/SiteHeaderMobileLogo";
import {
  flattenCategoriesHierarchy,
  getChildCategories,
  getRootCategories,
} from "@/lib/categories/hierarchy";
import { getNavCategories, getTopCategoriesByPostCount } from "@/lib/data/home";
import { getSiteIdentity } from "@/lib/site-identity/settings";
import { DEFAULT_FOOTER_MARK_URL } from "@/lib/site-identity/constants";
import type { ProgramModules } from "@/lib/features/program-modules";
import { DEFAULT_PROGRAM_MODULES } from "@/lib/features/program-modules";
import type { MobileCategoryItem } from "@/components/public/MobileCategoryBar";

const FALLBACK_NAV = [
  { name: "U.S." },
  { name: "Politics" },
  { name: "World" },
  { name: "Opinion" },
  { name: "Business" },
  { name: "Science" },
  { name: "Lifestyle" },
  { name: "Health" },
  { name: "Tech & AI" },
];

function categoryLabel(name: string, slug: string): string {
  if (slug === "elections") return "Elections 2026";
  return name;
}

export default async function SiteHeader({
  modules = DEFAULT_PROGRAM_MODULES,
  isLoggedIn = false,
  isStaff = false,
  user = null,
}: {
  modules?: ProgramModules;
  isLoggedIn?: boolean;
  isStaff?: boolean;
  user?: HeaderUser | null;
}) {
  const [identity, categories, menuTopCategories] = await Promise.all([
    getSiteIdentity(),
    getNavCategories(),
    getTopCategoriesByPostCount(5),
  ]);
  const siteName = identity.siteName;
  const headerLogo = identity.headerLogoUrl;
  const logoSrc = headerLogo || DEFAULT_FOOTER_MARK_URL;
  const fromDb = categories.filter((c) => c.slug !== "video");
  const navRoots =
    fromDb.length > 0
      ? getRootCategories(fromDb).map((c) => ({
          id: c.id,
          name: c.name,
          slug: c.slug,
        }))
      : FALLBACK_NAV.map((item, i) => ({
          id: String(i),
          name: item.name,
          slug: item.name.toLowerCase().replace(/\s+/g, "-").replace("&", ""),
        }));
  const navAll =
    fromDb.length > 0
      ? flattenCategoriesHierarchy(fromDb).map((c) => ({
          id: c.id,
          name: c.name,
          slug: c.slug,
          parent_id: c.parent_id,
        }))
      : navRoots.map((c) => ({ ...c, parent_id: null as string | null }));

  const desktopCategories: DesktopCategoryNav[] =
    fromDb.length > 0
      ? getRootCategories(fromDb).map((root) => ({
          id: root.id,
          name: root.name,
          slug: root.slug,
          children: getChildCategories(fromDb, root.id).map((c) => ({
            id: c.id,
            name: c.name,
            slug: c.slug,
          })),
        }))
      : navRoots.map((r) => ({
          id: r.id,
          name: r.name,
          slug: r.slug,
          children: [],
        }));

  const mobileBarItems: MobileCategoryItem[] = [
    { id: "latest", label: "Latest", href: "/" },
    ...navAll.map((c) => ({
      id: c.id,
      label: c.parent_id
        ? `  ${categoryLabel(c.name, c.slug)}`
        : categoryLabel(c.name, c.slug),
      href: `/category/${c.slug}`,
    })),
    { id: "for-you", label: "For You", href: "/feed/popular" },
    { id: "exclusive", label: "Exclusive", href: "/feed/premium" },
  ];

  return (
    <div className="sticky top-0 z-50 w-full max-w-none overflow-visible">
      <DesktopSiteHeader
        siteName={siteName}
        logoSrc={logoSrc}
        logoWidths={identity.headerLogoMaxWidth}
        logoClassName={identity.headerLogoClassName}
        categories={desktopCategories}
        showSchedule={modules.schedule}
        user={user}
      />

      {/* Mobile / tablet */}
      <header className="w-full max-w-none text-white xl:hidden">
        <div className="relative border-b-[5px] border-[#E1B647] bg-[#000D3C]">
        <div className="absolute inset-x-0 top-0 z-30 h-[3px] bg-black" />
        <div className="site-header-navy-inner relative flex items-center justify-between gap-2 px-2 sm:px-3">
          <div className="flex min-h-0 min-w-0 flex-1 items-center gap-1 sm:gap-2">
            <MobileNav
              topCategories={
                menuTopCategories.length > 0 ? menuTopCategories : navAll.slice(0, 5)
              }
              showSchedule={modules.schedule}
              isLoggedIn={isLoggedIn}
              isStaff={isStaff}
              tone="light"
              logoSrc={logoSrc}
              logoAlt={siteName}
              logoWidths={identity.headerLogoMaxWidth}
              logoClassName={identity.headerLogoClassName}
            />
            <SiteHeaderMobileLogo
              siteName={siteName}
              logoSrc={logoSrc}
              widths={identity.headerLogoMaxWidth}
              className={identity.headerLogoClassName}
            />
          </div>

          <div className="flex shrink-0 items-center gap-0.5 sm:gap-1">
            <HeaderSearch tone="light" iconSize={22} />
            <HeaderUserMenu user={user} tone="light" iconSize={22} />
          </div>
        </div>
        </div>

        <NewsSectionMobileCategoryBar items={mobileBarItems} />
      </header>
    </div>
  );
}
