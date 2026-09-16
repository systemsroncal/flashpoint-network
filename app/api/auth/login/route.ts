import { NextResponse, type NextRequest } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { safeNext } from "@/lib/auth/safe-next";
import { getSiteUrl, scrubSiteUrlEnv } from "@/lib/env";

export const dynamic = "force-dynamic";

/**
 * Classic form POST login — avoids Next.js Server Action Origin parsing
 * (`new URL(origin)` → ERR_INVALID_URL on duplicated CyberPanel Origins).
 */
export async function POST(request: NextRequest) {
  scrubSiteUrlEnv();

  let form: FormData;
  try {
    form = await request.formData();
  } catch (err) {
    console.error("[api/auth/login] formData", err);
    return redirectLogin("Could not read sign-in form.");
  }

  const email = String(form.get("email") || "").trim();
  const password = String(form.get("password") || "");
  const next = safeNext(String(form.get("next") || "/"));

  try {
    void getSiteUrl();
    const supabase = await createClient();
    if (!supabase) {
      return redirectLogin(
        "Sign-in is temporarily unavailable. Try again in a few minutes.",
        next,
      );
    }

    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });
    if (error) {
      return redirectLogin(error.message, next);
    }

    const admin = createAdminClient();
    const { data: userData } = await supabase.auth.getUser();
    let destination = next;
    if (userData.user && admin && next === "/") {
      const { data: profile } = await admin
        .from("profiles")
        .select("role")
        .eq("id", userData.user.id)
        .maybeSingle();
      const role = profile?.role as string | undefined;
      if (
        role &&
        ["superadmin", "admin", "editor", "journalist"].includes(role)
      ) {
        destination = "/admin";
      }
    }

    return NextResponse.redirect(absolute(destination), 303);
  } catch (err) {
    console.error("[api/auth/login]", err);
    const message =
      err instanceof Error && /Invalid URL|ERR_INVALID_URL/i.test(err.message)
        ? "Site URL is misconfigured (app env, PM2, or Supabase Auth → Site URL). Use a single origin like https://fptn.com, then rebuild and pm2 restart --update-env."
        : "Sign-in is temporarily unavailable. Try again in a few minutes.";
    return redirectLogin(message, next);
  }
}

function absolute(path: string): string {
  const origin = getSiteUrl().replace(/\/$/, "");
  const dest = path.startsWith("/") ? path : `/${path}`;
  return `${origin}${dest}`;
}

function redirectLogin(message: string, next?: string) {
  const qs = new URLSearchParams({ error: message });
  if (next && next !== "/") qs.set("next", next);
  return NextResponse.redirect(absolute(`/login?${qs.toString()}`), 303);
}
