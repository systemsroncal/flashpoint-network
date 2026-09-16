"use server";

import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { compileEmailPreviewHtml, replaceEmailShortcodes } from "@/lib/email/preview";
import { sendEmail } from "@/lib/email";
import { getSiteName, getSiteUrl, scrubSiteUrlEnv } from "@/lib/env";
import { safeNext } from "@/lib/auth/safe-next";

function rethrowRedirect(error: unknown) {
  if (
    typeof error === "object" &&
    error !== null &&
    "digest" in error &&
    typeof (error as { digest?: unknown }).digest === "string" &&
    String((error as { digest: string }).digest).startsWith("NEXT_REDIRECT")
  ) {
    throw error;
  }
}

const AUTH_UNAVAILABLE =
  "Sign-in is temporarily unavailable. Try again in a few minutes.";

const SITE_URL_MISCONFIGURED =
  "Site URL is misconfigured (app env, PM2, or Supabase Auth → Site URL). It must be a single origin like https://fptn.com — then rebuild and pm2 restart --update-env.";

function friendlyAuthMessage(error: unknown, fallback: string): string {
  const message =
    error instanceof Error
      ? error.message
      : typeof error === "string"
        ? error
        : "";
  if (
    (error instanceof TypeError && /Invalid URL/i.test(message)) ||
    /ERR_INVALID_URL|Invalid URL/i.test(message)
  ) {
    return SITE_URL_MISCONFIGURED;
  }
  return fallback;
}

function fail(path: string, message: string, extra?: string): never {
  const qs = new URLSearchParams({ error: message });
  if (extra) qs.set("next", extra);
  redirect(`${path}?${qs.toString()}`);
}

export async function signInAction(formData: FormData) {
  const next = safeNext(String(formData.get("next") || "/"));
  try {
    scrubSiteUrlEnv();
    const email = String(formData.get("email") || "").trim();
    const password = String(formData.get("password") || "");
    // Touch site URL early so a bad env fails inside this try, not later.
    void getSiteUrl();
    const supabase = await createClient();
    if (!supabase) fail("/login", AUTH_UNAVAILABLE, next);
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) {
      fail("/login", error.message, next);
    }
    const admin = createAdminClient();
    const { data: userData } = await supabase.auth.getUser();
    if (userData.user && admin) {
      const { data: profile } = await admin
        .from("profiles")
        .select("role")
        .eq("id", userData.user.id)
        .maybeSingle();
      const role = profile?.role as string | undefined;
      if (
        next === "/" &&
        role &&
        ["superadmin", "admin", "editor", "journalist"].includes(role)
      ) {
        redirect("/admin");
      }
    }
    redirect(next);
  } catch (error) {
    rethrowRedirect(error);
    console.error("[auth] signInAction", error);
    fail("/login", friendlyAuthMessage(error, AUTH_UNAVAILABLE), next);
  }
}

export async function signUpAction(formData: FormData) {
  try {
    scrubSiteUrlEnv();
    const email = String(formData.get("email") || "").trim();
    const password = String(formData.get("password") || "");
    const firstName = String(formData.get("first_name") || "").trim();
    const lastName = String(formData.get("last_name") || "").trim();
    const supabase = await createClient();
    if (!supabase) fail("/register", AUTH_UNAVAILABLE);
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          first_name: firstName,
          last_name: lastName,
          full_name: [firstName, lastName].filter(Boolean).join(" "),
          role: "subscriber",
        },
        emailRedirectTo: `${getSiteUrl()}/auth/callback`,
      },
    });
    if (error) {
      fail("/register", error.message);
    }
    if (data.user?.email) {
      await sendTemplateEmail("welcome", data.user.email, {
        CURRENT_USER_FULLNAME:
          [firstName, lastName].filter(Boolean).join(" ") || "Reader",
        CURRENT_USER_NAME: firstName || "Reader",
      }).catch(() => undefined);
    }
    redirect("/login?registered=1");
  } catch (error) {
    rethrowRedirect(error);
    console.error("[auth] signUpAction", error);
    fail("/register", friendlyAuthMessage(error, AUTH_UNAVAILABLE));
  }
}

export async function signOutAction() {
  try {
    const supabase = await createClient();
    if (supabase) await supabase.auth.signOut();
  } catch (error) {
    console.error("[auth] signOutAction", error);
  }
  redirect("/");
}

export async function requestPasswordResetAction(formData: FormData) {
  try {
    scrubSiteUrlEnv();
    const email = String(formData.get("email") || "").trim();
    const supabase = await createClient();
    if (!supabase) fail("/forgot-password", AUTH_UNAVAILABLE);
    const redirectTo = `${getSiteUrl()}/auth/callback?next=/update-password&type=recovery`;
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo,
    });
    if (error) {
      fail("/forgot-password", error.message);
    }
    await sendTemplateEmail("password-reset", email, {
      CURRENT_USER_NAME: email.split("@")[0] || "there",
      RESET_LINK: redirectTo,
    }).catch(() => undefined);
    redirect("/forgot-password?sent=1");
  } catch (error) {
    rethrowRedirect(error);
    console.error("[auth] requestPasswordResetAction", error);
    fail("/forgot-password", friendlyAuthMessage(error, AUTH_UNAVAILABLE));
  }
}

export async function updatePasswordAction(formData: FormData) {
  try {
    const password = String(formData.get("password") || "");
    const supabase = await createClient();
    if (!supabase) fail("/update-password", AUTH_UNAVAILABLE);
    if (password.length < 8) {
      fail("/update-password", "Password must be at least 8 characters");
    }
    const { error } = await supabase.auth.updateUser({ password });
    if (error) {
      fail("/update-password", error.message);
    }
    redirect("/update-password?done=1");
  } catch (error) {
    rethrowRedirect(error);
    console.error("[auth] updatePasswordAction", error);
    fail("/update-password", AUTH_UNAVAILABLE);
  }
}

async function sendTemplateEmail(
  slug: string,
  to: string,
  extras: Record<string, string>,
) {
  try {
    const admin = createAdminClient();
    if (!admin) return;
    const { data: tpl } = await admin
      .from("email_templates")
      .select("*")
      .eq("slug", slug)
      .maybeSingle();
    if (!tpl) return;
    const samples = {
      SITE_NAME: getSiteName(),
      SITE_URL: getSiteUrl(),
      SITE_TAGLINE: "Get The Full Story. As It Is.",
      CURRENT_YEAR: String(new Date().getFullYear()),
      CURRENT_DATE: new Date().toLocaleDateString("en-US"),
      ...extras,
    };
    const subject = replaceEmailShortcodes(tpl.subject, samples);
    const body = replaceEmailShortcodes(tpl.body_html, samples);
    const wrapped = compileEmailPreviewHtml({
      subject,
      bodyHtml: body,
      design: {
        headerBgColor: tpl.header_bg_color || "#1b2a64",
        footerBgColor: tpl.footer_bg_color || "#111111",
        logoUrl: tpl.logo_url || `${getSiteUrl()}/brand/fpn-logo-mark.svg`,
        maxWidth: tpl.max_width || 600,
        logoAlign: (tpl.logo_align as "left" | "center" | "right") || "center",
      },
      siteName: getSiteName(),
    });
    await sendEmail({ to, subject, html: wrapped });
  } catch (err) {
    console.error("[auth] sendTemplateEmail", slug, err);
  }
}
