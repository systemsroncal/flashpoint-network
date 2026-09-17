import "server-only";

import { createAdminClient } from "@/lib/supabase/admin";
import {
  AI_KEYS_SETTING,
  AI_PROVIDERS,
  type AiProviderId,
  type AiProviderKeys,
  type AiProviderStatus,
} from "@/lib/ai/catalog";

export type { AiProviderStatus };

/** Env aliases accepted per provider (first non-empty wins after DB). */
const ENV_ALIASES: Record<AiProviderId, string[]> = {
  google: ["AI_GOOGLE_API_KEY", "GOOGLE_API_KEY", "GEMINI_API_KEY"],
  openai: ["AI_OPENAI_API_KEY", "OPENAI_API_KEY"],
  xai: ["AI_XAI_API_KEY", "XAI_API_KEY"],
  anthropic: ["AI_ANTHROPIC_API_KEY", "ANTHROPIC_API_KEY"],
  nvidia: [
    "AI_NVIDIA_API_KEY",
    "NVIDIA_API_KEY",
    "NGC_API_KEY",
    "INTEGRATION_NVIDIA_API_KEY",
  ],
  perplexity: ["AI_PERPLEXITY_API_KEY", "PERPLEXITY_API_KEY"],
};

function envKeyFor(provider: AiProviderId): string {
  for (const name of ENV_ALIASES[provider]) {
    const v = process.env[name]?.trim();
    if (v) return v;
  }
  return "";
}

function requireAdmin() {
  const client = createAdminClient();
  if (!client) throw new Error("Supabase admin client is not configured");
  return client;
}

function normalizeKeys(raw: unknown): AiProviderKeys {
  const out: AiProviderKeys = {};
  if (!raw || typeof raw !== "object" || Array.isArray(raw)) {
    // Still allow env-only configuration
    for (const p of AI_PROVIDERS) {
      const envFallback = envKeyFor(p.id);
      if (envFallback) out[p.id] = envFallback;
    }
    return out;
  }
  const obj = raw as Record<string, unknown>;
  for (const p of AI_PROVIDERS) {
    const fromDb =
      typeof obj[p.id] === "string" ? String(obj[p.id]).trim() : "";
    const value = fromDb || envKeyFor(p.id) || "";
    if (value) out[p.id] = value;
  }
  return out;
}

/** Server-only: full keys from site_settings (+ optional env overrides). */
export async function getAiProviderKeys(): Promise<AiProviderKeys> {
  try {
    const supabase = requireAdmin();
    const { data, error } = await supabase
      .from("site_settings")
      .select("value")
      .eq("key", AI_KEYS_SETTING)
      .maybeSingle();
    if (error) {
      // Fall through to env-only so misconfigured DB does not hard-block env keys
      console.error("[ai/keys] site_settings read failed:", error.message);
      return normalizeKeys({});
    }
    return normalizeKeys(data?.value ?? {});
  } catch (err) {
    console.error("[ai/keys] getAiProviderKeys failed:", err);
    return normalizeKeys({});
  }
}

/** Safe for admin UI — never returns full secrets. */
export async function getAiProviderStatus(): Promise<AiProviderStatus[]> {
  const keys = await getAiProviderKeys();
  return AI_PROVIDERS.map((p) => {
    const key = keys[p.id]?.trim() || "";
    return {
      id: p.id,
      label: p.label,
      settingLabel: p.settingLabel,
      configured: Boolean(key),
      hint: key ? `••••${key.slice(-4)}` : null,
    };
  });
}

/**
 * Merge updates into stored keys.
 * - empty string in updates = keep existing
 * - explicit null / "__CLEAR__" = clear that provider
 */
export async function upsertAiProviderKeys(
  updates: Partial<Record<AiProviderId, string | null>>,
): Promise<void> {
  const supabase = requireAdmin();
  const { data } = await supabase
    .from("site_settings")
    .select("value")
    .eq("key", AI_KEYS_SETTING)
    .maybeSingle();
  const base: AiProviderKeys = {};
  if (data?.value && typeof data.value === "object" && !Array.isArray(data.value)) {
    for (const p of AI_PROVIDERS) {
      const v = (data.value as Record<string, unknown>)[p.id];
      if (typeof v === "string" && v.trim()) base[p.id] = v.trim();
    }
  }

  const next: AiProviderKeys = { ...base };
  for (const p of AI_PROVIDERS) {
    if (!(p.id in updates)) continue;
    const val = updates[p.id];
    if (val === null || val === "__CLEAR__") {
      delete next[p.id];
    } else if (typeof val === "string" && val.trim()) {
      next[p.id] = val.trim();
    }
  }

  const { error } = await supabase.from("site_settings").upsert({
    key: AI_KEYS_SETTING,
    value: next,
  });
  if (error) throw new Error(error.message);
}
