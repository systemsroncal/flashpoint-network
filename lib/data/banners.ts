import "server-only";

import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import type { BannerSlot, BannerWidget } from "@/lib/banners/slots";

async function db() {
  return (await createClient()) ?? createAdminClient();
}

export async function getBannerWidget(
  slot: BannerSlot,
): Promise<BannerWidget | null> {
  const supabase = await db();
  if (!supabase) return null;
  const { data, error } = await supabase
    .from("banner_widgets")
    .select(
      "id, slot, label, desktop_image_url, mobile_image_url, href, open_in_new_tab, enabled, sort_order, created_at, updated_at",
    )
    .eq("slot", slot)
    .eq("enabled", true)
    .maybeSingle();
  if (error) {
    console.error("[banners] getBannerWidget", slot, error.message);
    return null;
  }
  return (data as BannerWidget | null) ?? null;
}

export async function getBannerWidgetsBySlots(
  slots: BannerSlot[],
): Promise<Partial<Record<BannerSlot, BannerWidget>>> {
  const supabase = await db();
  if (!supabase) return {};
  const { data, error } = await supabase
    .from("banner_widgets")
    .select(
      "id, slot, label, desktop_image_url, mobile_image_url, href, open_in_new_tab, enabled, sort_order, created_at, updated_at",
    )
    .in("slot", slots)
    .eq("enabled", true);
  if (error) {
    console.error("[banners] getBannerWidgetsBySlots", error.message);
    return {};
  }
  const map: Partial<Record<BannerSlot, BannerWidget>> = {};
  for (const row of (data as BannerWidget[]) ?? []) {
    map[row.slot as BannerSlot] = row;
  }
  return map;
}
