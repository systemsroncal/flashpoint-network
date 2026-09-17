/**
 * Runs once when the Node server boots (PM2 / `next start`).
 * Scrub duplicated site URL env before any request hits `new URL(...)`.
 */
export async function register() {
  if (process.env.NEXT_RUNTIME && process.env.NEXT_RUNTIME !== "nodejs") {
    return;
  }

  const { scrubSiteUrlEnv } = await import("@/lib/env");
  const changed = scrubSiteUrlEnv();
  if (changed.length) {
    for (const row of changed) {
      console.warn(
        `[env] scrubbed ${row.key}: ${JSON.stringify(row.before)} → ${JSON.stringify(row.after)}`,
      );
    }
  }
}
