"use client";

import { useState, useCallback } from "react";
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
  Hand,
  Share2,
  Shield,
} from "lucide-react";
import { useAutoRefresh } from "@/lib/hooks/useAutoRefresh";
import { useTranslation } from "@/lib/hooks/useTranslation";
import { toast } from "sonner";

const CATEGORY_STYLES = {
  road: {
    bg: "bg-orange-50",
    text: "text-orange-600",
    border: "border-orange-200",
    dot: "bg-orange-400",
  },
  water: {
    bg: "bg-blue-50",
    text: "text-blue-600",
    border: "border-blue-200",
    dot: "bg-blue-400",
  },
  electricity: {
    bg: "bg-amber-50",
    text: "text-amber-600",
    border: "border-amber-200",
    dot: "bg-amber-400",
  },
  garbage: {
    bg: "bg-emerald-50",
    text: "text-emerald-600",
    border: "border-emerald-200",
    dot: "bg-emerald-400",
  },
  safety: {
    bg: "bg-red-50",
    text: "text-red-600",
    border: "border-red-200",
    dot: "bg-red-400",
  },
  other: {
    bg: "bg-slate-50",
    text: "text-slate-500",
    border: "border-slate-200",
    dot: "bg-slate-400",
  },
};

const STATUS_INFO = {
  pending: {
    label: "Pending",
    icon: Clock,
    color: "text-amber-600",
    bg: "bg-amber-50",
    border: "border-amber-200",
    spin: false,
  },
  in_progress: {
    label: "In Progress",
    icon: Loader2,
    color: "text-blue-600",
    bg: "bg-blue-50",
    border: "border-blue-200",
    spin: true,
  },
  completed: {
    label: "Resolved",
    icon: CheckCircle,
    color: "text-emerald-600",
    bg: "bg-emerald-50",
    border: "border-emerald-200",
    spin: false,
  },
};

function timeAgo(dateStr) {
  const diff = Date.now() - new Date(dateStr).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return "just now";
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  return `${Math.floor(hrs / 24)}d ago`;
}

export default function PostCard({ post, onPostUpdated, onPostDeleted }) {
  const { user, isSignedIn } = useUser();
  const { t } = useTranslation();

  const isAuthor = isSignedIn && user && post.author?.clerkId === user.id;
  const isAuthority = isSignedIn && user?.publicMetadata?.role === "authority";
  const canManagePost = isAuthor || isAuthority;

  // Like state
  const [likeCount, setLikeCount] = useState(post.likes?.length || 0);
  const [liked, setLiked] = useState(false);
  const [liking, setLiking] = useState(false);

  // Volunteer state
  const [volunteerCount, setVolunteerCount] = useState(
    post.volunteers?.length || 0,
  );
  const [volunteered, setVolunteered] = useState(false);
  const [volunteering, setVolunteering] = useState(false);

  // Comment state
  const [commentOpen, setCommentOpen] = useState(false);
  const [comments, setComments] = useState([]);
  const [commentsLoaded, setCommentsLoaded] = useState(false);
  const [loadingComments, setLoadingComments] = useState(false);
  const [commentText, setCommentText] = useState("");
  const [submittingComment, setSubmittingComment] = useState(false);

  // Image expanded
  const [imgExpanded, setImgExpanded] = useState(false);

  const handleLike = async () => {
    if (!isSignedIn || liking) return;
    const wasLiked = liked;
    setLiked(!wasLiked);
    setLikeCount((c) => (wasLiked ? c - 1 : c + 1));
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

  const handleVolunteer = async () => {
    if (!isSignedIn || volunteering) return;
    if (post.targetGroup === "authority") {
      toast.info("This issue is targeted to authorities only");
      return;
    }
    const was = volunteered;
    setVolunteered(!was);
    setVolunteerCount((c) => (was ? c - 1 : c + 1));
    setVolunteering(true);
    try {
      const res = await fetch(`/api/posts/${post._id}/volunteer`, {
        method: "POST",
      });
      const data = await res.json();
      if (!res.ok) throw new Error();
      setVolunteered(data.volunteered);
      setVolunteerCount(data.count);
      if (data.volunteered) toast.success("You volunteered! +5 points");
    } catch {
      setVolunteered(was);
      setVolunteerCount((c) => (was ? c + 1 : c - 1));
    } finally {
      setVolunteering(false);
    }
  };

  const handleShare = async () => {
    const url = `${window.location.origin}/post/${post._id}`;
    if (navigator.share) {
      try {
        await navigator.share({
          title: post.title,
          text: post.description,
          url,
        });
      } catch {}
    } else {
      await navigator.clipboard.writeText(url);
      toast.success("Link copied!");
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

  const status = STATUS_INFO[post.samasyaStatus] || STATUS_INFO.pending;
  const statusLabels = {
    pending: t("post.pending"),
    in_progress: t("post.inProgress"),
    completed: t("post.resolved"),
  };
  const statusLabel = statusLabels[post.samasyaStatus] || t("post.pending");
  const StatusIcon = status.icon;

  const authorName = post.author?.name || "Anonymous";
  const authorAvatar = post.author?.avatar || null;
  const catStyle = CATEGORY_STYLES[post.category] || CATEGORY_STYLES.other;

  const showVolunteerBtn =
    post.targetGroup === "volunteer" || post.targetGroup === "both";

  return (
    <article className="bg-white border border-slate-100 rounded-xl overflow-hidden transition-all hover:shadow-md hover:shadow-slate-100 duration-300">
      {/* ── Photo ── */}
      {post.photo && (
        <div
          className="relative bg-slate-100 w-full cursor-pointer overflow-hidden"
          style={{
            aspectRatio: imgExpanded ? "auto" : "2/1",
            maxHeight: imgExpanded ? 500 : 200,
          }}
          onClick={() => setImgExpanded(!imgExpanded)}
        >
          <Image
            src={post.photo}
            alt={post.title}
            fill
            className={`object-cover transition-transform duration-500 ${imgExpanded ? "scale-100" : "hover:scale-105"}`}
            sizes="(max-width: 640px) 100vw, 640px"
          />
          {/* Status overlay */}
          <div className="absolute top-3 left-3 flex gap-1.5">
            <span
              className={`flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold backdrop-blur-md ${status.bg}/80 ${status.color} border ${status.border}`}
            >
              <StatusIcon
                className={`w-3 h-3 ${status.spin ? "animate-spin" : ""}`}
              />
              {statusLabel}
            </span>
          </div>
          {/* Category overlay */}
          <div className="absolute top-3 right-3">
            <span
              className={`flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold capitalize backdrop-blur-md ${catStyle.bg}/80 ${catStyle.text} border ${catStyle.border}`}
            >
              <span className={`w-1.5 h-1.5 rounded-full ${catStyle.dot}`} />
              {post.category}
            </span>
          </div>
        </div>
      )}

      <div className="p-4 space-y-3">
        {/* ── Header row ── */}
        <div className="flex justify-between items-start gap-2">
          <div className="flex items-center gap-2.5 min-w-0">
            {authorAvatar ? (
              <Image
                src={authorAvatar}
                alt={authorName}
                width={36}
                height={36}
                className="rounded-full border border-slate-200 object-cover shrink-0"
              />
            ) : (
              <div className="flex justify-center items-center bg-gradient-to-br from-green-400 to-emerald-600 rounded-full w-9 h-9 font-bold text-white text-sm shrink-0">
                {authorName[0]?.toUpperCase()}
              </div>
            )}
            <div className="min-w-0">
              <p className="font-semibold text-slate-800 text-sm truncate">
                {authorName}
              </p>
              <p className="text-slate-400 text-[11px]">
                {timeAgo(post.createdAt)}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-1.5 shrink-0">
            {/* Target group badge */}
            <span className="flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-medium bg-slate-50 text-slate-500 border border-slate-200">
              {post.targetGroup === "authority" && (
                <Shield className="w-3 h-3" />
              )}
              {post.targetGroup === "volunteer" && (
                <Users className="w-3 h-3" />
              )}
              {post.targetGroup === "both" && <Users className="w-3 h-3" />}
              {post.targetGroup === "both"
                ? t("post.targetBoth")
                : post.targetGroup === "authority"
                  ? t("post.targetAuthority")
                  : t("post.targetVolunteer")}
            </span>

            {/* No photo? Show status/category inline */}
            {!post.photo && (
              <>
                <span
                  className={`flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold ${status.bg} ${status.color} border ${status.border}`}
                >
                  <StatusIcon
                    className={`w-3 h-3 ${status.spin ? "animate-spin" : ""}`}
                  />
                  {statusLabel}
                </span>
                <span
                  className={`flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold capitalize ${catStyle.bg} ${catStyle.text} border ${catStyle.border}`}
                >
                  <span
                    className={`w-1.5 h-1.5 rounded-full ${catStyle.dot}`}
                  />
                  {post.category}
                </span>
              </>
            )}

            {canManagePost && (
              <PostActionsMenu
                post={post}
                onUpdated={onPostUpdated}
                onDeleted={onPostDeleted}
              />
            )}
          </div>
        </div>

        {/* ── Title & description ── */}
        <div>
          <h3 className="font-semibold text-slate-800 text-[15px] leading-snug">
            {post.title}
          </h3>
          <p className="mt-1 text-slate-500 text-sm leading-relaxed line-clamp-2">
            {post.description}
          </p>
        </div>

        {/* ── Location ── */}
        {post.location?.address && (
          <div className="flex items-center gap-1.5 text-slate-400 text-xs">
            <MapPin className="w-3.5 h-3.5 shrink-0 text-slate-300" />
            <span className="truncate">{post.location.address}</span>
          </div>
        )}

        {/* ── Authority response ── */}
        {post.authorityResponse && (
          <div className="bg-indigo-50 px-3 py-2.5 border border-indigo-100 rounded-lg">
            <div className="flex items-center gap-1.5 mb-1">
              <Shield className="w-3 h-3 text-indigo-500" />
              <span className="text-indigo-600 text-[10px] font-bold uppercase tracking-wider">
                {t("post.authority")}
              </span>
            </div>
            <p className="text-indigo-700 text-xs leading-relaxed">
              {post.authorityResponse}
            </p>
          </div>
        )}

        {/* ── Volunteer CTA ── */}
        {showVolunteerBtn && post.samasyaStatus !== "completed" && (
          <button
            onClick={handleVolunteer}
            disabled={!isSignedIn || volunteering}
            className={`w-full flex items-center justify-center gap-2 py-2.5 rounded-lg text-xs font-semibold transition-all duration-200 ${
              volunteered
                ? "bg-emerald-50 text-emerald-600 border border-emerald-200"
                : "bg-gradient-to-r from-green-500 to-emerald-600 text-white shadow-sm shadow-emerald-200 hover:shadow-md hover:shadow-emerald-200 active:scale-[0.98]"
            } disabled:opacity-50`}
          >
            {volunteering ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : volunteered ? (
              <CheckCircle className="w-4 h-4" />
            ) : (
              <Hand className="w-4 h-4" />
            )}
            {volunteered ? t("post.volunteered") : t("post.volunteer")}
            {volunteerCount > 0 && (
              <span
                className={`ml-1 px-1.5 py-0.5 rounded-full text-[10px] ${volunteered ? "bg-emerald-100 text-emerald-700" : "bg-white/20 text-white"}`}
              >
                {volunteerCount}
              </span>
            )}
          </button>
        )}

        {/* ── Action bar ── */}
        <div className="flex items-center pt-2 border-t border-slate-100">
          {/* Like */}
          <button
            onClick={handleLike}
            disabled={!isSignedIn || liking}
            className={`flex items-center gap-1.5 text-xs font-medium rounded-lg px-3 py-2 transition-all duration-200 ${
              liked
                ? "text-green-600 bg-green-50"
                : "text-slate-400 hover:text-green-600 hover:bg-green-50"
            } disabled:opacity-40`}
          >
            <ThumbsUp className={`w-4 h-4 ${liked ? "fill-green-600" : ""}`} />
            <span>{likeCount}</span>
          </button>

          {/* Comments */}
          <button
            onClick={toggleComments}
            className={`flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-medium transition-all duration-200 ${
              commentOpen
                ? "text-blue-600 bg-blue-50"
                : "text-slate-400 hover:text-blue-600 hover:bg-blue-50"
            }`}
          >
            <MessageSquare className="w-4 h-4" />
            {commentsLoaded && comments.length > 0 && (
              <span>{comments.length}</span>
            )}
            {commentOpen ? (
              <ChevronUp className="w-3 h-3" />
            ) : (
              <ChevronDown className="w-3 h-3" />
            )}
          </button>

          {/* Share */}
          <button
            onClick={handleShare}
            className="flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-medium text-slate-400 hover:text-slate-600 hover:bg-slate-50 transition-all duration-200"
          >
            <Share2 className="w-4 h-4" />
          </button>

          {/* Spacer + volunteer count (if not showing CTA) */}
          <div className="flex items-center gap-1.5 ml-auto text-slate-400 text-xs">
            {(!showVolunteerBtn || post.samasyaStatus === "completed") &&
              volunteerCount > 0 && (
                <>
                  <Users className="w-3.5 h-3.5" />
                  <span>{volunteerCount}</span>
                </>
              )}
          </div>
        </div>

        {/* ── Comments section ── */}
        {commentOpen && (
          <div className="space-y-2.5 pt-2 border-t border-slate-100">
            {loadingComments && (
              <div className="flex justify-center py-3">
                <Loader2 className="w-4 h-4 text-slate-300 animate-spin" />
              </div>
            )}

            {!loadingComments && comments.length === 0 && (
              <p className="py-2 text-slate-400 text-xs text-center">
                {t("post.noComments")}
              </p>
            )}

            {comments.map((c) => (
              <div key={c._id} className="flex items-start gap-2">
                {c.author?.avatar ? (
                  <Image
                    src={c.author.avatar}
                    alt={c.author.name}
                    width={24}
                    height={24}
                    className="mt-0.5 rounded-full object-cover shrink-0"
                  />
                ) : (
                  <div className="flex justify-center items-center bg-slate-200 mt-0.5 rounded-full w-6 h-6 font-bold text-[10px] text-slate-500 shrink-0">
                    {c.author?.name?.[0]?.toUpperCase()}
                  </div>
                )}
                <div className="flex-1 bg-slate-50 px-3 py-2 rounded-lg min-w-0">
                  <div className="flex items-center gap-2">
                    <p className="font-semibold text-slate-700 text-xs">
                      {c.author?.name}
                    </p>
                    <p className="text-[10px] text-slate-400">
                      {c.createdAt ? timeAgo(c.createdAt) : ""}
                    </p>
                  </div>
                  <p className="mt-0.5 text-slate-600 text-sm leading-snug">
                    {c.text}
                  </p>
                </div>
              </div>
            ))}

            {isSignedIn ? (
              <form
                onSubmit={handleSubmitComment}
                className="flex items-center gap-2"
              >
                <input
                  type="text"
                  value={commentText}
                  onChange={(e) => setCommentText(e.target.value)}
                  placeholder={t("post.writeComment")}
                  maxLength={500}
                  className="flex-1 bg-slate-50 px-3 py-2 border border-slate-200 focus:border-green-400 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-100 text-sm transition"
                />
                <button
                  type="submit"
                  disabled={!commentText.trim() || submittingComment}
                  className="flex justify-center items-center bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 disabled:opacity-40 rounded-lg w-9 h-9 text-white transition shrink-0"
                >
                  {submittingComment ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    <Send className="w-4 h-4" />
                  )}
                </button>
              </form>
            ) : (
              <p className="py-1 text-slate-400 text-xs text-center">
                {t("post.signInComment")}
              </p>
            )}
          </div>
        )}
      </div>
    </article>
  );
}
