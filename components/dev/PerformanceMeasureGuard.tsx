"use client";

import { installPerformanceMeasureGuard } from "@/components/dev/installPerformanceMeasureGuard";

// Patch as early as this client module evaluates (before paint/effects).
installPerformanceMeasureGuard();

/** Invisible client boundary that installs the Performance.measure guard. */
export default function PerformanceMeasureGuard() {
  return null;
}
