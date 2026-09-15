import "server-only";

import { createAdminClient } from "@/lib/supabase/admin";
import { isStaffRole } from "@/lib/auth/session";
import type { UserRole } from "@/lib/types/cms";

export type PaywallSettings = {
  enabled: boolean;
  freeArticleLimit: number;
  modalTitle: string;
  modalBody: string;
};

export type AdSenseSettings = {
  enabled: boolean;
  clientId: string;
  adsTxt: string;
};

const DEFAULT_PAYWALL: PaywallSettings = {
  enabled: true,
  freeArticleLimit: 3,
  modalTitle: "Don't stop here",
  modalBody:
    "Create your FPN All Access account for free to keep reading and join the conversation.",
};

const DEFAULT_ADSENSE: AdSenseSettings = {
  enabled: false,
  clientId: "",
  adsTxt: "google.com, pub-0000000000000000, DIRECT, f08c47fec0942fa0",
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

async function readSetting(key: string): Promise<unknown> {
  const admin = createAdminClient();
  if (!admin) return null;
  const { data } = await admin
    .from("site_settings")
    .select("value")
    .eq("key", key)
    .maybeSingle();
  return data?.value ?? null;
}

export async function getPaywallSettings(): Promise<PaywallSettings> {
  const raw = asObject(await readSetting("paywall"));
  return {
    enabled: typeof raw.enabled === "boolean" ? raw.enabled : DEFAULT_PAYWALL.enabled,
    freeArticleLimit:
      typeof raw.free_article_limit === "number"
        ? Math.max(0, Math.floor(raw.free_article_limit))
        : DEFAULT_PAYWALL.freeArticleLimit,
    modalTitle:
      typeof raw.modal_title === "string" && raw.modal_title.trim()
        ? raw.modal_title
        : DEFAULT_PAYWALL.modalTitle,
    modalBody:
      typeof raw.modal_body === "string" && raw.modal_body.trim()
        ? raw.modal_body
        : DEFAULT_PAYWALL.modalBody,
  };
}

export async function getAdSenseSettings(): Promise<AdSenseSettings> {
  const raw = asObject(await readSetting("adsense"));
  const adsTxtRaw = await readSetting("ads_txt");
  let adsTxt = DEFAULT_ADSENSE.adsTxt;
  if (typeof adsTxtRaw === "string" && adsTxtRaw.trim()) {
    adsTxt = adsTxtRaw;
  } else if (typeof raw.ads_txt === "string" && raw.ads_txt.trim()) {
    adsTxt = raw.ads_txt;
  }

  return {
    enabled: typeof raw.enabled === "boolean" ? raw.enabled : DEFAULT_ADSENSE.enabled,
    clientId:
      typeof raw.client_id === "string" ? raw.client_id.trim() : DEFAULT_ADSENSE.clientId,
    adsTxt,
  };
}

export type PaywallDecision = {
  locked: boolean;
  remaining: number;
  reason: "ok" | "disabled" | "staff" | "subscriber" | "limit" | "premium";
};

/**
 * Soft paywall: anonymous readers get N free articles (cookie-tracked client-side).
 * Premium posts require any signed-in user. Staff always bypass.
 */
export function evaluatePaywall(opts: {
  settings: PaywallSettings;
  isPremium: boolean;
  role: UserRole | null;
  viewedCount: number;
}): PaywallDecision {
  const { settings, isPremium, role, viewedCount } = opts;

  if (!settings.enabled) {
    return { locked: false, remaining: Infinity, reason: "disabled" };
  }
  if (role && isStaffRole(role)) {
    return { locked: false, remaining: Infinity, reason: "staff" };
  }
  if (role === "subscriber" || role === "guest") {
    // Authenticated subscribers bypass soft limit; premium still gated below
    if (!isPremium) {
      return { locked: false, remaining: Infinity, reason: "subscriber" };
    }
  }
  if (isPremium && !role) {
    return { locked: true, remaining: 0, reason: "premium" };
  }
  if (isPremium && role) {
    return { locked: false, remaining: Infinity, reason: "subscriber" };
  }

  const remaining = Math.max(0, settings.freeArticleLimit - viewedCount);
  if (remaining <= 0) {
    return { locked: true, remaining: 0, reason: "limit" };
  }
  return { locked: false, remaining, reason: "ok" };
}
