"use server";

import { revalidatePath } from "next/cache";
import { upsertAiProviderKeys } from "@/lib/ai/keys";
import type { AiProviderId } from "@/lib/ai/catalog";
import { AI_PROVIDERS } from "@/lib/ai/catalog";

export async function saveAiProviderKeysAction(formData: FormData) {
  const updates: Partial<Record<AiProviderId, string | null>> = {};
  for (const p of AI_PROVIDERS) {
    const clear = formData.get(`clear_${p.id}`) === "on";
    const value = String(formData.get(`key_${p.id}`) || "");
    if (clear) {
      updates[p.id] = null;
    } else if (value.trim()) {
      updates[p.id] = value.trim();
    }
  }
  await upsertAiProviderKeys(updates);
  revalidatePath("/admin/settings");
  revalidatePath("/admin/posts");
}
