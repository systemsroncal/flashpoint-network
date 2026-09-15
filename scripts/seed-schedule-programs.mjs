#!/usr/bin/env node
/**
 * Seed September 2026 schedule from the attached/public PDF grid.
 * Uses pdfplumber via python helper for table extraction.
 *
 * Usage: node scripts/seed-schedule-programs.mjs
 */
import { createClient } from "@supabase/supabase-js";
import { readFileSync, writeFileSync, existsSync, mkdirSync, copyFileSync } from "node:fs";
import { resolve, dirname } from "node:path";
import { fileURLToPath } from "node:url";
import { spawnSync } from "node:child_process";

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = resolve(__dirname, "..");
const PDF_ATTACHED =
  "/cursor/stores/bc-4a455162-0030-4de5-96cf-ad19ed4659ba/media/schedule-september-2026.pdf";
const PDF_REMOTE =
  "https://img1.wsimg.com/blobby/go/d0b3ddce-59df-44df-ae95-8ef1cdbe6a2e/September%202026.pdf";
const YEAR = 2026;
const MONTH = 9;

function loadEnvFile(path) {
  if (!path || !existsSync(path)) return;
  for (const line of readFileSync(path, "utf8").split("\n")) {
    const m = line.match(/^\s*([A-Za-z_][A-Za-z0-9_]*)\s*=\s*(.*)\s*$/);
    if (!m) continue;
    let val = m[2];
    if (
      (val.startsWith('"') && val.endsWith('"')) ||
      (val.startsWith("'") && val.endsWith("'"))
    ) {
      val = val.slice(1, -1);
    }
    if (!process.env[m[1]]) process.env[m[1]] = val;
  }
}

loadEnvFile(process.env.SUPABASE_ENV_FILE);
loadEnvFile(resolve(ROOT, ".env.local"));
loadEnvFile(
  "/cursor/stores/bc-4a455162-0030-4de5-96cf-ad19ed4659ba/internal/supabase.env",
);

const DAYS = [
  "Sunday",
  "Monday",
  "Tuesday",
  "Wednesday",
  "Thursday",
  "Friday",
  "Saturday",
];

function cleanTitle(raw) {
  return String(raw || "")
    .replace(/\s+/g, " ")
    .replace(/''/g, "'")
    .trim();
}

function inferCategory(title) {
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

function categoryColor(cat) {
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
      return "#FF490D";
  }
}

function parseTimeLabel(label, forcePm = false) {
  const s = String(label).trim();
  const m = s.match(/^(\d{1,2}):(\d{2})\s*(AM|PM)?$/i);
  if (!m) return null;
  let hour = Number(m[1]);
  const minute = Number(m[2]);
  let meridiem = (m[3] || "").toUpperCase();
  if (!meridiem) meridiem = forcePm ? "PM" : "AM";
  if (meridiem === "AM") {
    if (hour === 12) hour = 0;
  } else {
    if (hour !== 12) hour += 12;
  }
  return `${String(hour).padStart(2, "0")}:${String(minute).padStart(2, "0")}:00`;
}

function addMinutes(timeHms, mins) {
  const [h, m] = timeHms.split(":").map(Number);
  const total = h * 60 + m + mins;
  const nh = Math.floor(total / 60) % 24;
  const nm = total % 60;
  return `${String(nh).padStart(2, "0")}:${String(nm).padStart(2, "0")}:00`;
}

function extractWeeklySlots() {
  const py = `
import json, pdfplumber
pdf_path = ${JSON.stringify(PDF_ATTACHED)}
days = ${JSON.stringify(DAYS)}
rows_out = []
seen_pm = False
with pdfplumber.open(pdf_path) as pdf:
  for page in pdf.pages:
    tables = page.extract_tables() or []
    for table in tables:
      for row in table:
        if not row or not row[0]:
          continue
        label = (row[0] or '').strip()
        if not label or label.lower().startswith('date') or label.lower() in ('sunday',):
          continue
        if label.upper() == 'SUNDAY':
          continue
        force_pm = 'PM' in label.upper()
        if force_pm:
          seen_pm = True
        # after first PM row, bare times without meridiem are still PM-era only if labeled
        cells = [(c or '').replace('\\n', ' ').strip() for c in row[1:8]]
        while len(cells) < 7:
          cells.append('')
        rows_out.append({'label': label, 'force_pm': force_pm or False, 'cells': cells[:7]})
print(json.dumps(rows_out))
`;
  const res = spawnSync("python3", ["-c", py], {
    encoding: "utf8",
    maxBuffer: 10 * 1024 * 1024,
  });
  if (res.status !== 0) {
    throw new Error(res.stderr || "pdf extract failed");
  }
  return JSON.parse(res.stdout);
}

function expandSeptember(weeklyRows) {
  const entries = [];
  // Build ordered slots with resolved times
  const slots = [];
  for (const row of weeklyRows) {
    const start = parseTimeLabel(row.label, row.force_pm);
    if (!start) continue;
    slots.push({
      start,
      programs: row.cells.map(cleanTitle),
    });
  }
  // sort by start time
  slots.sort((a, b) => a.start.localeCompare(b.start));

  const daysInMonth = new Date(YEAR, MONTH, 0).getDate();
  for (let day = 1; day <= daysInMonth; day++) {
    const date = new Date(Date.UTC(YEAR, MONTH - 1, day));
    const dow = date.getUTCDay(); // 0=Sun
    for (let i = 0; i < slots.length; i++) {
      const slot = slots[i];
      const title = slot.programs[dow];
      if (!title) continue;
      const next = slots[i + 1];
      let end = next ? next.start : addMinutes(slot.start, 30);
      // if next wraps past midnight relative to start, use +30
      if (end <= slot.start) end = addMinutes(slot.start, 30);
      const category = inferCategory(title);
      entries.push({
        air_date: `${YEAR}-${String(MONTH).padStart(2, "0")}-${String(day).padStart(2, "0")}`,
        start_time: slot.start,
        end_time: end,
        title,
        description: null,
        category,
        color: categoryColor(category),
      });
    }
  }
  return entries;
}

async function main() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !key) throw new Error("Missing Supabase env");
  if (!existsSync(PDF_ATTACHED)) throw new Error("Missing attached PDF");

  const publicDir = resolve(ROOT, "public/schedules");
  mkdirSync(publicDir, { recursive: true });
  const publicPdf = resolve(publicDir, "september-2026.pdf");
  copyFileSync(PDF_ATTACHED, publicPdf);

  const weekly = extractWeeklySlots();
  const entries = expandSeptember(weekly);
  if (!entries.length) throw new Error("No schedule entries parsed");

  const snapshot = resolve(ROOT, "scripts/data/schedule-september-2026-seed.json");
  mkdirSync(dirname(snapshot), { recursive: true });
  writeFileSync(
    snapshot,
    JSON.stringify({ year: YEAR, month: MONTH, weeklySlots: weekly.length, entries }, null, 2),
  );
  console.log(`Parsed ${weekly.length} weekly slots → ${entries.length} dated entries`);

  const admin = createClient(url, key, {
    auth: { autoRefreshToken: false, persistSession: false },
  });

  // Replace September 2026 entries
  const from = `${YEAR}-${String(MONTH).padStart(2, "0")}-01`;
  const to = `${YEAR}-${String(MONTH).padStart(2, "0")}-${new Date(YEAR, MONTH, 0).getDate()}`;
  const { error: delErr } = await admin
    .from("schedule_entries")
    .delete()
    .gte("air_date", from)
    .lte("air_date", to);
  if (delErr) throw delErr;

  const chunk = 200;
  for (let i = 0; i < entries.length; i += chunk) {
    const batch = entries.slice(i, i + chunk);
    const { error } = await admin.from("schedule_entries").insert(batch);
    if (error) throw error;
    console.log(`Inserted ${Math.min(i + chunk, entries.length)}/${entries.length}`);
  }

  await admin.from("schedule_pdfs").upsert(
    {
      year: YEAR,
      month: MONTH,
      title: "Broadcast schedule — September 2026",
      pdf_url: PDF_REMOTE,
    },
    { onConflict: "year,month" },
  );

  await admin.from("site_settings").upsert({
    key: "schedule_display_mode",
    value: "dynamic",
  });

  console.log("Done. Local PDF copy:", publicPdf);
}

main().catch((err) => {
  console.error(err?.message || err);
  process.exit(1);
});
