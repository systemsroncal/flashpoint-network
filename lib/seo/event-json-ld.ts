import type { EventItem } from "@/lib/types/cms";
import { compactJsonLd } from "@/lib/seo/json-ld";
import { absoluteSiteUrl } from "@/lib/seo/urls";

export function buildEventJsonLd(event: EventItem) {
  const url = absoluteSiteUrl(`/events/${event.slug}`);
  const siteUrl = absoluteSiteUrl("");

  return compactJsonLd({
    "@context": "https://schema.org",
    "@type": "Event",
    "@id": `${url}#event`,
    name: event.title,
    description: event.description || undefined,
    startDate: event.starts_at || undefined,
    endDate: event.ends_at || undefined,
    eventAttendanceMode: "https://schema.org/OnlineEventAttendanceMode",
    eventStatus: event.is_live
      ? "https://schema.org/EventScheduled"
      : "https://schema.org/EventScheduled",
    location: {
      "@type": "VirtualLocation",
      url: event.external_url || url,
    },
    image: event.thumbnail_url || undefined,
    organizer: {
      "@type": "Organization",
      "@id": `${siteUrl}/#organization`,
    },
    url,
  });
}
