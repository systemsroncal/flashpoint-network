import "server-only";

import { readdir, stat } from "node:fs/promises";
import path from "node:path";
import {
  assertUnderUploadsRoot,
  getUploadsRoot,
} from "@/lib/media/uploads-root";

const IMAGE_EXT = new Set([
  ".webp",
  ".jpg",
  ".jpeg",
  ".png",
  ".gif",
  ".avif",
]);

const DAY_FOLDER = /^\d{4}-\d{2}-\d{2}$/;

export type UploadLibraryItem = {
  url: string;
  filename: string;
  day: string;
  year: number;
  month: number;
  size: number;
  modifiedAt: string;
};

export type UploadLibraryMonth = {
  year: number;
  month: number;
  count: number;
  label: string;
};

type LibraryIndex = {
  builtAt: number;
  items: UploadLibraryItem[];
};

let indexCache: LibraryIndex | null = null;
const INDEX_TTL_MS = 20_000;

export function invalidateUploadLibraryIndex() {
  indexCache = null;
}

function monthLabel(year: number, month: number): string {
  try {
    return new Intl.DateTimeFormat("en-US", {
      month: "long",
      year: "numeric",
    }).format(new Date(year, month - 1, 1));
  } catch {
    return `${year}-${String(month).padStart(2, "0")}`;
  }
}

async function listDayFolders(root: string): Promise<string[]> {
  let entries;
  try {
    entries = await readdir(root, { withFileTypes: true });
  } catch {
    return [];
  }
  return entries
    .filter((e) => e.isDirectory() && DAY_FOLDER.test(e.name))
    .map((e) => e.name)
    .sort((a, b) => b.localeCompare(a));
}

async function filesInDay(
  root: string,
  day: string,
): Promise<UploadLibraryItem[]> {
  let dir: string;
  try {
    dir = assertUnderUploadsRoot(path.join(root, day));
  } catch {
    return [];
  }

  let entries;
  try {
    entries = await readdir(dir, { withFileTypes: true });
  } catch {
    return [];
  }

  const [y, m] = day.split("-").map(Number);
  const items: UploadLibraryItem[] = [];

  for (const entry of entries) {
    if (!entry.isFile()) continue;
    const ext = path.extname(entry.name).toLowerCase();
    if (!IMAGE_EXT.has(ext)) continue;

    const filePath = path.join(dir, entry.name);
    let st;
    try {
      st = await stat(filePath);
    } catch {
      continue;
    }

    items.push({
      url: `/uploads/${day}/${entry.name}`,
      filename: entry.name,
      day,
      year: y,
      month: m,
      size: st.size,
      modifiedAt: st.mtime.toISOString(),
    });
  }

  return items;
}

async function buildFullIndex(): Promise<UploadLibraryItem[]> {
  const root = getUploadsRoot();
  const days = await listDayFolders(root);
  const all: UploadLibraryItem[] = [];

  for (const day of days) {
    const batch = await filesInDay(root, day);
    all.push(...batch);
  }

  all.sort((a, b) => {
    const byDay = b.day.localeCompare(a.day);
    if (byDay !== 0) return byDay;
    return b.modifiedAt.localeCompare(a.modifiedAt);
  });

  return all;
}

async function getIndexedItems(): Promise<UploadLibraryItem[]> {
  const now = Date.now();
  if (indexCache && now - indexCache.builtAt < INDEX_TTL_MS) {
    return indexCache.items;
  }
  const items = await buildFullIndex();
  indexCache = { builtAt: now, items };
  return items;
}

function summarizeMonths(items: UploadLibraryItem[]): UploadLibraryMonth[] {
  const map = new Map<string, UploadLibraryMonth>();
  for (const item of items) {
    const key = `${item.year}-${item.month}`;
    const existing = map.get(key);
    if (existing) {
      existing.count += 1;
    } else {
      map.set(key, {
        year: item.year,
        month: item.month,
        count: 1,
        label: monthLabel(item.year, item.month),
      });
    }
  }
  return [...map.values()].sort(
    (a, b) => b.year - a.year || b.month - a.month,
  );
}

export type ListUploadLibraryOptions = {
  q?: string;
  year?: number | null;
  month?: number | null;
  offset?: number;
  limit?: number;
};

export type ListUploadLibraryResult = {
  items: UploadLibraryItem[];
  total: number;
  hasMore: boolean;
  nextOffset: number;
  months: UploadLibraryMonth[];
};

export async function listUploadLibrary(
  options: ListUploadLibraryOptions = {},
): Promise<ListUploadLibraryResult> {
  const q = (options.q ?? "").trim().toLowerCase();
  const offset = Math.max(0, options.offset ?? 0);
  const limit = Math.min(100, Math.max(1, options.limit ?? 48));

  let items = await getIndexedItems();

  if (options.year != null && Number.isFinite(options.year)) {
    const y = options.year;
    items = items.filter((item) => item.year === y);
    if (options.month != null && Number.isFinite(options.month)) {
      const m = options.month;
      items = items.filter((item) => item.month === m);
    }
  }

  if (q) {
    items = items.filter(
      (item) =>
        item.filename.toLowerCase().includes(q) ||
        item.url.toLowerCase().includes(q) ||
        item.day.includes(q),
    );
  }

  const total = items.length;
  const page = items.slice(offset, offset + limit);
  const nextOffset = offset + page.length;

  return {
    items: page,
    total,
    hasMore: nextOffset < total,
    nextOffset,
    months: summarizeMonths(await getIndexedItems()),
  };
}
