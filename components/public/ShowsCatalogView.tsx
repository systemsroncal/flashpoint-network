"use client";

import Image from "next/image";
import Link from "next/link";
import { useMemo } from "react";
import LiveTvIcon from "@/components/public/LiveTvIcon";
import type { ClassicProgram } from "@/lib/types/cms";

const PAGE_MAX = "mx-auto max-w-[1728px] px-4 md:px-8 xl:px-[96px]";
const HERO_IMAGE = "/brand/network-programs/family-camera.png";

export type ShowsCatalogVariant = "classic" | "children";

type BottomCta = {
  backgroundImage: string;
  title: string;
  body: string;
  buttonLabel: string;
  buttonHref: string;
};

type Props = {
  variant: ShowsCatalogVariant;
  programs: ClassicProgram[];
};

function formatScheduleLine(line: string): string {
  return line
    .replace(/\s*[-–]\s*/g, " · ")
    .replace(/\s+/g, " ")
    .trim();
}

function scheduleLines(program: ClassicProgram): string[] {
  if (program.schedule_line?.trim()) {
    return [formatScheduleLine(program.schedule_line)];
  }
  if (program.schedule_note?.trim()) {
    return [formatScheduleLine(program.schedule_note)];
  }
  return [];
}

function ProgramCard({
  program,
  index,
}: {
  program: ClassicProgram;
  index: number;
}) {
  const lines = scheduleLines(program);
  return (
    <li
      className="min-w-0 animate-[fpnFadeUp_0.55s_ease-out_both]"
      style={{ animationDelay: `${Math.min(index, 12) * 40}ms` }}
    >
      <article className="w-full text-left">
        <div className="relative aspect-square w-full overflow-hidden rounded-[6px] bg-[#19191c]">
          {program.featured_image_url ? (
            <Image
              src={program.featured_image_url}
              alt=""
              fill
              className="object-cover"
              sizes="(max-width:640px) 100vw, (max-width:1280px) 33vw, 25vw"
            />
          ) : (
            <span className="absolute inset-0 flex items-center justify-center text-xs font-bold uppercase tracking-wide text-white/20">
              FPTN
            </span>
          )}
          {program.genre ? (
            <span className="absolute left-2 top-2 rounded-[3px] bg-black/70 px-2 py-0.5 text-[10px] font-bold uppercase tracking-[0.1em] text-white">
              {program.genre}
            </span>
          ) : null}
        </div>
        <h2 className="mt-3.5 font-sans text-[17px] font-bold leading-snug text-[#faf9f6]">
          {program.title}
        </h2>
        {lines.length > 0 ? (
          <ul className="mt-1.5 space-y-0.5">
            {lines.map((line) => (
              <li
                key={line}
                className="text-[12px] leading-[1.35] text-[#a8a5a3] md:text-[13px]"
              >
                {line}
              </li>
            ))}
          </ul>
        ) : null}
      </article>
    </li>
  );
}

const COPY: Record<
  ShowsCatalogVariant,
  {
    heroEyebrow: string;
    heroTitle: string;
    heroTitleAccent?: string;
    heroBody: string;
    gridEyebrow: string;
    gridTitle: string;
    bottom: BottomCta;
  }
> = {
  classic: {
    heroEyebrow: "Great television. Timeless stories.",
    heroTitle: "Your classic",
    heroTitleAccent: "favorites.",
    heroBody:
      "The laughs you remember. The characters you love. Rediscover the golden age of television, only on FPTN.",
    gridEyebrow: "Weekday classics",
    gridTitle: "Your classic favorites",
    bottom: {
      backgroundImage: HERO_IMAGE,
      title: "Network programs",
      body:
        "Messages that point you to Jesus. Discover teaching, worship and revival on FPTN.",
      buttonLabel: "Watch the Network Programs",
      buttonHref: "/network-programs",
    },
  },
  children: {
    heroEyebrow: "Fun, faith, timeless favorites",
    heroTitle: "Big adventures for",
    heroTitleAccent: "little hearts.",
    heroBody:
      "Classic characters, fun-filled lessons, Bible stories and family-friendly shows made for kids to enjoy.",
    gridEyebrow: "Fun, faith, timeless favorites",
    gridTitle: "Shows kids can grow with",
    bottom: {
      backgroundImage: "/brand/catalog/children/children-last-section-bg.png",
      title: "Network programs",
      body:
        "Messages that point you to Jesus. Discover teaching, worship and revival on FPTN.",
      buttonLabel: "Watch the Network Programs",
      buttonHref: "/network-programs",
    },
  },
};

export default function ShowsCatalogView({ variant, programs }: Props) {
  const copy = COPY[variant];
  const gridPrograms = useMemo(
    () => [...programs].sort((a, b) => (a.sort_order ?? 0) - (b.sort_order ?? 0)),
    [programs],
  );

  const heroSrc =
    variant === "children"
      ? "/brand/catalog/children/Section.png"
      : HERO_IMAGE;

  return (
    <div className="min-h-full bg-[#101011] text-white">
      <section className="relative min-h-[420px] overflow-hidden md:min-h-[520px] lg:min-h-[580px]">
        <Image
          src={heroSrc}
          alt=""
          fill
          className="object-cover object-center"
          priority
          sizes="100vw"
        />
        <div
          className="absolute inset-0"
          style={{
            backgroundImage:
              "linear-gradient(90deg, rgba(0,0,0,0.55) 0%, rgba(0,0,0,0.45) 100%), linear-gradient(0deg, #101011 0%, rgba(16,16,17,0) 35%), linear-gradient(90deg, rgba(8,8,9,0.82) 0%, rgba(8,8,9,0.4) 50%, rgba(8,8,9,0.15) 100%)",
          }}
          aria-hidden
        />
        <div
          className={`relative flex min-h-[420px] flex-col justify-end pb-10 pt-16 md:min-h-[520px] md:pb-14 lg:min-h-[580px] ${PAGE_MAX}`}
        >
          <div className="flex max-w-[853px] flex-col">
            <div className="flex items-center gap-3 pt-3">
              <span className="h-[3px] w-6 shrink-0 bg-[#e52b36]" aria-hidden />
              <p className="text-[13px] font-bold uppercase tracking-[0.22em] text-[#e0dbd7]">
                {copy.heroEyebrow}
              </p>
            </div>
            <h1 className="mt-7 font-sans text-4xl font-black leading-[1.05] tracking-[-0.04em] text-[#faf9f6] md:text-6xl lg:text-[72px] lg:leading-[1.05]">
              {copy.heroTitle}
              {copy.heroTitleAccent ? (
                <>
                  <br />
                  <span className="text-[#e8e0d5]">{copy.heroTitleAccent}</span>
                </>
              ) : null}
            </h1>
            <p className="mt-7 max-w-xl text-base leading-relaxed text-[#c9c6c4] md:text-[19px] md:leading-8">
              {copy.heroBody}
            </p>
            <div className="mt-8">
              <Link
                href="/live"
                className="fpn-live-cta fpn-live-cta--hero fpn-live-cta--ministry inline-flex"
              >
                <LiveTvIcon />
                We are live
              </Link>
            </div>
          </div>
        </div>
      </section>

      <section className={`${PAGE_MAX} pb-14 pt-12 md:pt-16`}>
        <p className="text-xs font-bold uppercase tracking-[0.18em] text-[#aaa4a2]">
          {copy.gridEyebrow}
        </p>
        <h2 className="mt-3 font-sans text-[2.75rem] font-bold leading-tight tracking-[-0.03em] text-[#faf9f6] md:text-[45px]">
          {copy.gridTitle}
        </h2>

        {programs.length === 0 ? (
          <div className="mt-12 rounded-2xl border border-dashed border-white/15 px-6 py-16 text-center">
            <h3 className="text-2xl font-bold tracking-tight">No programs listed</h3>
            <p className="mx-auto mt-2 max-w-md text-sm text-white/50">
              Check back soon for new shows.
            </p>
            <Link
              href="/"
              className="mt-6 inline-flex rounded-md bg-[var(--fpn-rojo)] px-5 py-2.5 text-sm font-bold text-white"
            >
              Back to home
            </Link>
          </div>
        ) : (
          <ul className="mt-10 grid grid-cols-1 gap-x-5 gap-y-10 min-[400px]:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {gridPrograms.map((program, index) => (
              <ProgramCard key={program.id} program={program} index={index} />
            ))}
          </ul>
        )}
      </section>

      <section className="relative overflow-hidden border-t border-white/5">
        <div className="absolute inset-0 bg-[#0d0d0d]" aria-hidden />
        <Image
          src={copy.bottom.backgroundImage}
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
            {copy.bottom.title}
          </p>
          <p className="mt-5 max-w-2xl text-base font-medium tracking-wide text-white md:text-[23px] md:leading-normal md:tracking-[0.05em]">
            {copy.bottom.body}
          </p>
          <Link
            href={copy.bottom.buttonHref}
            className="mt-8 inline-flex rounded-[15px] border-2 border-[#ffcb2c] bg-[#0d0d0d] px-8 py-4 text-lg font-bold tracking-wide text-white transition hover:bg-[#151515]"
          >
            {copy.bottom.buttonLabel}
          </Link>
        </div>
      </section>
    </div>
  );
}
