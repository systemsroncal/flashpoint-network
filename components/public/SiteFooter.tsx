import Image from "next/image";
import Link from "next/link";
import SiteLogo from "@/components/public/SiteLogo";
import type { ProgramModules } from "@/lib/features/program-modules";
import { DEFAULT_PROGRAM_MODULES } from "@/lib/features/program-modules";
import { DEFAULT_FOOTER_MARK_URL } from "@/lib/site-identity/constants";
import { getSiteIdentity } from "@/lib/site-identity/settings";

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
      { label: "Family Classics", href: "/classic-programs" },
      { label: "Network Programs", href: "/network-programs" },
    ],
  },
];

export default async function SiteFooter({
  tagline = "Get The Full Story. As It Is.",
  modules = DEFAULT_PROGRAM_MODULES,
}: {
  tagline?: string;
  modules?: ProgramModules;
}) {
  const identity = await getSiteIdentity();
  const siteName = identity.siteName;
  const footerLogo = identity.footerLogoUrl;

  return (
    <footer className="mt-auto bg-[#111111] text-white">
      <div className="mx-auto max-w-[1440px] px-4 py-10 md:px-8 lg:px-10">
        <div className="mb-10 flex flex-col items-start justify-between gap-4 rounded-[12px] bg-black/40 px-5 py-6 md:flex-row md:items-center">
          <p className="font-article text-xl font-black tracking-tight md:text-2xl">
            {tagline}
          </p>
        </div>

        <div className="grid gap-10 md:grid-cols-[1.1fr_2fr]">
          <div>
            {footerLogo ? (
              <Link href="/" className="inline-block" aria-label={siteName}>
                <SiteLogo
                  src={footerLogo}
                  alt={siteName}
                  widths={identity.footerLogoMaxWidth}
                  className={`object-left ${identity.footerLogoClassName}`.trim()}
                  fluid={false}
                  heightClass="h-14 w-auto"
                />
              </Link>
            ) : (
              <Link
                href="/"
                className="inline-flex w-[120px] flex-col overflow-hidden rounded-[3px] border-2 border-white bg-black"
                aria-label={siteName}
              >
                <span className="flex h-[60px] items-center justify-center bg-black px-2">
                  <Image
                    src={DEFAULT_FOOTER_MARK_URL}
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
            )}
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
                  {col.links
                    .filter((link) => {
                      if (link.href === "/classic-programs") return modules.classic;
                      if (link.href === "/schedule-programs") return modules.schedule;
                      return true;
                    })
                    .map((link) => (
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
          <div className="flex flex-col gap-1.5">
            <p className="text-[14px] leading-snug text-white/50">
              © {new Date().getFullYear()} {siteName}. All rights reserved.
            </p>
            <p className="text-xs">
              Platform Developed By{" "}
              <a
                href="https://www.dreamsanimation.com/"
                target="_blank"
                rel="noopener noreferrer"
                className="text-white/70 transition-colors hover:text-white"
              >
                Dreams Animation
              </a>
            </p>
          </div>
          <div className="flex flex-wrap gap-x-5 gap-y-2">
            <Link href="/terms-and-conditions" className="hover:text-white">
              Terms &amp; Conditions
            </Link>
            <Link href="/privacy-policy" className="hover:text-white">
              Privacy Policy
            </Link>
            <Link href="/data-disclaimer" className="hover:text-white">
              Data Disclaimer
            </Link>
            <Link href="/copyright-policy" className="hover:text-white">
              Copyright Policy
            </Link>
            <Link href="/about" className="hover:text-white">
              About
            </Link>
            <Link href="/contact" className="hover:text-white">
              Contact
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
