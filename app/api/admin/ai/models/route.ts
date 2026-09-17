import { NextResponse } from "next/server";
import { AI_MODELS } from "@/lib/ai/catalog";
import { getAiProviderKeys, getAiProviderStatus } from "@/lib/ai/keys";
import { requireStaffProfile } from "@/lib/auth/session";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/** Public-to-admin catalog: configured flags only — never returns API keys. */
export async function GET() {
  const profile = await requireStaffProfile();
  if (!profile) {
    return NextResponse.json(
      { error: "Unauthorized — staff login required." },
      { status: 401 },
    );
  }

  try {
    const [status, keys] = await Promise.all([
      getAiProviderStatus(),
      getAiProviderKeys(),
    ]);
    const configured = new Set(
      Object.entries(keys)
        .filter(([, v]) => Boolean(v?.trim()))
        .map(([k]) => k),
    );
    const models = AI_MODELS.map((m) => ({
      id: m.id,
      label: m.label,
      provider: m.provider,
      webGrounded: Boolean(m.webGrounded),
      enabled: configured.has(m.provider),
      disabledReason: configured.has(m.provider)
        ? null
        : "Configure API key in Settings (or AI_NVIDIA_API_KEY / NVIDIA_API_KEY env)",
    }));
    return NextResponse.json({
      providers: status,
      models,
    });
  } catch (err) {
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Failed to load models" },
      { status: 500 },
    );
  }
}
