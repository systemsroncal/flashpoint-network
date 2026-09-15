/**
 * Dev-only guard for a known Next.js 16 + Turbopack / React instrumentation bug:
 * `performance.measure()` can be called with a negative childrenEndTime (-Infinity)
 * when a Server Component render is aborted/rejected (redirect, notFound, HMR).
 *
 * Upstream: https://github.com/vercel/next.js/issues/86060
 * Does not affect production builds; this patch only runs in development.
 */
export function installPerformanceMeasureGuard(): void {
  if (typeof window === "undefined") return;
  if (process.env.NODE_ENV === "production") return;

  const perf = window.performance;
  if (!perf || typeof perf.measure !== "function") return;

  const flagged = perf as Performance & { __fpnMeasurePatched?: boolean };
  if (flagged.__fpnMeasurePatched) return;
  flagged.__fpnMeasurePatched = true;

  const original = perf.measure.bind(perf);
  perf.measure = ((...args: Parameters<Performance["measure"]>) => {
    try {
      return original(...args);
    } catch (err) {
      const message = err instanceof Error ? err.message : String(err);
      if (/negative time stamp/i.test(message)) {
        return undefined as unknown as PerformanceMeasure;
      }
      throw err;
    }
  }) as Performance["measure"];
}
