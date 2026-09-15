"use client";

import Link from "next/link";
import { useEffect } from "react";

export default function GlobalError({
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
    <html lang="en">
      <body className="flex min-h-screen flex-col items-center justify-center bg-white px-4 text-center text-[#111]">
        <p className="text-xs font-bold uppercase tracking-[0.2em] text-[#E85D04]">
          Error
        </p>
        <h1 className="mt-3 text-3xl font-bold tracking-tight">
          Something went wrong
        </h1>
        <p className="mt-3 max-w-md text-sm text-black/65">
          We hit an unexpected problem loading this page. Try again, or return
          home.
        </p>
        <div className="mt-8 flex gap-3">
          <button
            type="button"
            onClick={reset}
            className="rounded-md bg-[#E85D04] px-5 py-2.5 text-sm font-bold text-white"
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
      </body>
    </html>
  );
}
