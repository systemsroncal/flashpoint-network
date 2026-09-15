import Image from "next/image";
import Link from "next/link";

const COLUMNS = [
  {
    title: "U.S.",
    links: ["Politics", "World", "Elections", "National"],
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
      <div className="mx-auto max-w-[1440px] px-4 py-10 md:px-8 lg:px-10">
        <div className="mb-10 flex flex-col items-start justify-between gap-4 rounded-[12px] bg-black/40 px-5 py-6 md:flex-row md:items-center">
          <p className="font-article text-xl font-black tracking-tight md:text-2xl">
            Get The Full Story. As It Is.
          </p>
          <Link
            href="/admin"
            className="inline-flex rounded-md bg-[var(--fpn-rojo)] px-5 py-2.5 text-[12px] font-bold uppercase tracking-wide text-white"
          >
            Subscribe Today
          </Link>
        </div>

        <div className="grid gap-10 md:grid-cols-[1.1fr_2fr]">
          <div>
            <Link href="/" className="inline-flex w-[120px] flex-col overflow-hidden rounded-[3px] border-2 border-white bg-black">
              <span className="flex h-[60px] items-center justify-center bg-black px-2">
                <Image
                  src="/brand/fpn-logo-mark.svg"
                  alt="Flash Point"
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
      </div>

      <div className="border-t border-white/10">
        <div className="mx-auto flex max-w-[1440px] flex-col gap-2 px-4 py-4 text-xs text-white/45 md:px-8 lg:px-10 sm:flex-row sm:items-center sm:justify-between">
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
