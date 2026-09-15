import { getResendApiKey, getSiteName } from "@/lib/env";

export type SendEmailInput = {
  to: string;
  subject: string;
  html: string;
  from?: string;
};

/**
 * Email sender stub. Uses Resend when RESEND_API_KEY is set; otherwise logs a mock send.
 */
export async function sendEmail(input: SendEmailInput) {
  const apiKey = getResendApiKey();
  const from = input.from || process.env.EMAIL_FROM || `noreply@${getSiteName().toLowerCase().replace(/\s+/g, "")}.local`;

  if (!apiKey) {
    console.info("[email:mock]", {
      to: input.to,
      subject: input.subject,
      from,
    });
    return { id: "mock-email-id", mocked: true as const };
  }

  const { Resend } = await import("resend");
  const resend = new Resend(apiKey);
  const result = await resend.emails.send({
    from,
    to: input.to,
    subject: input.subject,
    html: input.html,
  });

  return { ...result, mocked: false as const };
}
