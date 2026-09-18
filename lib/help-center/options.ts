export const HELP_CENTER_AREAS = [
  "Journalism/Correction/Media Inquiry",
  "Account & Subscription",
  "Website & Technical Support",
  "Advertising & Partnerships",
  "Other",
] as const;

export type HelpCenterArea = (typeof HELP_CENTER_AREAS)[number];

export const JOURNALISM_ISSUES = [
  "Media Inquiry/Statement Request (Public Relations)",
  "Correction or Clarification",
  "Tip or Story Idea",
  "Rights & Permissions",
  "Other Journalism Issue",
] as const;

export type JournalismIssue = (typeof JOURNALISM_ISSUES)[number];

export const JOURNALISM_AREA: HelpCenterArea =
  "Journalism/Correction/Media Inquiry";
