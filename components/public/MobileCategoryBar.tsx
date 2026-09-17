"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

export type MobileCategoryItem = {
  id: string;
  label: string;
  href: string;
};

type Props = {
  items: MobileCategoryItem[];
};

function isActive(pathname: string, href: string): boolean {
  if (href === "/") {
    return pathname === "/" || pathname === "/feed/latest";
  }
  return pathname === href || pathname.startsWith(`${href}/`);
}

export default function MobileCategoryBar({ items }: Props) {
  const pathname = usePathname() || "/";

  return (
    <nav
      aria-label="Sections"
      className="border-b border-[#E5E5E5] bg-white"
    >
      <ul className="flex gap-5 overflow-x-auto px-4 scrollbar-none [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
        {items.map((item) => {
          const active = isActive(pathname, item.href);
          return (
            <li key={item.id} className="shrink-0">
              <Link
                href={item.href}
                aria-current={active ? "page" : undefined}
                className={`relative inline-flex whitespace-nowrap py-3 text-[14px] leading-none tracking-tight text-black ${
                  active ? "font-bold" : "font-normal"
                }`}
              >
                {item.label}
                {active ? (
                  <span
                    aria-hidden
                    className="absolute inset-x-0 bottom-0 h-[3px] bg-black"
                  />
                ) : null}
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
