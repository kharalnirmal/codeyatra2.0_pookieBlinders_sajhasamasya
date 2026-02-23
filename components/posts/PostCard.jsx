"use client";

import { useState } from "react";
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
} from "lucide-react";

const CATEGORY_COLORS = {
  road: "bg-orange-100 text-orange-700",
  water: "bg-blue-100 text-blue-700",
  electricity: "bg-yellow-100 text-yellow-700",
  garbage: "bg-green-100 text-green-700",
  safety: "bg-red-100 text-red-700",
  other: "bg-gray-100 text-gray-600",
};

const STATUS_INFO = {
  pending: {
    label: "Pending",
    icon: Clock,
    color: "text-yellow-600 bg-yellow-50",
    spin: false,
  },
  in_progress: {
    label: "In Progress",
    icon: Loader2,
    color: "text-blue-600 bg-blue-50",
    spin: true,
  },
  completed: {
    label: "Resolved",
    icon: CheckCircle,
    color: "text-green-600 bg-green-50",
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

  // Check if current user is the post author or an authority
  const isAuthor = isSignedIn && user && post.author?.clerkId === user.id;
  const isAuthority = isSignedIn && user?.publicMetadata?.role === "authority";
  const canManagePost = isAuthor || isAuthority;

  // Like state (optimistic)
  const [likeCount, setLikeCount] = useState(post.likes?.length || 0);
  const [liked, setLiked] = useState(false);
  const [liking, setLiking] = useState(false);

  // Comment state
  const [commentOpen, setCommentOpen] = useState(false);
  const [comments, setComments] = useState([]);
  const [commentsLoaded, setCommentsLoaded] = useState(false);
  const [loadingComments, setLoadingComments] = useState(false);
  const [commentText, setCommentText] = useState("");
  const [submittingComment, setSubmittingComment] = useState(false);

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

  const loadComments = async () => {
    if (commentsLoaded) return;
    setLoadingComments(true);
    try {
      const res = await fetch(`/api/posts/${post._id}/comments`);
      const data = await res.json();
      setComments(data.comments || []);
      setCommentsLoaded(true);
    } finally {
      setLoadingComments(false);
    }
  };

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
  const StatusIcon = status.icon;
  const authorName = post.author?.name || "Anonymous";
  const authorAvatar = post.author?.avatar || null;
  const categoryClass = CATEGORY_COLORS[post.category] || CATEGORY_COLORS.other;

  return (
    <article className="bg-white shadow-sm rounded-2xl overflow-hidden border border-gray-100">
      {/* Photo */}
      {post.photo && (
        <div
          className="relative bg-gray-100 w-full"
          style={{ aspectRatio: "16/9" }}
        >
          <Image
            src={post.photo}
            alt={post.title}
            fill
            className="object-cover"
            sizes="(max-width: 640px) 100vw, 640px"
          />
        </div>
      )}

      <div className="space-y-3 p-4">
        {/* Header row */}
        <div className="flex justify-between items-start gap-2">
          <div className="flex items-center gap-2 min-w-0">
            {authorAvatar ? (
              <Image
                src={authorAvatar}
                alt={authorName}
                width={32}
                height={32}
                className="rounded-full object-cover shrink-0"
              />
            ) : (
              <div className="flex justify-center items-center bg-primary rounded-full w-8 h-8 font-bold text-white text-sm shrink-0">
                {authorName[0]?.toUpperCase()}
              </div>
            )}
            <div className="min-w-0">
              <p className="font-medium text-gray-800 text-sm truncate">
                {authorName}
              </p>
              <p className="text-gray-400 text-xs">{timeAgo(post.createdAt)}</p>
            </div>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            {/* Three-dot menu for author or authority */}
            {canManagePost && (
              <PostActionsMenu
                post={post}
                onUpdated={onPostUpdated}
                onDeleted={onPostDeleted}
              />
            )}

            {/* Status badge */}
            <span
              className={`flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium shrink-0 ${status.color}`}
            >
              <StatusIcon
                className={`w-3 h-3 ${status.spin ? "animate-spin" : ""}`}
              />
              {status.label}
            </span>
          </div>
        </div>

        {/* Title & description */}
        <div>
          <h3 className="font-semibold text-gray-900 text-base leading-snug">
            {post.title}
          </h3>
          <p className="mt-1 text-gray-500 text-sm line-clamp-2">
            {post.description}
          </p>
        </div>

        {/* Tags row */}
        <div className="flex flex-wrap gap-1.5">
          <span
            className={`px-2 py-0.5 rounded-full text-xs font-medium capitalize ${categoryClass}`}
          >
            {post.category}
          </span>
          <span className="bg-gray-100 px-2 py-0.5 rounded-full text-gray-500 text-xs capitalize">
            {post.targetGroup === "both"
              ? "Authority + Volunteers"
              : post.targetGroup}
          </span>
        </div>

        {/* Location */}
        {post.location?.address && (
          <p className="flex items-center gap-1 text-gray-400 text-xs">
            <MapPin className="w-3.5 h-3.5 shrink-0" />
            <span className="truncate">{post.location.address}</span>
          </p>
        )}

        {/* Authority response */}
        {post.authorityResponse && (
          <div className="bg-blue-50 border border-blue-100 px-3 py-2 rounded-xl">
            <p className="text-blue-700 text-xs">
              <span className="font-semibold">Authority: </span>
              {post.authorityResponse}
            </p>
          </div>
        )}

        {/* Action row */}
        <div className="flex items-center gap-1 pt-1 border-t border-gray-100">
          {/* Like button */}
          <button
            onClick={handleLike}
            disabled={!isSignedIn || liking}
            className={`flex items-center gap-1.5 text-xs font-medium rounded-xl px-3 py-2 transition ${
              liked
                ? "text-primary bg-primary/10"
                : "text-gray-400 hover:text-primary hover:bg-primary/5"
            } disabled:opacity-50`}
          >
            <ThumbsUp className={`w-4 h-4 ${liked ? "fill-primary" : ""}`} />
            <span>{likeCount}</span>
          </button>

          {/* Comment toggle */}
          <button
            onClick={toggleComments}
            className="flex items-center gap-1.5 text-gray-400 text-xs hover:text-secondary rounded-xl px-3 py-2 transition"
          >
            <MessageSquare className="w-4 h-4" />
            {commentsLoaded && comments.length > 0 ? (
              <span>{comments.length}</span>
            ) : null}
            {commentOpen ? (
              <ChevronUp className="w-3 h-3" />
            ) : (
              <ChevronDown className="w-3 h-3" />
            )}
          </button>

          {/* Volunteers count */}
          <span className="flex items-center gap-1 ml-auto text-gray-400 text-xs px-2">
            <Users className="w-3.5 h-3.5" />
            {post.volunteers?.length || 0}
          </span>
        </div>

        {/* Comment section */}
        {commentOpen && (
          <div className="space-y-2.5 pt-1 border-t border-gray-100">
            {loadingComments && (
              <div className="flex justify-center py-3">
                <Loader2 className="w-4 h-4 text-gray-300 animate-spin" />
              </div>
            )}

            {!loadingComments && comments.length === 0 && (
              <p className="py-2 text-center text-gray-400 text-xs">
                No comments yet.
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
                    className="rounded-full object-cover shrink-0 mt-0.5"
                  />
                ) : (
                  <div className="flex justify-center items-center bg-gray-200 rounded-full w-6 h-6 text-gray-500 text-[10px] font-bold shrink-0 mt-0.5">
                    {c.author?.name?.[0]?.toUpperCase()}
                  </div>
                )}
                <div className="bg-gray-50 px-3 py-2 rounded-xl flex-1 min-w-0">
                  <p className="font-semibold text-gray-700 text-xs">
                    {c.author?.name}
                  </p>
                  <p className="text-gray-600 text-sm leading-snug mt-0.5">
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
                  placeholder="Write a comment…"
                  maxLength={500}
                  className="flex-1 bg-gray-50 border border-gray-200 focus:border-primary rounded-xl px-3 py-2 text-sm focus:outline-none"
                />
                <button
                  type="submit"
                  disabled={!commentText.trim() || submittingComment}
                  className="flex justify-center items-center bg-primary hover:bg-red-700 disabled:opacity-40 rounded-xl w-9 h-9 text-white transition shrink-0"
                >
                  {submittingComment ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    <Send className="w-4 h-4" />
                  )}
                </button>
              </form>
            ) : (
              <p className="text-center text-gray-400 text-xs py-1">
                Sign in to comment
              </p>
            )}
          </div>
        )}
      </div>
    </article>
  );
}
