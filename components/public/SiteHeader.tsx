import Link from "next/link";
import HeaderSearch from "@/components/public/HeaderSearch";
import MobileCategoryBar, {
  type MobileCategoryItem,
} from "@/components/public/MobileCategoryBar";
import MobileNav from "@/components/public/MobileNav";
import BrandImage from "@/components/public/BrandImage";
import { getNavCategories } from "@/lib/data/home";
import { getSiteIdentity } from "@/lib/site-identity/settings";
import { DEFAULT_FOOTER_MARK_URL } from "@/lib/site-identity/constants";
import type { ProgramModules } from "@/lib/features/program-modules";
import { DEFAULT_PROGRAM_MODULES } from "@/lib/features/program-modules";

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
  { name: "Elections" },
];

function categoryLabel(name: string, slug: string): string {
  if (slug === "elections") return "Elections 2026";
  return name;
}

export default async function SiteHeader({
  modules = DEFAULT_PROGRAM_MODULES,
  isLoggedIn = false,
  isStaff = false,
}: {
  modules?: ProgramModules;
  isLoggedIn?: boolean;
  isStaff?: boolean;
}) {
  const [identity, categories] = await Promise.all([
    getSiteIdentity(),
    getNavCategories(),
  ]);
  const siteName = identity.siteName;
  const headerLogo = identity.headerLogoUrl;
  const fromDb = categories.filter((c) => c.slug !== "video");
  const navAll =
    fromDb.length > 0
      ? fromDb.map((c) => ({
          id: c.id,
          name: c.name,
          slug: c.slug,
        }))
      : FALLBACK_NAV.map((item, i) => ({
          id: String(i),
          name: item.name,
          slug: item.name.toLowerCase().replace(/\s+/g, "-").replace("&", ""),
        }));
  const navDesktop = navAll.slice(0, 9);

  const mobileBarItems: MobileCategoryItem[] = [
    { id: "latest", label: "Latest", href: "/" },
    ...navAll.map((c) => ({
      id: c.id,
      label: categoryLabel(c.name, c.slug),
      href: `/category/${c.slug}`,
    })),
    { id: "for-you", label: "For You", href: "/feed/popular" },
    { id: "exclusive", label: "Exclusive", href: "/feed/premium" },
  ];

  const authDesktop =
    isLoggedIn ? (
      isStaff ? (
        <Link
          href="/admin"
          className="inline-flex h-[38px] items-center justify-center rounded-md bg-[var(--fpn-rojo)] px-4 text-[14px] font-black text-white hover:brightness-110"
        >
          Admin
        </Link>
      ) : null
    ) : (
      <>
        <Link
          href="/register"
          className="hidden h-[38px] w-[105px] items-center justify-center rounded-md bg-white text-[14px] font-bold text-black md:inline-flex"
        >
          Subscribe
        </Link>
        <Link
          href="/login"
          className="hidden h-[38px] min-w-[72px] items-center justify-center rounded-md bg-[var(--fpn-rojo)] px-3 text-[14px] font-black text-white hover:brightness-110 md:inline-flex md:w-[105px]"
        >
          Login
        </Link>
      </>
    );

  const authMobile = isLoggedIn ? (
    isStaff ? (
      <Link
        href="/admin"
        className="text-[14px] font-bold text-white hover:opacity-80"
      >
        Admin
      </Link>
    ) : (
      <span className="w-[52px]" aria-hidden />
    )
  ) : (
    <Link
      href="/login"
      className="text-[14px] font-bold text-white hover:opacity-80"
    >
      Sign in
    </Link>
  );

  return (
    <header className="relative z-20 w-full max-w-none">
      {/* —— Desktop / xl+ : existing navy header —— */}
      <div className="relative hidden w-full bg-[var(--fpn-navy)] text-white xl:block">
        <div className="absolute inset-x-0 top-0 h-[3px] bg-[var(--fpn-rojo)]" />
        <div className="mx-auto flex max-w-[1440px] items-center justify-between gap-3 px-4 py-3 md:gap-4 md:px-8 lg:px-10">
          <div className="flex items-center gap-3">
            <Link href="/" className="relative z-10 shrink-0" aria-label={siteName}>
              <BrandImage
                src={headerLogo || DEFAULT_FOOTER_MARK_URL}
                alt={siteName}
                width={200}
                height={52}
                className="h-[52px] w-auto max-w-[200px] object-contain"
                priority
              />
            </Link>
          </div>

          <nav className="hidden flex-1 items-center justify-center gap-1 xl:flex 2xl:gap-2">
            {navDesktop.map((category) => (
              <Link
                key={category.id}
                href={`/category/${category.slug}`}
                className="inline-flex items-center px-1.5 py-2 text-[13px] font-black text-white transition-opacity hover:opacity-80 2xl:px-2 2xl:text-[15px]"
              >
                {category.name}
              </Link>
            ))}
          </nav>

          <div className="flex items-center gap-2 sm:gap-4">
            {modules.schedule ? (
              <Link
                href="/schedule-programs"
                className="hidden text-[13px] font-bold text-white/90 hover:text-white lg:inline"
              >
                Schedule
              </Link>
            ) : null}
            {modules.classic ? (
              <Link
                href="/classic-programs"
                className="hidden text-[13px] font-bold text-white/90 hover:text-white lg:inline"
              >
                Classics
              </Link>
            ) : null}
            <HeaderSearch tone="light" />
            {authDesktop}
          </div>
        </div>
      </div>

      {/* —— Mobile / tablet : same navy as desktop so the logo reads —— */}
      <div className="relative w-full max-w-none bg-[var(--fpn-navy)] text-white xl:hidden">
        <div className="absolute inset-x-0 top-0 h-[3px] bg-[var(--fpn-rojo)]" />
        <div className="relative grid w-full grid-cols-[1fr_auto_1fr] items-center gap-2 px-2 pb-2.5 pt-3.5 sm:px-3">
          <div className="flex items-center justify-start gap-0.5">
            <MobileNav
              items={navAll}
              showClassic={modules.classic}
              showSchedule={modules.schedule}
              isLoggedIn={isLoggedIn}
              isStaff={isStaff}
              tone="light"
            />
            <HeaderSearch tone="light" />
          </div>

          <Link
            href="/"
            className="justify-self-center"
            aria-label={siteName}
          >
            <BrandImage
              src={headerLogo || DEFAULT_FOOTER_MARK_URL}
              alt={siteName}
              width={160}
              height={34}
              className="h-8 w-auto max-w-[180px] object-contain sm:h-9"
              priority
            />
          </Link>

          <div className="flex items-center justify-end pr-1">{authMobile}</div>
        </div>

        <MobileCategoryBar items={mobileBarItems} />
      </div>
    </header>
  );
}
