"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import type { PostComment } from "@/lib/data/post-comments";
import { profileDisplayName } from "@/lib/comments/display";
import { getCurrentProfile } from "@/lib/auth/session";

type ActionError = { ok: false; error: string };
type ActionOk = { ok: true; comment?: PostComment };

async function requireUser(postSlug: string) {
  const supabase = await createClient();
  if (!supabase) return { supabase: null as null, user: null as null };

  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    redirect(`/login?next=${encodeURIComponent(`/news/${postSlug}`)}`);
  }
  return { supabase, user };
}

function toComment(
  row: {
    id: string;
    post_id: string;
    user_id: string;
    parent_id: string | null;
    body: string;
    created_at: string;
  },
  profile: Awaited<ReturnType<typeof getCurrentProfile>>,
): PostComment {
  return {
    id: row.id,
    post_id: row.post_id,
    user_id: row.user_id,
    parent_id: row.parent_id,
    body: row.body,
    created_at: row.created_at,
    author_name: profile ? profileDisplayName(profile) : "You",
    author_avatar_url: profile?.avatar_url ?? null,
    like_count: 0,
    liked_by_me: false,
  };
}

export async function submitPostCommentAction(
  postId: string,
  postSlug: string,
  body: string,
  parentId?: string | null,
): Promise<ActionOk | ActionError> {
  const trimmed = body.trim();
  if (!trimmed) return { ok: false, error: "Write a comment before posting." };
  if (trimmed.length > 4000) {
    return { ok: false, error: "Comment is too long (max 4000 characters)." };
  }

  const { supabase, user } = await requireUser(postSlug);
  if (!supabase || !user) return { ok: false, error: "Comments are unavailable." };

  const profile = await getCurrentProfile();

  const { data, error } = await supabase
    .from("post_comments")
    .insert({
      post_id: postId,
      user_id: user.id,
      body: trimmed,
      status: "visible",
      parent_id: parentId || null,
    })
    .select("id, post_id, user_id, parent_id, body, created_at")
    .single();

  if (error) {
    return { ok: false, error: error.message || "Could not post comment." };
  }

  revalidatePath(`/news/${postSlug}`);
  return { ok: true, comment: toComment(data, profile) };
}

export async function togglePostCommentLikeAction(
  commentId: string,
  postSlug: string,
  liked: boolean,
): Promise<{ ok: true; liked: boolean; like_count: number } | ActionError> {
  const { supabase, user } = await requireUser(postSlug);
  if (!supabase || !user) return { ok: false, error: "Comments are unavailable." };

  if (liked) {
    const { error } = await supabase
      .from("post_comment_likes")
      .delete()
      .eq("comment_id", commentId)
      .eq("user_id", user.id);
    if (error) {
      return { ok: false, error: error.message || "Could not update like." };
    }
  } else {
    const { error } = await supabase.from("post_comment_likes").insert({
      comment_id: commentId,
      user_id: user.id,
    });
    if (error) {
      return { ok: false, error: error.message || "Could not update like." };
    }
  }

  const { count, error: countError } = await supabase
    .from("post_comment_likes")
    .select("*", { count: "exact", head: true })
    .eq("comment_id", commentId);

  if (countError) {
    revalidatePath(`/news/${postSlug}`);
    return { ok: true, liked: !liked, like_count: 0 };
  }

  revalidatePath(`/news/${postSlug}`);
  return { ok: true, liked: !liked, like_count: count ?? 0 };
}
