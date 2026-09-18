"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import type {
  ScheduleDisplayMode,
  ScheduleEntry,
  SchedulePdf,
} from "@/lib/types/cms";
import { isBrandScheduleColor } from "@/lib/schedule/display-color";

const MONTH_NAMES = [
  "January",
  "February",
  "March",
  "April",
  "May",
  "June",
  "July",
  "August",
  "September",
  "October",
  "November",
  "December",
];

function formatTime(t: string) {
  const [hh, mm] = t.split(":").map(Number);
  const d = new Date();
  d.setHours(hh, mm, 0, 0);
  return d.toLocaleTimeString("en-US", {
    hour: "numeric",
    minute: "2-digit",
  });
}

function shiftMonth(year: number, month: number, delta: number) {
  const d = new Date(year, month - 1 + delta, 1);
  return { year: d.getFullYear(), month: d.getMonth() + 1 };
}

export default function ScheduleProgramsView({
  year,
  month,
  entries,
  displayMode,
  pdf,
  siteName,
}: {
  year: number;
  month: number;
  entries: ScheduleEntry[];
  displayMode: ScheduleDisplayMode;
  pdf: SchedulePdf | null;
  siteName: string;
}) {
  const daysInMonth = new Date(year, month, 0).getDate();
  const byDate = useMemo(() => {
    const map = new Map<string, ScheduleEntry[]>();
    for (const e of entries) {
      const list = map.get(e.air_date) ?? [];
      list.push(e);
      map.set(e.air_date, list);
    }
    return map;
  }, [entries]);

  const defaultDay = useMemo(() => {
    const today = new Date();
    if (today.getFullYear() === year && today.getMonth() + 1 === month) {
      return today.getDate();
    }
    return 1;
  }, [year, month]);

  const [selectedDay, setSelectedDay] = useState(defaultDay);
  const airDate = `${year}-${String(month).padStart(2, "0")}-${String(selectedDay).padStart(2, "0")}`;
  const dayEntries = byDate.get(airDate) ?? [];
  const prev = shiftMonth(year, month, -1);
  const next = shiftMonth(year, month, 1);
  const showDynamic = displayMode === "dynamic" || displayMode === "both";
  const showPdf = displayMode === "pdf" || displayMode === "both";
  const localPdf = month === 9 && year === 2026 ? "/schedules/september-2026.pdf" : null;
  const pdfHref = pdf?.pdf_url || localPdf;

  return (
    <div className="bg-white text-black">
      <div className="relative overflow-hidden border-b border-black/10 bg-[var(--fpn-navy)] text-white">
        <div
          className="pointer-events-none absolute inset-0 opacity-35"
          style={{
            background:
              "radial-gradient(ellipse 70% 50% at 80% 0%, rgba(255,73,13,0.35), transparent 55%)",
          }}
        />
        <div className="relative mx-auto max-w-[1440px] px-4 py-10 md:px-8 lg:px-10 lg:py-14">
          <p className="text-xs font-bold uppercase tracking-[0.18em] text-[var(--fpn-rojo)]">
            {siteName}
          </p>
          <h1 className="mt-2 font-article text-3xl font-black tracking-tight md:text-5xl">
            Schedule / Programs
          </h1>
          <p className="mt-3 max-w-2xl text-sm text-white/70 md:text-base">
            Eastern Time broadcast grid — pick a day to see what’s on FlashPoint
            Television Network.
          </p>
          <div className="mt-6 flex flex-wrap items-center gap-3">
            <Link
              href={`/schedule-programs?year=${prev.year}&month=${prev.month}`}
              className="rounded-md border border-white/30 px-3 py-1.5 text-sm font-semibold text-white/90 hover:bg-white/10"
            >
              ← {MONTH_NAMES[prev.month - 1]}
            </Link>
            <p className="font-article text-xl font-black tracking-tight md:text-2xl">
              {MONTH_NAMES[month - 1]} {year}
            </p>
            <Link
              href={`/schedule-programs?year=${next.year}&month=${next.month}`}
              className="rounded-md border border-white/30 px-3 py-1.5 text-sm font-semibold text-white/90 hover:bg-white/10"
            >
              {MONTH_NAMES[next.month - 1]} →
            </Link>
          </div>
        </div>
      </div>

      <div className="mx-auto max-w-[1440px] space-y-10 px-4 py-10 md:px-8 lg:px-10">
        {showDynamic ? (
          <section>
            <div className="mb-4 flex flex-wrap gap-2">
              {Array.from({ length: daysInMonth }, (_, i) => i + 1).map((day) => {
                const date = new Date(year, month - 1, day);
                const weekday = date.toLocaleDateString("en-US", {
                  weekday: "short",
                });
                const active = day === selectedDay;
                const key = `${year}-${String(month).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
                const has = (byDate.get(key)?.length ?? 0) > 0;
                return (
                  <button
                    key={day}
                    type="button"
                    onClick={() => setSelectedDay(day)}
                    className={`min-w-[3.25rem] rounded-md border px-2 py-2 text-center transition ${
                      active
                        ? "border-[var(--fpn-rojo)] bg-[var(--fpn-rojo)] text-white"
                        : has
                          ? "border-black/15 bg-white hover:border-[var(--fpn-rojo)]/50"
                          : "border-dashed border-black/10 text-black/35"
                    }`}
                  >
                    <span className="block text-[10px] font-bold uppercase tracking-wide opacity-80">
                      {weekday}
                    </span>
                    <span className="block text-sm font-black">{day}</span>
                  </button>
                );
              })}
            </div>

            <div className="rounded-[12px] border border-black/10">
              <div className="border-b border-black/10 bg-[#0B0F14] px-4 py-3 text-white">
                <p className="text-xs font-bold uppercase tracking-[0.14em] text-white/55">
                  Day lineup · ET
                </p>
                <h2 className="font-article text-2xl font-black tracking-tight">
                  {new Date(year, month - 1, selectedDay).toLocaleDateString(
                    "en-US",
                    {
                      weekday: "long",
                      month: "long",
                      day: "numeric",
                      year: "numeric",
                    },
                  )}
                </h2>
              </div>
              {dayEntries.length === 0 ? (
                <div className="px-4 py-12 text-center text-sm text-black/55">
                  No schedule entries for this day yet.
                </div>
              ) : (
                <ul className="divide-y divide-black/8">
                  {dayEntries.map((entry) => (
                    <li
                      key={entry.id}
                      className="flex flex-col gap-2 px-4 py-3 sm:flex-row sm:items-center sm:gap-4"
                    >
                      <p className="w-36 shrink-0 text-sm font-bold text-[var(--fpn-navy)]">
                        {formatTime(entry.start_time)}
                        {entry.end_time ? (
                          <span className="font-medium text-black/45">
                            {" "}
                            – {formatTime(entry.end_time)}
                          </span>
                        ) : null}
                      </p>
                      <div className="min-w-0 flex-1">
                        <p className="font-article text-lg font-black leading-snug tracking-tight">
                          {entry.title}
                        </p>
                        {entry.description ? (
                          <p className="mt-0.5 text-sm text-black/60">
                            {entry.description}
                          </p>
                        ) : null}
                      </div>
                      {entry.category ? (
                        <span
                          className={`inline-flex shrink-0 rounded px-2 py-1 text-[10px] font-bold uppercase tracking-wide ${
                            isBrandScheduleColor(entry.color)
                              ? "bg-[#0B0F14] text-white"
                              : "text-white"
                          }`}
                          style={
                            isBrandScheduleColor(entry.color)
                              ? undefined
                              : {
                                  backgroundColor:
                                    entry.color || "var(--fpn-rojo)",
                                }
                          }
                        >
                          {entry.category}
                        </span>
                      ) : null}
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </section>
        ) : null}

        {showPdf && pdfHref ? (
          <section>
            <div className="mb-4 flex flex-wrap items-end justify-between gap-3">
              <div>
                <h2 className="font-article text-2xl font-black tracking-tight">
                  Monthly PDF
                </h2>
                <p className="text-sm text-black/60">
                  {pdf?.title || `${MONTH_NAMES[month - 1]} ${year} grid`}
                </p>
              </div>
              <a
                href={pdfHref}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex rounded-md bg-[var(--fpn-rojo)] px-4 py-2 text-sm font-bold text-white hover:brightness-110"
              >
                Download PDF
              </a>
            </div>
            <div className="overflow-hidden rounded-[12px] border border-black/10 bg-neutral-100">
              <iframe
                title="Schedule PDF"
                src={pdfHref}
                className="h-[70vh] w-full"
              />
            </div>
          </section>
        ) : null}

        {!showDynamic && !showPdf ? (
          <div className="rounded-[12px] border border-dashed border-black/15 px-6 py-16 text-center">
            <h2 className="font-article text-2xl font-black">Schedule unavailable</h2>
            <p className="mt-2 text-sm text-black/60">
              Display mode is not configured for this month.
            </p>
          </div>
        ) : null}
      </div>
    </div>
  );
}
