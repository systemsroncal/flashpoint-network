import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";

export type PostComment = {
  id: string;
  post_id: string;
  user_id: string;
  body: string;
  created_at: string;
  author_name: string;
};

type Row = {
  id: string;
  post_id: string;
  user_id: string;
  body: string;
  created_at: string;
  author: { full_name: string | null; first_name: string | null; last_name: string | null; email: string | null } | { full_name: string | null; first_name: string | null; last_name: string | null; email: string | null }[] | null;
};

function authorLabel(
  author: Row["author"],
): string {
  const p = Array.isArray(author) ? author[0] : author;
  if (!p) return "Reader";
  const full = (p.full_name || "").trim();
  if (full) return full;
  const parts = [p.first_name, p.last_name].filter(Boolean).join(" ").trim();
  if (parts) return parts;
  const email = (p.email || "").trim();
  if (email) return email.split("@")[0] || "Reader";
  return "Reader";
}

function normalize(row: Row): PostComment {
  return {
    id: row.id,
    post_id: row.post_id,
    user_id: row.user_id,
    body: row.body,
    created_at: row.created_at,
    author_name: authorLabel(row.author),
  };
}

export async function getPostComments(postId: string, limit = 80): Promise<PostComment[]> {
  const supabase = (await createClient()) ?? createAdminClient();
  if (!supabase) return [];

  const { data, error } = await supabase
    .from("post_comments")
    .select(
      "id, post_id, user_id, body, created_at, author:profiles ( full_name, first_name, last_name, email )",
    )
    .eq("post_id", postId)
    .eq("status", "visible")
    .order("created_at", { ascending: true })
    .limit(limit);

  if (error) {
    console.error("[getPostComments]", error.message);
    return [];
  }

  return ((data as unknown as Row[]) ?? []).map(normalize);
}
