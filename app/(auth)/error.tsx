"use client";

import Link from "next/link";
import { useEffect } from "react";

export default function AuthError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error("[auth]", error);
  }, [error]);

  return (
    <div className="rounded-2xl border border-white/15 bg-white/95 p-6 text-[#111] shadow-2xl backdrop-blur sm:p-8">
      <h1 className="font-[family-name:var(--font-fraunces)] text-3xl font-bold tracking-tight text-[#001F3F]">
        Something went wrong
      </h1>
      <p className="mt-2 text-sm text-black/65">
        We couldn&apos;t finish that request. You can try again or return to
        sign in — the form is still available.
      </p>
      <div className="mt-6 flex flex-col gap-3 sm:flex-row">
        <button
          type="button"
          onClick={reset}
          className="rounded-lg bg-[var(--fpn-rojo)] px-4 py-3 text-sm font-bold text-white"
        >
          Try again
        </button>
        <Link
          href="/login"
          className="rounded-lg border border-black/15 px-4 py-3 text-center text-sm font-bold"
        >
          Sign in
        </Link>
        <Link
          href="/forgot-password"
          className="rounded-lg border border-black/15 px-4 py-3 text-center text-sm font-bold"
        >
          Reset password
        </Link>
      </div>
    </div>
  );
}
