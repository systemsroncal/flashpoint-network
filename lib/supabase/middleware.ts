import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";
import {
  normalizeForwardedHost,
  normalizePublicUrl,
  scrubSiteUrlEnv,
} from "@/lib/env";

const STAFF_ROLES = new Set(["superadmin", "admin", "editor", "journalist"]);

/**
 * OLS/proxy sometimes duplicates Origin / X-Forwarded-Host
 * (`https://fptn.com, https://fptn.com`). Next Server Actions call
 * `new URL(...)` on those headers and throw ERR_INVALID_URL before
 * the action body — which paints (auth)/error.tsx.
 */
function sanitizedRequestHeaders(request: NextRequest): Headers {
  // Also scrub PM2-dumped env (middleware runs even if instrumentation lagged).
  scrubSiteUrlEnv();

  const headers = new Headers(request.headers);

  const origin = headers.get("origin");
  if (origin && /[,;]/.test(origin)) {
    const cleaned = normalizePublicUrl(origin, "");
    if (cleaned) headers.set("origin", cleaned);
  }

  const xfHost = headers.get("x-forwarded-host");
  if (xfHost && /[\s,;]/.test(xfHost)) {
    const host = normalizeForwardedHost(xfHost);
    if (host) headers.set("x-forwarded-host", host);
  }

  return headers;
}

/**
 * Refresh the auth session and gate /admin behind staff roles.
 */
export async function updateSession(request: NextRequest) {
  const requestHeaders = sanitizedRequestHeaders(request);
  let supabaseResponse = NextResponse.next({
    request: { headers: requestHeaders },
  });

  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key =
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ||
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY;

  if (!url || !key || url.includes("placeholder") || url.includes("YOUR_PROJECT")) {
    return supabaseResponse;
  }

  const supabase = createServerClient(url, key, {
    cookies: {
      getAll() {
        return request.cookies.getAll();
      },
      setAll(cookiesToSet) {
        cookiesToSet.forEach(({ name, value }) => {
          request.cookies.set(name, value);
        });
        supabaseResponse = NextResponse.next({
          request: { headers: requestHeaders },
        });
        cookiesToSet.forEach(({ name, value, options }) => {
          supabaseResponse.cookies.set(name, value, options);
        });
      },
    },
  });

  try {
    const {
      data: { user },
    } = await supabase.auth.getUser();

    const path = request.nextUrl.pathname;
    const isAdmin = path === "/admin" || path.startsWith("/admin/");

    if (isAdmin) {
      if (!user) {
        const login = request.nextUrl.clone();
        login.pathname = "/login";
        login.searchParams.set("next", path);
        return NextResponse.redirect(login);
      }

      const { data: profile } = await supabase
        .from("profiles")
        .select("role")
        .eq("id", user.id)
        .maybeSingle();

      const role = (profile?.role as string | undefined) || "";
      if (!STAFF_ROLES.has(role)) {
        const denied = request.nextUrl.clone();
        denied.pathname = "/";
        denied.searchParams.set("admin_denied", "1");
        return NextResponse.redirect(denied);
      }
    }

    return supabaseResponse;
  } catch (err) {
    console.error("[middleware] session check failed", err);
    return supabaseResponse;
  }
}
