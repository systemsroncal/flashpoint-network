import Link from "next/link";
import { requestPasswordResetAction } from "@/lib/auth/actions";

export const dynamic = "force-dynamic";

type Props = {
  searchParams: Promise<{ error?: string; sent?: string }>;
};

export default async function ForgotPasswordPage({ searchParams }: Props) {
  const params = await searchParams;

  return (
    <div className="rounded-2xl border border-white/15 bg-white/95 p-6 text-[#111] shadow-2xl backdrop-blur sm:p-8">
      <h1 className="font-[family-name:var(--font-fraunces)] text-3xl font-bold tracking-tight text-[#001F3F]">
        Reset password
      </h1>
      <p className="mt-2 text-sm text-black/65">
        We&apos;ll email you a secure link to choose a new password.
      </p>

      {params.sent ? (
        <p className="mt-4 rounded-lg bg-emerald-50 px-3 py-2 text-sm text-emerald-800">
          If that email exists, a reset link is on the way. Also check spam.
        </p>
      ) : null}
      {params.error ? (
        <p className="mt-4 rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700">
          {params.error}
        </p>
      ) : null}

      <form action={requestPasswordResetAction} className="mt-6 space-y-4">
        <label className="block space-y-1.5">
          <span className="text-xs font-bold uppercase tracking-wide text-black/55">
            Email
          </span>
          <input
            name="email"
            type="email"
            required
            autoComplete="email"
            className="w-full rounded-lg border border-black/15 bg-white px-3 py-2.5 text-sm outline-none ring-[var(--fpn-rojo)] focus:ring-2"
          />
        </label>
        <button
          type="submit"
          className="w-full rounded-lg bg-[var(--fpn-rojo)] px-4 py-3 text-sm font-bold text-white hover:brightness-110"
        >
          Send reset link
        </button>
      </form>

      <p className="mt-6 text-center text-sm text-black/60">
        <Link
          href="/login"
          className="font-semibold text-[var(--fpn-rojo)] hover:underline"
        >
          Back to sign in
        </Link>
      </p>
    </div>
  );
}
