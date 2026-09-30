"use client";

import Link from "next/link";
import { FormEvent, useState, useTransition } from "react";
import type { PostComment } from "@/lib/data/post-comments";
import { submitPostCommentAction } from "@/lib/comments/actions";
import { formatDate } from "@/lib/format";

type Props = {
  postId: string;
  postSlug: string;
  initialComments: PostComment[];
  isLoggedIn: boolean;
  timeZone: string;
};

export default function PostCommentsSection({
  postId,
  postSlug,
  initialComments,
  isLoggedIn,
  timeZone,
}: Props) {
  const [comments, setComments] = useState(initialComments);
  const [text, setText] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  const onSubmit = (e: FormEvent) => {
    e.preventDefault();
    setError(null);
    startTransition(async () => {
      const result = await submitPostCommentAction(postId, postSlug, text);
      if (!result.ok) {
        setError(result.error);
        return;
      }
      const label = "You";
      setComments((prev) => [
        ...prev,
        {
          id: `local-${Date.now()}`,
          post_id: postId,
          user_id: "",
          body: text.trim(),
          created_at: new Date().toISOString(),
          author_name: label,
        },
      ]);
      setText("");
    });
  };

  return (
    <div className="pt-10">
      <h2 className="font-article text-[1.75rem] font-black tracking-tight md:text-[2rem]">
        Comments
      </h2>

      {isLoggedIn ? (
        <form onSubmit={onSubmit} className="mt-6 space-y-3">
          <label className="block">
            <span className="text-[11px] font-bold uppercase tracking-[0.14em] text-black/55">
              Add a comment
            </span>
            <textarea
              value={text}
              onChange={(e) => setText(e.target.value)}
              rows={4}
              maxLength={4000}
              required
              className="mt-2 w-full border border-black/15 bg-white px-3 py-3 text-[15px] outline-none focus:border-[var(--fpn-rojo)]"
              placeholder="Share your thoughts…"
            />
          </label>
          {error ? (
            <p className="text-sm font-medium text-red-700" role="alert">{error}</p>
          ) : null}
          <button
            type="submit"
            disabled={pending || !text.trim()}
            className="rounded-md bg-[var(--fpn-rojo)] px-5 py-2.5 text-sm font-bold text-white hover:brightness-110 disabled:opacity-60"
          >
            {pending ? "Posting…" : "Post comment"}
          </button>
        </form>
      ) : (
        <p className="mt-6 text-center text-[15px] text-black/80">
          <Link
            href={`/register?next=${encodeURIComponent(`/news/${postSlug}`)}`}
            className="font-bold text-[var(--fpn-rojo)] hover:underline"
          >
            Create your free FPTN account
          </Link>
          {" "}
          to read the full story and join the conversation.
        </p>
      )}

      <ul className="mt-8 space-y-6 border-t border-[#ddd] pt-8">
        {comments.length === 0 ? (
          <li className="text-center text-sm text-black/50">No comments yet.</li>
        ) : (
          comments.map((c) => (
            <li key={c.id} className="border-b border-black/8 pb-6 last:border-0">
              <p className="text-[11px] font-bold uppercase tracking-[0.12em] text-black/50">
                {c.author_name}
                <span className="mx-2 font-normal">·</span>
                {formatDate(c.created_at, timeZone)}
              </p>
              <p className="mt-2 whitespace-pre-wrap text-[15px] leading-relaxed text-black/90">
                {c.body}
              </p>
            </li>
          ))
        )}
      </ul>
    </div>
  );
}
