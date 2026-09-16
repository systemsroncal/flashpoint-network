"use client";

import Link from "next/link";
import { useEffect } from "react";

/**
 * Root error UI — never echo raw Internal Server Error / Invalid URL.
 * Auth routes should hit (auth)/error.tsx first; this is the backstop.
 */
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

  const msg = error?.message || "";
  const isSiteUrl = /Invalid URL|ERR_INVALID_URL/i.test(msg);
  const loginHref = isSiteUrl
    ? `/login?error=${encodeURIComponent(
        "Site URL is misconfigured. Use a single origin like https://fptn.com, then rebuild and pm2 restart --update-env.",
      )}`
    : "/login";

  return (
    <div className="mx-auto flex min-h-[50vh] max-w-xl flex-col items-center justify-center px-4 py-16 text-center">
      <p className="text-xs font-bold uppercase tracking-[0.2em] text-[var(--fpn-rojo)]">
        Error
      </p>
      <h1 className="mt-3 font-[family-name:var(--font-fraunces)] text-3xl font-bold tracking-tight text-[#001F3F]">
        {isSiteUrl ? "Configuration issue" : "Couldn't load this page"}
      </h1>
      <p className="mt-3 text-sm text-black/65">
        {isSiteUrl
          ? "Duplicated site URL detected (often CyberPanel SITE_URL). Fix env, rebuild, and sign in again."
          : "An unexpected error occurred. Try again, sign in, or go back home."}
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
          href={loginHref}
          className="rounded-md border border-black/15 px-5 py-2.5 text-sm font-bold"
        >
          Sign in
        </Link>
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
