import Link from "next/link";

const COLUMNS = [
  {
    title: "News",
    links: ["U.S.", "Politics", "World", "Elections"],
  },
  {
    title: "Business",
    links: ["Markets", "Economy", "Tech & AI"],
  },
  {
    title: "Opinion",
    links: ["Editorials", "Columns", "Letters"],
  },
  {
    title: "Lifestyle",
    links: ["Health", "Science", "Culture"],
  },
];

export default function SiteFooter() {
  return (
    <footer className="mt-auto bg-[#111111] text-white">
      <div className="mx-auto grid max-w-[1200px] gap-10 px-4 py-14 md:grid-cols-[1.15fr_2fr]">
        <div>
          <div className="flex items-center gap-2.5">
            <span className="bg-[var(--fpn-red)] px-2.5 py-1 text-[11px] font-black uppercase tracking-[0.06em]">
              Flash Point
            </span>
            <span className="text-sm font-bold uppercase tracking-[0.18em]">
              Network
            </span>
          </div>
          <p className="mt-5 max-w-xs font-article text-lg font-bold leading-snug text-white">
            Get The Full Story. As It Is.
          </p>
          <div className="mt-6 flex flex-col gap-2.5 sm:flex-row">
            <Link
              href="/admin"
              className="inline-flex justify-center bg-[var(--fpn-orange)] px-4 py-2.5 text-[11px] font-bold uppercase tracking-[0.1em] text-white hover:bg-[#e63e00]"
            >
              Subscribe Today
            </Link>
            <Link
              href="/admin"
              className="inline-flex justify-center border border-white/30 px-4 py-2.5 text-[11px] font-bold uppercase tracking-[0.1em] text-white hover:border-white"
            >
              Make a Donation
            </Link>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-8 sm:grid-cols-4">
          {COLUMNS.map((col) => (
            <div key={col.title}>
              <h3 className="text-[11px] font-bold uppercase tracking-[0.12em] text-white">
                {col.title}
              </h3>
              <ul className="mt-3.5 space-y-2.5 text-sm text-white/55">
                {col.links.map((link) => (
                  <li key={link}>
                    <Link href="/" className="transition-colors hover:text-white">
                      {link}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </div>

      <div className="border-t border-white/10">
        <div className="mx-auto flex max-w-[1200px] flex-col gap-2 px-4 py-4 text-xs text-white/45 sm:flex-row sm:items-center sm:justify-between">
          <p>© {new Date().getFullYear()} Flash Point Network. All rights reserved.</p>
          <div className="flex gap-5">
            <Link href="/" className="hover:text-white">
              Terms & Conditions
            </Link>
            <Link href="/" className="hover:text-white">
              Privacy Policy
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
