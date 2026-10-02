import type { PostComment } from "@/lib/data/post-comments";

/** Public comment byline: first name + last initial (e.g. "Maria G."). */
export function commentPublicDisplayName(raw: string): string {
  const name = raw.trim();
  if (!name) return "Reader";
  const parts = name.split(/\s+/).filter(Boolean);
  if (parts.length === 1) return parts[0];
  const first = parts[0];
  const last = parts[parts.length - 1];
  if (last.length <= 2 && last.endsWith(".")) {
    return `${first} ${last}`;
  }
  const initial = last[0]?.toUpperCase();
  return initial ? `${first} ${initial}.` : first;
}

export function commentAuthorName(comment: PostComment): string {
  const name = comment.author_name?.trim();
  return commentPublicDisplayName(name || "Reader");
}

export function commentAuthorInitials(comment: PostComment): string {
  const fromName = (comment.author_name || "").trim() || "Reader";
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
  if (full) return commentPublicDisplayName(full);
  const first = (profile.first_name || "").trim();
  const last = (profile.last_name || "").trim();
  if (first && last) {
    const initial = last[0]?.toUpperCase();
    return initial ? `${first} ${initial}.` : first;
  }
  if (first) return first;
  if (last) return last;
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
