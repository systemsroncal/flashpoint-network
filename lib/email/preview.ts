export type LogoAlign = "left" | "center" | "right";

export type EmailDesign = {
  headerBgColor: string;
  footerBgColor: string;
  logoUrl: string;
  maxWidth: number;
  logoAlign: LogoAlign;
};

export const EMAIL_SHORTCODE_SAMPLES: Record<string, string> = {
  SITE_NAME: "Flash Point Network",
  SITE_URL: "https://fpnetwork.local",
  SITE_TAGLINE: "Get The Full Story. As It Is.",
  CURRENT_USER_FULLNAME: "Alex Rivera",
  CURRENT_USER_NAME: "Alex",
  CURRENT_USER_EMAIL: "alex@example.com",
  RESET_LINK: "https://fpnetwork.local/reset?token=sample",
};

function sampleShortcodes(): Record<string, string> {
  const now = new Date();
  return {
    ...EMAIL_SHORTCODE_SAMPLES,
    CURRENT_YEAR: String(now.getFullYear()),
    CURRENT_DATE: now.toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    }),
  };
}

export function replaceEmailShortcodes(
  input: string,
  samples: Record<string, string> = sampleShortcodes(),
) {
  return input.replace(/\{([A-Z0-9_]+)\}/g, (match, key: string) => {
    return samples[key] ?? match;
  });
}

function logoAlignCss(align: LogoAlign): {
  tdAlign: string;
  textAlign: string;
  imgStyle: string;
} {
  if (align === "right") {
    return {
      tdAlign: "right",
      textAlign: "right",
      imgStyle: "display:inline-block;max-height:40px;max-width:180px;height:auto;",
    };
  }
  if (align === "left") {
    return {
      tdAlign: "left",
      textAlign: "left",
      imgStyle: "display:block;max-height:40px;max-width:180px;height:auto;",
    };
  }
  return {
    tdAlign: "center",
    textAlign: "center",
    imgStyle:
      "display:inline-block;max-height:40px;max-width:180px;height:auto;margin:0 auto;",
  };
}

export function compileEmailPreviewHtml(options: {
  subject: string;
  bodyHtml: string;
  design: EmailDesign;
  siteName?: string;
}) {
  const samples = sampleShortcodes();
  const { subject, bodyHtml, design } = options;
  const siteName = options.siteName || samples.SITE_NAME;
  const width = Math.min(Math.max(design.maxWidth || 600, 320), 900);
  const body = replaceEmailShortcodes(bodyHtml || "<p></p>", samples);
  const subjectCompiled = replaceEmailShortcodes(
    subject || "(no subject)",
    samples,
  );
  const logo = design.logoUrl?.trim();
  const headerBg = design.headerBgColor || "#1b2a64";
  const footerBg = design.footerBgColor || "#111111";
  const align = design.logoAlign || "center";
  const { tdAlign, textAlign, imgStyle } = logoAlignCss(align);

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
            <td align="${tdAlign}" style="background:${escapeAttr(headerBg)};padding:20px 24px;text-align:${textAlign};">
              ${
                logo
                  ? `<img src="${escapeAttr(logo)}" alt="${escapeAttr(siteName)}" style="${imgStyle}" />`
                  : `<div style="color:#fff;font-size:18px;font-weight:700;text-align:${textAlign};">${escapeHtml(siteName)}</div>`
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
              &copy; ${samples.CURRENT_YEAR} ${escapeHtml(siteName)}<br />
              ${escapeHtml(samples.SITE_TAGLINE)}
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
