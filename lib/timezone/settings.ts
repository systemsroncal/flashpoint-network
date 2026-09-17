import "server-only";

import { cache } from "react";
import { createAdminClient } from "@/lib/supabase/admin";
import {
  DEFAULT_SITE_TIMEZONE,
  normalizeSiteTimezone,
  SITE_TIMEZONE_SETTING,
} from "@/lib/timezone/constants";

/**
 * Site display timezone from `site_settings`. Cached per request.
 * DB timestamps stay UTC; convert only on display / datetime-local parse.
 */
export const getSiteTimezone = cache(async (): Promise<string> => {
  const admin = createAdminClient();
  if (!admin) return DEFAULT_SITE_TIMEZONE;
  const { data } = await admin
    .from("site_settings")
    .select("value")
    .eq("key", SITE_TIMEZONE_SETTING)
    .maybeSingle();
  return normalizeSiteTimezone(data?.value);
});
