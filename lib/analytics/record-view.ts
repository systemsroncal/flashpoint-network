import "server-only";

import { createAdminClient } from "@/lib/supabase/admin";
import { getSessionUser } from "@/lib/auth/session";

/**
 * Record a public article view into post_views and bump posts.view_count.
 * Best-effort — never throws to the page render path.
 */
export async function recordPostView(postId: string) {
  try {
    const admin = createAdminClient();
    if (!admin) return;

    const user = await getSessionUser();
    const { error: insertError } = await admin.from("post_views").insert({
      post_id: postId,
      viewer_id: user?.id ?? null,
      viewed_at: new Date().toISOString(),
    });
    if (insertError) {
      console.error("[recordPostView] insert", insertError.message);
      return;
    }

    const { data: row } = await admin
      .from("posts")
      .select("view_count")
      .eq("id", postId)
      .maybeSingle();
    const next = (row?.view_count ?? 0) + 1;
    await admin.from("posts").update({ view_count: next }).eq("id", postId);
  } catch (err) {
    console.error("[recordPostView]", err);
  }
}
