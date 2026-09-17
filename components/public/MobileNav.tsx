"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import HeaderSearch from "@/components/public/HeaderSearch";

type NavItem = {
  id: string;
  name: string;
  slug: string;
};

export default function MobileNav({
  items,
  showClassic = false,
  showSchedule = false,
  isLoggedIn = false,
  isStaff = false,
  tone = "light",
}: {
  items: NavItem[];
  showClassic?: boolean;
  showSchedule?: boolean;
  isLoggedIn?: boolean;
  isStaff?: boolean;
  /** `light` = white bars (navy header); `dark` = black bars (WaPo mobile). */
  tone?: "light" | "dark";
}) {
  const [open, setOpen] = useState(false);
  const barClass = tone === "dark" ? "bg-black" : "bg-white";

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false);
    };
    document.addEventListener("keydown", onKey);
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = prev;
    };
  }, [open]);

  return (
    <div className="xl:hidden">
      <button
        type="button"
        aria-label={open ? "Close menu" : "Open menu"}
        aria-expanded={open}
        onClick={() => setOpen((v) => !v)}
        className={`inline-flex h-9 w-9 items-center justify-center ${
          tone === "dark"
            ? "text-black"
            : "rounded-md border border-white/40 text-white"
        }`}
      >
        <span className="sr-only">Menu</span>
        <span className="flex flex-col gap-1.5" aria-hidden>
          <span
            className={`block h-0.5 w-4 transition ${barClass} ${open ? "translate-y-[7px] rotate-45" : ""}`}
          />
          <span
            className={`block h-0.5 w-4 transition ${barClass} ${open ? "opacity-0" : ""}`}
          />
          <span
            className={`block h-0.5 w-4 transition ${barClass} ${open ? "-translate-y-[7px] -rotate-45" : ""}`}
          />
        </span>
      </button>

      {open ? (
        <div className="fixed inset-0 z-50 bg-[var(--fpn-navy)]/98 text-white">
          <div className="mx-auto flex max-w-[1440px] items-center justify-between px-4 py-4 md:px-8">
            <p className="text-sm font-bold uppercase tracking-[0.18em]">
              Sections
            </p>
            <button
              type="button"
              aria-label="Close menu"
              onClick={() => setOpen(false)}
              className="inline-flex h-9 w-9 items-center justify-center rounded-md border border-white/40"
            >
              ✕
            </button>
          </div>
          <nav className="mx-auto max-h-[calc(100vh-5rem)] max-w-[1440px] overflow-y-auto px-4 pb-10 md:px-8">
            <div className="mb-6 flex items-center justify-between gap-3 rounded-md border border-white/20 px-3 py-2">
              <p className="text-xs font-bold uppercase tracking-wide text-white/60">
                Search
              </p>
              <HeaderSearch />
            </div>
            <ul className="divide-y divide-white/15 border-t border-white/15">
              {items.map((item) => (
                <li key={item.id}>
                  <Link
                    href={`/category/${item.slug}`}
                    onClick={() => setOpen(false)}
                    className="flex items-center justify-between py-4 text-lg font-black tracking-tight"
                  >
                    {item.name}
                    <span className="text-sm opacity-60">→</span>
                  </Link>
                </li>
              ))}
            </ul>
            <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:flex-wrap">
              {isLoggedIn && isStaff ? (
                <Link
                  href="/admin"
                  onClick={() => setOpen(false)}
                  className="inline-flex h-11 items-center justify-center rounded-md bg-[var(--fpn-rojo)] text-sm font-black text-white"
                >
                  Admin
                </Link>
              ) : null}
              {showSchedule ? (
                <Link
                  href="/schedule-programs"
                  onClick={() => setOpen(false)}
                  className="inline-flex h-11 items-center justify-center rounded-md border border-white/40 text-sm font-semibold"
                >
                  Schedule
                </Link>
              ) : null}
              {showClassic ? (
                <Link
                  href="/classic-programs"
                  onClick={() => setOpen(false)}
                  className="inline-flex h-11 items-center justify-center rounded-md border border-white/40 text-sm font-semibold"
                >
                  Classics
                </Link>
              ) : null}
            </div>
          </nav>
        </div>
      ) : null}
    </div>
  );
}
