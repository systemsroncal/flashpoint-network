import type { PostComment } from "@/lib/data/post-comments";

export function commentAuthorName(comment: PostComment): string {
  const name = comment.author_name?.trim();
  return name || "Reader";
}

export function commentAuthorInitials(comment: PostComment): string {
  const fromName = commentAuthorName(comment);
  const parts = fromName.split(/\s+/).filter(Boolean);
  if (parts.length >= 2) {
    return `${parts[0][0]}${parts[1][0]}`.toUpperCase();
  }
  if (parts.length === 1 && parts[0].length >= 2) {
    return parts[0].slice(0, 2).toUpperCase();
  }
  return fromName.slice(0, 2).toUpperCase() || "FP";
}

export function profileDisplayName(profile: {
  full_name?: string | null;
  first_name?: string | null;
  last_name?: string | null;
  email?: string | null;
}): string {
  const full = (profile.full_name || "").trim();
  if (full) return full;
  const parts = [profile.first_name, profile.last_name].filter(Boolean).join(" ").trim();
  if (parts) return parts;
  const email = (profile.email || "").trim();
  if (email) return email.split("@")[0] || "You";
  return "You";
}

export function profileInitials(profile: {
  full_name?: string | null;
  first_name?: string | null;
  last_name?: string | null;
  email?: string | null;
}): string {
  const first = profile.first_name?.[0];
  const last = profile.last_name?.[0];
  if (first || last) {
    return `${first || ""}${last || ""}`.toUpperCase() || "FP";
  }
  const full = (profile.full_name || "").trim();
  if (full) {
    const parts = full.split(/\s+/).filter(Boolean);
    if (parts.length >= 2) {
      return `${parts[0][0]}${parts[1][0]}`.toUpperCase();
    }
    return full.slice(0, 2).toUpperCase();
  }
  return profile.email?.[0]?.toUpperCase() || "FP";
}
