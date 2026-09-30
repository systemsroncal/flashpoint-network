"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";

export async function submitPostCommentAction(
  postId: string,
  postSlug: string,
  body: string,
): Promise<{ ok: true } | { ok: false; error: string }> {
  const trimmed = body.trim();
  if (!trimmed) return { ok: false, error: "Write a comment before posting." };
  if (trimmed.length > 4000) {
    return { ok: false, error: "Comment is too long (max 4000 characters)." };
  }

  const supabase = await createClient();
  if (!supabase) return { ok: false, error: "Comments are unavailable." };

  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    redirect(`/login?next=${encodeURIComponent(`/news/${postSlug}`)}`);
  }

  const { error } = await supabase.from("post_comments").insert({
    post_id: postId,
    user_id: user.id,
    body: trimmed,
    status: "visible",
  });

  if (error) {
    return { ok: false, error: error.message || "Could not post comment." };
  }

  revalidatePath(`/news/${postSlug}`);
  return { ok: true };
}
