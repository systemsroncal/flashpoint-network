"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { signOutAction } from "@/lib/auth/actions";

export type HeaderUser = {
  email: string;
  displayName: string;
  isStaff: boolean;
};

export default function HeaderUserMenu({
  user,
  tone = "light",
}: {
  user: HeaderUser | null;
  tone?: "light" | "dark";
}) {
  const [open, setOpen] = useState(false);
  const rootRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    const onPointer = (e: MouseEvent) => {
      if (!rootRef.current?.contains(e.target as Node)) setOpen(false);
    };
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false);
    };
    document.addEventListener("mousedown", onPointer);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("mousedown", onPointer);
      document.removeEventListener("keydown", onKey);
    };
  }, [open]);

  const iconClass =
    tone === "dark" ? "text-black" : "text-white";

  if (!user) {
    return (
      <Link
        href="/login"
        aria-label="Sign in"
        className={`inline-flex h-9 w-9 items-center justify-center hover:opacity-80 ${iconClass}`}
      >
        <UserIcon />
      </Link>
    );
  }

  const initial =
    user.displayName.trim()[0]?.toUpperCase() ||
    user.email[0]?.toUpperCase() ||
    "?";

  return (
    <div ref={rootRef} className="relative">
      <button
        type="button"
        aria-label="Account menu"
        aria-expanded={open}
        onClick={() => setOpen((v) => !v)}
        className={`inline-flex h-9 w-9 items-center justify-center rounded-full border border-white/25 bg-white/10 text-[13px] font-bold hover:bg-white/20 ${iconClass}`}
      >
        {initial}
      </button>
      {open ? (
        <div
          role="menu"
          className="absolute right-0 top-full z-50 mt-2 w-[min(100vw-2rem,280px)] rounded-lg border border-black/10 bg-white py-2 text-left text-black shadow-[0_12px_40px_rgba(0,0,0,0.18)]"
        >
          <div className="border-b border-black/8 px-4 py-3">
            <p className="text-sm font-bold leading-snug">{user.displayName}</p>
            <p className="mt-0.5 truncate text-xs text-black/55">{user.email}</p>
          </div>
          {user.isStaff ? (
            <Link
              href="/admin"
              role="menuitem"
              className="block px-4 py-2.5 text-sm font-semibold hover:bg-black/5"
              onClick={() => setOpen(false)}
            >
              Admin
            </Link>
          ) : null}
          <form action={signOutAction} className="border-t border-black/8 px-2 pt-1">
            <button
              type="submit"
              role="menuitem"
              className="w-full rounded-md px-2 py-2.5 text-left text-sm font-semibold text-[var(--fpn-rojo)] hover:bg-black/5"
            >
              Sign out
            </button>
          </form>
        </div>
      ) : null}
    </div>
  );
}

function UserIcon() {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" aria-hidden>
      <circle cx="12" cy="8" r="4" stroke="currentColor" strokeWidth="1.75" />
      <path
        d="M5 20c1.5-3.5 4.2-5 7-5s5.5 1.5 7 5"
        stroke="currentColor"
        strokeWidth="1.75"
        strokeLinecap="round"
      />
    </svg>
  );
}
