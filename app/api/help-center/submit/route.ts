import { NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";
import {
  HELP_CENTER_AREAS,
  JOURNALISM_ISSUES,
  JOURNALISM_AREA,
} from "@/lib/help-center/options";
import { saveHelpCenterAttachments } from "@/lib/help-center/upload";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function trimField(value: FormDataEntryValue | null, max = 5000): string {
  if (typeof value !== "string") return "";
  return value.trim().slice(0, max);
}

export async function POST(request: Request) {
  const admin = createAdminClient();
  if (!admin) {
    return NextResponse.json(
      { ok: false, error: "Service temporarily unavailable." },
      { status: 503 },
    );
  }

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

  const email = trimField(formData.get("email"), 320);
  const helpArea = trimField(formData.get("help_area"), 200);
  const journalismIssue = trimField(formData.get("journalism_issue"), 200) || null;
  const subject = trimField(formData.get("subject"), 500);
  const description = trimField(formData.get("description"), 8000);

  if (!email || !EMAIL_RE.test(email)) {
    return NextResponse.json(
      { ok: false, error: "Enter a valid email address." },
      { status: 400 },
    );
  }
  if (!HELP_CENTER_AREAS.includes(helpArea as (typeof HELP_CENTER_AREAS)[number])) {
    return NextResponse.json(
      { ok: false, error: "Select a help area." },
      { status: 400 },
    );
  }
  if (
    journalismIssue &&
    !JOURNALISM_ISSUES.includes(
      journalismIssue as (typeof JOURNALISM_ISSUES)[number],
    )
  ) {
    return NextResponse.json(
      { ok: false, error: "Invalid journalism issue selection." },
      { status: 400 },
    );
  }
  if (helpArea !== JOURNALISM_AREA && journalismIssue) {
    return NextResponse.json(
      { ok: false, error: "Journalism issue only applies to journalism requests." },
      { status: 400 },
    );
  }
  if (!subject) {
    return NextResponse.json(
      { ok: false, error: "Subject is required." },
      { status: 400 },
    );
  }
  if (!description || description.length < 10) {
    return NextResponse.json(
      { ok: false, error: "Please describe your request (at least 10 characters)." },
      { status: 400 },
    );
  }

  const attachmentFiles: File[] = [];
  for (const entry of formData.getAll("attachments")) {
    if (entry instanceof File && entry.size > 0) attachmentFiles.push(entry);
  }

  let attachmentPaths: string[] = [];
  if (attachmentFiles.length > 0) {
    const saved = await saveHelpCenterAttachments(attachmentFiles);
    if (!saved.ok) {
      return NextResponse.json({ ok: false, error: saved.error }, { status: 400 });
    }
    attachmentPaths = saved.paths;
  }

  const { error } = await admin.from("help_center_submissions").insert({
    email,
    help_area: helpArea,
    journalism_issue:
      helpArea === JOURNALISM_AREA ? journalismIssue : null,
    subject,
    description,
    attachment_paths: attachmentPaths,
  });

  if (error) {
    console.error("help_center_submissions insert", error);
    return NextResponse.json(
      { ok: false, error: "Could not save your request. Please try again later." },
      { status: 500 },
    );
  }

  return NextResponse.json({ ok: true });
}
