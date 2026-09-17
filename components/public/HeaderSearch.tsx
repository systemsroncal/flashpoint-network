"use client";

import Image from "next/image";
import { useRouter } from "next/navigation";
import { useEffect, useId, useRef, useState, type FormEvent } from "react";

type Props = {
  initialQuery?: string;
};

export default function HeaderSearch({ initialQuery = "" }: Props) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [q, setQ] = useState(initialQuery);
  const inputRef = useRef<HTMLInputElement>(null);
  const panelId = useId();

  useEffect(() => {
    if (!open) return;
    inputRef.current?.focus();
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false);
    };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [open]);

  const submit = (e: FormEvent) => {
    e.preventDefault();
    const query = q.trim();
    if (!query) {
      router.push("/search");
    } else {
      router.push(`/search?q=${encodeURIComponent(query)}`);
    }
    setOpen(false);
  };

  return (
    <div className="relative">
      <button
        type="button"
        aria-label={open ? "Close search" : "Search"}
        aria-expanded={open}
        aria-controls={panelId}
        onClick={() => setOpen((v) => !v)}
        className="inline-flex h-6 w-6 items-center justify-center hover:opacity-80"
      >
        <Image src="/brand/search.svg" alt="" width={23} height={23} />
      </button>

      {open ? (
        <form
          id={panelId}
          onSubmit={submit}
          className="absolute right-0 top-full z-50 mt-3 flex w-[min(92vw,320px)] items-center gap-2 rounded-md border border-white/20 bg-[var(--fpn-navy)] p-2 shadow-xl"
        >
          <input
            ref={inputRef}
            type="search"
            name="q"
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="Search news…"
            className="min-w-0 flex-1 rounded bg-white/10 px-3 py-2 text-sm text-white outline-none placeholder:text-white/50 focus:bg-white/15"
            autoComplete="off"
          />
          <button
            type="submit"
            className="shrink-0 rounded bg-[var(--fpn-rojo)] px-3 py-2 text-xs font-bold uppercase tracking-wide text-white hover:brightness-110"
          >
            Go
          </button>
        </form>
      ) : null}
    </div>
  );
}
