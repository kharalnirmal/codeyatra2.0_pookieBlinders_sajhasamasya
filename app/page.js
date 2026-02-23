"use client";

import { useState, useEffect, useCallback } from "react";
import { useUser, SignInButton, SignUpButton } from "@clerk/nextjs";
import { RefreshCw, Leaf, ArrowRight } from "lucide-react";

import Loader from "@/components/ui/Loader";
import PostCard from "@/components/posts/PostCard";
import { useAutoRefresh } from "@/lib/hooks/useAutoRefresh";
import { useTranslation } from "@/lib/hooks/useTranslation";

export default function HomePage() {
  const { isSignedIn } = useUser();
  const { t } = useTranslation();

  const [loading, setLoading] = useState(true);
  const [posts, setPosts] = useState([]);
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
      if (showRefreshing) setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    if (isSignedIn) {
      fetchPosts();
    }
  }, [fetchPosts, isSignedIn]);

  // Auto refresh every 10 seconds
  useAutoRefresh(() => {
    if (isSignedIn) fetchPosts(false);
  }, 10000);

  return (
    <>
      {loading && <Loader onComplete={() => setLoading(false)} />}

      <div
        style={{ opacity: loading ? 0 : 1, transition: "opacity 0.5s ease" }}
        className="flex flex-col min-h-screen bg-gray-50 pb-20"
      >
        <main className="flex-1 p-2 space-y-6">
          {/* 🔒 NOT SIGNED IN → HERO SECTION */}
          {!isSignedIn && (
            <div className="w-full max-w-md mx-auto pt-4">
              <div className="relative overflow-hidden rounded-[2.5rem] bg-gradient-to-br from-[#1a3a1f] via-[#2d5a36] to-[rgb(102,169,95)] p-7 shadow-2xl shadow-green-900/20">
                <div className="relative z-10 flex flex-col gap-6">
                  <div className="inline-flex items-center gap-2 self-start rounded-full bg-white/10 px-3 py-1 text-[10px] font-semibold uppercase tracking-wider text-white border border-white/20">
                    <Leaf className="h-3 w-3 text-[rgb(102,169,95)]" />
                    Community Growth
                  </div>

                  <div className="space-y-2">
                    <h1 className="text-2xl font-extrabold text-white">
                      Welcome to{" "}
                      <span className="bg-gradient-to-r from-white to-[rgb(200,230,195)] bg-clip-text text-transparent">
                        SajhaSamasya
                      </span>
                    </h1>
                    <p className="text-xs text-white/80 leading-relaxed">
                      Raise local issues, support neighbors, and improve your
                      community together.
                    </p>
                  </div>

                  <div className="flex gap-3 pt-2">
                    <SignUpButton mode="redirect">
                      <button className="flex-1 flex items-center justify-center gap-2 rounded-xl bg-white py-3.5 text-xs font-black uppercase text-[#1a3a1f] shadow-lg active:scale-95 transition-all">
                        Get Started
                        <ArrowRight className="h-3.5 w-3.5" />
                      </button>
                    </SignUpButton>

                    <SignInButton mode="redirect">
                      <button className="flex-1 rounded-xl bg-white/10 py-3.5 text-xs font-black uppercase text-white border border-white/20 backdrop-blur-md active:scale-95 transition-all hover:bg-white/20">
                        Login
                      </button>
                    </SignInButton>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* 📰 SIGNED IN → FEED */}
          {isSignedIn && (
            <>
              <div className="flex justify-between items-center px-4 pt-2">
                <h2 className="font-bold text-gray-800 text-lg">
                  {t("home.title")}
                </h2>

                <button
                  onClick={() => fetchPosts(true)}
                  disabled={refreshing}
                  className="flex items-center gap-1 text-gray-500 hover:text-green-600 text-xs transition"
                >
                  <RefreshCw
                    className={`w-4 h-4 ${refreshing ? "animate-spin" : ""}`}
                  />
                  {t("home.refresh")}
                </button>
              </div>

              {posts.length > 0 ? (
                <div className="space-y-3 mx-auto px-4 mt-2 max-w-lg">
                  {posts.map((post) => (
                    <PostCard key={post._id} post={post} />
                  ))}
                </div>
              ) : !fetchError ? (
                <div className="flex flex-col justify-center items-center gap-3 mt-20 text-gray-400">
                  <p className="text-base">{t("home.noIssues")}</p>
                  <p className="text-sm">{t("home.beFirst")}</p>
                </div>
              ) : (
                <div className="text-center text-red-500 mt-10">
                  {fetchError}
                </div>
              )}
            </>
          )}
        </main>
      </div>
    </>
  );
}
