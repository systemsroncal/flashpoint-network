import Link from "next/link";
import { getNavCategories } from "@/lib/data/home";

const FALLBACK_NAV = [
  "U.S.",
  "Politics",
  "World",
  "Opinion",
  "Business",
  "Science",
  "Lifestyle",
  "Health",
  "Tech & AI",
];

export default async function SiteHeader() {
  const categories = await getNavCategories();
  const nav =
    categories.filter((c) => c.slug !== "video").slice(0, 9).length > 0
      ? categories.filter((c) => c.slug !== "video").slice(0, 9)
      : FALLBACK_NAV.map((name, i) => ({
          id: String(i),
          name,
          slug: name.toLowerCase().replace(/\s+/g, "-"),
          description: null,
          sort_order: i,
        }));

  return (
    <header className="bg-black text-white">
      <div className="mx-auto flex max-w-[1200px] items-center justify-between gap-4 px-4 py-3.5">
        <Link href="/" className="flex shrink-0 items-center gap-2.5">
          <span className="inline-flex items-center bg-[var(--fpn-red)] px-2.5 py-1 text-[11px] font-black uppercase tracking-[0.06em]">
            Flash Point
          </span>
          <span className="text-sm font-bold uppercase tracking-[0.2em] sm:text-[15px]">
            Network
          </span>
        </Link>

        <nav className="hidden items-center gap-4 overflow-x-auto text-[11px] font-semibold uppercase tracking-[0.08em] text-white/75 xl:flex">
          {nav.map((category) => (
            <Link
              key={category.id}
              href={`/?category=${category.slug}`}
              className="whitespace-nowrap transition-colors hover:text-white"
            >
              {category.name}
            </Link>
          ))}
        </nav>

        <div className="flex items-center gap-2.5 text-sm">
          <button
            type="button"
            aria-label="Search"
            className="hidden h-9 w-9 items-center justify-center rounded-full border border-white/25 text-base text-white/80 transition-colors hover:border-white hover:text-white sm:inline-flex"
          >
            ⌕
          </button>
          <Link
            href="/admin"
            className="hidden rounded-sm border border-white px-3.5 py-1.5 text-[11px] font-bold uppercase tracking-[0.08em] text-white transition-colors hover:bg-white hover:text-black sm:inline-flex"
          >
            Subscribe
          </Link>
          <Link
            href="/admin"
            className="rounded-full bg-[#2563EB] px-4 py-1.5 text-[11px] font-bold uppercase tracking-[0.04em] text-white hover:bg-[#1d4ed8]"
          >
            Login
          </Link>
        </div>
      </div>
    </header>
  );
}
