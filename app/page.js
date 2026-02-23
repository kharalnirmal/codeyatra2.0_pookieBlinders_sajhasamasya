"use client";

import { useState, useEffect, useCallback, useMemo } from "react";
import { useUser, SignInButton, SignUpButton } from "@clerk/nextjs";
import {
  RefreshCw,
  Leaf,
  ArrowRight,
  Search,
  MapPin,
  AlertTriangle,
  Loader2,
} from "lucide-react";

import PostCard from "@/components/posts/PostCard";
import { useAutoRefresh } from "@/lib/hooks/useAutoRefresh";
import { useTranslation } from "@/lib/hooks/useTranslation";

export default function HomePage() {
  const { isSignedIn } = useUser();
  const { t } = useTranslation();

  const [posts, setPosts] = useState([]);
  const [fetchError, setFetchError] = useState("");
  const [refreshing, setRefreshing] = useState(false);
  const [loading, setLoading] = useState(true);
  const [selectedDistrict, setSelectedDistrict] = useState("all");

  // Fetch posts (for everyone)
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
      setRefreshing(false);
      setLoading(false);
    }
  }, []);

  // Load on mount
  useEffect(() => {
    fetchPosts();
  }, [fetchPosts]);

  // Auto refresh every 10s
  useAutoRefresh(() => {
    fetchPosts(false);
  }, 10000);

  // District options
  const districtOptions = useMemo(() => {
    const unique = new Set();
    posts.forEach((post) => {
      if (post.district?.trim()) unique.add(post.district.trim());
    });
    return Array.from(unique).sort((a, b) => a.localeCompare(b));
  }, [posts]);

  const filteredPosts = useMemo(() => {
    if (selectedDistrict === "all") return posts;
    return posts.filter((p) => p.district?.trim() === selectedDistrict);
  }, [posts, selectedDistrict]);

  return (
    <div className="flex flex-col min-h-screen bg-slate-50 pb-24">
      <main className="flex-1">
        {/* ================= HERO (Only if NOT logged in) ================= */}
        {!isSignedIn && (
          <div className="w-full max-w-md mx-auto pt-4 px-4">
            <div className="rounded-3xl bg-gradient-to-br from-[#1a3a1f] via-[#2d5a36] to-[rgb(102,169,95)] p-6 text-white shadow-xl">
              <div className="flex items-center gap-2 text-xs uppercase tracking-wide bg-white/10 px-3 py-1 rounded-full w-fit">
                <Leaf className="w-3 h-3" />
                {t("home.heroTag")}
              </div>

              <h1 className="text-2xl font-bold mt-4">
                {t("home.heroTitle")} SajhaSamasya
              </h1>

              <p className="text-xs text-white/80 mt-2">{t("home.heroDesc")}</p>

              <div className="flex gap-3 mt-5">
                <SignUpButton mode="redirect">
                  <button className="flex-1 bg-white text-[#1a3a1f] text-xs font-bold py-3 rounded-xl">
                    {t("home.getStarted")}
                  </button>
                </SignUpButton>

                <SignInButton mode="redirect">
                  <button className="flex-1 bg-white/20 text-white text-xs font-bold py-3 rounded-xl border border-white/20">
                    {t("home.login")}
                  </button>
                </SignInButton>
              </div>
            </div>
          </div>
        )}

        {/* ================= POSTS SECTION (Always Visible) ================= */}
        <div className="max-w-lg mx-auto px-4 pt-6">
          {/* Filter + Refresh */}
          <div className="flex items-center justify-between gap-3 mb-4">
            <div className="flex items-center gap-2 flex-1 bg-white border rounded-lg px-3 py-2">
              <MapPin className="w-4 h-4 text-slate-400" />
              <select
                value={selectedDistrict}
                onChange={(e) => setSelectedDistrict(e.target.value)}
                className="w-full bg-transparent text-sm focus:outline-none"
              >
                <option value="all">All districts</option>
                {districtOptions.map((d) => (
                  <option key={d} value={d}>
                    {d}
                  </option>
                ))}
              </select>
            </div>

            <button
              onClick={() => fetchPosts(true)}
              disabled={refreshing}
              className="p-2 bg-slate-100 rounded-lg"
            >
              <RefreshCw
                className={`w-4 h-4 ${refreshing ? "animate-spin" : ""}`}
              />
            </button>
          </div>

          {/* Loading */}
          {loading ? (
            <div className="flex flex-col items-center py-20 text-slate-400">
              <Loader2 className="w-8 h-8 animate-spin mb-2" />
              Loading issues...
            </div>
          ) : fetchError ? (
            <div className="flex flex-col items-center py-20 text-red-500 text-sm">
              <AlertTriangle className="w-6 h-6 mb-2" />
              {fetchError}
            </div>
          ) : filteredPosts.length > 0 ? (
            <div className="space-y-3">
              {filteredPosts.map((post) => (
                <PostCard key={post._id} post={post} />
              ))}
            </div>
          ) : (
            <div className="flex flex-col items-center py-20 text-slate-400 text-sm">
              <Search className="w-6 h-6 mb-2" />
              No issues found
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
