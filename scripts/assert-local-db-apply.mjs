/**
 * Block Supabase DDL/seed scripts when the repo lives on the VPS app path.
 * Migrations always run from a developer machine (.env.local), never on the server.
 */
import { resolve, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), "..");

const VPS_PATH_MARKERS = [
  "/home/fptn.com/",
  "/home/admin/web/",
  "dev.fptn.com/app/",
];

export function assertLocalDbApply() {
  if (process.env.FPTN_ALLOW_VPS_DB_APPLY === "1") return;

  const root = ROOT.replace(/\\/g, "/").toLowerCase();
  for (const marker of VPS_PATH_MARKERS) {
    if (root.includes(marker.toLowerCase())) {
      throw new Error(
        "Supabase migrations must run from your local machine (npm run db:apply), not on the VPS. " +
          "Deploy code with scripts/deploy-from-github.sh only. " +
          "Emergency override: FPTN_ALLOW_VPS_DB_APPLY=1",
      );
    }
  }
}
