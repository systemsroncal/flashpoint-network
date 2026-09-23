import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";
import {
  ADMIN_ACCESS_COOKIE,
  ADMIN_ACCESS_QUERY_PARAM,
  ADMIN_ACCESS_QUERY_VALUE,
  isAdminAccessGranted,
} from "@/lib/admin/access-manager";
import {
  PUBLIC_AUTH_SECURITY_PARAM,
  PUBLIC_AUTH_SECURITY_VALUE,
} from "@/lib/auth/public-auth-gate";
import {
  getSiteUrl,
  getSupabaseUrl,
  normalizeForwardedHost,
  normalizePublicUrl,
  scrubSiteUrlEnv,
} from "@/lib/env";

const STAFF_ROLES = new Set(["superadmin", "admin", "editor", "journalist"]);

/**
 * OLS/proxy sometimes duplicates Origin / X-Forwarded-Host
 * (`https://fptn.com, https://fptn.com`). Next Server Actions call
 * `new URL(...)` on those headers and throw ERR_INVALID_URL before
 * the action body — which paints app/error.tsx.
 *
 * Always force a single clean Origin / Host when anything looks multi-valued
 * or unparseable. Prefer Host-derived origin over a poisoned Origin header.
 */
function sanitizedRequestHeaders(request: NextRequest): Headers {
  scrubSiteUrlEnv();

  const headers = new Headers(request.headers);

  const xfHostRaw = headers.get("x-forwarded-host");
  const hostRaw = headers.get("host");
  const xfHost = normalizeForwardedHost(xfHostRaw) || normalizeForwardedHost(hostRaw);
  if (xfHost && xfHostRaw && xfHost !== xfHostRaw) {
    headers.set("x-forwarded-host", xfHost);
  }
  if (hostRaw && /[\s,;]/.test(hostRaw)) {
    const cleaned = normalizeForwardedHost(hostRaw);
    if (cleaned) headers.set("host", cleaned);
  }

  const originRaw = headers.get("origin");
  const originLooksBad =
    !originRaw ||
    /[\s,;]/.test(originRaw) ||
    !normalizePublicUrl(originRaw, "");

  if (originLooksBad) {
    const proto =
      headers.get("x-forwarded-proto")?.split(",")[0]?.trim() ||
      (request.nextUrl.protocol === "https:" ? "https" : "http");
    const host = xfHost || normalizeForwardedHost(headers.get("host"));
    const rebuilt = host
      ? normalizePublicUrl(`${proto}://${host}`, "")
      : normalizePublicUrl(getSiteUrl(), "");
    if (rebuilt) {
      headers.set("origin", rebuilt);
    } else if (originRaw) {
      const cleaned = normalizePublicUrl(originRaw, "");
      if (cleaned) headers.set("origin", cleaned);
      else headers.delete("origin");
    }
  } else if (originRaw) {
    const cleaned = normalizePublicUrl(originRaw, "");
    if (cleaned && cleaned !== originRaw) headers.set("origin", cleaned);
  }

  return headers;
}

/**
 * Refresh the auth session and gate /admin behind staff roles.
 */
export async function updateSession(request: NextRequest) {
  let requestHeaders: Headers;
  try {
    requestHeaders = sanitizedRequestHeaders(request);
  } catch (err) {
    console.error("[middleware] header sanitize failed", err);
    scrubSiteUrlEnv();
    requestHeaders = new Headers(request.headers);
  }

  let supabaseResponse = NextResponse.next({
    request: { headers: requestHeaders },
  });

  const key =
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ||
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY;

  let url = "";
  try {
    url = getSupabaseUrl();
  } catch (err) {
    console.error("[middleware] getSupabaseUrl failed", err);
    return supabaseResponse;
  }

  if (!url || !key || url.includes("placeholder") || url.includes("YOUR_PROJECT")) {
    return supabaseResponse;
  }

  let supabase;
  try {
    supabase = createServerClient(url, key, {
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
  } catch (err) {
    console.error("[middleware] createServerClient failed", err);
    return supabaseResponse;
  }

  try {
    const {
      data: { user },
    } = await supabase.auth.getUser();

    const path = request.nextUrl.pathname;
    const isAdmin = path === "/admin" || path.startsWith("/admin/");

    if (isAdmin) {
      const accessParam = request.nextUrl.searchParams.get(ADMIN_ACCESS_QUERY_PARAM);
      const accessCookie = request.cookies.get(ADMIN_ACCESS_COOKIE)?.value;

      if (!isAdminAccessGranted(accessParam, accessCookie)) {
        const home = request.nextUrl.clone();
        home.pathname = "/";
        home.search = "";
        return NextResponse.redirect(home);
      }

      if (accessParam === ADMIN_ACCESS_QUERY_VALUE) {
        supabaseResponse.cookies.set(ADMIN_ACCESS_COOKIE, ADMIN_ACCESS_QUERY_VALUE, {
          path: "/",
          maxAge: 60 * 60 * 24 * 90,
          httpOnly: true,
          sameSite: "lax",
          secure: request.nextUrl.protocol === "https:",
        });
      }

      if (!user) {
        const login = request.nextUrl.clone();
        login.pathname = "/login";
        login.search = "";
        login.searchParams.set("next", path);
        login.searchParams.set(
          PUBLIC_AUTH_SECURITY_PARAM,
          PUBLIC_AUTH_SECURITY_VALUE,
        );
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
