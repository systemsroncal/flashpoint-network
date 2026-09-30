import { NextResponse } from "next/server";
import { sendEmail } from "@/lib/email";
import { getAdvertisingInquiryEmail, getSiteName } from "@/lib/env";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function trimField(value: FormDataEntryValue | null, max = 2000): string {
  if (typeof value !== "string") return "";
  return value.trim().slice(0, max);
}

export async function POST(request: Request) {
  let formData: FormData;
  try {
    formData = await request.formData();
  } catch {
    return NextResponse.json(
      { ok: false, error: "Invalid form data." },
      { status: 400 },
    );
  }

  if (trimField(formData.get("website_url"), 200)) {
    return NextResponse.json({ ok: true });
  }

  const company = trimField(formData.get("company"), 200);
  const name = trimField(formData.get("name"), 200);
  const email = trimField(formData.get("email"), 320);
  const phone = trimField(formData.get("phone"), 80);
  const message = trimField(formData.get("message"), 6000);

  if (!name) {
    return NextResponse.json(
      { ok: false, error: "Your name is required." },
      { status: 400 },
    );
  }
  if (!email || !EMAIL_RE.test(email)) {
    return NextResponse.json(
      { ok: false, error: "Enter a valid email address." },
      { status: 400 },
    );
  }
  if (!message || message.length < 10) {
    return NextResponse.json(
      { ok: false, error: "Tell us about your advertising goals (at least 10 characters)." },
      { status: 400 },
    );
  }

  const to = getAdvertisingInquiryEmail();
  const site = getSiteName();
  const subject = `[${site}] Advertising inquiry — ${company || name}`;
  const html = `
    <p><strong>New advertising inquiry</strong></p>
    <ul>
      <li><strong>Name:</strong> ${escapeHtml(name)}</li>
      <li><strong>Company:</strong> ${escapeHtml(company || "—")}</li>
      <li><strong>Email:</strong> ${escapeHtml(email)}</li>
      <li><strong>Phone:</strong> ${escapeHtml(phone || "—")}</li>
    </ul>
    <p><strong>Message</strong></p>
    <p>${escapeHtml(message).replace(/\n/g, "<br />")}</p>
  `;

  try {
    await sendEmail({ to, subject, html });
  } catch (err) {
    console.error("[advertise/submit] sendEmail", err);
    return NextResponse.json(
      { ok: false, error: "Could not send your message. Please try again later." },
      { status: 500 },
    );
  }

  return NextResponse.json({ ok: true });
}

function escapeHtml(text: string): string {
  return text
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}
