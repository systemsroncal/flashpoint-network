/**
 * Env helpers with safe fallbacks so the app boots without real secrets.
 */

export function getSupabaseUrl(): string {
  return process.env.NEXT_PUBLIC_SUPABASE_URL || "https://placeholder.supabase.co";
}

/**
 * Prefer the classic anon JWT; fall back to the publishable key when present.
 */
export function getSupabaseAnonKey(): string {
  return (
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ||
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY ||
    "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.placeholder"
  );
}

export function isSupabaseConfigured(): boolean {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key =
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ||
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY;

  return Boolean(
    url &&
      key &&
      !url.includes("placeholder") &&
      !url.includes("YOUR_PROJECT"),
  );
}

export function getResendApiKey(): string | null {
  return process.env.RESEND_API_KEY || null;
}

export function getSiteUrl(): string {
  return process.env.NEXT_PUBLIC_SITE_URL || "http://127.0.0.1:43125";
}

export function getSiteName(): string {
  return process.env.NEXT_PUBLIC_SITE_NAME || "Flash Point Network";
}
