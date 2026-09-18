"use client";

import Link from "next/link";
import { useEffect, useMemo } from "react";
import { withPublicAuthAccess } from "@/lib/auth/public-auth-gate";

export default function AuthError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  const kind = useMemo(() => {
    const msg = error?.message || "";
    if (/Invalid URL|ERR_INVALID_URL/i.test(msg)) return "site-url" as const;
    if (
      /Failed to find Server Action|was not found on the server|unexpected response/i.test(
        msg,
      )
    ) {
      return "stale-action" as const;
    }
    return "generic" as const;
  }, [error]);

  useEffect(() => {
    console.error("[auth]", error);
  }, [error]);

  const title =
    kind === "site-url"
      ? "Configuration issue"
      : kind === "stale-action"
        ? "App was updated"
        : "Something went wrong";

  const body =
    kind === "site-url"
      ? "Duplicated or invalid site URL detected. Check Supabase Auth Site URL and PM2 env, then sign in again."
      : kind === "stale-action"
        ? "This tab is on an old build after a deploy. Reload sign-in (hard refresh) and try again — your redirect will be kept when possible."
        : "We couldn't finish that request. You can try again or return to sign in — the form is still available.";

  const loginHref =
    kind === "site-url"
      ? withPublicAuthAccess(
          `/login?error=${encodeURIComponent(
            "Site URL is misconfigured (app env, PM2, or Supabase Auth → Site URL). Use a single origin like https://fptn.com, then rebuild and pm2 restart --update-env.",
          )}`,
        )
      : kind === "stale-action"
        ? withPublicAuthAccess(
            `/login?error=${encodeURIComponent(
              "The app was updated. Please hard-refresh and sign in again.",
            )}`,
          )
        : withPublicAuthAccess("/login");

  return (
    <div className="rounded-2xl border border-white/15 bg-white/95 p-6 text-[#111] shadow-2xl backdrop-blur sm:p-8">
      <h1 className="font-[family-name:var(--font-fraunces)] text-3xl font-bold tracking-tight text-[#001F3F]">
        {title}
      </h1>
      <p className="mt-2 text-sm text-black/65">{body}</p>
      <div className="mt-6 flex flex-col gap-3 sm:flex-row">
        <button
          type="button"
          onClick={() => {
            if (kind === "stale-action") {
              window.location.assign(loginHref);
              return;
            }
            reset();
          }}
          className="rounded-lg bg-[var(--fpn-rojo)] px-4 py-3 text-sm font-bold text-white"
        >
          {kind === "stale-action" ? "Reload sign-in" : "Try again"}
        </button>
        <Link
          href={loginHref}
          className="rounded-lg border border-black/15 px-4 py-3 text-center text-sm font-bold"
        >
          Sign in
        </Link>
        <Link
          href={withPublicAuthAccess("/forgot-password")}
          className="rounded-lg border border-black/15 px-4 py-3 text-center text-sm font-bold"
        >
          Reset password
        </Link>
      </div>
    </div>
  );
}
