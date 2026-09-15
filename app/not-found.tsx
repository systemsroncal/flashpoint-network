import Link from "next/link";

export default function NotFound() {
  return (
    <div className="mx-auto flex min-h-[60vh] max-w-xl flex-col items-center justify-center px-4 py-16 text-center">
      <p className="text-xs font-bold uppercase tracking-[0.2em] text-[var(--fpn-rojo)]">
        404
      </p>
      <h1 className="mt-3 font-[family-name:var(--font-fraunces)] text-3xl font-bold tracking-tight text-[#001F3F] md:text-4xl">
        Page not found
      </h1>
      <p className="mt-3 text-sm text-black/65">
        That story or section isn&apos;t available. Head back to the latest
        coverage.
      </p>
      <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
        <Link
          href="/"
          className="inline-flex rounded-md bg-[var(--fpn-rojo)] px-5 py-2.5 text-sm font-bold text-white"
        >
          Home
        </Link>
        <Link
          href="/events"
          className="inline-flex rounded-md border border-black/15 px-5 py-2.5 text-sm font-bold text-black"
        >
          Events
        </Link>
      </div>
    </div>
  );
}
