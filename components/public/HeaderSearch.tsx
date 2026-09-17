"use client";

import Image from "next/image";
import { useRouter } from "next/navigation";
import { useEffect, useId, useRef, useState, type FormEvent } from "react";

type Props = {
  initialQuery?: string;
  /** `light` = white icon (navy header); `dark` = black icon (WaPo mobile). */
  tone?: "light" | "dark";
  className?: string;
};

export default function HeaderSearch({
  initialQuery = "",
  tone = "light",
  className = "",
}: Props) {
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
    <>
      <button
        type="button"
        aria-label={open ? "Close search" : "Search"}
        aria-expanded={open}
        aria-controls={panelId}
        onClick={() => setOpen((v) => !v)}
        className={`inline-flex h-9 w-9 items-center justify-center hover:opacity-80 ${className}`}
      >
        {tone === "dark" ? (
          <svg
            width="22"
            height="22"
            viewBox="0 0 24 24"
            fill="none"
            aria-hidden
          >
            <circle
              cx="11"
              cy="11"
              r="7"
              stroke="currentColor"
              strokeWidth="2"
            />
            <path
              d="M20 20l-3.5-3.5"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
            />
          </svg>
        ) : (
          <Image src="/brand/search.svg" alt="" width={23} height={23} />
        )}
      </button>

      {open ? (
        <div
          id={panelId}
          role="dialog"
          aria-modal="true"
          aria-label="Search"
          className="absolute inset-x-0 top-full z-50 bg-white text-black shadow-[0_12px_28px_rgba(11,15,20,0.12)]"
        >
          <div className="relative mx-auto flex max-w-[1440px] flex-col items-center px-4 pb-14 pt-12 md:px-8 md:pb-16 md:pt-14 lg:px-10">
            <button
              type="button"
              aria-label="Close search"
              onClick={() => setOpen(false)}
              className="absolute right-3 top-3 inline-flex h-10 w-10 items-center justify-center text-[#B0B0B0] transition-colors hover:text-[#6B7280] md:right-6 md:top-4 lg:right-8"
            >
              <svg
                width="22"
                height="22"
                viewBox="0 0 24 24"
                fill="none"
                aria-hidden
              >
                <path
                  d="M6 6l12 12M18 6L6 18"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                />
              </svg>
            </button>

            <h2 className="font-article text-center text-[1.75rem] font-bold leading-tight tracking-tight text-black md:text-[2.25rem]">
              What are you looking for?
            </h2>

            <form
              onSubmit={submit}
              className="mt-8 flex w-full max-w-[540px] items-center rounded-full border border-[#D0D0D0] bg-white md:mt-10"
            >
              <input
                ref={inputRef}
                type="search"
                name="q"
                value={q}
                onChange={(e) => setQ(e.target.value)}
                placeholder="Search"
                className="min-w-0 flex-1 bg-transparent px-6 py-3.5 text-[16px] text-black outline-none placeholder:text-[#A3A3A3]"
                autoComplete="off"
              />
              <span
                className="h-7 w-px shrink-0 bg-[#D0D0D0]"
                aria-hidden
              />
              <button
                type="submit"
                aria-label="Submit search"
                className="mr-1.5 inline-flex h-11 w-11 shrink-0 items-center justify-center text-[#4B5563] transition-colors hover:text-black"
              >
                <svg
                  width="20"
                  height="20"
                  viewBox="0 0 24 24"
                  fill="none"
                  aria-hidden
                >
                  <circle
                    cx="11"
                    cy="11"
                    r="7"
                    stroke="currentColor"
                    strokeWidth="2"
                  />
                  <path
                    d="M20 20l-3.5-3.5"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                  />
                </svg>
              </button>
            </form>
          </div>
        </div>
      ) : null}
    </>
  );
}
