/** Catalog of public static routes editable in admin → Pages (SEO). */
export type PublicPageGroup =
  | "Main"
  | "News"
  | "Programs"
  | "Legal"
  | "Support"
  | "Feeds";

export type PublicPageDefinition = {
  key: string;
  path: string;
  label: string;
  group: PublicPageGroup;
  defaultTitle: string;
  defaultDescription: string;
};

export const PUBLIC_PAGES: PublicPageDefinition[] = [
  {
    key: "home",
    path: "/",
    label: "Home",
    group: "Main",
    defaultTitle: "Home",
    defaultDescription:
      "FlashPoint Television Network — digital newspaper. Get The Full Story. As It Is.",
  },
  {
    key: "about",
    path: "/about",
    label: "About",
    group: "Main",
    defaultTitle: "About",
    defaultDescription:
      "Learn about FlashPoint Television Network, Gene Bailey, Teri Bailey, and our mission.",
  },
  {
    key: "live",
    path: "/live",
    label: "Live stream",
    group: "Main",
    defaultTitle: "Streaming Now: Watch Live",
    defaultDescription:
      "Watch FlashPoint Television Network live — faith-based programming, news, and original shows on FPTN.com.",
  },
  {
    key: "contact",
    path: "/contact",
    label: "Contact",
    group: "Main",
    defaultTitle: "Contact",
    defaultDescription:
      "Contact FlashPoint Television Network for media, partnerships, and general inquiries.",
  },
  {
    key: "search",
    path: "/search",
    label: "Search",
    group: "Main",
    defaultTitle: "Search",
    defaultDescription: "Search FlashPoint Television Network news.",
  },
  {
    key: "news",
    path: "/news",
    label: "FPTN News (hub)",
    group: "News",
    defaultTitle: "FPTN News",
    defaultDescription:
      "Breaking news, politics, and analysis from FlashPoint Television Network.",
  },
  {
    key: "events",
    path: "/events",
    label: "Events",
    group: "News",
    defaultTitle: "Events",
    defaultDescription: "Live and upcoming FlashPoint Television Network events",
  },
  {
    key: "classic-programs",
    path: "/classic-programs",
    label: "Family Classics",
    group: "Programs",
    defaultTitle: "Your Classic Favorites",
    defaultDescription:
      "Classic family programming on FlashPoint Television Network.",
  },
  {
    key: "children-programs",
    path: "/children-programs",
    label: "Children Programs",
    group: "Programs",
    defaultTitle: "Children Programs",
    defaultDescription:
      "Faith-based children's programming on FlashPoint Television Network.",
  },
  {
    key: "ministry-programs",
    path: "/ministry-programs",
    label: "Ministry Programs",
    group: "Programs",
    defaultTitle: "Ministry Programs",
    defaultDescription:
      "Gospel-centered ministry broadcasts on FlashPoint Television Network.",
  },
  {
    key: "network-programs",
    path: "/network-programs",
    label: "Network Programs",
    group: "Programs",
    defaultTitle: "FPTN Shows",
    defaultDescription:
      "Original shows and network programming on FlashPoint Television Network.",
  },
  {
    key: "schedule-programs",
    path: "/schedule-programs",
    label: "Schedule",
    group: "Programs",
    defaultTitle: "Schedule / Programs",
    defaultDescription:
      "FlashPoint Television Network broadcast schedule — Eastern Time.",
  },
  {
    key: "help-center",
    path: "/help-center",
    label: "Help Center",
    group: "Support",
    defaultTitle: "Help Center",
    defaultDescription:
      "Get help with FlashPoint Television Network support and journalism requests.",
  },
  {
    key: "advertise",
    path: "/advertise",
    label: "Advertise",
    group: "Support",
    defaultTitle: "Advertise with FPTN",
    defaultDescription:
      "Advertising and sponsorship opportunities on FlashPoint Television Network.",
  },
  {
    key: "terms",
    path: "/terms-and-conditions",
    label: "Terms & Conditions",
    group: "Legal",
    defaultTitle: "Terms & Conditions",
    defaultDescription:
      "Terms of Service for FlashPoint Television Network websites, platforms, and programming.",
  },
  {
    key: "privacy",
    path: "/privacy-policy",
    label: "Privacy Policy",
    group: "Legal",
    defaultTitle: "Privacy Policy",
    defaultDescription:
      "How FlashPoint Television Network collects, uses, and protects your personal information.",
  },
  {
    key: "disclaimer",
    path: "/data-disclaimer",
    label: "Data Disclaimer",
    group: "Legal",
    defaultTitle: "Data Disclaimer",
    defaultDescription:
      "Important information about financial, market, and third-party data on FlashPoint Television Network.",
  },
  {
    key: "copyright",
    path: "/copyright-policy",
    label: "Copyright Policy",
    group: "Legal",
    defaultTitle: "Copyright Policy and Infringement Notification",
    defaultDescription:
      "Copyright policy and DMCA infringement notification procedures for FlashPoint Television Network.",
  },
  {
    key: "feed-latest",
    path: "/feed/latest",
    label: "Feed: Latest News",
    group: "Feeds",
    defaultTitle: "Latest News",
    defaultDescription:
      "The newest published stories from FlashPoint Television Network.",
  },
  {
    key: "feed-podcasts",
    path: "/feed/podcasts",
    label: "Feed: Beyond the Broadcast",
    group: "Feeds",
    defaultTitle: "Beyond the Broadcast",
    defaultDescription: "Broadcast episodes, newest first.",
  },
  {
    key: "feed-videos",
    path: "/feed/videos",
    label: "Feed: Must-Watch Videos",
    group: "Feeds",
    defaultTitle: "Must-Watch Videos",
    defaultDescription: "Video stories and must-watch coverage, newest first.",
  },
  {
    key: "feed-premium",
    path: "/feed/premium",
    label: "Feed: Exclusive Content",
    group: "Feeds",
    defaultTitle: "Exclusive Content",
    defaultDescription: "Premium and exclusive FPTN stories, newest first.",
  },
  {
    key: "feed-popular",
    path: "/feed/popular",
    label: "Feed: Popular",
    group: "Feeds",
    defaultTitle: "Popular",
    defaultDescription: "Editor-flagged popular stories, newest first.",
  },
];

export function getPublicPageByKey(key: string): PublicPageDefinition | undefined {
  return PUBLIC_PAGES.find((p) => p.key === key);
}

export function normalizePublicPath(path: string): string {
  const t = path.trim();
  if (!t || t === "/") return "/";
  const withSlash = t.startsWith("/") ? t : `/${t}`;
  return withSlash.replace(/\/+$/, "") || "/";
}

export function getPublicPageByPath(path: string): PublicPageDefinition | undefined {
  const normalized = normalizePublicPath(path);
  return PUBLIC_PAGES.find((p) => normalizePublicPath(p.path) === normalized);
}
