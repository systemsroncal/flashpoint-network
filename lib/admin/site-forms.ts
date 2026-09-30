/** Public site forms surfaced in admin → Forms. */
export type SiteFormDefinition = {
  id: string;
  title: string;
  description: string;
  publicPath: string;
  adminEntriesPath: string;
};

export function getSiteFormById(id: string): SiteFormDefinition | undefined {
  return SITE_FORMS.find((f) => f.id === id);
}

export const SITE_FORMS: SiteFormDefinition[] = [
  {
    id: "help-center",
    title: "Help Center",
    description: "Support and journalism requests from /help-center",
    publicPath: "/help-center",
    adminEntriesPath: "/admin/forms/help-center",
  },
  {
    id: "advertise",
    title: "Advertising inquiry",
    description: "Advertiser leads from /advertise",
    publicPath: "/advertise",
    adminEntriesPath: "/admin/forms/advertise",
  },
];
