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
  CheckCircle,
  Loader2,
  MessageSquare,
  Send,
  ChevronDown,
  ChevronUp,
  Zap,
} from "lucide-react";
import { useAutoRefresh } from "@/lib/hooks/useAutoRefresh";
import { useTranslation } from "@/lib/hooks/useTranslation";

/* ─── palette ──────────────────────────────────────────────────────────── */
const CATEGORY_STYLES = {
  road:        { pill: "bg-amber-50 text-amber-700 ring-1 ring-amber-200",    dot: "bg-amber-400" },
  water:       { pill: "bg-sky-50 text-sky-700 ring-1 ring-sky-200",          dot: "bg-sky-400" },
  electricity: { pill: "bg-yellow-50 text-yellow-700 ring-1 ring-yellow-200", dot: "bg-yellow-400" },
  garbage:     { pill: "bg-emerald-50 text-emerald-700 ring-1 ring-emerald-200", dot: "bg-emerald-400" },
  safety:      { pill: "bg-rose-50 text-rose-700 ring-1 ring-rose-200",       dot: "bg-rose-400" },
  other:       { pill: "bg-slate-50 text-slate-500 ring-1 ring-slate-200",    dot: "bg-slate-400" },
};

const STATUS_INFO = {
  pending: {
    label: "Pending",
    icon: Clock,
    style: "bg-amber-50 text-amber-600 ring-1 ring-amber-200",
    glow: "shadow-amber-100",
    spin: false,
  },
  in_progress: {
    label: "In Progress",
    icon: Loader2,
    style: "bg-blue-50 text-blue-600 ring-1 ring-blue-200",
    glow: "shadow-blue-100",
    spin: true,
  },
  completed: {
    label: "Resolved",
    icon: CheckCircle,
    style: "bg-emerald-50 text-emerald-600 ring-1 ring-emerald-200",
    glow: "shadow-emerald-100",
    spin: false,
  },
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
  const s = `w-${size} h-${size}`;
  if (src)
    return (
      <Image
        src={src}
        alt={name}
        width={size * 4}
        height={size * 4}
        className={`${s} rounded-full object-cover ring-2 ring-white shadow-sm shrink-0`}
      />
    );
  return (
    <div
      className={`${s} rounded-full shrink-0 flex items-center justify-center
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
        <div className="bg-slate-50 rounded-2xl rounded-tl-sm px-3.5 py-2.5 border border-slate-100">
          <p className="text-[11px] font-semibold text-slate-500 mb-0.5 tracking-wide uppercase">
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

  const isAuthor    = isSignedIn && user && post.author?.clerkId === user.id;
  const isAuthority = isSignedIn && user?.publicMetadata?.role === "authority";
  const canManage   = isAuthor || isAuthority;

  /* like state */
  const [likeCount, setLikeCount] = useState(post.likes?.length || 0);
  const [liked,     setLiked]     = useState(false);
  const [liking,    setLiking]    = useState(false);
  const [likePop,   setLikePop]   = useState(false);

  /* comment state */
  const [commentOpen,      setCommentOpen]      = useState(false);
  const [comments,         setComments]         = useState([]);
  const [commentsLoaded,   setCommentsLoaded]   = useState(false);
  const [loadingComments,  setLoadingComments]  = useState(false);
  const [commentText,      setCommentText]      = useState("");
  const [submittingComment,setSubmittingComment]= useState(false);

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
      const res  = await fetch(`/api/posts/${post._id}/like`, { method: "POST" });
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
      const res  = await fetch(`/api/posts/${post._id}/comments`);
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
      const res  = await fetch(`/api/posts/${post._id}/comments`, {
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

  const status      = STATUS_INFO[post.samasyaStatus] || STATUS_INFO.pending;
  const StatusIcon  = status.icon;
  const catStyle    = CATEGORY_STYLES[post.category] || CATEGORY_STYLES.other;
  const authorName  = post.author?.name || "Anonymous";
  const authorAvatar= post.author?.avatar || null;

  const statusLabels = {
    pending:     t("post.pending"),
    in_progress: t("post.inProgress"),
    completed:   t("post.resolved"),
  };
  const statusLabel = statusLabels[post.samasyaStatus] || t("post.pending");

  return (
    <>
      {/* ── keyframe styles injected once ── */}
      <style>{`
        @keyframes fade-up {
          from { opacity: 0; transform: translateY(10px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        @keyframes slide-down {
          from { opacity: 0; max-height: 0; transform: translateY(-6px); }
          to   { opacity: 1; max-height: 800px; transform: translateY(0); }
        }
        @keyframes pop {
          0%   { transform: scale(1); }
          40%  { transform: scale(1.32); }
          70%  { transform: scale(0.9); }
          100% { transform: scale(1); }
        }
        @keyframes shimmer {
          0%   { background-position: -400px 0; }
          100% { background-position: 400px 0; }
        }
        .animate-fade-up  { animation: fade-up 0.35s ease both; }
        .animate-slide-down{ animation: slide-down 0.35s cubic-bezier(.4,0,.2,1) both; }
        .animate-pop      { animation: pop 0.38s cubic-bezier(.4,0,.2,1); }
      `}</style>

      <article
        className="group relative bg-white border border-slate-100 rounded-3xl overflow-hidden
          shadow-sm hover:shadow-xl hover:shadow-slate-200/80
          transition-all duration-500 ease-out
          hover:-translate-y-0.5"
      >
        {/* ── Photo with gradient veil ── */}
        {post.photo && (
          <div className="relative w-full overflow-hidden" style={{ aspectRatio: "16/9" }}>
            <Image
              src={post.photo}
              alt={post.title}
              fill
              className="object-cover transition-transform duration-700 ease-out group-hover:scale-[1.03]"
              sizes="(max-width: 640px) 100vw, 640px"
            />
            {/* gradient veil */}
            <div className="absolute inset-0 bg-gradient-to-t from-black/30 via-transparent to-transparent" />
            {/* status badge floating on image */}
            <span
              className={`absolute bottom-3 right-3 flex items-center gap-1.5 px-2.5 py-1
                rounded-full text-[11px] font-semibold backdrop-blur-md
                bg-white/80 shadow-lg border border-white/60 ${status.style}`}
            >
              <StatusIcon className={`w-3 h-3 ${status.spin ? "animate-spin" : ""}`} />
              {statusLabel}
            </span>
          </div>
        )}

        <div className="p-5 space-y-4">

          {/* ── Header ── */}
          <div className="flex items-start justify-between gap-3">
            <div className="flex items-center gap-3 min-w-0">
              <div className="relative shrink-0">
                <Avatar src={authorAvatar} name={authorName} size={9} />
                {/* online-style ring pulse when post is recent */}
                {Date.now() - new Date(post.createdAt).getTime() < 3600000 && (
                  <span className="absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 bg-emerald-400 rounded-full ring-2 ring-white" />
                )}
              </div>
              <div className="min-w-0">
                <p className="font-semibold text-slate-800 text-sm truncate leading-tight">
                  {authorName}
                </p>
                <p className="text-slate-400 text-xs mt-0.5 flex items-center gap-1">
                  <Clock className="w-3 h-3" />
                  {timeAgo(post.createdAt)}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2 shrink-0">
              {canManage && (
                <PostActionsMenu
                  post={post}
                  onUpdated={onPostUpdated}
                  onDeleted={onPostDeleted}
                />
              )}
              {/* Status badge (only shown here if no photo) */}
              {!post.photo && (
                <span
                  className={`flex items-center gap-1.5 px-2.5 py-1 rounded-full
                    text-[11px] font-semibold ${status.style} shadow-sm`}
                >
                  <StatusIcon className={`w-3 h-3 ${status.spin ? "animate-spin" : ""}`} />
                  {statusLabel}
                </span>
              )}
            </div>
          </div>

          {/* ── Title & description ── */}
          <div>
            <h3 className="font-bold text-slate-900 text-base leading-snug tracking-tight">
              {post.title}
            </h3>
            <p className="mt-1.5 text-slate-500 text-sm leading-relaxed line-clamp-2">
              {post.description}
            </p>
          </div>

          {/* ── Tags ── */}
          <div className="flex flex-wrap gap-2">
            <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium capitalize ${catStyle.pill}`}>
              <span className={`w-1.5 h-1.5 rounded-full ${catStyle.dot}`} />
              {post.category}
            </span>
            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium
              bg-slate-50 text-slate-500 ring-1 ring-slate-200 capitalize">
              <Users className="w-3 h-3" />
              {post.targetGroup === "both" ? t("post.authorityVolunteer") : post.targetGroup}
            </span>
          </div>

          {/* ── Location ── */}
          {post.location?.address && (
            <div className="flex items-center gap-1.5 text-slate-400 text-xs">
              <div className="flex items-center justify-center w-5 h-5 rounded-full bg-slate-100">
                <MapPin className="w-3 h-3 text-slate-500" />
              </div>
              <span className="truncate">{post.location.address}</span>
            </div>
          )}

          {/* ── Authority response ── */}
          {post.authorityResponse && (
            <div className="relative overflow-hidden bg-gradient-to-r from-blue-50 to-indigo-50
              border border-blue-100 rounded-2xl px-4 py-3">
              {/* decorative bar */}
              <div className="absolute left-0 inset-y-0 w-1 bg-gradient-to-b from-blue-400 to-indigo-500 rounded-full" />
              <p className="text-blue-700 text-xs leading-relaxed pl-2">
                <span className="font-bold uppercase tracking-wide text-blue-500 text-[10px]">
                  {t("post.authority")} ·
                </span>{" "}
                {post.authorityResponse}
              </p>
            </div>
          )}

          {/* ── Divider ── */}
          <div className="h-px bg-gradient-to-r from-transparent via-slate-100 to-transparent" />

          {/* ── Action row ── */}
          <div className="flex items-center gap-1">

            {/* Like */}
            <button
              onClick={handleLike}
              disabled={!isSignedIn || liking}
              className={`group/like flex items-center gap-2 px-3 py-2 rounded-2xl text-xs font-semibold
                transition-all duration-200 ease-out disabled:opacity-40 select-none
                ${liked
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
              className={`flex items-center gap-2 px-3 py-2 rounded-2xl text-xs font-semibold
                transition-all duration-200 ease-out select-none
                ${commentOpen
                  ? "bg-slate-100 text-slate-700"
                  : "text-slate-400 hover:bg-slate-50 hover:text-slate-600"
                }`}
            >
              <MessageSquare className="w-4 h-4" />
              {commentsLoaded && comments.length > 0 && (
                <span className="tabular-nums">{comments.length}</span>
              )}
              {commentOpen
                ? <ChevronUp  className="w-3.5 h-3.5 transition-transform duration-200" />
                : <ChevronDown className="w-3.5 h-3.5 transition-transform duration-200" />
              }
            </button>

            {/* Volunteers */}
            <div className="flex items-center gap-1.5 ml-auto px-2.5 py-1.5 rounded-xl
              bg-slate-50 text-slate-400 text-xs font-medium">
              <Users className="w-3.5 h-3.5" />
              <span className="tabular-nums">{post.volunteers?.length || 0}</span>
            </div>
          </div>

          {/* ── Comments ── */}
          {commentOpen && (
            <div className="animate-slide-down space-y-3 pt-1 overflow-hidden">

              {/* loading */}
              {loadingComments && (
                <div className="flex items-center justify-center gap-2 py-4 text-slate-300">
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span className="text-xs">Loading…</span>
                </div>
              )}

              {/* empty */}
              {!loadingComments && comments.length === 0 && (
                <div className="flex flex-col items-center gap-1 py-5 text-slate-300">
                  <MessageSquare className="w-6 h-6" />
                  <p className="text-xs">{t("post.noComments")}</p>
                </div>
              )}

              {/* list */}
              {comments.map((c, i) => (
                <Comment key={c._id} c={c} index={i} />
              ))}

              {/* input */}
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
                    className="flex-1 bg-slate-50 border border-slate-200 text-sm text-slate-800
                      placeholder-slate-400 px-4 py-2.5 rounded-2xl
                      focus:outline-none focus:ring-2 focus:ring-slate-300 focus:border-slate-300
                      transition-all duration-200"
                  />
                  <button
                    type="submit"
                    disabled={!commentText.trim() || submittingComment}
                    className="flex items-center justify-center w-10 h-10 rounded-2xl shrink-0
                      bg-slate-800 hover:bg-slate-700 disabled:opacity-40
                      text-white shadow-sm hover:shadow-md
                      transition-all duration-200 active:scale-95"
                  >
                    {submittingComment
                      ? <Loader2 className="w-4 h-4 animate-spin" />
                      : <Send className="w-4 h-4" />
                    }
                  </button>
                </form>
              ) : (
                <p className="text-center text-xs text-slate-400 py-2">
                  {t("post.signInComment")}
                </p>
              )}
            </div>
          )}

        </div>
      </article>
    </>
  );
}