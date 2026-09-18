"use client";

import Image from "next/image";
import Link from "next/link";
import { useCallback, useEffect, useId, useMemo, useState } from "react";
import LiveTvIcon from "@/components/public/LiveTvIcon";
import type { MinistryProgram } from "@/lib/types/cms";

/** Last row divider: programs at or above this sort_order sit below the rule (Figma). */
const BOTTOM_ROW_SORT_FROM = 190;
const PAGE_MAX = "mx-auto max-w-[1728px] px-4 md:px-8 xl:px-[96px]";
const HERO_IMAGE =
  "https://fptn.com/uploads/2026-09-18/db1ce1c7-e18c-475d-b4d9-cf125da4a913.webp";

function formatScheduleLine(line: string): string {
  return line
    .replace(/\s*[-–]\s*/g, " · ")
    .replace(/\s+/g, " ")
    .trim();
}

function scheduleLines(program: MinistryProgram): string[] {
  const detail = program.schedule_detail?.trim();
  if (detail) {
    return detail
      .split(/\r?\n/)
      .map((line) => formatScheduleLine(line))
      .filter(Boolean);
  }
  if (program.schedule_line) {
    return [formatScheduleLine(program.schedule_line)];
  }
  if (program.schedule_note) {
    return [formatScheduleLine(program.schedule_note)];
  }
  return [];
}

function modalBlurb(program: MinistryProgram): string {
  const raw = program.description || program.excerpt || "";
  const trimmed = raw.replace(/\s+/g, " ").trim();
  if (trimmed.length > 20 && !/^smiling man|^portrait of|^black and white/i.test(trimmed)) {
    return trimmed;
  }
  if (program.schedule_note) {
    return `${program.title} airs ${program.schedule_note.replace(/\.$/, "")} on FlashPoint Television Network.`;
  }
  return `${program.title} on FlashPoint Television Network.`;
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

function ProgramCard({
  program,
  index,
  onInfo,
}: {
  program: MinistryProgram;
  index: number;
  onInfo: () => void;
}) {
  const lines = scheduleLines(program);
  return (
    <li
      className="min-w-0 animate-[fpnFadeUp_0.55s_ease-out_both]"
      style={{ animationDelay: `${Math.min(index, 12) * 40}ms` }}
    >
      <button type="button" onClick={onInfo} className="group w-full cursor-pointer text-left">
        <div className="relative aspect-square w-full overflow-hidden rounded-[6px] bg-[#19191c]">
          {program.featured_image_url ? (
            <Image
              src={program.featured_image_url}
              alt=""
              fill
              className="object-cover transition duration-500 group-hover:scale-[1.02]"
              sizes="(max-width:640px) 100vw, (max-width:1280px) 33vw, 18vw"
            />
          ) : (
            <span className="absolute inset-0 flex items-center justify-center text-xs font-bold uppercase tracking-wide text-white/20">
              FPTN
            </span>
          )}
          <span
            className="absolute bottom-3 right-3 flex h-8 w-8 items-center justify-center rounded-full border border-white/60 bg-[rgba(16,16,17,0.79)] font-serif text-lg italic leading-none text-[#faf9f6]"
            aria-hidden
          >
            i
          </span>
        </div>
        <h2 className="mt-3.5 font-sans text-[17px] font-bold leading-snug text-[#faf9f6]">
          {program.title}
        </h2>
        {program.host_name ? (
          <p className="mt-1.5 text-[15px] text-[#ccc3b8]">{program.host_name}</p>
        ) : null}
        {lines.length > 0 ? (
          <ul className="mt-1.5 space-y-0.5">
            {lines.map((line) => (
              <li key={line} className="text-[12px] leading-[1.35] text-[#a8a5a3] md:text-[13px]">
                {line}
              </li>
            ))}
          </ul>
        ) : null}
      </button>
    </li>
  );
}

export default function MinistryProgramsView({
  programs,
}: {
  programs: MinistryProgram[];
  siteName?: string;
}) {
  const [activeId, setActiveId] = useState<string | null>(null);
  const titleId = useId();
  const active = programs.find((p) => p.id === activeId) ?? null;

  const gridPrograms = useMemo(
    () => [...programs].sort((a, b) => (a.sort_order ?? 0) - (b.sort_order ?? 0)),
    [programs],
  );
  const bottomRowStartIndex = useMemo(
    () => gridPrograms.findIndex((p) => (p.sort_order ?? 0) >= BOTTOM_ROW_SORT_FROM),
    [gridPrograms],
  );

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

  const activeLines = active ? scheduleLines(active) : [];

  return (
    <div className="min-h-full bg-[#101011] text-white">
      <section className="relative min-h-[420px] overflow-hidden md:min-h-[520px] lg:min-h-[580px]">
        <Image
          src={HERO_IMAGE}
          alt=""
          fill
          className="object-cover object-[center_20%]"
          priority
          sizes="100vw"
        />
        <div
          className="absolute inset-0"
          style={{
            backgroundImage:
              "linear-gradient(90deg, rgba(0,0,0,0.5) 0%, rgba(0,0,0,0.5) 100%), linear-gradient(0deg, #101011 0%, rgba(16,16,17,0) 35%), linear-gradient(90deg, rgba(8,8,9,0.79) 0%, rgba(8,8,9,0.35) 45%, rgba(8,8,9,0) 72%)",
          }}
          aria-hidden
        />
        <div className={`relative flex min-h-[420px] flex-col justify-end pb-10 pt-16 md:min-h-[520px] md:pb-14 lg:min-h-[580px] ${PAGE_MAX}`}>
          <div className="flex max-w-[853px] flex-col">
            <div className="flex items-center gap-3 pt-3">
              <span className="h-[3px] w-6 shrink-0 bg-[#e52b36]" aria-hidden />
              <p className="text-[13px] font-bold uppercase tracking-[0.22em] text-[#e0dbd7]">
                Faith at the center
              </p>
            </div>
            <h1 className="mt-7 font-sans text-4xl font-black leading-[1.05] tracking-[-0.04em] text-[#faf9f6] md:text-6xl lg:text-[85px] lg:leading-[1.05]">
              Rooted in the Word.
              <br />
              <span className="text-[#e8e0d5]">Alive in faith.</span>
            </h1>
            <p className="mt-7 max-w-xl text-base leading-relaxed text-[#c9c6c4] md:text-[19px] md:leading-8">
              Messages that point you to Jesus.
              <br className="hidden sm:block" />
              <span className="sm:whitespace-pre"> Discover teaching, worship and revival on FPTN.</span>
            </p>
            <div className="mt-8">
              <Link href="/live" className="fpn-live-cta fpn-live-cta--hero fpn-live-cta--ministry inline-flex">
                <LiveTvIcon />
                We are live
              </Link>
            </div>
          </div>
        </div>
      </section>

      <section className={`${PAGE_MAX} pb-14 pt-12 md:pt-16`}>
        <h2 className="font-sans text-[2.75rem] font-bold leading-tight tracking-[-0.03em] text-[#faf9f6] md:text-[45px]">
          FPTN Shows
        </h2>

        <p className="mt-6 text-xs font-bold uppercase tracking-[0.18em] text-[#aaa4a2]">
          Grounded in scripture. Centered on Jesus.
        </p>

        {programs.length === 0 ? (
          <div className="mt-12 rounded-2xl border border-dashed border-white/15 px-6 py-16 text-center">
            <h3 className="text-2xl font-bold tracking-tight">No network programs listed</h3>
            <p className="mx-auto mt-2 max-w-md text-sm text-white/50">
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
          <ul
            className="mt-10 grid grid-cols-1 gap-x-5 gap-y-10 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5"
          >
            {gridPrograms.flatMap((program, index) => {
              const divider =
                bottomRowStartIndex >= 0 && index === bottomRowStartIndex
                  ? [
                      <li
                        key="fptn-shows-bottom-divider"
                        className="col-span-full mt-2 border-t border-white/10 pt-10"
                        aria-hidden
                      />,
                    ]
                  : [];
              return [
                ...divider,
                <ProgramCard
                  key={program.id}
                  program={program}
                  index={index}
                  onInfo={() => setActiveId(program.id)}
                />,
              ];
            })}
          </ul>
        )}
      </section>

      <section className={`${PAGE_MAX} hidden pb-10`}>
        <div className="relative flex min-h-[99px] flex-col items-start justify-center gap-4 overflow-hidden rounded-[15px] bg-[#1b1b1b] py-4 pl-[120px] pr-4 md:flex-row md:items-center md:justify-between md:pl-[150px] md:pr-8">
          <div className="pointer-events-none absolute bottom-0 left-3 top-0 w-[120px] md:left-6 md:w-[158px]">
            <Image
              src="/brand/network-programs/advertise-camera.png"
              alt=""
              fill
              className="object-contain object-left"
              sizes="158px"
            />
          </div>
          <p className="text-base font-medium tracking-wide text-white md:text-[23px] md:tracking-[0.05em]">
            Reach our growing audience of 5 million Americans.
          </p>
          <Link
            href="/subscribe"
            className="shrink-0 rounded-full bg-white px-9 py-3 text-center text-[17px] font-bold text-[#101011] transition hover:bg-white/90"
          >
            Learn more
          </Link>
        </div>
      </section>

      <section className="relative hidden overflow-hidden border-t border-white/5">
        <div className="absolute inset-0 bg-[#0d0d0d]" aria-hidden />
        <Image
          src="/brand/network-programs/family-camera.png"
          alt=""
          fill
          className="object-cover object-center opacity-35"
          sizes="100vw"
        />
        <div
          className="absolute inset-0 bg-gradient-to-r from-[#0d0d0d] via-[#0d0d0d]/90 to-transparent"
          aria-hidden
        />
        <div className={`relative py-16 md:py-20 ${PAGE_MAX}`}>
          <p className="font-sans text-4xl font-bold uppercase tracking-[0.12em] text-white md:text-[58px] md:leading-none">
            Family programs
          </p>
          <p className="mt-5 max-w-2xl text-base font-medium tracking-wide text-white md:text-[23px] md:leading-normal md:tracking-[0.05em]">
            The laughs you remember. The characters you love.
            <br />
            Rediscover the golden age of television, only on FPTN.
          </p>
          <Link
            href="/classic-programs"
            className="mt-8 inline-flex rounded-[15px] border-2 border-[#ffcb2c] bg-[#0d0d0d] px-8 py-4 text-lg font-bold tracking-wide text-white transition hover:bg-[#151515]"
          >
            Watch Family Programs
          </Link>
        </div>
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
            <div className="relative aspect-square shrink-0 bg-[#1a1a1a]">
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
                FPTN Shows
              </p>
              <h2
                id={titleId}
                className="mt-2 font-sans text-2xl font-bold leading-tight tracking-tight text-white sm:text-[1.75rem]"
              >
                {active.title}
              </h2>
              {active.host_name ? (
                <p className="mt-2 text-sm text-[#ccc3b8]">{active.host_name}</p>
              ) : null}
              <p className="mt-4 text-sm leading-relaxed text-white/55">{modalBlurb(active)}</p>
              {activeLines.length > 0 ? (
                <ul className="mt-5 space-y-1 border-t border-white/10 pt-5">
                  {activeLines.map((line) => (
                    <li key={line} className="text-sm text-[#d2cfd0]">{line}</li>
                  ))}
                </ul>
              ) : null}
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
