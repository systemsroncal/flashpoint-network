import { NextResponse, type NextRequest } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { getSiteUrl, scrubSiteUrlEnv } from "@/lib/env";
import { safeNext } from "@/lib/auth/safe-next";

export async function GET(request: NextRequest) {
  scrubSiteUrlEnv();
  const { searchParams } = new URL(request.url);
  const code = searchParams.get("code");
  const next = safeNext(searchParams.get("next"));
  const origin = getSiteUrl().replace(/\/$/, "");

  if (code) {
    const supabase = await createClient();
    if (supabase) {
      const { error } = await supabase.auth.exchangeCodeForSession(code);
      if (!error) {
        // Password recovery flows land on update-password
        const type = searchParams.get("type");
        if (type === "recovery" || next.includes("update-password")) {
          return NextResponse.redirect(`${origin}/update-password`);
        }
        return NextResponse.redirect(`${origin}${next}`);
      }
    }
  }

  return NextResponse.redirect(
    `${origin}/login?error=${encodeURIComponent("Could not confirm email link")}`,
  );
}
