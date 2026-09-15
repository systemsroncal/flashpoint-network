export type EmailDesign = {
  headerBgColor: string;
  footerBgColor: string;
  logoUrl: string;
  maxWidth: number;
};

export const EMAIL_SHORTCODE_SAMPLES: Record<string, string> = {
  SITE_NAME: "Flash Point Network",
  SITE_URL: "https://fpnetwork.local",
  SITE_TAGLINE: "Get The Full Story. As It Is.",
  CURRENT_USER_FULLNAME: "Alex Rivera",
  CURRENT_USER_NAME: "Alex",
  CURRENT_USER_EMAIL: "alex@example.com",
  RESET_LINK: "https://fpnetwork.local/reset?token=sample",
  CURRENT_YEAR: String(new Date().getFullYear()),
  CURRENT_DATE: new Date().toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  }),
};

export function replaceEmailShortcodes(
  input: string,
  samples: Record<string, string> = EMAIL_SHORTCODE_SAMPLES,
) {
  return input.replace(/\{([A-Z0-9_]+)\}/g, (match, key: string) => {
    return samples[key] ?? match;
  });
}

export function compileEmailPreviewHtml(options: {
  subject: string;
  bodyHtml: string;
  design: EmailDesign;
  siteName?: string;
}) {
  const { subject, bodyHtml, design } = options;
  const siteName = options.siteName || EMAIL_SHORTCODE_SAMPLES.SITE_NAME;
  const width = Math.min(Math.max(design.maxWidth || 600, 320), 900);
  const body = replaceEmailShortcodes(bodyHtml || "<p></p>");
  const subjectCompiled = replaceEmailShortcodes(subject || "(no subject)");
  const logo = design.logoUrl?.trim();
  const headerBg = design.headerBgColor || "#1b2a64";
  const footerBg = design.footerBgColor || "#111111";

  return `<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8" />
  <title>${escapeAttr(subjectCompiled)}</title>
</head>
<body style="margin:0;padding:24px;background:#f3f4f6;font-family:Arial,Helvetica,sans-serif;color:#111;">
  <table role="presentation" width="100%" cellspacing="0" cellpadding="0">
    <tr>
      <td align="center">
        <table role="presentation" width="${width}" cellspacing="0" cellpadding="0" style="width:100%;max-width:${width}px;background:#ffffff;border-radius:8px;overflow:hidden;border:1px solid #e5e7eb;">
          <tr>
            <td style="background:${escapeAttr(headerBg)};padding:20px 24px;text-align:left;">
              ${
                logo
                  ? `<img src="${escapeAttr(logo)}" alt="${escapeAttr(siteName)}" style="display:block;max-height:40px;max-width:180px;height:auto;" />`
                  : `<div style="color:#fff;font-size:18px;font-weight:700;">${escapeHtml(siteName)}</div>`
              }
            </td>
          </tr>
          <tr>
            <td style="padding:12px 24px 0;font-size:12px;color:#6b7280;">
              Subject: <strong style="color:#111;">${escapeHtml(subjectCompiled)}</strong>
            </td>
          </tr>
          <tr>
            <td style="padding:16px 24px 28px;font-size:15px;line-height:1.6;color:#111;">
              ${body}
            </td>
          </tr>
          <tr>
            <td style="background:${escapeAttr(footerBg)};padding:16px 24px;color:#ffffff;font-size:12px;line-height:1.5;">
              &copy; ${EMAIL_SHORTCODE_SAMPLES.CURRENT_YEAR} ${escapeHtml(siteName)}<br />
              ${escapeHtml(EMAIL_SHORTCODE_SAMPLES.SITE_TAGLINE)}
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>`;
}

function escapeHtml(value: string) {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

function escapeAttr(value: string) {
  return escapeHtml(value).replace(/'/g, "&#39;");
}
