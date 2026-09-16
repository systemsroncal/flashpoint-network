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
  const from =
    input.from ||
    process.env.EMAIL_FROM ||
    `noreply@${getSiteName().toLowerCase().replace(/\s+/g, "")}.local`;

  if (!apiKey) {
    console.info("[email:mock]", {
      to: input.to,
      subject: input.subject,
      from,
    });
    return { id: "mock-email-id", mocked: true as const };
  }

  try {
    const { Resend } = await import("resend");
    const resend = new Resend(apiKey);
    const result = await resend.emails.send({
      from,
      to: input.to,
      subject: input.subject,
      html: input.html,
    });
    if (result.error) {
      console.error("[email:resend]", result.error);
      return { id: "resend-error", mocked: true as const, error: result.error };
    }
    return { ...result, mocked: false as const };
  } catch (err) {
    console.error("[email:resend] send failed; falling back to mock log", err);
    console.info("[email:mock]", {
      to: input.to,
      subject: input.subject,
      from,
    });
    return { id: "mock-email-id", mocked: true as const };
  }
}
