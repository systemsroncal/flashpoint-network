import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { getSessionUser } from "@/lib/auth/session";

export type PostComment = {
  id: string;
  post_id: string;
  user_id: string;
  parent_id: string | null;
  body: string;
  created_at: string;
  author_name: string;
  author_avatar_url: string | null;
  like_count: number;
  liked_by_me: boolean;
};

type Row = {
  id: string;
  post_id: string;
  user_id: string;
  parent_id: string | null;
  body: string;
  created_at: string;
  author:
    | {
        full_name: string | null;
        first_name: string | null;
        last_name: string | null;
        email: string | null;
        avatar_url: string | null;
      }
    | {
        full_name: string | null;
        first_name: string | null;
        last_name: string | null;
        email: string | null;
        avatar_url: string | null;
      }[]
    | null;
};

function authorLabel(author: Row["author"]): string {
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

function authorAvatar(author: Row["author"]): string | null {
  const p = Array.isArray(author) ? author[0] : author;
  const url = (p?.avatar_url || "").trim();
  return url || null;
}

function normalize(
  row: Row,
  likeCount: number,
  likedByMe: boolean,
): PostComment {
  return {
    id: row.id,
    post_id: row.post_id,
    user_id: row.user_id,
    parent_id: row.parent_id ?? null,
    body: row.body,
    created_at: row.created_at,
    author_name: authorLabel(row.author),
    author_avatar_url: authorAvatar(row.author),
    like_count: likeCount,
    liked_by_me: likedByMe,
  };
}

export async function getPostComments(
  postId: string,
  limit = 120,
): Promise<PostComment[]> {
  const supabase = (await createClient()) ?? createAdminClient();
  if (!supabase) return [];

  const viewer = await getSessionUser();
  const viewerId = viewer?.id ?? null;

  const { data, error } = await supabase
    .from("post_comments")
    .select(
      "id, post_id, user_id, parent_id, body, created_at, author:profiles ( full_name, first_name, last_name, email, avatar_url )",
    )
    .eq("post_id", postId)
    .eq("status", "visible")
    .order("created_at", { ascending: true })
    .limit(limit);

  if (error) {
    console.error("[getPostComments]", error.message);
    return [];
  }

  const rows = (data as unknown as Row[]) ?? [];
  if (rows.length === 0) return [];

  const commentIds = rows.map((r) => r.id);
  const { data: likeRows, error: likeError } = await supabase
    .from("post_comment_likes")
    .select("comment_id, user_id")
    .in("comment_id", commentIds);

  if (likeError) {
    console.error("[getPostComments] likes", likeError.message);
  }

  const likeCountByComment = new Map<string, number>();
  const likedByViewer = new Set<string>();
  for (const like of likeRows ?? []) {
    const cid = like.comment_id as string;
    likeCountByComment.set(cid, (likeCountByComment.get(cid) ?? 0) + 1);
    if (viewerId && like.user_id === viewerId) {
      likedByViewer.add(cid);
    }
  }

  return rows.map((row) =>
    normalize(
      row,
      likeCountByComment.get(row.id) ?? 0,
      likedByViewer.has(row.id),
    ),
  );
}
