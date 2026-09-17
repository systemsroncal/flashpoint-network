"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useRef, useState } from "react";

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
    return pathname === "/";
  }
  return pathname === href || pathname.startsWith(`${href}/`);
}

export default function MobileCategoryBar({ items }: Props) {
  const pathname = usePathname() || "/";
  const listRef = useRef<HTMLUListElement>(null);
  const [spread, setSpread] = useState(false);

  useEffect(() => {
    const el = listRef.current;
    if (!el) return;

    const sync = () => {
      setSpread(el.scrollWidth <= el.clientWidth + 2);
    };

    sync();
    const observer = new ResizeObserver(sync);
    observer.observe(el);
    window.addEventListener("resize", sync);

    return () => {
      observer.disconnect();
      window.removeEventListener("resize", sync);
    };
  }, [items]);

  return (
    <nav
      aria-label="Sections"
      className="w-full max-w-none border-b border-[#E5E5E5] bg-white"
    >
      <ul
        ref={listRef}
        className={`flex w-full max-w-none flex-nowrap overflow-x-auto overscroll-x-contain px-3 scrollbar-none sm:px-3 [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden ${
          spread
            ? "justify-between gap-2"
            : "justify-start gap-5 after:block after:h-px after:w-3 after:shrink-0 after:content-['']"
        }`}
      >
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
