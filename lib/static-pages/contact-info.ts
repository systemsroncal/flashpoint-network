/** Public contact details used across legal, About, and Contact pages. */
export const FPTN_PUBLIC_CONTACT = {
  legalName: "FlashPoint Television Network",
  siteName: "FlashPoint Television Network",
  siteUrl: "https://fptn.com",
  siteHost: "fptn.com",
  supportEmail: "support@fptn.com",
  privacyEmail: "support@fptn.com",
  legalEmail: "support@fptn.com",
  copyrightEmail: "support@fptn.com",
  partnershipsEmail: "partnerships@fptn.com",
  subscriptionsEmail: "subscriptions@fptn.com",
  tipsEmail: "tips@fptn.com",
  pressEmail: "press@fptn.com",
  infoEmail: "info@fptn.com",
  supportHoursLines: [
    "Monday–Friday: 8:00 AM–8:00 PM CT",
    "Saturday–Sunday: 10:00 AM–6:00 PM CT",
  ],
  supportHoursText:
    "Monday–Friday: 8:00 AM–8:00 PM CT; Saturday–Sunday: 10:00 AM–6:00 PM CT",
  governingState: "Texas",
  marketDataDelayMinutes: "15",
  marketDataProviders:
    "licensed third-party financial and market data providers",
  privacyRequestUrl: "https://fptn.com/contact",
  contactPagePath: "/contact",
  social: {
    x: "https://x.com/fpnetwork",
    facebook: "https://facebook.com/fpnetwork",
    instagram: "https://instagram.com/fpnetwork",
    youtube: "https://youtube.com/@fpnetwork",
  },
} as const;

/** Replace Figma/legal template brackets with live site details. */
export function resolveLegalPlaceholders(text: string): string {
  const c = FPTN_PUBLIC_CONTACT;
  const map: Record<string, string> = {
    "[INSERT GENERAL SUPPORT OR LEGAL EMAIL]": c.supportEmail,
    "[INSERT COPYRIGHT OR LEGAL EMAIL]": c.copyrightEmail,
    "[INSERT LEGAL OR SUPPORT EMAIL]": c.supportEmail,
    "[INSERT PRIVACY EMAIL]": c.privacyEmail,
    "[INSERT PRIVACY EMAIL OR FORM]": `${c.privacyEmail} or ${c.siteUrl}${c.contactPagePath}`,
    "[INSERT PRIVACY REQUEST FORM URL]": c.privacyRequestUrl,
    "[INSERT CONTACT EMAIL OR FORM]": `${c.supportEmail} or ${c.siteUrl}${c.contactPagePath}`,
    "[INSERT COPYRIGHT EMAIL]": c.copyrightEmail,
    "[INSERT LEGAL COMPANY NAME]": c.legalName,
    "[INSERT OFFICIAL BUSINESS ADDRESS]":
      `For current mailing address, email ${c.supportEmail} or visit ${c.siteUrl}${c.contactPagePath}.`,
    "[INSERT BUSINESS HOURS, IF APPLICABLE]": c.supportHoursText,
    "[INSERT STATE]": c.governingState,
    "[INSERT APPLICABLE DELAY, IF ANY]": `${c.marketDataDelayMinutes} minutes`,
    "[INSERT NUMBER]": c.marketDataDelayMinutes,
    "[INSERT APPROVED DATA PROVIDERS]": c.marketDataProviders,
    "[INSERT APPROVED PROVIDERS]": c.marketDataProviders,
  };

  let out = text;
  for (const [from, to] of Object.entries(map)) {
    out = out.split(from).join(to);
  }
  out = out.split("FlashPointNetwork.com").join(c.siteHost);
  out = out.split("flashpointnetwork.com").join(c.siteHost);
  return out;
}
