"use client";

import { useState, useCallback, useRef } from "react";
import Image from "next/image";
import { useUser } from "@clerk/nextjs";
import PostActionsMenu from "@/components/posts/PostActionsMenu";
import {
  MapPin,
  Clock,
  ThumbsUp,
  Users,
  Loader2,
  MessageSquare,
  Send,
  ChevronDown,
  ChevronUp,
} from "lucide-react";
import { useAutoRefresh } from "@/lib/hooks/useAutoRefresh";
import { useTranslation } from "@/lib/hooks/useTranslation";

/* ─── palette ──────────────────────────────────────────────────────────── */
const CATEGORY_STYLES = {
  road: {
    pill: "bg-amber-50 text-amber-700 ring-1 ring-amber-200",
    dot: "bg-amber-400",
  },
  water: {
    pill: "bg-sky-50 text-sky-700 ring-1 ring-sky-200",
    dot: "bg-sky-400",
  },
  electricity: {
    pill: "bg-yellow-50 text-yellow-700 ring-1 ring-yellow-200",
    dot: "bg-yellow-400",
  },
  garbage: {
    pill: "bg-emerald-50 text-emerald-700 ring-1 ring-emerald-200",
    dot: "bg-emerald-400",
  },
  safety: {
    pill: "bg-rose-50 text-rose-700 ring-1 ring-rose-200",
    dot: "bg-rose-400",
  },
  other: {
    pill: "bg-slate-50 text-slate-500 ring-1 ring-slate-200",
    dot: "bg-slate-400",
  },
};

/* ─── Avatar size map (Tailwind JIT needs static classes) ──────────────── */
const AVATAR_SIZE = {
  7: { cls: "w-7 h-7", px: 28 },
  8: { cls: "w-8 h-8", px: 32 },
  9: { cls: "w-9 h-9", px: 36 },
};

/* ─── helpers ───────────────────────────────────────────────────────────── */
function timeAgo(dateStr) {
  const diff = Date.now() - new Date(dateStr).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return "just now";
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  return `${Math.floor(hrs / 24)}d ago`;
}

/* ─── Avatar ────────────────────────────────────────────────────────────── */
function Avatar({ src, name, size = 8 }) {
  const { cls, px } = AVATAR_SIZE[size] || AVATAR_SIZE[8];
  if (src)
    return (
      <Image
        src={src}
        alt={name}
        width={px}
        height={px}
        className={`${cls} rounded-full object-cover ring-2 ring-white shadow-sm shrink-0`}
      />
    );
  return (
    <div
      className={`${cls} rounded-full shrink-0 flex items-center justify-center
        bg-gradient-to-br from-slate-600 to-slate-800 text-white font-semibold
        text-xs ring-2 ring-white shadow-sm`}
    >
      {name?.[0]?.toUpperCase()}
    </div>
  );
}

/* ─── Comment ───────────────────────────────────────────────────────────── */
function Comment({ c, index }) {
  return (
    <div
      className="flex items-start gap-2.5 animate-fade-up"
      style={{ animationDelay: `${index * 60}ms`, animationFillMode: "both" }}
    >
      <Avatar src={c.author?.avatar} name={c.author?.name} size={7} />
      <div className="flex-1 min-w-0">
        <div className="bg-slate-50 px-3.5 py-2.5 border border-slate-100 rounded-2xl rounded-tl-sm">
          <p className="mb-0.5 font-semibold text-[11px] text-slate-500 uppercase tracking-wide">
            {c.author?.name}
          </p>
          <p className="text-slate-700 text-sm leading-relaxed">{c.text}</p>
        </div>
      </div>
    </div>
  );
}

/* ─── PostCard ──────────────────────────────────────────────────────────── */
export default function PostCard({ post, onPostUpdated, onPostDeleted }) {
  const { user, isSignedIn } = useUser();
  const { t } = useTranslation();

  const isAuthor = isSignedIn && user && post.author?.clerkId === user.id;
  const isAuthority = isSignedIn && user?.publicMetadata?.role === "authority";
  const canManage = isAuthor || isAuthority;

  /* like state */
  const [likeCount, setLikeCount] = useState(post.likes?.length || 0);
  const [liked, setLiked] = useState(false);
  const [liking, setLiking] = useState(false);
  const [likePop, setLikePop] = useState(false);

  /* comment state */
  const [commentOpen, setCommentOpen] = useState(false);
  const [comments, setComments] = useState([]);
  const [commentsLoaded, setCommentsLoaded] = useState(false);
  const [loadingComments, setLoadingComments] = useState(false);
  const [commentText, setCommentText] = useState("");
  const [submittingComment, setSubmittingComment] = useState(false);

  const inputRef = useRef(null);

  /* ── handlers ── */
  const handleLike = async () => {
    if (!isSignedIn || liking) return;
    const wasLiked = liked;
    setLiked(!wasLiked);
    setLikeCount((c) => (wasLiked ? c - 1 : c + 1));
    setLikePop(true);
    setTimeout(() => setLikePop(false), 400);
    setLiking(true);
    try {
      const res = await fetch(`/api/posts/${post._id}/like`, {
        method: "POST",
      });
      const data = await res.json();
      if (!res.ok) throw new Error();
      setLiked(data.liked);
      setLikeCount(data.count);
    } catch {
      setLiked(wasLiked);
      setLikeCount((c) => (wasLiked ? c + 1 : c - 1));
    } finally {
      setLiking(false);
    }
  };

  const refreshComments = useCallback(async () => {
    try {
      const res = await fetch(`/api/posts/${post._id}/comments`);
      const data = await res.json();
      setComments(data.comments || []);
      setCommentsLoaded(true);
    } catch {}
  }, [post._id]);

  const loadComments = async () => {
    if (commentsLoaded) return;
    setLoadingComments(true);
    await refreshComments();
    setLoadingComments(false);
  };

  useAutoRefresh(refreshComments, 10000, commentOpen && commentsLoaded);

  const toggleComments = () => {
    const next = !commentOpen;
    setCommentOpen(next);
    if (next && !commentsLoaded) loadComments();
    if (next) setTimeout(() => inputRef.current?.focus(), 350);
  };

  const handleSubmitComment = async (e) => {
    e.preventDefault();
    if (!commentText.trim() || !isSignedIn || submittingComment) return;
    setSubmittingComment(true);
    try {
      const res = await fetch(`/api/posts/${post._id}/comments`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text: commentText.trim() }),
      });
      const data = await res.json();
      if (res.ok && data.comment) {
        setComments((prev) => [...prev, data.comment]);
        setCommentText("");
      }
    } finally {
      setSubmittingComment(false);
    }
  };

  const catStyle = CATEGORY_STYLES[post.category] || CATEGORY_STYLES.other;
  const authorName = post.author?.name || "Anonymous";
  const authorAvatar = post.author?.avatar || null;
  const isRecent = Date.now() - new Date(post.createdAt).getTime() < 3600000;

  return (
    <article className="group relative bg-white border border-slate-100 rounded-2xl overflow-hidden shadow-sm hover:shadow-lg hover:shadow-slate-200/60 transition-all duration-300 ease-out">
      {/* ── Photo ── */}
      {post.photo && (
        <div
          className="relative w-full overflow-hidden"
          style={{ aspectRatio: "16/9" }}
        >
          <Image
            src={post.photo}
            alt={post.title}
            fill
            className="object-cover group-hover:scale-[1.02] transition-transform duration-700 ease-out"
            sizes="(max-width: 640px) 100vw, 640px"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-black/5 to-transparent" />
          {/* category badge on image */}
          <span
            className={`absolute bottom-3 left-3 inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-semibold backdrop-blur-md bg-white/80 shadow-sm border border-white/60 capitalize ${catStyle.pill}`}
          >
            <span className={`w-1.5 h-1.5 rounded-full ${catStyle.dot}`} />
            {post.category}
          </span>
        </div>
      )}

      <div className="px-4 pt-4 pb-3 space-y-3">
        {/* ── Author row ── */}
        <div className="flex items-center justify-between gap-2">
          <div className="flex items-center gap-2.5 min-w-0">
            <div className="relative shrink-0">
              <Avatar src={authorAvatar} name={authorName} size={8} />
              {isRecent && (
                <span className="absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 bg-emerald-400 rounded-full ring-2 ring-white" />
              )}
            </div>
            <div className="min-w-0">
              <p className="font-semibold text-slate-800 text-[13px] truncate leading-tight">
                {authorName}
              </p>
              <p className="text-slate-400 text-[11px] mt-0.5 flex items-center gap-1">
                <Clock className="w-3 h-3" />
                {timeAgo(post.createdAt)}
              </p>
            </div>
          </div>
          {canManage && (
            <PostActionsMenu
              post={post}
              onUpdated={onPostUpdated}
              onDeleted={onPostDeleted}
            />
          )}
        </div>

        {/* ── Title ── */}
        <h3 className="font-bold text-slate-900 text-[15px] leading-snug tracking-tight">
          {post.title}
        </h3>

        {/* ── Description ── */}
        {post.description && (
          <p className="text-slate-500 text-sm leading-relaxed line-clamp-3">
            {post.description}
          </p>
        )}

        {/* ── Meta row ── */}
        <div className="flex flex-wrap items-center gap-x-3 gap-y-1.5 text-xs text-slate-400">
          {!post.photo && (
            <span
              className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full font-medium capitalize ${catStyle.pill}`}
            >
              <span className={`w-1.5 h-1.5 rounded-full ${catStyle.dot}`} />
              {post.category}
            </span>
          )}
          <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full bg-slate-50 ring-1 ring-slate-100 font-medium text-slate-500 capitalize">
            <Users className="w-3 h-3" />
            {post.targetGroup === "both"
              ? t("post.authorityVolunteer")
              : post.targetGroup}
          </span>
          {post.location?.address && (
            <span className="inline-flex items-center gap-1 text-slate-400">
              <MapPin className="w-3 h-3" />
              <span className="truncate max-w-[180px]">
                {post.location.address}
              </span>
            </span>
          )}
        </div>

        {/* ── Authority response ── */}
        {post.authorityResponse && (
          <div className="relative bg-gradient-to-r from-blue-50 to-indigo-50 px-4 py-3 border border-blue-100 rounded-xl overflow-hidden">
            <div className="absolute left-0 inset-y-0 w-1 bg-gradient-to-b from-blue-400 to-indigo-500 rounded-full" />
            <p className="pl-2 text-blue-700 text-xs leading-relaxed">
              <span className="font-bold text-[10px] text-blue-500 uppercase tracking-wide">
                {t("post.authority")} ·
              </span>{" "}
              {post.authorityResponse}
            </p>
          </div>
        )}

        {/* ── Divider ── */}
        <div className="h-px bg-slate-100" />

        {/* ── Action row ── */}
        <div className="flex items-center gap-1 -mx-1">
          {/* Like */}
          <button
            onClick={handleLike}
            disabled={!isSignedIn || liking}
            className={`group/like flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-semibold
              transition-all duration-200 ease-out disabled:opacity-40 select-none
              ${
                liked
                  ? "bg-rose-50 text-rose-500 ring-1 ring-rose-200 hover:bg-rose-100"
                  : "text-slate-400 hover:bg-slate-50 hover:text-slate-600"
              }`}
          >
            <ThumbsUp
              className={`w-4 h-4 transition-all duration-200
                ${liked ? "fill-rose-500 text-rose-500" : ""}
                ${likePop ? "animate-pop" : "group-hover/like:scale-110"}`}
            />
            <span className="tabular-nums">{likeCount}</span>
          </button>

          {/* Comment toggle */}
          <button
            onClick={toggleComments}
            className={`flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-semibold
              transition-all duration-200 ease-out select-none
              ${
                commentOpen
                  ? "bg-slate-100 text-slate-700"
                  : "text-slate-400 hover:bg-slate-50 hover:text-slate-600"
              }`}
          >
            <MessageSquare className="w-4 h-4" />
            {commentsLoaded && comments.length > 0 && (
              <span className="tabular-nums">{comments.length}</span>
            )}
            {commentOpen ? (
              <ChevronUp className="w-3.5 h-3.5" />
            ) : (
              <ChevronDown className="w-3.5 h-3.5" />
            )}
          </button>

          {/* Volunteers */}
          <div className="flex items-center gap-1.5 ml-auto px-3 py-1.5 rounded-xl bg-slate-50 text-slate-400 text-xs font-medium">
            <Users className="w-3.5 h-3.5" />
            <span className="tabular-nums">
              {post.volunteers?.length || 0}
            </span>
          </div>
        </div>

        {/* ── Comments ── */}
        {commentOpen && (
          <div className="space-y-3 pt-1 overflow-hidden animate-slide-down">
            {loadingComments && (
              <div className="flex justify-center items-center gap-2 py-4 text-slate-300">
                <Loader2 className="w-4 h-4 animate-spin" />
                <span className="text-xs">Loading…</span>
              </div>
            )}

            {!loadingComments && comments.length === 0 && (
              <div className="flex flex-col items-center gap-1 py-5 text-slate-300">
                <MessageSquare className="w-6 h-6" />
                <p className="text-xs">{t("post.noComments")}</p>
              </div>
            )}

            {comments.map((c, i) => (
              <Comment key={c._id} c={c} index={i} />
            ))}

            {isSignedIn ? (
              <form
                onSubmit={handleSubmitComment}
                className="flex items-center gap-2 pt-1"
              >
                <input
                  ref={inputRef}
                  type="text"
                  value={commentText}
                  onChange={(e) => setCommentText(e.target.value)}
                  placeholder={t("post.writeComment")}
                  maxLength={500}
                  className="flex-1 bg-slate-50 px-4 py-2.5 border border-slate-200 focus:border-slate-300 rounded-2xl focus:outline-none focus:ring-2 focus:ring-slate-300 text-slate-800 text-sm transition-all duration-200 placeholder-slate-400"
                />
                <button
                  type="submit"
                  disabled={!commentText.trim() || submittingComment}
                  className="flex justify-center items-center bg-slate-800 hover:bg-slate-700 disabled:opacity-40 shadow-sm hover:shadow-md rounded-2xl w-10 h-10 text-white active:scale-95 transition-all duration-200 shrink-0"
                >
                  {submittingComment ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    <Send className="w-4 h-4" />
                  )}
                </button>
              </form>
            ) : (
              <p className="py-2 text-slate-400 text-xs text-center">
                {t("post.signInComment")}
              </p>
            )}
          </div>
        )}
      </div>
    </article>
  );
}
