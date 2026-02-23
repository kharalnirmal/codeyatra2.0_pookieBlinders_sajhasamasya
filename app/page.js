"use client";

import { useState, useEffect, useCallback } from "react";
import PostCard from "@/components/posts/PostCard";
import { AlertCircle, RefreshCw } from "lucide-react";
import { useAutoRefresh } from "@/lib/hooks/useAutoRefresh";

function PostSkeleton() {
  return (
    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-4 animate-pulse">
      <div className="flex items-center gap-3 mb-3">
        <div className="w-10 h-10 rounded-full bg-gray-200" />
        <div className="flex-1 space-y-2">
          <div className="h-3.5 bg-gray-200 rounded w-28" />
          <div className="h-2.5 bg-gray-100 rounded w-20" />
        </div>
        <div className="h-5 w-16 bg-gray-100 rounded-full" />
      </div>
      <div className="space-y-2 mb-3">
        <div className="h-4 bg-gray-200 rounded w-3/4" />
        <div className="h-3 bg-gray-100 rounded w-full" />
        <div className="h-3 bg-gray-100 rounded w-5/6" />
      </div>
      <div className="h-44 bg-gray-100 rounded-xl mb-3" />
      <div className="flex gap-4">
        <div className="h-8 w-16 bg-gray-100 rounded-lg" />
        <div className="h-8 w-16 bg-gray-100 rounded-lg" />
      </div>
    </div>
  );
}

export default function Home() {
  const [posts, setPosts] = useState([]);
  const [fetchingInitial, setFetchingInitial] = useState(true);
  const [fetchError, setFetchError] = useState("");
  const [refreshing, setRefreshing] = useState(false);

  const fetchPosts = useCallback(async (showRefreshing = false) => {
    if (showRefreshing) setRefreshing(true);
    setFetchError("");
    try {
      const res = await fetch("/api/posts");
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to load posts");
      setPosts(data.posts || []);
    } catch (err) {
      setFetchError(err.message || "Failed to load posts");
    } finally {
      setFetchingInitial(false);
      if (showRefreshing) setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    fetchPosts();
  }, [fetchPosts]);

  // Auto-refresh every 10 seconds (silent, no loading spinner)
  useAutoRefresh(() => fetchPosts(false), 10000);

  return (
    <main className="bg-gray-50 pb-28 min-h-screen">
      {/* Feed header */}
      <div className="flex justify-between items-center px-4 pt-4 pb-2">
        <h2 className="font-bold text-gray-800 text-lg">Community Issues</h2>
        <button
          onClick={() => fetchPosts(true)}
          disabled={refreshing}
          className="flex items-center gap-1 text-gray-500 hover:text-primary text-xs transition"
          aria-label="Refresh feed"
        >
          <RefreshCw
            className={`w-4 h-4 ${refreshing ? "animate-spin" : ""}`}
          />
          Refresh
        </button>
      </div>

      {/* Error state */}
      {fetchError && (
        <div className="flex items-center gap-2 mx-4 mt-2 p-3 bg-red-50 border border-red-200 rounded-xl text-red-600 text-sm">
          <AlertCircle className="w-4 h-4 shrink-0" />
          {fetchError}
        </div>
      )}

      {/* Skeleton loading */}
      {fetchingInitial && (
        <div className="space-y-3 mx-auto px-4 mt-2 max-w-lg">
          {[1, 2, 3].map((i) => (
            <PostSkeleton key={i} />
          ))}
        </div>
      )}

      {/* Posts feed */}
      {!fetchingInitial && posts.length > 0 ? (
        <div className="space-y-3 mx-auto px-4 mt-2 max-w-lg">
          {posts.map((post) => (
            <PostCard key={post._id} post={post} />
          ))}
        </div>
      ) : !fetchingInitial && !fetchError ? (
        <div className="flex flex-col justify-center items-center gap-3 mt-20 text-gray-400">
          <p className="text-base">No issues reported yet.</p>
          <p className="text-sm">Be the first to report a community issue!</p>
        </div>
      ) : null}
    </main>
  );
}
