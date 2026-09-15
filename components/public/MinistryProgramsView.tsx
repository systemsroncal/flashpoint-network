import Image from "next/image";
import Link from "next/link";
import type {
  MinistryProgram,
  MinistryProgramsSortMode,
} from "@/lib/types/cms";
import { getSiteName } from "@/lib/env";

const SORT_LABELS: Record<MinistryProgramsSortMode, string> = {
  manual: "Featured order",
  a_z: "A–Z",
  z_a: "Z–A",
  random: "Shuffled",
  newest: "Newest first",
};

export default function MinistryProgramsView({
  programs,
  sortMode,
}: {
  programs: MinistryProgram[];
  sortMode: MinistryProgramsSortMode;
}) {
  const siteName = getSiteName();

  return (
    <div className="bg-white text-black">
      <div className="relative overflow-hidden border-b border-black/10 bg-[var(--fpn-navy)] text-white">
        <div
          className="pointer-events-none absolute inset-0 opacity-40"
          style={{
            background:
              "radial-gradient(ellipse 80% 60% at 15% 15%, rgba(225,6,0,0.32), transparent 55%), radial-gradient(ellipse 50% 40% at 90% 85%, rgba(255,255,255,0.08), transparent 50%)",
          }}
        />
        <div className="relative mx-auto max-w-[1440px] px-4 py-10 md:px-8 lg:px-10 lg:py-14">
          <p className="text-xs font-bold uppercase tracking-[0.18em] text-[var(--fpn-rojo)]">
            {siteName}
          </p>
          <h1 className="mt-2 font-article text-3xl font-black tracking-tight md:text-5xl">
            Ministry Programs
          </h1>
          <p className="mt-3 max-w-2xl text-sm text-white/70 md:text-base">
            Gospel-centered broadcasts and pastoral teaching from FlashPoint
            Television Network.
          </p>
          <p className="mt-4 text-[11px] font-bold uppercase tracking-[0.14em] text-white/45">
            Sorted · {SORT_LABELS[sortMode]}
          </p>
        </div>
      </div>

      <div className="mx-auto max-w-[1440px] px-4 py-10 md:px-8 lg:px-10">
        {programs.length === 0 ? (
          <div className="rounded-[12px] border border-dashed border-black/15 px-6 py-16 text-center">
            <h2 className="font-article text-2xl font-black tracking-tight">
              No ministry programs listed
            </h2>
            <p className="mx-auto mt-2 max-w-md text-sm text-black/60">
              Check back soon for teaching and worship broadcasts.
            </p>
            <Link
              href="/"
              className="mt-6 inline-flex rounded-md bg-[var(--fpn-rojo)] px-5 py-2.5 text-sm font-bold text-white"
            >
              Back to home
            </Link>
          </div>
        ) : (
          <ul className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {programs.map((program, index) => (
              <li
                key={program.id}
                className="animate-[fpnFadeUp_0.55s_ease-out_both]"
                style={{ animationDelay: `${Math.min(index, 10) * 45}ms` }}
              >
                <Link
                  href={`/ministry-programs/${program.slug}`}
                  className="group flex h-full flex-col overflow-hidden rounded-[12px] border border-black/10 bg-white transition duration-300 hover:border-[var(--fpn-rojo)]/40 hover:shadow-[0_12px_32px_rgba(11,15,20,0.08)]"
                >
                  <div className="relative aspect-square overflow-hidden bg-[#0B1220]">
                    {program.featured_image_url ? (
                      <Image
                        src={program.featured_image_url}
                        alt={program.title}
                        fill
                        className="object-cover transition duration-500 group-hover:scale-[1.04]"
                        sizes="(max-width:768px) 100vw, 33vw"
                      />
                    ) : (
                      <span className="absolute inset-0 flex items-center justify-center text-sm font-bold uppercase tracking-wide text-white/40">
                        Ministry
                      </span>
                    )}
                    <span className="absolute inset-x-0 bottom-0 h-1/3 bg-gradient-to-t from-black/55 to-transparent opacity-80 transition group-hover:opacity-100" />
                  </div>
                  <div className="flex flex-1 flex-col p-4">
                    {program.schedule_note ? (
                      <p className="text-[11px] font-bold uppercase tracking-[0.12em] text-[var(--fpn-rojo)]">
                        {program.schedule_note}
                      </p>
                    ) : null}
                    <h2 className="mt-2 font-article text-xl font-black leading-snug tracking-tight transition-colors group-hover:text-[var(--fpn-rojo)]">
                      {program.title}
                    </h2>
                    {program.excerpt ? (
                      <p className="mt-2 line-clamp-2 text-sm text-black/65">
                        {program.excerpt}
                      </p>
                    ) : null}
                    <p className="mt-auto pt-4 text-xs font-semibold text-black/45 transition-colors group-hover:text-[var(--fpn-rojo)]">
                      View details →
                    </p>
                  </div>
                </Link>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
