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
      <div className="mx-auto flex max-w-6xl items-center justify-between gap-4 px-4 py-3">
        <Link href="/" className="flex shrink-0 items-center gap-2">
          <span className="inline-flex items-center bg-[#E10600] px-2 py-1 text-[11px] font-black uppercase tracking-wide">
            Flash Point
          </span>
          <span className="text-sm font-bold uppercase tracking-[0.18em] sm:text-base">
            Network
          </span>
        </Link>

        <nav className="hidden items-center gap-3 overflow-x-auto text-[11px] font-semibold uppercase tracking-wide text-white/80 xl:flex">
          {nav.map((category) => (
            <Link
              key={category.id}
              href={`/?category=${category.slug}`}
              className="whitespace-nowrap hover:text-white"
            >
              {category.name}
            </Link>
          ))}
        </nav>

        <div className="flex items-center gap-2 text-sm">
          <button
            type="button"
            aria-label="Search"
            className="hidden h-9 w-9 items-center justify-center rounded-full border border-white/20 text-white/80 hover:text-white sm:inline-flex"
          >
            ⌕
          </button>
          <Link
            href="/admin"
            className="hidden rounded border border-white px-3 py-1.5 text-xs font-semibold uppercase tracking-wide text-white hover:bg-white hover:text-black sm:inline-flex"
          >
            Subscribe
          </Link>
          <Link
            href="/admin"
            className="rounded-full bg-[#2563EB] px-3 py-1.5 text-xs font-semibold text-white hover:bg-[#1d4ed8]"
          >
            Login
          </Link>
        </div>
      </div>
    </header>
  );
}
