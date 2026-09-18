"use client";

import Link from "next/link";
import { useMemo } from "react";
import type { ScheduleEntry, SchedulePdf } from "@/lib/types/cms";
import { scheduleEntryDisplayColor } from "@/lib/schedule/display-color";

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

const DAYS = [
  "SUNDAY",
  "MONDAY",
  "TUESDAY",
  "WEDNESDAY",
  "THURSDAY",
  "FRIDAY",
  "SATURDAY",
] as const;

function shiftMonth(year: number, month: number, delta: number) {
  const d = new Date(year, month - 1 + delta, 1);
  return { year: d.getFullYear(), month: d.getMonth() + 1 };
}

function hhmm(t: string) {
  return t.slice(0, 5);
}

function formatSlotLabel(t: string) {
  const [hh, mm] = t.split(":").map(Number);
  const d = new Date();
  d.setHours(hh, mm, 0, 0);
  return d.toLocaleTimeString("en-US", {
    hour: "numeric",
    minute: "2-digit",
  });
}

function halfHourSlots(startHour: number, endHourExclusive: number) {
  const slots: string[] = [];
  for (let h = startHour; h < endHourExclusive; h++) {
    slots.push(`${String(h).padStart(2, "0")}:00:00`);
    slots.push(`${String(h).padStart(2, "0")}:30:00`);
  }
  return slots;
}

const AM_SLOTS = halfHourSlots(0, 12);
const PM_SLOTS = halfHourSlots(12, 24);

function isoDate(d: Date) {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}

/** First Sunday that falls inside the displayed month. */
function weekDates(year: number, month: number): string[] {
  const first = new Date(year, month - 1, 1);
  const start = new Date(first);
  const add = (7 - first.getDay()) % 7;
  start.setDate(first.getDate() + add);
  return Array.from({ length: 7 }, (_, i) => {
    const d = new Date(start);
    d.setDate(start.getDate() + i);
    return isoDate(d);
  });
}

function accentForTitle(title: string, fallback: string | null): string {
  const t = title.toLowerCase();
  if (/flashpoint live/.test(t)) return "#E8C547";
  if (/flashpoint\s*\(pm\)|flashpoint \(pm\)/.test(t)) return "#E85A4A";
  if (/flashpoint\s*\(\d/.test(t) || /flashpoint \(\d/.test(t)) return "#F0A202";
  if (t.includes("flashpoint")) return "#E8C547";
  if (t.includes("news")) return "#7EC8E8";
  if (t.includes("movie") || t.includes("cinema")) return "#C084FC";
  if (fallback) return fallback;
  return "#F3E6C8";
}

type Cell = { title: string; color: string } | null;

function buildGrid(entries: ScheduleEntry[], dates: string[]) {
  const byKey = new Map<string, ScheduleEntry>();
  for (const e of entries) {
    byKey.set(`${e.air_date}|${hhmm(e.start_time)}`, e);
  }
  const lookup = (slot: string, dayIndex: number): Cell => {
    const date = dates[dayIndex];
    const e =
      byKey.get(`${date}|${hhmm(slot)}`) ??
      byKey.get(`${date}|${slot.slice(0, 8)}`);
    if (!e) return null;
    const accent = accentForTitle(e.title, e.color);
    return {
      title: e.title,
      color: scheduleEntryDisplayColor(e.color, accent),
    };
  };
  return lookup;
}

function GridTable({
  rangeLabel,
  slots,
  lookup,
}: {
  rangeLabel: string;
  slots: string[];
  lookup: (slot: string, dayIndex: number) => Cell;
}) {
  return (
    <div className="overflow-x-auto">
      <p className="mb-2 text-[11px] font-semibold uppercase tracking-[0.16em] text-white/55">
        {rangeLabel}
      </p>
      <table className="w-full min-w-[920px] border-collapse text-left">
        <thead>
          <tr className="text-[10px] font-bold uppercase tracking-[0.12em] text-white/70">
            <th className="w-[72px] py-2 pr-2 font-bold">Time</th>
            {DAYS.map((d) => (
              <th key={d} className="px-1 py-2 font-bold">
                {d}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {slots.map((slot) => (
            <tr key={slot} className="border-t border-white/8">
              <td className="whitespace-nowrap py-1.5 pr-2 align-middle text-[11px] font-semibold text-white/45">
                {formatSlotLabel(slot)}
              </td>
              {DAYS.map((_, dayIndex) => {
                const cell = lookup(slot, dayIndex);
                return (
                  <td key={`${slot}-${dayIndex}`} className="px-1 py-1.5 align-middle">
                    {cell ? (
                      <span
                        className="block truncate text-[11px] font-semibold leading-tight md:text-[12px]"
                        style={{ color: cell.color }}
                        title={cell.title}
                      >
                        {cell.title}
                      </span>
                    ) : (
                      <span className="text-white/15">—</span>
                    )}
                  </td>
                );
              })}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export default function ScheduleWeeklyGridView({
  year,
  month,
  entries,
  pdfHref,
  pdfTitle,
}: {
  year: number;
  month: number;
  entries: ScheduleEntry[];
  pdfHref: string | null;
  pdfTitle: string;
}) {
  const prev = shiftMonth(year, month, -1);
  const next = shiftMonth(year, month, 1);
  const dates = useMemo(() => weekDates(year, month), [year, month]);
  const lookup = useMemo(() => buildGrid(entries, dates), [entries, dates]);

  return (
    <div className="bg-white text-black">
      <style>{`
        @media print {
          header, footer, .schedule-week-nav { display: none !important; }
          .schedule-week-card { box-shadow: none !important; }
        }
      `}</style>
      <div className="schedule-week-nav mx-auto max-w-[1440px] px-4 pb-6 pt-10 md:px-8 md:pt-14 lg:px-10">
        <div className="mb-6 flex flex-wrap items-center justify-center gap-3 text-sm">
          <Link
            href={`/schedule-programs?year=${prev.year}&month=${prev.month}`}
            className="rounded-md border border-black/15 px-3 py-1.5 font-semibold text-black/70 hover:border-black/40"
          >
            ← {MONTH_NAMES[prev.month - 1]}
          </Link>
          <Link
            href={`/schedule-programs?year=${next.year}&month=${next.month}`}
            className="rounded-md border border-black/15 px-3 py-1.5 font-semibold text-black/70 hover:border-black/40"
          >
            {MONTH_NAMES[next.month - 1]} →
          </Link>
        </div>
        <h1 className="text-center font-article text-[2rem] font-black leading-[1.15] tracking-[-0.03em] text-black md:text-5xl lg:text-[4.2rem] lg:leading-[1.05]">
          Broadcast schedule as of
          <br />
          {MONTH_NAMES[month - 1]} {year}
        </h1>
      </div>

      <div className="mx-auto max-w-[1680px] px-3 pb-12 md:px-6 lg:px-10">
        <div
          className="schedule-week-card rounded-[17px] px-3 py-6 shadow-[0_20px_60px_rgba(11,26,52,0.35)] md:px-6 md:py-8 lg:px-8"
          style={{
            background:
              "linear-gradient(180deg, #152448 0%, #0B1A38 42%, #0A1428 100%)",
          }}
        >
          <GridTable
            rangeLabel="12:00 AM – 11:30 AM"
            slots={AM_SLOTS}
            lookup={lookup}
          />
          <div className="my-8 h-px bg-white/10" />
          <GridTable
            rangeLabel="12:00 PM – 11:30 PM"
            slots={PM_SLOTS}
            lookup={lookup}
          />

          <div className="mt-8 flex flex-col items-start justify-between gap-3 border-t border-white/10 pt-5 sm:flex-row sm:items-center">
            <p className="text-[11px] text-white/40">
              Programming subject to change · All times Eastern
            </p>
            <div className="flex flex-wrap gap-2">
              <button
                type="button"
                onClick={() => window.print()}
                className="rounded-md bg-[#C45C12] px-4 py-2 text-[11px] font-bold uppercase tracking-[0.12em] text-white hover:brightness-110"
              >
                Print schedule
              </button>
              {pdfHref ? (
                <a
                  href={pdfHref}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="rounded-md bg-[#8B1E1E] px-4 py-2 text-[11px] font-bold uppercase tracking-[0.12em] text-white hover:brightness-110"
                >
                  View more
                </a>
              ) : null}
            </div>
          </div>
        </div>
        <p className="mt-3 text-center text-[11px] text-black/40">{pdfTitle}</p>
      </div>
    </div>
  );
}
