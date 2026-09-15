"use client";

import Image from "next/image";
import Link from "next/link";
import { useCallback, useEffect, useId, useState } from "react";
import type { ClassicProgram } from "@/lib/types/cms";

function scheduleDays(program: ClassicProgram): string {
  const note = program.schedule_note || "";
  if (/monday through friday/i.test(note)) return "Monday through Friday";
  if (/monday/i.test(note) && /friday/i.test(note)) return "Monday through Friday";
  return note.replace(/\s+at\s+.+$/i, "").trim() || "Weekdays";
}

function scheduleTime(program: ClassicProgram): string {
  const source = `${program.schedule_line || ""} ${program.schedule_note || ""}`;
  const m = source.match(/([0-9]{1,2}:[0-9]{2})\s*([AP]M)/i);
  if (!m) return program.schedule_line || program.schedule_note || "";
  return `${m[1]} ${m[2].toUpperCase()} ET`;
}

function cardSchedule(program: ClassicProgram): string {
  if (program.schedule_line) {
    return program.schedule_line
      .replace(/([0-9])([AP]M)/i, "$1 $2")
      .replace(/\s+/g, " ")
      .trim();
  }
  const time = scheduleTime(program);
  if (time) return `Mon–Fri · ${time}`;
  return "";
}

function InfoIcon({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      aria-hidden
      className={className}
      width="18"
      height="18"
    >
      <circle cx="12" cy="12" r="9" stroke="currentColor" strokeWidth="1.6" />
      <path
        d="M12 10.5v5.5M12 8.2v.2"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
      />
    </svg>
  );
}

function CloseIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" aria-hidden className={className} width="18" height="18">
      <path
        d="M7 7l10 10M17 7L7 17"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
      />
    </svg>
  );
}

function ExternalArrow({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" aria-hidden className={className} width="16" height="16">
      <path
        d="M7 17L17 7M10 7h7v7"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

export default function ClassicProgramsView({
  programs,
}: {
  programs: ClassicProgram[];
}) {
  const [activeId, setActiveId] = useState<string | null>(null);
  const titleId = useId();
  const active = programs.find((p) => p.id === activeId) ?? null;

  const close = useCallback(() => setActiveId(null), []);

  useEffect(() => {
    if (!active) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") close();
    };
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    document.addEventListener("keydown", onKey);
    return () => {
      document.body.style.overflow = prev;
      document.removeEventListener("keydown", onKey);
    };
  }, [active, close]);

  return (
    <div className="min-h-full bg-[#0B0B0B] text-white">
      <section className="mx-auto max-w-[1440px] px-4 py-10 md:px-8 lg:px-10 lg:py-14">
        <div className="flex flex-col gap-3 md:flex-row md:items-end md:justify-between md:gap-8">
          <div>
            <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-white/45">
              Familiar faces. Unforgettable moments.
            </p>
            <h1 className="mt-2 font-sans text-3xl font-bold tracking-tight text-white md:text-5xl">
              Your classic favorites
            </h1>
          </div>
          <p className="shrink-0 text-sm text-white/45 md:pb-1 md:text-right">
            On FPTN, Monday through Friday
          </p>
        </div>

        {programs.length === 0 ? (
          <div className="mt-12 rounded-2xl border border-dashed border-white/15 px-6 py-16 text-center">
            <h2 className="text-2xl font-bold tracking-tight">No classics listed</h2>
            <p className="mx-auto mt-2 max-w-md text-sm text-white/50">
              Check back soon for the weekday lineup.
            </p>
            <Link
              href="/"
              className="mt-6 inline-flex rounded-md bg-[var(--fpn-rojo)] px-5 py-2.5 text-sm font-bold text-white"
            >
              Back to home
            </Link>
          </div>
        ) : (
          <ul className="mt-10 grid gap-x-5 gap-y-8 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {programs.map((program, index) => {
              const schedule = cardSchedule(program);
              return (
                <li
                  key={program.id}
                  className="animate-[fpnFadeUp_0.55s_ease-out_both]"
                  style={{ animationDelay: `${Math.min(index, 8) * 45}ms` }}
                >
                  <button
                    type="button"
                    onClick={() => setActiveId(program.id)}
                    className="group w-full cursor-pointer text-left"
                  >
                    <div className="relative aspect-square overflow-hidden rounded-md bg-[#161616]">
                      {program.featured_image_url ? (
                        <Image
                          src={program.featured_image_url}
                          alt=""
                          fill
                          className="object-cover transition duration-500 group-hover:scale-[1.03]"
                          sizes="(max-width:640px) 100vw, (max-width:1280px) 33vw, 25vw"
                        />
                      ) : (
                        <span className="absolute inset-0 flex items-center justify-center text-xs font-bold uppercase tracking-wide text-white/30">
                          Classic
                        </span>
                      )}
                      {program.genre ? (
                        <span className="absolute left-2.5 top-2.5 rounded-[3px] bg-black/65 px-2 py-1 text-[10px] font-bold uppercase tracking-[0.12em] text-white backdrop-blur-[2px]">
                          {program.genre}
                        </span>
                      ) : null}
                      <div className="absolute inset-x-0 bottom-0 flex items-end justify-between gap-2 bg-gradient-to-t from-black/80 via-black/35 to-transparent px-2.5 pb-2.5 pt-10">
                        <span className="text-[10px] font-semibold uppercase tracking-[0.14em] text-white/70">
                          FPTN Classics
                        </span>
                        <span
                          className="inline-flex h-7 w-7 items-center justify-center rounded-full border border-white/55 text-white/90 transition group-hover:border-white group-hover:bg-white/10"
                          aria-hidden
                        >
                          <InfoIcon />
                        </span>
                      </div>
                    </div>
                    <h2 className="mt-3 font-sans text-[1.05rem] font-bold leading-snug tracking-tight text-white">
                      {program.title}
                    </h2>
                    {schedule ? (
                      <p className="mt-1 text-sm text-white/45">{schedule}</p>
                    ) : null}
                  </button>
                </li>
              );
            })}
          </ul>
        )}
      </section>

      {active ? (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6"
          role="dialog"
          aria-modal="true"
          aria-labelledby={titleId}
        >
          <button
            type="button"
            className="absolute inset-0 bg-black/70 backdrop-blur-[3px]"
            aria-label="Close dialog"
            onClick={close}
          />
          <div className="relative z-10 flex max-h-[min(92vh,860px)] w-full max-w-[440px] flex-col overflow-hidden rounded-2xl bg-[#121212] shadow-[0_24px_80px_rgba(0,0,0,0.55)] animate-[fpnFadeUp_0.35s_ease-out]">
            <div className="relative aspect-[4/3] shrink-0 bg-[#1a1a1a]">
              {active.featured_image_url ? (
                <Image
                  src={active.featured_image_url}
                  alt=""
                  fill
                  className="object-cover"
                  sizes="440px"
                  priority
                />
              ) : null}
              <button
                type="button"
                onClick={close}
                className="absolute right-3 top-3 inline-flex h-9 w-9 items-center justify-center rounded-full border border-white/70 bg-black/25 text-white backdrop-blur-sm transition hover:bg-black/45"
                aria-label="Close"
              >
                <CloseIcon />
              </button>
            </div>
            <div className="overflow-y-auto px-5 py-5 sm:px-6 sm:py-6">
              <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-white/45">
                FPTN Classic Collection
              </p>
              <h2
                id={titleId}
                className="mt-2 font-sans text-2xl font-bold leading-tight tracking-tight text-white sm:text-[1.75rem]"
              >
                {active.title}
              </h2>
              <p className="mt-2 text-sm text-white/50">
                {active.genres_label ||
                  (active.genre
                    ? `${active.genre} · Classic television`
                    : "Classic television")}
              </p>
              <div className="mt-5">
                <p className="text-sm text-white/50">{scheduleDays(active)}</p>
                <p className="mt-1 font-sans text-3xl font-bold tracking-tight text-white sm:text-4xl">
                  {scheduleTime(active)}
                </p>
              </div>
              <Link
                href="/schedule-programs"
                className="mt-7 inline-flex items-center gap-2 rounded-md bg-[var(--fpn-rojo)] px-4 py-2.5 text-sm font-bold text-white transition hover:brightness-110"
              >
                View network schedule
                <ExternalArrow />
              </Link>
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
}
