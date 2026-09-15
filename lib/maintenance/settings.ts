import "server-only";

import { createAdminClient } from "@/lib/supabase/admin";

export type MaintenanceSettings = {
  enabled: boolean;
  /** Optional override; empty = Figma design default copy */
  message: string;
};

const DEFAULTS: MaintenanceSettings = {
  enabled: false,
  message: "",
};

function asObject(value: unknown): Record<string, unknown> {
  if (value && typeof value === "object" && !Array.isArray(value)) {
    return value as Record<string, unknown>;
  }
  if (typeof value === "string") {
    try {
      const parsed = JSON.parse(value);
      if (parsed && typeof parsed === "object") {
        return parsed as Record<string, unknown>;
      }
    } catch {
      /* ignore */
    }
  }
  return {};
}

export async function getMaintenanceSettings(): Promise<MaintenanceSettings> {
  const admin = createAdminClient();
  if (!admin) return DEFAULTS;
  const { data } = await admin
    .from("site_settings")
    .select("value")
    .eq("key", "maintenance")
    .maybeSingle();
  const raw = asObject(data?.value);
  return {
    enabled: typeof raw.enabled === "boolean" ? raw.enabled : DEFAULTS.enabled,
    message: typeof raw.message === "string" ? raw.message.trim() : "",
  };
}
