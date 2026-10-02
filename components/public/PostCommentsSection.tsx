"use client";

import Link from "next/link";
import { FormEvent, useMemo, useState, useTransition } from "react";
import CommentUserAvatar from "@/components/public/CommentUserAvatar";
import type { PostComment } from "@/lib/data/post-comments";
import {
  submitPostCommentAction,
  togglePostCommentLikeAction,
} from "@/lib/comments/actions";
import {
  commentAuthorInitials,
  commentAuthorName,
  profileDisplayName,
  profileInitials,
} from "@/lib/comments/display";
import { formatCommentTime } from "@/lib/format";

type ViewerProfile = {
  full_name?: string | null;
  first_name?: string | null;
  last_name?: string | null;
  email?: string | null;
  avatar_url?: string | null;
};

type Props = {
  postId: string;
  postSlug: string;
  initialComments: PostComment[];
  isLoggedIn: boolean;
  timeZone: string;
  viewerProfile?: ViewerProfile | null;
};

function HeartIcon({ filled }: { filled: boolean }) {
  return (
    <svg
      viewBox="0 0 24 24"
      className={`h-[18px] w-[18px] ${filled ? "text-[var(--fpn-rojo)]" : "text-black/40"}`}
      aria-hidden
    >
      <path
        d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"
        fill={filled ? "currentColor" : "none"}
        stroke="currentColor"
        strokeWidth={filled ? 0 : 1.6}
      />
    </svg>
  );
}

function groupReplies(comments: PostComment[]) {
  const roots: PostComment[] = [];
  const repliesByParent = new Map<string, PostComment[]>();
  for (const c of comments) {
    if (!c.parent_id) {
      roots.push(c);
      continue;
    }
    const list = repliesByParent.get(c.parent_id) ?? [];
    list.push(c);
    repliesByParent.set(c.parent_id, list);
  }
  return { roots, repliesByParent };
}

function mergeComment(prev: PostComment[], next: PostComment): PostComment[] {
  if (prev.some((c) => c.id === next.id)) return prev;
  return [...prev, next];
}

function updateCommentLike(
  comments: PostComment[],
  commentId: string,
  liked: boolean,
  likeCount: number,
): PostComment[] {
  return comments.map((c) =>
    c.id === commentId
      ? { ...c, liked_by_me: liked, like_count: likeCount }
      : c,
  );
}

type CommentComposerProps = {
  postId: string;
  postSlug: string;
  parentId?: string | null;
  viewerProfile?: ViewerProfile | null;
  placeholder: string;
  submitLabel: string;
  onPosted: (comment: PostComment) => void;
  onCancel?: () => void;
  compact?: boolean;
};

function CommentComposer({
  postId,
  postSlug,
  parentId = null,
  viewerProfile,
  placeholder,
  submitLabel,
  onPosted,
  onCancel,
  compact,
}: CommentComposerProps) {
  const [text, setText] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  const onSubmit = (e: FormEvent) => {
    e.preventDefault();
    setError(null);
    startTransition(async () => {
      const result = await submitPostCommentAction(
        postId,
        postSlug,
        text,
        parentId,
      );
      if (!result.ok) {
        setError(result.error);
        return;
      }
      if (result.comment) {
        onPosted(result.comment);
      }
      setText("");
      onCancel?.();
    });
  };

  const name = viewerProfile ? profileDisplayName(viewerProfile) : "You";
  const initials = viewerProfile ? profileInitials(viewerProfile) : "FP";

  return (
    <form onSubmit={onSubmit} className={compact ? "mt-3" : "mt-6"}>
      <div className="flex gap-3">
        <CommentUserAvatar
          name={name}
          initials={initials}
          avatarUrl={viewerProfile?.avatar_url}
          size={compact ? "sm" : "md"}
        />
        <div className="min-w-0 flex-1">
          <textarea
            value={text}
            onChange={(e) => setText(e.target.value)}
            rows={compact ? 2 : 3}
            maxLength={4000}
            required
            className="w-full resize-y rounded-lg border border-black/10 bg-[#f7f7f7] px-3 py-2.5 text-[15px] leading-relaxed outline-none transition focus:border-[var(--fpn-rojo)] focus:bg-white"
            placeholder={placeholder}
          />
          {error ? (
            <p className="mt-2 text-sm font-medium text-red-700" role="alert">
              {error}
            </p>
          ) : null}
          <div className="mt-2 flex flex-wrap items-center gap-2">
            <button
              type="submit"
              disabled={pending || !text.trim()}
              className="rounded-full bg-[var(--fpn-rojo)] px-4 py-2 text-sm font-bold text-white hover:brightness-110 disabled:opacity-60"
            >
              {pending ? "Posting…" : submitLabel}
            </button>
            {onCancel ? (
              <button
                type="button"
                onClick={onCancel}
                className="rounded-full px-3 py-2 text-sm font-semibold text-black/55 hover:text-black"
              >
                Cancel
              </button>
            ) : null}
          </div>
        </div>
      </div>
    </form>
  );
}

type CommentItemProps = {
  comment: PostComment;
  repliesByParent: Map<string, PostComment[]>;
  postId: string;
  postSlug: string;
  isLoggedIn: boolean;
  timeZone: string;
  viewerProfile?: ViewerProfile | null;
  depth: number;
  onPosted: (comment: PostComment) => void;
  onLikeToggle: (commentId: string, liked: boolean, likeCount: number) => void;
};

function CommentItem({
  comment,
  repliesByParent,
  postId,
  postSlug,
  isLoggedIn,
  timeZone,
  viewerProfile,
  depth,
  onPosted,
  onLikeToggle,
}: CommentItemProps) {
  const [replyOpen, setReplyOpen] = useState(false);
  const [likePending, startLike] = useTransition();

  const replies = repliesByParent.get(comment.id) ?? [];
  const name = commentAuthorName(comment);
  const initials = commentAuthorInitials(comment);

  const onLike = () => {
    if (!isLoggedIn || likePending) return;
    startLike(async () => {
      const result = await togglePostCommentLikeAction(
        comment.id,
        postSlug,
        comment.liked_by_me,
      );
      if (result.ok) {
        onLikeToggle(comment.id, result.liked, result.like_count);
      }
    });
  };

  return (
    <li className={depth > 0 ? "mt-4" : undefined}>
      <article
        className={`flex gap-3 ${depth > 0 ? "ml-2 border-l-2 border-black/8 pl-4 md:ml-4 md:pl-5" : ""}`}
      >
        <CommentUserAvatar
          name={name}
          initials={initials}
          avatarUrl={comment.author_avatar_url}
          size={depth > 0 ? "sm" : "md"}
        />
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-baseline gap-x-2 gap-y-0.5">
            <p className="text-[15px] font-bold text-black">{name}</p>
            <time
              className="text-xs text-black/45"
              dateTime={comment.created_at}
            >
              {formatCommentTime(comment.created_at, timeZone)}
            </time>
          </div>
          <p className="mt-1.5 whitespace-pre-wrap text-[15px] leading-relaxed text-black/85">
            {comment.body}
          </p>
          <div className="mt-2 flex flex-wrap items-center gap-3">
            <button
              type="button"
              onClick={onLike}
              disabled={!isLoggedIn || likePending}
              className={`inline-flex items-center gap-1.5 rounded-full px-2 py-1 text-sm font-semibold transition hover:bg-black/[0.04] disabled:cursor-not-allowed disabled:opacity-50 ${comment.liked_by_me ? "text-[var(--fpn-rojo)]" : "text-black/55"}`}
              aria-pressed={comment.liked_by_me}
              aria-label={
                comment.liked_by_me ? "Unlike comment" : "Like comment"
              }
            >
              <HeartIcon filled={comment.liked_by_me} />
              <span>{comment.like_count > 0 ? comment.like_count : ""}</span>
              <span className="sr-only">likes</span>
            </button>
            {isLoggedIn ? (
              <button
                type="button"
                onClick={() => setReplyOpen((v) => !v)}
                className="rounded-full px-2 py-1 text-sm font-semibold text-black/55 hover:bg-black/[0.04] hover:text-[var(--fpn-rojo)]"
              >
                Reply
              </button>
            ) : null}
          </div>
          {replyOpen && isLoggedIn ? (
            <CommentComposer
              postId={postId}
              postSlug={postSlug}
              parentId={comment.id}
              viewerProfile={viewerProfile}
              placeholder={`Reply to ${name}…`}
              submitLabel="Post reply"
              compact
              onPosted={(c) => {
                onPosted(c);
                setReplyOpen(false);
              }}
              onCancel={() => setReplyOpen(false)}
            />
          ) : null}
          {replies.length > 0 ? (
            <ul className="mt-2 list-none">
              {replies.map((reply) => (
                <CommentItem
                  key={reply.id}
                  comment={reply}
                  repliesByParent={repliesByParent}
                  postId={postId}
                  postSlug={postSlug}
                  isLoggedIn={isLoggedIn}
                  timeZone={timeZone}
                  viewerProfile={viewerProfile}
                  depth={depth + 1}
                  onPosted={onPosted}
                  onLikeToggle={onLikeToggle}
                />
              ))}
            </ul>
          ) : null}
        </div>
      </article>
    </li>
  );
}

export default function PostCommentsSection({
  postId,
  postSlug,
  initialComments,
  isLoggedIn,
  timeZone,
  viewerProfile,
}: Props) {
  const [comments, setComments] = useState(initialComments);

  const { roots, repliesByParent } = useMemo(
    () => groupReplies(comments),
    [comments],
  );

  const onPosted = (comment: PostComment) => {
    setComments((prev) => mergeComment(prev, comment));
  };

  const onLikeToggle = (
    commentId: string,
    liked: boolean,
    likeCount: number,
  ) => {
    setComments((prev) => updateCommentLike(prev, commentId, liked, likeCount));
  };

  const countLabel =
    comments.length === 0
      ? "No comments yet"
      : `${comments.length} comment${comments.length === 1 ? "" : "s"}`;

  return (
    <div className="pt-10">
      <div className="flex flex-wrap items-baseline justify-between gap-2">
        <h2 className="font-article text-[1.75rem] font-black tracking-tight md:text-[2rem]">
          Comments
        </h2>
        <p className="text-sm font-medium text-black/45">{countLabel}</p>
      </div>

      {isLoggedIn ? (
        <CommentComposer
          postId={postId}
          postSlug={postSlug}
          viewerProfile={viewerProfile}
          placeholder="Join the conversation…"
          submitLabel="Post comment"
          onPosted={onPosted}
        />
      ) : (
        <p className="mt-6 rounded-lg border border-black/10 bg-[#fafafa] px-4 py-4 text-center text-[15px] text-black/80">
          <Link
            href={`/register?next=${encodeURIComponent(`/news/${postSlug}`)}`}
            className="font-bold text-[var(--fpn-rojo)] hover:underline"
          >
            Create your free FPTN account
          </Link>
          {" "}
          to join the conversation, reply, and like comments.
        </p>
      )}

      {roots.length > 0 ? (
        <ul className="mt-8 space-y-6 border-t border-[#ddd] pt-8">
          {roots.map((c) => (
            <CommentItem
              key={c.id}
              comment={c}
              repliesByParent={repliesByParent}
              postId={postId}
              postSlug={postSlug}
              isLoggedIn={isLoggedIn}
              timeZone={timeZone}
              viewerProfile={viewerProfile}
              depth={0}
              onPosted={onPosted}
              onLikeToggle={onLikeToggle}
            />
          ))}
        </ul>
      ) : null}
    </div>
  );
}
