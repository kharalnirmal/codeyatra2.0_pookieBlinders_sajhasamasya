"use client";

import { useState, useEffect, useCallback, useMemo } from "react";
import { useUser, SignInButton, SignUpButton } from "@clerk/nextjs";
import {
  RefreshCw,
  Leaf,
  ArrowRight,
  Search,
  SlidersHorizontal,
  TrendingUp,
  Clock,
  CheckCircle,
  Users,
  X,
  AlertTriangle,
} from "lucide-react";
import Link from "next/link";

import PostCard from "@/components/posts/PostCard";
import { useAutoRefresh } from "@/lib/hooks/useAutoRefresh";
import { useTranslation } from "@/lib/hooks/useTranslation";
import { CATEGORIES } from "@/lib/constants";

const CATEGORY_ICONS = {
  road: "🛣️",
  water: "💧",
  electricity: "⚡",
  garbage: "🗑️",
  safety: "🛡️",
  other: "📋",
};

export default function HomePage() {
  const { isSignedIn } = useUser();
  const { t } = useTranslation();

  const [posts, setPosts] = useState([]);
  const [fetchError, setFetchError] = useState("");
  const [refreshing, setRefreshing] = useState(false);

  // Filters
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [sortBy, setSortBy] = useState("latest");
  const [searchQuery, setSearchQuery] = useState("");
  const [searchOpen, setSearchOpen] = useState(false);

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

  // Derived stats
  const stats = useMemo(() => {
    const active = posts.filter((p) => p.samasyaStatus !== "completed").length;
    const resolved = posts.filter(
      (p) => p.samasyaStatus === "completed",
    ).length;
    const totalVolunteers = posts.reduce(
      (sum, p) => sum + (p.volunteers?.length || 0),
      0,
    );
    return { active, resolved, totalVolunteers, total: posts.length };
  }, [posts]);

  // Category counts
  const categoryCounts = useMemo(() => {
    const counts = { all: posts.length };
    CATEGORIES.forEach((c) => {
      counts[c] = posts.filter((p) => p.category === c).length;
    });
    return counts;
  }, [posts]);

  // Filtered + sorted posts
  const filteredPosts = useMemo(() => {
    let result = [...posts];

    if (selectedCategory !== "all") {
      result = result.filter((p) => p.category === selectedCategory);
    }

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      result = result.filter(
        (p) =>
          p.title?.toLowerCase().includes(q) ||
          p.description?.toLowerCase().includes(q) ||
          p.location?.address?.toLowerCase().includes(q),
      );
    }

    if (sortBy === "trending") {
      result.sort(
        (a, b) =>
          (b.likes?.length || 0) +
          (b.volunteers?.length || 0) -
          ((a.likes?.length || 0) + (a.volunteers?.length || 0)),
      );
    } else if (sortBy === "volunteers") {
      result.sort(
        (a, b) => (b.volunteers?.length || 0) - (a.volunteers?.length || 0),
      );
    }
    // "latest" is default from API (newest first)

    return result;
  }, [posts, selectedCategory, sortBy, searchQuery]);

  return (
    <>
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
              {/* ── Quick stats strip ── */}
              <div className="bg-white border-b border-slate-100">
                <div className="max-w-lg mx-auto px-4 py-3">
                  <div className="grid grid-cols-3 gap-3">
                    <div className="text-center">
                      <div className="flex items-center justify-center gap-1.5 text-amber-500 mb-0.5">
                        <AlertTriangle className="w-3.5 h-3.5" />
                        <span className="font-bold text-lg leading-none">
                          {stats.active}
                        </span>
                      </div>
                      <p className="text-[10px] text-slate-400 font-medium">
                        {t("home.statsActive")}
                      </p>
                    </div>
                    <div className="text-center border-x border-slate-100">
                      <div className="flex items-center justify-center gap-1.5 text-emerald-500 mb-0.5">
                        <CheckCircle className="w-3.5 h-3.5" />
                        <span className="font-bold text-lg leading-none">
                          {stats.resolved}
                        </span>
                      </div>
                      <p className="text-[10px] text-slate-400 font-medium">
                        {t("home.statsResolved")}
                      </p>
                    </div>
                    <div className="text-center">
                      <div className="flex items-center justify-center gap-1.5 text-blue-500 mb-0.5">
                        <Users className="w-3.5 h-3.5" />
                        <span className="font-bold text-lg leading-none">
                          {stats.totalVolunteers}
                        </span>
                      </div>
                      <p className="text-[10px] text-slate-400 font-medium">
                        {t("home.statsVolunteers")}
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              {/* ── Category filter pills ── */}
              <div className="bg-white border-b border-slate-100">
                <div className="max-w-lg mx-auto px-4 py-3">
                  <div className="flex gap-2 overflow-x-auto no-scrollbar">
                    <button
                      onClick={() => setSelectedCategory("all")}
                      className={`shrink-0 flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold transition-all duration-200 ${
                        selectedCategory === "all"
                          ? "bg-slate-800 text-white shadow-sm"
                          : "bg-slate-100 text-slate-500 hover:bg-slate-200"
                      }`}
                    >
                      {t("home.allCategories")}
                      <span
                        className={`text-[10px] px-1 py-0.5 rounded-full ${
                          selectedCategory === "all"
                            ? "bg-white/20"
                            : "bg-slate-200"
                        }`}
                      >
                        {categoryCounts.all}
                      </span>
                    </button>
                    {CATEGORIES.map((cat) => (
                      <button
                        key={cat}
                        onClick={() => setSelectedCategory(cat)}
                        className={`shrink-0 flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold capitalize transition-all duration-200 ${
                          selectedCategory === cat
                            ? "bg-slate-800 text-white shadow-sm"
                            : "bg-slate-100 text-slate-500 hover:bg-slate-200"
                        }`}
                      >
                        <span>{CATEGORY_ICONS[cat]}</span>
                        {cat}
                        {categoryCounts[cat] > 0 && (
                          <span
                            className={`text-[10px] px-1 py-0.5 rounded-full ${
                              selectedCategory === cat
                                ? "bg-white/20"
                                : "bg-slate-200"
                            }`}
                          >
                            {categoryCounts[cat]}
                          </span>
                        )}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              {/* ── Sort tabs + search ── */}
              <div className="max-w-lg mx-auto px-4 pt-4 pb-2">
                <div className="flex items-center justify-between gap-3">
                  <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-lg flex-1">
                    {[
                      { key: "latest", icon: Clock, label: t("home.latest") },
                      {
                        key: "trending",
                        icon: TrendingUp,
                        label: t("home.trending"),
                      },
                      {
                        key: "volunteers",
                        icon: Users,
                        label: t("home.volunteers"),
                      },
                    ].map((tab) => (
                      <button
                        key={tab.key}
                        onClick={() => setSortBy(tab.key)}
                        className={`flex-1 flex items-center justify-center gap-1 py-1.5 rounded-md text-[11px] font-medium transition-all duration-200 ${
                          sortBy === tab.key
                            ? "bg-white shadow-sm text-slate-800"
                            : "text-slate-400 hover:text-slate-600"
                        }`}
                      >
                        <tab.icon className="w-3 h-3" />
                        {tab.label}
                      </button>
                    ))}
                  </div>

                  <div className="flex items-center gap-1.5">
                    <button
                      onClick={() => setSearchOpen(!searchOpen)}
                      className={`p-2 rounded-lg transition-all duration-200 ${
                        searchOpen
                          ? "bg-slate-800 text-white"
                          : "bg-slate-100 text-slate-500 hover:bg-slate-200"
                      }`}
                    >
                      <Search className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => fetchPosts(true)}
                      disabled={refreshing}
                      className="p-2 rounded-lg bg-slate-100 text-slate-500 hover:bg-slate-200 transition-all duration-200 disabled:opacity-50"
                    >
                      <RefreshCw
                        className={`w-4 h-4 ${refreshing ? "animate-spin" : ""}`}
                      />
                    </button>
                  </div>
                </div>

                {/* Search bar (expandable) */}
                {searchOpen && (
                  <div className="mt-2 flex items-center gap-2 animate-in slide-in-from-top-2 duration-200">
                    <div className="relative flex-1">
                      <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                      <input
                        type="text"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        placeholder="Search issues..."
                        autoFocus
                        className="w-full pl-9 pr-3 py-2 bg-white border border-slate-200 rounded-lg text-sm focus:outline-none focus:border-green-400 focus:ring-2 focus:ring-green-100 transition"
                      />
                    </div>
                    {searchQuery && (
                      <button
                        onClick={() => setSearchQuery("")}
                        className="p-2 rounded-lg bg-slate-100 text-slate-500 hover:bg-slate-200 transition"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    )}
                  </div>
                )}

                {/* Results count */}
                {(selectedCategory !== "all" || searchQuery) && (
                  <p className="mt-2 text-[11px] text-slate-400 font-medium">
                    {filteredPosts.length} {t("home.issuesCount")}
                    {selectedCategory !== "all" && (
                      <span className="capitalize"> · {selectedCategory}</span>
                    )}
                    {searchQuery && <span> · &ldquo;{searchQuery}&rdquo;</span>}
                  </p>
                )}
              </div>

              {/* ── Post feed ── */}
              <div className="max-w-lg mx-auto px-4">
                {filteredPosts.length > 0 ? (
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
                ) : !fetchError ? (
                  <div className="flex flex-col items-center gap-3 py-20 text-center">
                    <div className="w-16 h-16 rounded-full bg-slate-100 flex items-center justify-center">
                      <Search className="w-6 h-6 text-slate-300" />
                    </div>
                    <div>
                      <p className="text-slate-500 text-sm font-medium">
                        {searchQuery || selectedCategory !== "all"
                          ? "No matching issues found"
                          : t("home.noIssues")}
                      </p>
                      <p className="text-slate-400 text-xs mt-1">
                        {searchQuery || selectedCategory !== "all"
                          ? "Try adjusting your filters"
                          : t("home.beFirst")}
                      </p>
                    </div>
                    {(searchQuery || selectedCategory !== "all") && (
                      <button
                        onClick={() => {
                          setSearchQuery("");
                          setSelectedCategory("all");
                        }}
                        className="px-4 py-2 rounded-lg bg-slate-100 text-slate-600 text-xs font-medium hover:bg-slate-200 transition"
                      >
                        Clear filters
                      </button>
                    )}
                  </div>
                ) : (
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
                )}
              </div>
            </div>
          )}
        </main>
      </div>
    </>
  );
}
