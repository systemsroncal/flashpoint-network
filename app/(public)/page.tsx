import Link from "next/link";

export default function HomePage() {
  return (
    <div className="mx-auto max-w-6xl px-4 py-16">
      <p className="text-sm font-medium uppercase tracking-[0.2em] text-[#E85D04]">
        Flash Point Network
      </p>
      <h1 className="mt-3 max-w-2xl text-4xl font-semibold tracking-tight text-[#001F3F] sm:text-5xl">
        Digital newspaper platform
      </h1>
      <p className="mt-4 max-w-xl text-base leading-7 text-[#5A6A85]">
        Phase 1 scaffold is live: Next.js App Router, Tailwind public stubs, and
        a Modernize-based admin shell. Public home design and CMS features arrive
        in later phases.
      </p>
      <div className="mt-8 flex flex-wrap gap-3">
        <Link
          href="/admin"
          className="inline-flex items-center rounded bg-[#001F3F] px-4 py-2.5 text-sm font-medium text-white hover:bg-[#003366]"
        >
          Open admin
        </Link>
        <Link
          href="/api/health"
          className="inline-flex items-center rounded border border-[#001F3F]/20 px-4 py-2.5 text-sm font-medium text-[#001F3F] hover:bg-[#F7F8FA]"
        >
          Health check
        </Link>
      </div>
    </div>
  );
}
