/** IANA timezone for site-wide display / datetime-local conversion. */
export const SITE_TIMEZONE_SETTING = "timezone";

/** Default when unset — Central Time (Chicago). */
export const DEFAULT_SITE_TIMEZONE = "America/Chicago";

export type TimezoneOption = {
  value: string;
  label: string;
};

/** Common US + world zones for the admin select (English labels). */
export const SITE_TIMEZONE_OPTIONS: TimezoneOption[] = [
  { value: "America/Chicago", label: "Chicago (Central Time)" },
  { value: "America/New_York", label: "New York (Eastern Time)" },
  { value: "America/Denver", label: "Denver (Mountain Time)" },
  { value: "America/Phoenix", label: "Phoenix (Mountain, no DST)" },
  { value: "America/Los_Angeles", label: "Los Angeles (Pacific Time)" },
  { value: "America/Anchorage", label: "Anchorage (Alaska Time)" },
  { value: "Pacific/Honolulu", label: "Honolulu (Hawaii Time)" },
  { value: "UTC", label: "UTC" },
  { value: "America/Toronto", label: "Toronto" },
  { value: "America/Mexico_City", label: "Mexico City" },
  { value: "Europe/London", label: "London" },
  { value: "Europe/Paris", label: "Paris" },
  { value: "Asia/Jerusalem", label: "Jerusalem" },
  { value: "Asia/Dubai", label: "Dubai" },
  { value: "Asia/Tokyo", label: "Tokyo" },
  { value: "Australia/Sydney", label: "Sydney" },
];

export function isValidIanaTimezone(value: string): boolean {
  if (!value || typeof value !== "string") return false;
  try {
    Intl.DateTimeFormat("en-US", { timeZone: value });
    return true;
  } catch {
    return false;
  }
}

export function normalizeSiteTimezone(raw: unknown): string {
  if (typeof raw === "string") {
    const trimmed = raw.trim().replace(/^"|"$/g, "");
    if (isValidIanaTimezone(trimmed)) return trimmed;
  }
  if (raw && typeof raw === "object" && !Array.isArray(raw)) {
    const tz = (raw as { timezone?: unknown }).timezone;
    if (typeof tz === "string" && isValidIanaTimezone(tz.trim())) {
      return tz.trim();
    }
  }
  return DEFAULT_SITE_TIMEZONE;
}
