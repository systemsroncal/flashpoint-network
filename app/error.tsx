"use client";

import Link from "next/link";
import { useEffect } from "react";

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <div className="mx-auto flex min-h-[50vh] max-w-xl flex-col items-center justify-center px-4 py-16 text-center">
      <p className="text-xs font-bold uppercase tracking-[0.2em] text-[var(--fpn-rojo)]">
        Error
      </p>
      <h1 className="mt-3 font-[family-name:var(--font-fraunces)] text-3xl font-bold tracking-tight text-[#001F3F]">
        Couldn&apos;t load this page
      </h1>
      <p className="mt-3 text-sm text-black/65">
        An unexpected error occurred. Try again, or go back home.
      </p>
      <div className="mt-8 flex flex-wrap justify-center gap-3">
        <button
          type="button"
          onClick={reset}
          className="rounded-md bg-[var(--fpn-rojo)] px-5 py-2.5 text-sm font-bold text-white"
        >
          Try again
        </button>
        <Link
          href="/"
          className="rounded-md border border-black/15 px-5 py-2.5 text-sm font-bold"
        >
          Home
        </Link>
      </div>
    </div>
  );
}
