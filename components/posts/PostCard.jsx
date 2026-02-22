"use client";

import Image from "next/image";
import {
  MapPin,
  Clock,
  ThumbsUp,
  Users,
  CheckCircle,
  Loader2,
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
  },
  in_progress: {
    label: "In Progress",
    icon: Loader2,
    color: "text-blue-600 bg-blue-50",
  },
  completed: {
    label: "Resolved",
    icon: CheckCircle,
    color: "text-green-600 bg-green-50",
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

export default function PostCard({ post }) {
  const status = STATUS_INFO[post.samasyaStatus] || STATUS_INFO.pending;
  const StatusIcon = status.icon;
  const authorName = post.author?.name || "Anonymous";
  const authorAvatar = post.author?.avatar || null;
  const categoryClass = CATEGORY_COLORS[post.category] || CATEGORY_COLORS.other;

  return (
    <article className="bg-white shadow-sm rounded-2xl overflow-hidden">
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
            {/* Avatar */}
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

          {/* Status badge */}
          <span
            className={`flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium shrink-0 ${status.color}`}
          >
            <StatusIcon className="w-3 h-3" />
            {status.label}
          </span>
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

        {/* Footer row */}
        <div className="flex items-center gap-4 pt-1 border-t text-gray-400 text-xs">
          <span className="flex items-center gap-1">
            <ThumbsUp className="w-3.5 h-3.5" />
            {post.likes?.length || 0}
          </span>
          <span className="flex items-center gap-1">
            <Users className="w-3.5 h-3.5" />
            {post.volunteers?.length || 0} volunteers
          </span>
          {post.location?.address && (
            <span className="flex items-center gap-1 ml-auto truncate">
              <MapPin className="w-3.5 h-3.5 shrink-0" />
              {post.location.address}
            </span>
          )}
        </div>
      </div>
    </article>
  );
}
