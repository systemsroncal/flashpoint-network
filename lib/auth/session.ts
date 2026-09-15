import "server-only";

import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import type { Profile, UserRole } from "@/lib/types/cms";

const STAFF: UserRole[] = ["superadmin", "admin", "editor", "journalist"];
const ADMINS: UserRole[] = ["superadmin", "admin"];

export async function getSessionUser() {
  const supabase = await createClient();
  if (!supabase) return null;
  const { data } = await supabase.auth.getUser();
  return data.user ?? null;
}

export async function getCurrentProfile(): Promise<Profile | null> {
  const user = await getSessionUser();
  if (!user) return null;
  const admin = createAdminClient();
  if (!admin) return null;
  const { data } = await admin
    .from("profiles")
    .select("id, email, full_name, first_name, last_name, role, avatar_url")
    .eq("id", user.id)
    .maybeSingle();
  return (data as Profile | null) ?? null;
}

export function isStaffRole(role: UserRole | null | undefined) {
  return Boolean(role && STAFF.includes(role));
}

export function isAdminRole(role: UserRole | null | undefined) {
  return Boolean(role && ADMINS.includes(role));
}

export async function requireStaffProfile() {
  const profile = await getCurrentProfile();
  if (!profile || !isStaffRole(profile.role)) return null;
  return profile;
}
