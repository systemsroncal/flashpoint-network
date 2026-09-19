import { Buffer as NodeBuffer } from "node:buffer";
import ExcelJS from "exceljs";
import type { MinistryProgram } from "@/lib/types/cms";

/** Columns that match the public FPTN Shows grid + carousel + publish controls. */
export const NETWORK_PROGRAM_EXCEL_HEADERS = [
  "id",
  "title",
  "host_name",
  "schedule_detail",
  "featured_image_url",
  "carousel_image_url",
  "sort_order",
  "status",
] as const;

export type NetworkProgramExcelRow = {
  id: string;
  title: string;
  host_name: string;
  schedule_detail: string;
  featured_image_url: string;
  carousel_image_url: string;
  sort_order: number;
  status: "draft" | "published" | "archived";
};

function cellText(value: ExcelJS.CellValue): string {
  if (value == null) return "";
  if (typeof value === "string" || typeof value === "number") {
    return String(value).trim();
  }
  if (typeof value === "boolean") return value ? "true" : "false";
  if (value instanceof Date) return value.toISOString();
  if (typeof value === "object" && "text" in value && typeof value.text === "string") {
    return value.text.trim();
  }
  if (typeof value === "object" && "result" in value) {
    return cellText(value.result as ExcelJS.CellValue);
  }
  return String(value).trim();
}

function normalizeStatus(raw: string): "draft" | "published" | "archived" {
  const v = raw.toLowerCase();
  if (v === "draft" || v === "archived" || v === "published") return v;
  return "published";
}

export function programsToExcelRows(
  programs: MinistryProgram[],
): NetworkProgramExcelRow[] {
  return programs.map((p) => ({
    id: p.id,
    title: p.title ?? "",
    host_name: p.host_name ?? "",
    schedule_detail: p.schedule_detail ?? "",
    featured_image_url: p.featured_image_url ?? "",
    carousel_image_url: p.carousel_image_url ?? "",
    sort_order: Number.isFinite(p.sort_order) ? p.sort_order : 0,
    status: normalizeStatus(String(p.status || "published")),
  }));
}

export async function buildNetworkProgramsWorkbook(
  programs: MinistryProgram[],
): Promise<NodeBuffer> {
  const workbook = new ExcelJS.Workbook();
  workbook.creator = "FPTN Admin";
  workbook.created = new Date();

  const sheet = workbook.addWorksheet("Network Programs", {
    views: [{ state: "frozen", ySplit: 1 }],
  });

  sheet.columns = [
    { header: "id", key: "id", width: 38 },
    { header: "title", key: "title", width: 36 },
    { header: "host_name", key: "host_name", width: 24 },
    { header: "schedule_detail", key: "schedule_detail", width: 40 },
    { header: "featured_image_url", key: "featured_image_url", width: 48 },
    { header: "carousel_image_url", key: "carousel_image_url", width: 48 },
    { header: "sort_order", key: "sort_order", width: 12 },
    { header: "status", key: "status", width: 12 },
  ];

  const header = sheet.getRow(1);
  header.font = { bold: true };
  header.commit();

  for (const row of programsToExcelRows(programs)) {
    sheet.addRow(row);
  }

  const notes = workbook.addWorksheet("Instructions");
  notes.getColumn(1).width = 88;
  notes.addRow([
    "Leave id blank to create a new program. Keep id to update an existing one.",
  ]);
  notes.addRow([
    "schedule_detail: one air time per line (use Alt+Enter in Excel for new lines).",
  ]);
  notes.addRow([
    "featured_image_url: grid card image. carousel_image_url: home carousel image.",
  ]);
  notes.addRow(["status: draft | published | archived"]);
  notes.addRow([
    "Import upserts by id when present; otherwise inserts a new row with a random slug.",
  ]);

  // exceljs types `Buffer` as ArrayBuffer (`declare interface Buffer extends ArrayBuffer`).
  // Convert to a real Node Buffer for the export API.
  const raw = await workbook.xlsx.writeBuffer();
  return NodeBuffer.from(raw as ArrayBuffer);
}

export async function parseNetworkProgramsWorkbook(
  data: ArrayBuffer | NodeBuffer,
): Promise<NetworkProgramExcelRow[]> {
  const workbook = new ExcelJS.Workbook();
  const nodeBuf = NodeBuffer.isBuffer(data)
    ? data
    : NodeBuffer.from(data);
  // exceljs `.load` is typed against its ambient Buffer (= ArrayBuffer) alias.
  await workbook.xlsx.load(nodeBuf as unknown as ArrayBuffer);
  const sheet =
    workbook.getWorksheet("Network Programs") || workbook.worksheets[0];
  if (!sheet) throw new Error("Excel file has no worksheets.");

  const headerRow = sheet.getRow(1);
  const colIndex = new Map<string, number>();
  headerRow.eachCell({ includeEmpty: false }, (cell, colNumber) => {
    const key = cellText(cell.value).toLowerCase();
    if (key) colIndex.set(key, colNumber);
  });

  for (const required of ["title"] as const) {
    if (!colIndex.has(required)) {
      throw new Error(`Missing required column: ${required}`);
    }
  }

  const rows: NetworkProgramExcelRow[] = [];
  sheet.eachRow({ includeEmpty: false }, (row, rowNumber) => {
    if (rowNumber === 1) return;
    const title = cellText(row.getCell(colIndex.get("title")!).value);
    if (!title) return;

    const sortRaw = colIndex.has("sort_order")
      ? cellText(row.getCell(colIndex.get("sort_order")!).value)
      : "0";
    const sort_order = Number.parseInt(sortRaw, 10);
    const statusRaw = colIndex.has("status")
      ? cellText(row.getCell(colIndex.get("status")!).value)
      : "published";

    rows.push({
      id: colIndex.has("id")
        ? cellText(row.getCell(colIndex.get("id")!).value)
        : "",
      title,
      host_name: colIndex.has("host_name")
        ? cellText(row.getCell(colIndex.get("host_name")!).value)
        : "",
      schedule_detail: colIndex.has("schedule_detail")
        ? cellText(row.getCell(colIndex.get("schedule_detail")!).value)
        : "",
      featured_image_url: colIndex.has("featured_image_url")
        ? cellText(row.getCell(colIndex.get("featured_image_url")!).value)
        : "",
      carousel_image_url: colIndex.has("carousel_image_url")
        ? cellText(row.getCell(colIndex.get("carousel_image_url")!).value)
        : "",
      sort_order: Number.isFinite(sort_order) ? sort_order : 0,
      status: normalizeStatus(statusRaw),
    });
  });

  return rows;
}
