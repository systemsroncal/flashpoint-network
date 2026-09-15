"use server";

import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { compileEmailPreviewHtml, replaceEmailShortcodes } from "@/lib/email/preview";
import { sendEmail } from "@/lib/email";
import { getSiteName, getSiteUrl } from "@/lib/env";

function safeNext(path: string | null | undefined) {
  if (!path || !path.startsWith("/") || path.startsWith("//")) return "/";
  return path;
}

export async function signInAction(formData: FormData) {
  const email = String(formData.get("email") || "").trim();
  const password = String(formData.get("password") || "");
  const next = safeNext(String(formData.get("next") || "/"));
  const supabase = await createClient();
  if (!supabase) throw new Error("Auth is not configured");
  const { error } = await supabase.auth.signInWithPassword({ email, password });
  if (error) {
    redirect(`/login?error=${encodeURIComponent(error.message)}&next=${encodeURIComponent(next)}`);
  }
  // Staff land in admin by default when next is home
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
}

export async function signUpAction(formData: FormData) {
  const email = String(formData.get("email") || "").trim();
  const password = String(formData.get("password") || "");
  const firstName = String(formData.get("first_name") || "").trim();
  const lastName = String(formData.get("last_name") || "").trim();
  const supabase = await createClient();
  if (!supabase) throw new Error("Auth is not configured");
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
    redirect(`/register?error=${encodeURIComponent(error.message)}`);
  }
  // Best-effort welcome email from template
  if (data.user?.email) {
    await sendTemplateEmail("welcome", data.user.email, {
      CURRENT_USER_FULLNAME: [firstName, lastName].filter(Boolean).join(" ") || "Reader",
      CURRENT_USER_NAME: firstName || "Reader",
    }).catch(() => undefined);
  }
  redirect("/login?registered=1");
}

export async function signOutAction() {
  const supabase = await createClient();
  if (supabase) await supabase.auth.signOut();
  redirect("/");
}

export async function requestPasswordResetAction(formData: FormData) {
  const email = String(formData.get("email") || "").trim();
  const supabase = await createClient();
  if (!supabase) throw new Error("Auth is not configured");
  const redirectTo = `${getSiteUrl()}/auth/callback?next=/update-password&type=recovery`;
  const { error } = await supabase.auth.resetPasswordForEmail(email, {
    redirectTo,
  });
  if (error) {
    redirect(`/forgot-password?error=${encodeURIComponent(error.message)}`);
  }
  // Best-effort branded template (Supabase also sends its own recovery email)
  await sendTemplateEmail("password-reset", email, {
    CURRENT_USER_NAME: email.split("@")[0] || "there",
    RESET_LINK: redirectTo,
  }).catch(() => undefined);
  redirect("/forgot-password?sent=1");
}

export async function updatePasswordAction(formData: FormData) {
  const password = String(formData.get("password") || "");
  const supabase = await createClient();
  if (!supabase) throw new Error("Auth is not configured");
  if (password.length < 8) {
    redirect(
      `/update-password?error=${encodeURIComponent("Password must be at least 8 characters")}`,
    );
  }
  const { error } = await supabase.auth.updateUser({ password });
  if (error) {
    redirect(`/update-password?error=${encodeURIComponent(error.message)}`);
  }
  redirect("/update-password?done=1");
}

async function sendTemplateEmail(
  slug: string,
  to: string,
  extras: Record<string, string>,
) {
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
  const html = compileEmailPreviewHtml({
    subject,
    bodyHtml: tpl.body_html,
    design: {
      headerBgColor: tpl.header_bg_color || "#1b2a64",
      footerBgColor: tpl.footer_bg_color || "#111111",
      logoUrl: tpl.logo_url || `${getSiteUrl()}/brand/fpn-logo-mark.svg`,
      maxWidth: tpl.max_width || 600,
      logoAlign: (tpl.logo_align as "left" | "center" | "right") || "center",
    },
    siteName: getSiteName(),
  });
  // compileEmailPreviewHtml already replaces shortcodes in body via its own samples —
  // re-replace subject vars already done; for body use replace on tpl
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
  await sendEmail({ to, subject, html: wrapped || html });
}
