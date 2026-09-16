import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";
import {
  getSupabaseAnonKey,
  getSupabaseUrl,
  isSupabaseConfigured,
} from "@/lib/env";

/**
 * Server Supabase client via @supabase/ssr.
 * Uses NEXT_PUBLIC_SUPABASE_URL + NEXT_PUBLIC_SUPABASE_ANON_KEY
 * (or NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY as fallback).
 * Returns null when credentials are not configured.
 */
export async function createClient() {
  if (!isSupabaseConfigured()) {
    return null;
  }

  try {
    const cookieStore = await cookies();

    return createServerClient(getSupabaseUrl(), getSupabaseAnonKey(), {
      cookies: {
        getAll() {
          return cookieStore.getAll();
        },
        setAll(cookiesToSet) {
          try {
            cookiesToSet.forEach(({ name, value, options }) => {
              cookieStore.set(name, value, options);
            });
          } catch {
            // Called from a Server Component — ignore when middleware handles refresh.
          }
        },
      },
    });
  } catch (err) {
    console.error("[supabase/server] createClient failed", err);
    return null;
  }
}
