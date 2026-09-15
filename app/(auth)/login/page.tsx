import Link from "next/link";
import { signInAction } from "@/lib/auth/actions";

type Props = {
  searchParams: Promise<{
    error?: string;
    next?: string;
    registered?: string;
  }>;
};

export default async function LoginPage({ searchParams }: Props) {
  const params = await searchParams;
  const next = params.next || "/";

  return (
    <div className="rounded-2xl border border-white/15 bg-white/95 p-6 text-[#111] shadow-2xl backdrop-blur sm:p-8">
      <h1 className="font-[family-name:var(--font-fraunces)] text-3xl font-bold tracking-tight text-[#001F3F]">
        Sign in
      </h1>
      <p className="mt-2 text-sm text-black/65">
        Access your FPN account or the newsroom admin.
      </p>

      {params.registered ? (
        <p className="mt-4 rounded-lg bg-emerald-50 px-3 py-2 text-sm text-emerald-800">
          Account created. Check your email if verification is required, then
          sign in.
        </p>
      ) : null}
      {params.error ? (
        <p className="mt-4 rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700">
          {params.error}
        </p>
      ) : null}

      <form action={signInAction} className="mt-6 space-y-4">
        <input type="hidden" name="next" value={next} />
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
        <label className="block space-y-1.5">
          <span className="text-xs font-bold uppercase tracking-wide text-black/55">
            Password
          </span>
          <input
            name="password"
            type="password"
            required
            autoComplete="current-password"
            className="w-full rounded-lg border border-black/15 bg-white px-3 py-2.5 text-sm outline-none ring-[var(--fpn-rojo)] focus:ring-2"
          />
        </label>
        <div className="flex justify-end">
          <Link
            href="/forgot-password"
            className="text-sm font-semibold text-[var(--fpn-rojo)] hover:underline"
          >
            Forgot password?
          </Link>
        </div>
        <button
          type="submit"
          className="w-full rounded-lg bg-[var(--fpn-rojo)] px-4 py-3 text-sm font-bold text-white hover:brightness-110"
        >
          Sign in
        </button>
      </form>

      <p className="mt-6 text-center text-sm text-black/60">
        New here?{" "}
        <Link
          href="/register"
          className="font-semibold text-[var(--fpn-rojo)] hover:underline"
        >
          Create an account
        </Link>
      </p>
    </div>
  );
}
