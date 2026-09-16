import "server-only";

import { createAdminClient } from "@/lib/supabase/admin";
import {
  DEFAULT_PROGRAM_MODULES,
  PROGRAM_MODULES_SETTING,
  parseProgramModules,
  type ProgramModules,
} from "@/lib/features/program-modules";

export async function getProgramModules(): Promise<ProgramModules> {
  const admin = createAdminClient();
  if (!admin) return DEFAULT_PROGRAM_MODULES;
  const { data } = await admin
    .from("site_settings")
    .select("value")
    .eq("key", PROGRAM_MODULES_SETTING)
    .maybeSingle();
  return parseProgramModules(data?.value);
}
