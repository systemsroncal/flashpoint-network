import Link from "next/link";
import { updatePasswordAction } from "@/lib/auth/actions";

export const dynamic = "force-dynamic";

type Props = {
  searchParams: Promise<{ error?: string; done?: string }>;
};

export default async function UpdatePasswordPage({ searchParams }: Props) {
  const params = await searchParams;

  return (
    <div className="rounded-2xl border border-white/15 bg-white/95 p-6 text-[#111] shadow-2xl backdrop-blur sm:p-8">
      <h1 className="font-[family-name:var(--font-fraunces)] text-3xl font-bold tracking-tight text-[#001F3F]">
        Choose a new password
      </h1>
      <p className="mt-2 text-sm text-black/65">
        Enter a strong password for your FPN account.
      </p>

      {params.done ? (
        <p className="mt-4 rounded-lg bg-emerald-50 px-3 py-2 text-sm text-emerald-800">
          Password updated.{" "}
          <Link href="/login" className="font-semibold underline">
            Sign in
          </Link>
        </p>
      ) : null}
      {params.error ? (
        <p className="mt-4 rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700">
          {params.error}
        </p>
      ) : null}

      {!params.done ? (
        <form action={updatePasswordAction} className="mt-6 space-y-4">
          <label className="block space-y-1.5">
            <span className="text-xs font-bold uppercase tracking-wide text-black/55">
              New password
            </span>
            <input
              name="password"
              type="password"
              required
              minLength={8}
              autoComplete="new-password"
              className="w-full rounded-lg border border-black/15 bg-white px-3 py-2.5 text-sm outline-none ring-[var(--fpn-rojo)] focus:ring-2"
            />
          </label>
          <button
            type="submit"
            className="w-full rounded-lg bg-[var(--fpn-rojo)] px-4 py-3 text-sm font-bold text-white hover:brightness-110"
          >
            Update password
          </button>
        </form>
      ) : null}
    </div>
  );
}
