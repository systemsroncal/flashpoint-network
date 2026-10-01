import { Buffer as NodeBuffer } from "node:buffer";
import ExcelJS from "exceljs";

const DAY_HEADERS = [
  "sunday",
  "monday",
  "tuesday",
  "wednesday",
  "thursday",
  "friday",
  "saturday",
] as const;

export type ScheduleExcelWeeklySlot = {
  start: string;
  programs: string[];
};

export type ScheduleExcelImportRow = {
  air_date: string;
  start_time: string;
  end_time: string;
  title: string;
  description: null;
  category: string;
  color: string;
};

function cellText(value: ExcelJS.CellValue): string {
  if (value == null) return "";
  if (typeof value === "string" || typeof value === "number") {
    return String(value).trim();
  }
  if (typeof value === "object" && "text" in value && typeof value.text === "string") {
    return value.text.trim();
  }
  if (typeof value === "object" && "result" in value) {
    return cellText(value.result as ExcelJS.CellValue);
  }
  return String(value).trim();
}

function cleanTitle(raw: string): string {
  return String(raw || "")
    .replace(/\s+/g, " ")
    .replace(/''/g, "'")
    .trim();
}

export function inferScheduleCategory(title: string): string {
  const t = title.toLowerCase();
  if (/flashpoint|flash point/.test(t)) return "flashpoint";
  if (
    /lucy|mickey|margie|joan|ozzie|dragnet|roy rogers|petticoat|annie oakley|howdy|bonanza|hawkeye|robin hood|captain z|love that bob|trouble with father|stories of the century|public defender|movie time|faithville|dusty|miss\. charity|gospel time|god's generals|faith on film/i.test(
      t,
    )
  ) {
    return "classic";
  }
  if (/news|vfi/.test(t)) return "news";
  if (/movie/.test(t)) return "movie";
  return "ministry";
}

export function scheduleCategoryColor(cat: string): string {
  switch (cat) {
    case "flashpoint":
      return "#E10600";
    case "classic":
      return "#1B2A64";
    case "news":
      return "#0F766E";
    case "movie":
      return "#7C3AED";
    default:
      return "#B80529";
  }
}

function parseTimeLabel(label: string, forcePm = false): string | null {
  const s = String(label).trim();
  const m = s.match(/^(\d{1,2}):(\d{2})\s*(AM|PM)?$/i);
  if (!m) return null;
  let hour = Number(m[1]);
  const minute = Number(m[2]);
  let meridiem = (m[3] || "").toUpperCase();
  if (!meridiem) meridiem = forcePm ? "PM" : "AM";
  if (meridiem === "AM") {
    if (hour === 12) hour = 0;
  } else if (hour !== 12) {
    hour += 12;
  }
  return `${String(hour).padStart(2, "0")}:${String(minute).padStart(2, "0")}:00`;
}

function parseExcelTimeCell(value: ExcelJS.CellValue): string | null {
  if (value instanceof Date) {
    const h = value.getUTCHours();
    const m = value.getUTCMinutes();
    return `${String(h).padStart(2, "0")}:${String(m).padStart(2, "0")}:00`;
  }
  if (typeof value === "number" && Number.isFinite(value)) {
    const totalMinutes = Math.round(value * 24 * 60);
    const h = Math.floor(totalMinutes / 60) % 24;
    const m = totalMinutes % 60;
    return `${String(h).padStart(2, "0")}:${String(m).padStart(2, "0")}:00`;
  }
  const text = cellText(value);
  if (!text) return null;
  const forcePm = /\bPM\b/i.test(text);
  return parseTimeLabel(text.replace(/\s*(AM|PM)\s*/i, " $1"), forcePm);
}

function addMinutes(timeHms: string, mins: number): string {
  const [h, m] = timeHms.split(":").map(Number);
  const total = h * 60 + m + mins;
  const nh = Math.floor(total / 60) % 24;
  const nm = total % 60;
  return `${String(nh).padStart(2, "0")}:${String(nm).padStart(2, "0")}:00`;
}

function findDayColumnMap(ws: ExcelJS.Worksheet): {
  headerRow: number;
  timeCol: number;
  dayCols: number[];
} {
  for (let r = 1; r <= Math.min(ws.rowCount, 15); r++) {
    const row = ws.getRow(r);
    const hits: { col: number; dayIndex: number }[] = [];
    row.eachCell({ includeEmpty: false }, (cell, col) => {
      const t = cellText(cell.value).toLowerCase();
      const idx = DAY_HEADERS.indexOf(t as (typeof DAY_HEADERS)[number]);
      if (idx >= 0) hits.push({ col, dayIndex: idx });
    });
    if (hits.length >= 5) {
      hits.sort((a, b) => a.dayIndex - b.dayIndex);
      const timeCol = Math.max(1, hits[0].col - 1);
      return {
        headerRow: r,
        timeCol,
        dayCols: hits.map((h) => h.col),
      };
    }
  }
  throw new Error(
    "Could not find a header row with Sunday–Saturday. Check the weekly grid layout.",
  );
}

export function parseScheduleWeeklyGrid(ws: ExcelJS.Worksheet): ScheduleExcelWeeklySlot[] {
  const { headerRow, timeCol, dayCols } = findDayColumnMap(ws);
  if (dayCols.length !== 7) {
    throw new Error(`Expected 7 day columns, found ${dayCols.length}.`);
  }

  const slots: ScheduleExcelWeeklySlot[] = [];
  for (let r = headerRow + 1; r <= ws.rowCount; r++) {
    const row = ws.getRow(r);
    const timeVal = row.getCell(timeCol).value;
    const start = parseExcelTimeCell(timeVal);
    if (!start) continue;

    const programs = dayCols.map((col) => cleanTitle(cellText(row.getCell(col).value)));
    if (programs.every((p) => !p)) continue;

    slots.push({ start, programs });
  }

  if (slots.length === 0) {
    throw new Error("No time rows found under the day headers.");
  }

  slots.sort((a, b) => a.start.localeCompare(b.start));
  return slots;
}

export function expandWeeklyGridToMonth(
  year: number,
  month: number,
  weeklySlots: ScheduleExcelWeeklySlot[],
): ScheduleExcelImportRow[] {
  const entries: ScheduleExcelImportRow[] = [];
  const daysInMonth = new Date(year, month, 0).getDate();

  for (let day = 1; day <= daysInMonth; day++) {
    const date = new Date(Date.UTC(year, month - 1, day));
    const dow = date.getUTCDay();

    for (let i = 0; i < weeklySlots.length; i++) {
      const slot = weeklySlots[i];
      const title = slot.programs[dow];
      if (!title) continue;

      const next = weeklySlots[i + 1];
      let end = next ? next.start : addMinutes(slot.start, 30);
      if (end <= slot.start) end = addMinutes(slot.start, 30);

      const category = inferScheduleCategory(title);
      entries.push({
        air_date: `${year}-${String(month).padStart(2, "0")}-${String(day).padStart(2, "0")}`,
        start_time: slot.start,
        end_time: end,
        title,
        description: null,
        category,
        color: scheduleCategoryColor(category),
      });
    }
  }

  return entries;
}

export async function parseScheduleProgramsWorkbook(
  buffer: Buffer,
  year: number,
  month: number,
): Promise<ScheduleExcelImportRow[]> {
  const workbook = new ExcelJS.Workbook();
  const nodeBuf = NodeBuffer.from(buffer);
  await workbook.xlsx.load(nodeBuf as unknown as ArrayBuffer);

  const ws = workbook.worksheets[0];
  if (!ws) throw new Error("The workbook has no sheets.");

  const weekly = parseScheduleWeeklyGrid(ws);
  const entries = expandWeeklyGridToMonth(year, month, weekly);
  if (entries.length === 0) {
    throw new Error("No schedule entries generated for the selected month.");
  }
  return entries;
}
