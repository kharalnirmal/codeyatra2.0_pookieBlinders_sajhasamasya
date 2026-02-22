"use client";

import { useState, useEffect } from "react";
import Loader from "@/components/ui/Loader";
import PostCard from "@/components/posts/PostCard";
import { AlertCircle, RefreshCw } from "lucide-react";

export default function Home() {
  const [loading, setLoading] = useState(true);
  const [posts, setPosts] = useState([]);
  const [fetchError, setFetchError] = useState("");
  const [refreshing, setRefreshing] = useState(false);

  async function fetchPosts(showRefreshing = false) {
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
      if (showRefreshing) setRefreshing(false);
    }
  }

  useEffect(() => {
    fetchPosts();
  }, []);

  return (
    <>
      {loading && <Loader onComplete={() => setLoading(false)} />}
      <main
        style={{ opacity: loading ? 0 : 1, transition: "opacity 0.5s ease" }}
        className="bg-gray-50 pb-28 min-h-screen"
      >
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

        {/* Posts feed */}
        {posts.length > 0 ? (
          <div className="space-y-3 mx-auto px-4 mt-2 max-w-lg">
            {posts.map((post) => (
              <PostCard key={post._id} post={post} />
            ))}
          </div>
        ) : !fetchError ? (
          <div className="flex flex-col justify-center items-center gap-3 mt-20 text-gray-400">
            <p className="text-base">No issues reported yet.</p>
            <p className="text-sm">Be the first to report a community issue!</p>
          </div>
        ) : null}
      </main>
    </>
  );
}
