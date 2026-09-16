import Image from "next/image";
import Link from "next/link";
import MobileNav from "@/components/public/MobileNav";
import { getNavCategories } from "@/lib/data/home";
import { getSiteName } from "@/lib/env";
import type { ProgramModules } from "@/lib/features/program-modules";
import { DEFAULT_PROGRAM_MODULES } from "@/lib/features/program-modules";

const FALLBACK_NAV = [
  { name: "U.S.", chevron: true },
  { name: "Politics", chevron: true },
  { name: "World", chevron: true },
  { name: "Opinion", chevron: false },
  { name: "Business", chevron: false },
  { name: "Science", chevron: false },
  { name: "Lifestyle", chevron: true },
  { name: "Health", chevron: true },
  { name: "Tech & AI", chevron: true },
];

export default async function SiteHeader({
  modules = DEFAULT_PROGRAM_MODULES,
}: {
  modules?: ProgramModules;
}) {
  const siteName = getSiteName();
  const categories = await getNavCategories();
  const fromDb = categories.filter((c) => c.slug !== "video").slice(0, 9);
  const nav =
    fromDb.length > 0
      ? fromDb.map((c, i) => ({
          id: c.id,
          name: c.name,
          slug: c.slug,
          chevron: FALLBACK_NAV[i]?.chevron ?? true,
        }))
      : FALLBACK_NAV.map((item, i) => ({
          id: String(i),
          name: item.name,
          slug: item.name.toLowerCase().replace(/\s+/g, "-").replace("&", ""),
          chevron: item.chevron,
        }));

  return (
    <header className="relative z-20 bg-[var(--fpn-navy)] text-white">
      <div className="absolute inset-x-0 top-0 h-[3px] bg-[var(--fpn-rojo)]" />
      <div className="mx-auto flex max-w-[1440px] items-center justify-between gap-3 px-4 py-3 md:gap-4 md:px-8 lg:px-10">
        <div className="flex items-center gap-3">
          <MobileNav
            items={nav.map(({ id, name, slug }) => ({ id, name, slug }))}
            showClassic={modules.classic}
            showSchedule={modules.schedule}
          />
          <Link href="/" className="relative z-10 shrink-0" aria-label={siteName}>
            <span className="flex w-[100px] flex-col overflow-hidden rounded-[3px] border-2 border-white bg-black sm:w-[130px]">
              <span className="relative flex h-[52px] items-center justify-center bg-black px-2 sm:h-[68px]">
                <Image
                  src="/brand/fpn-logo-mark.svg"
                  alt={siteName}
                  width={110}
                  height={52}
                  className="h-10 w-auto sm:h-[52px]"
                  priority
                />
              </span>
              <span className="bg-[var(--fpn-rojo)] py-1 text-center text-[10px] font-bold uppercase tracking-[0.35em] text-white sm:text-[11px]">
                Network
              </span>
            </span>
          </Link>
        </div>

        <nav className="hidden flex-1 items-center justify-center gap-1 xl:flex 2xl:gap-2">
          {nav.map((category) => (
            <Link
              key={category.id}
              href={`/category/${category.slug}`}
              className="inline-flex items-center gap-1 px-1.5 py-2 text-[13px] font-black text-white transition-opacity hover:opacity-80 2xl:px-2 2xl:text-[15px]"
            >
              {category.name}
              {category.chevron ? (
                <span className="text-[9px] opacity-80" aria-hidden>
                  ▼
                </span>
              ) : null}
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
          <Link
            href="/ministry-programs"
            className="hidden text-[13px] font-bold text-white/90 hover:text-white xl:inline"
          >
            Ministry
          </Link>
          <Link
            href="/events"
            className="hidden text-[13px] font-bold text-white/90 hover:text-white lg:inline"
          >
            Events
          </Link>
          <button
            type="button"
            aria-label="Search (coming soon)"
            title="Search coming soon"
            disabled
            className="inline-flex h-6 w-6 items-center justify-center opacity-60"
          >
            <Image src="/brand/search.svg" alt="" width={23} height={23} />
          </button>
          <Link
            href="/register"
            className="hidden h-[38px] w-[105px] items-center justify-center rounded-md bg-white text-[14px] font-bold text-black sm:inline-flex"
          >
            Subscribe
          </Link>
          <Link
            href="/login"
            className="inline-flex h-[38px] min-w-[72px] items-center justify-center rounded-md border border-white px-3 text-[14px] font-black text-white sm:w-[105px]"
          >
            Login
          </Link>
        </div>
      </div>
    </header>
  );
}
