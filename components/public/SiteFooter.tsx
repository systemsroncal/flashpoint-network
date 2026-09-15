import Image from "next/image";
import Link from "next/link";

const COLUMNS = [
  {
    title: "U.S.",
    links: [
      { label: "Politics", href: "/category/politics" },
      { label: "World", href: "/category/world" },
      { label: "Elections", href: "/category/elections" },
      { label: "National", href: "/category/us" },
    ],
  },
  {
    title: "Business",
    links: [
      { label: "Markets", href: "/category/business" },
      { label: "Economy", href: "/category/business" },
      { label: "Tech & AI", href: "/category/tech-ai" },
    ],
  },
  {
    title: "Opinion",
    links: [
      { label: "Editorials", href: "/category/opinion" },
      { label: "Columns", href: "/category/opinion" },
      { label: "Events", href: "/events" },
      { label: "Schedule", href: "/schedule-programs" },
    ],
  },
  {
    title: "Lifestyle",
    links: [
      { label: "Health", href: "/category/health" },
      { label: "Science", href: "/category/science" },
      { label: "Culture", href: "/category/lifestyle" },
      { label: "Classic Programs", href: "/classic-programs" },
      { label: "Ministry Programs", href: "/ministry-programs" },
    ],
  },
];

export default function SiteFooter({
  siteName = "Flash Point Network",
  tagline = "Get The Full Story. As It Is.",
}: {
  siteName?: string;
  tagline?: string;
}) {
  return (
    <footer className="mt-auto bg-[#111111] text-white">
      <div className="mx-auto max-w-[1440px] px-4 py-10 md:px-8 lg:px-10">
        <div className="mb-10 flex flex-col items-start justify-between gap-4 rounded-[12px] bg-black/40 px-5 py-6 md:flex-row md:items-center">
          <p className="font-article text-xl font-black tracking-tight md:text-2xl">
            {tagline}
          </p>
          <Link
            href="/register"
            className="inline-flex rounded-md bg-[var(--fpn-rojo)] px-5 py-2.5 text-[12px] font-bold uppercase tracking-wide text-white"
          >
            Subscribe Today
          </Link>
        </div>

        <div className="grid gap-10 md:grid-cols-[1.1fr_2fr]">
          <div>
            <Link
              href="/"
              className="inline-flex w-[120px] flex-col overflow-hidden rounded-[3px] border-2 border-white bg-black"
              aria-label={siteName}
            >
              <span className="flex h-[60px] items-center justify-center bg-black px-2">
                <Image
                  src="/brand/fpn-logo-mark.svg"
                  alt={siteName}
                  width={100}
                  height={48}
                  className="h-10 w-auto"
                />
              </span>
              <span className="bg-[var(--fpn-rojo)] py-1 text-center text-[10px] font-bold uppercase tracking-[0.35em]">
                Network
              </span>
            </Link>
            <p className="mt-5 max-w-xs text-sm leading-6 text-white/60">
              Independent reporting for a sharper public square.
            </p>
          </div>

          <div className="grid grid-cols-2 gap-8 sm:grid-cols-4">
            {COLUMNS.map((col) => (
              <div key={col.title}>
                <h3 className="text-[11px] font-bold uppercase tracking-[0.12em] text-white">
                  {col.title}
                </h3>
                <ul className="mt-3.5 space-y-2.5 text-sm text-white/55">
                  {col.links.map((link) => (
                    <li key={link.label}>
                      <Link
                        href={link.href}
                        className="transition-colors hover:text-white"
                      >
                        {link.label}
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="border-t border-white/10">
        <div className="mx-auto flex max-w-[1440px] flex-col gap-2 px-4 py-4 text-xs text-white/45 sm:flex-row sm:items-center sm:justify-between md:px-8 lg:px-10">
          <p>
            © {new Date().getFullYear()} {siteName}. All rights reserved.
          </p>
          <div className="flex gap-5">
            <Link href="/register" className="hover:text-white">
              Subscribe
            </Link>
            <Link href="/login" className="hover:text-white">
              Sign in
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
