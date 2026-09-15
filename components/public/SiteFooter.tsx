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
      <div className="mx-auto grid max-w-6xl gap-8 px-4 py-12 md:grid-cols-[1.1fr_2fr]">
        <div>
          <div className="flex items-center gap-2">
            <span className="bg-[#E10600] px-2 py-1 text-[11px] font-black uppercase">
              Flash Point
            </span>
            <span className="text-sm font-bold uppercase tracking-[0.16em]">
              Network
            </span>
          </div>
          <p className="mt-4 max-w-xs text-sm leading-6 text-white/65">
            Get The Full Story. As It Is.
          </p>
          <div className="mt-5 flex flex-col gap-2 sm:flex-row">
            <Link
              href="/admin"
              className="inline-flex justify-center bg-[#FF4500] px-4 py-2 text-xs font-bold uppercase tracking-wide text-white"
            >
              Subscribe Today
            </Link>
            <Link
              href="/admin"
              className="inline-flex justify-center border border-white/30 px-4 py-2 text-xs font-bold uppercase tracking-wide text-white"
            >
              Make a Donation
            </Link>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-6 sm:grid-cols-4">
          {COLUMNS.map((col) => (
            <div key={col.title}>
              <h3 className="text-xs font-bold uppercase tracking-wide text-white/90">
                {col.title}
              </h3>
              <ul className="mt-3 space-y-2 text-sm text-white/60">
                {col.links.map((link) => (
                  <li key={link}>
                    <Link href="/" className="hover:text-white">
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
        <div className="mx-auto flex max-w-6xl flex-col gap-2 px-4 py-4 text-xs text-white/50 sm:flex-row sm:items-center sm:justify-between">
          <p>© {new Date().getFullYear()} Flash Point Network. All rights reserved.</p>
          <div className="flex gap-4">
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
