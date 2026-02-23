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
  const [initialLoading, setInitialLoading] = useState(true);

  const [selectedDistrict, setSelectedDistrict] = useState("all");

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
      if (showRefreshing) setRefreshing(false);
      setInitialLoading(false);
    }
  }, []);

  useEffect(() => {
    if (isSignedIn) fetchPosts();
  }, [fetchPosts, isSignedIn]);

  useAutoRefresh(() => {
    if (isSignedIn) fetchPosts(false);
  }, 10000);

  const handlePostUpdated = (updatedPost) => {
    setPosts((prev) =>
      prev.map((p) => (p._id === updatedPost._id ? updatedPost : p)),
    );
  };

  const handlePostDeleted = (deletedId) => {
    setPosts((prev) => prev.filter((p) => p._id !== deletedId));
  };

  const districtOptions = useMemo(() => {
    const unique = new Set();
    posts.forEach((post) => {
      const d = post.district?.trim();
      if (d) unique.add(d);
    });
    return Array.from(unique).sort((a, b) => a.localeCompare(b));
  }, [posts]);

  // Reset filter if selected district no longer exists in data
  useEffect(() => {
    if (
      selectedDistrict !== "all" &&
      districtOptions.length > 0 &&
      !districtOptions.includes(selectedDistrict)
    ) {
      setSelectedDistrict("all");
    }
  }, [districtOptions, selectedDistrict]);

  const filteredPosts = useMemo(() => {
    if (selectedDistrict === "all") return posts;
    return posts.filter((p) => p.district?.trim() === selectedDistrict);
  }, [posts, selectedDistrict]);

  return (
    <div className="flex flex-col min-h-screen bg-slate-50 pb-24">
      <main className="flex-1">
        {/* ═══════════════════════════════════
            NOT SIGNED IN → HERO
        ═══════════════════════════════════ */}
        {!isSignedIn && (
          <div className="w-full max-w-md mx-auto pt-4 px-4">
            <div className="relative overflow-hidden rounded-[2.5rem] bg-gradient-to-br from-[#1a3a1f] via-[#2d5a36] to-[rgb(102,169,95)] p-7 shadow-2xl shadow-green-900/20">
              <div className="relative z-10 flex flex-col gap-6">
                <div className="inline-flex items-center gap-2 self-start rounded-full bg-white/10 px-3 py-1 text-[10px] font-semibold uppercase tracking-wider text-white border border-white/20">
                  <Leaf className="h-3 w-3 text-[rgb(102,169,95)]" />
                  {t("home.heroTag")}
                </div>

                <div className="space-y-2">
                  <h1 className="text-2xl font-extrabold text-white">
                    {t("home.heroTitle")}{" "}
                    <span className="bg-gradient-to-r from-white to-[rgb(200,230,195)] bg-clip-text text-transparent">
                      SajhaSamasya
                    </span>
                  </h1>
                  <p className="text-xs text-white/80 leading-relaxed">
                    {t("home.heroDesc")}
                  </p>
                </div>

                <div className="flex gap-3 pt-2">
                  <SignUpButton mode="redirect">
                    <button className="flex-1 flex items-center justify-center gap-2 rounded-xl bg-white py-3.5 text-xs font-black uppercase text-[#1a3a1f] shadow-lg active:scale-95 transition-all">
                      {t("home.getStarted")}
                      <ArrowRight className="h-3.5 w-3.5" />
                    </button>
                  </SignUpButton>

                  <SignInButton mode="redirect">
                    <button className="flex-1 rounded-xl bg-white/10 py-3.5 text-xs font-black uppercase text-white border border-white/20 backdrop-blur-md active:scale-95 transition-all hover:bg-white/20">
                      {t("home.login")}
                    </button>
                  </SignInButton>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ═══════════════════════════════════
            SIGNED IN → FULL FEED
        ═══════════════════════════════════ */}
        {isSignedIn && (
          <div className="space-y-0">
            {/* ── District filter + refresh ── */}
            <div className="max-w-lg mx-auto px-4 pt-4 pb-2">
              <div className="flex items-center justify-between gap-3">
                <div className="flex items-center gap-2 flex-1 bg-white border border-slate-200 rounded-lg px-3 py-2">
                  <MapPin className="w-4 h-4 text-slate-400 shrink-0" />
                  <select
                    value={selectedDistrict}
                    onChange={(e) => setSelectedDistrict(e.target.value)}
                    className="w-full bg-transparent text-sm text-slate-700 focus:outline-none"
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
                  className="p-2 rounded-lg bg-slate-100 text-slate-500 hover:bg-slate-200 transition-all duration-200 disabled:opacity-50 shrink-0"
                >
                  <RefreshCw
                    className={`w-4 h-4 ${refreshing ? "animate-spin" : ""}`}
                  />
                </button>
              </div>

              {/* Results count when filtered */}
              {selectedDistrict !== "all" && (
                <p className="mt-2 text-[11px] text-slate-400 font-medium">
                  {filteredPosts.length} {t("home.issuesCount")}
                  <span> · {selectedDistrict}</span>
                </p>
              )}
            </div>

            {/* ── Post feed ── */}
            <div className="max-w-lg mx-auto px-4">
              {/* Loading state */}
              {initialLoading ? (
                <div className="flex flex-col items-center gap-3 py-20 text-center">
                  <Loader2 className="w-8 h-8 text-slate-300 animate-spin" />
                  <p className="text-slate-400 text-sm">Loading issues...</p>
                </div>
              ) : filteredPosts.length > 0 ? (
                <div className="space-y-3">
                  {filteredPosts.map((post) => (
                    <PostCard
                      key={post._id}
                      post={post}
                      onPostUpdated={handlePostUpdated}
                      onPostDeleted={handlePostDeleted}
                    />
                  ))}
                </div>
              ) : fetchError ? (
                <div className="flex flex-col items-center gap-3 py-20 text-center">
                  <div className="w-16 h-16 rounded-full bg-red-50 flex items-center justify-center">
                    <AlertTriangle className="w-6 h-6 text-red-300" />
                  </div>
                  <p className="text-red-500 text-sm">{fetchError}</p>
                  <button
                    onClick={() => fetchPosts(true)}
                    className="px-4 py-2 rounded-lg bg-red-50 text-red-600 text-xs font-medium hover:bg-red-100 transition"
                  >
                    Try again
                  </button>
                </div>
              ) : (
                <div className="flex flex-col items-center gap-3 py-20 text-center">
                  <div className="w-16 h-16 rounded-full bg-slate-100 flex items-center justify-center">
                    <Search className="w-6 h-6 text-slate-300" />
                  </div>
                  <div>
                    <p className="text-slate-500 text-sm font-medium">
                      {selectedDistrict !== "all"
                        ? "No matching issues found"
                        : t("home.noIssues")}
                    </p>
                    <p className="text-slate-400 text-xs mt-1">
                      {selectedDistrict !== "all"
                        ? "Try selecting a different district"
                        : t("home.beFirst")}
                    </p>
                  </div>
                  {selectedDistrict !== "all" && (
                    <button
                      onClick={() => setSelectedDistrict("all")}
                      className="px-4 py-2 rounded-lg bg-slate-100 text-slate-600 text-xs font-medium hover:bg-slate-200 transition"
                    >
                      Clear filter
                    </button>
                  )}
                </div>
              )}
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
