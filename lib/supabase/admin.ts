import { createClient } from "@supabase/supabase-js";
import { getSupabaseUrl, isSupabaseConfigured } from "@/lib/env";

/**
 * Service-role client for trusted server-only operations.
 * Never import this into client components.
 */
export function createAdminClient() {
  if (!isSupabaseConfigured()) return null;

  const key =
    process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_SECRET_KEY;
  if (!key) return null;

  try {
    return createClient(getSupabaseUrl(), key, {
      auth: { autoRefreshToken: false, persistSession: false },
    });
  } catch (err) {
    console.error("[supabase/admin] createAdminClient failed", err);
    return null;
  }
}
