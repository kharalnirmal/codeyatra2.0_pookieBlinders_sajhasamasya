"use client";

import { useState, useEffect, useRef } from "react";
import Loader from "@/components/ui/Loader";
import PostCard from "@/components/posts/PostCard";
import { AlertCircle, RefreshCw, Sparkles, ArrowRight, MapPin } from "lucide-react";

/* ─────────────────────────────────────────
   Scroll-reveal wrapper with spring physics
───────────────────────────────────────── */
function Reveal({ children, delay = 0, className = "" }) {
  const ref = useRef(null);
  const [show, setShow] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const obs = new IntersectionObserver(
      ([e]) => { if (e.isIntersecting) { setShow(true); obs.disconnect(); } },
      { threshold: 0.07 }
    );
    obs.observe(el);
    return () => obs.disconnect();
  }, []);

  return (
    <div
      ref={ref}
      className={className}
      style={{
        opacity: show ? 1 : 0,
        transform: show ? "translateY(0px) scale(1)" : "translateY(28px) scale(0.98)",
        transition: `opacity 0.65s cubic-bezier(.22,1,.36,1) ${delay}ms, transform 0.65s cubic-bezier(.34,1.4,.64,1) ${delay}ms`,
      }}
    >
      {children}
    </div>
  );
}

/* ─────────────────────────────────────────
   Animated gradient orb (decorative)
───────────────────────────────────────── */
function Orb({ className }) {
  return (
    <div
      className={className}
      style={{
        borderRadius: "60% 40% 70% 30% / 50% 60% 40% 50%",
        animation: "morphOrb 8s ease-in-out infinite alternate",
        filter: "blur(60px)",
        willChange: "transform, border-radius",
      }}
    />
  );
}

/* ─────────────────────────────────────────
   Shimmer skeleton for loading state
───────────────────────────────────────── */
function SkeletonCard() {
  return (
    <div className="rounded-3xl overflow-hidden bg-white/60 border border-white/80 p-4 space-y-3">
      <div className="flex items-center gap-3">
        <div className="w-9 h-9 rounded-full bg-linear-to-r from-gray-100 to-gray-200 animate-pulse shrink-0" />
        <div className="flex-1 space-y-1.5">
          <div className="h-3 w-28 rounded-full bg-linear-to-r from-gray-100 to-gray-200 animate-pulse" />
          <div className="h-2.5 w-16 rounded-full bg-linear-to-r from-gray-100 to-gray-200 animate-pulse" />
        </div>
      </div>
      <div className="h-32 rounded-2xl bg-linear-to-r from-gray-100 to-gray-200 animate-pulse" />
      <div className="space-y-2">
        <div className="h-3 w-3/4 rounded-full bg-linear-to-r from-gray-100 to-gray-200 animate-pulse" />
        <div className="h-2.5 w-1/2 rounded-full bg-linear-to-r from-gray-100 to-gray-200 animate-pulse" />
      </div>
    </div>
  );
}

/* ─────────────────────────────────────────
   Main Page
───────────────────────────────────────── */
export default function Home() {
  const [loading, setLoading] = useState(true);
  const [postsLoading, setPostsLoading] = useState(true);
  const [posts, setPosts] = useState([]);
  const [fetchError, setFetchError] = useState("");
  const [refreshing, setRefreshing] = useState(false);
  const [refreshKey, setRefreshKey] = useState(0);
  const [headerVisible, setHeaderVisible] = useState(false);

  async function fetchPosts(showRefreshing = false) {
    if (showRefreshing) { setRefreshing(true); setPostsLoading(true); }
    setFetchError("");
    try {
      const res = await fetch("/api/posts");
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to load posts");
      setPosts(data.posts || []);
      if (showRefreshing) setRefreshKey((k) => k + 1);
    } catch (err) {
      setFetchError(err.message || "Failed to load posts");
    } finally {
      setPostsLoading(false);
      if (showRefreshing) setRefreshing(false);
    }
  }

  useEffect(() => { fetchPosts(); }, []);

  useEffect(() => {
    if (!loading) setTimeout(() => setHeaderVisible(true), 80);
  }, [loading]);

  return (
    <>
      {loading && <Loader onComplete={() => setLoading(false)} />}

      <style>{`
        @keyframes morphOrb {
          0%   { border-radius: 60% 40% 70% 30% / 50% 60% 40% 50%; transform: scale(1) rotate(0deg); }
          50%  { border-radius: 30% 70% 40% 60% / 60% 30% 70% 40%; transform: scale(1.08) rotate(6deg); }
          100% { border-radius: 50% 50% 30% 70% / 40% 60% 50% 60%; transform: scale(0.96) rotate(-4deg); }
        }
        @keyframes floatY {
          0%, 100% { transform: translateY(0px); }
          50%       { transform: translateY(-8px); }
        }
        @keyframes spinSlow {
          to { transform: rotate(360deg); }
        }
        @keyframes fadeSlideUp {
          from { opacity: 0; transform: translateY(20px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        @keyframes shimmer {
          from { background-position: -200% center; }
          to   { background-position: 200% center; }
        }
        @keyframes pulseSoft {
          0%, 100% { opacity: 0.5; transform: scale(1); }
          50%       { opacity: 0.8; transform: scale(1.04); }
        }
        .card-hover {
          transition: transform 0.4s cubic-bezier(.34,1.4,.64,1), box-shadow 0.4s ease;
        }
        .card-hover:hover {
          transform: translateY(-4px) scale(1.005);
          box-shadow: 0 20px 48px rgba(26,92,56,0.14), 0 4px 12px rgba(26,92,56,0.08);
        }
        .shimmer-text {
          background: linear-gradient(120deg, #14532d 0%, #16a34a 40%, #14532d 60%, #15803d 100%);
          background-size: 200% auto;
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
          animation: shimmer 4s linear infinite;
        }
        .glass-card {
          background: rgba(255,255,255,0.72);
          backdrop-filter: blur(20px) saturate(180%);
          -webkit-backdrop-filter: blur(20px) saturate(180%);
          border: 1px solid rgba(255,255,255,0.85);
          box-shadow: 0 4px 24px rgba(26,92,56,0.06), 0 1px 4px rgba(26,92,56,0.04), inset 0 1px 0 rgba(255,255,255,0.9);
        }
        .ring-pulse {
          animation: pulseSoft 3s ease-in-out infinite;
        }
      `}</style>

      <main
        style={{
          opacity: loading ? 0 : 1,
          transition: "opacity 0.7s ease",
          minHeight: "100vh",
          background: "linear-gradient(160deg, #f0f7f2 0%, #f8f8f4 40%, #f0f5f2 100%)",
          paddingBottom: "8rem",
          position: "relative",
          overflow: "hidden",
        }}
      >
        {/* ── AMBIENT BACKGROUND ── */}
        <div aria-hidden className="pointer-events-none fixed inset-0 -z-10">
          <Orb className="absolute -top-48 -left-32 w-150 h-125 bg-green-200/35" />
          <Orb className="absolute top-1/2 -right-48 w-120 h-120 bg-emerald-200/25"
            style={{ animationDelay: "-3s", animationDirection: "alternate-reverse" }}
          />
          <Orb className="absolute bottom-0 left-1/4 w-100 h-87.5 bg-teal-100/30"
            style={{ animationDelay: "-5s" }}
          />
          {/* Subtle dot grid */}
          <svg className="absolute inset-0 w-full h-full opacity-[0.025]" xmlns="http://www.w3.org/2000/svg">
            <defs>
              <pattern id="dots" x="0" y="0" width="24" height="24" patternUnits="userSpaceOnUse">
                <circle cx="2" cy="2" r="1.2" fill="#166534" />
              </pattern>
            </defs>
            <rect width="100%" height="100%" fill="url(#dots)" />
          </svg>
        </div>

        {/* ── HERO HEADER ── */}
        <div
          className="relative overflow-hidden"
          style={{
            opacity: headerVisible ? 1 : 0,
            transform: headerVisible ? "translateY(0)" : "translateY(-16px)",
            transition: "opacity 0.7s ease 0.1s, transform 0.7s cubic-bezier(.34,1.3,.64,1) 0.1s",
          }}
        >
          {/* Decorative arc behind hero */}
          <div
            aria-hidden
            className="absolute -top-24 left-1/2 -translate-x-1/2 w-[140%] h-64 opacity-20 -z-10"
            style={{
              background: "radial-gradient(ellipse at center top, #bbf7d0 0%, transparent 70%)",
            }}
          />

          <div className="mx-auto max-w-2xl px-5 sm:px-8 pt-6 pb-5 sm:pt-8 sm:pb-6">
            {/* Top label */}
            <div
              className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full mb-4"
              style={{
                background: "rgba(20,83,45,0.07)",
                border: "1px solid rgba(20,83,45,0.12)",
                animation: "fadeSlideUp 0.5s ease 0.2s both",
              }}
            >
              <span
                className="w-1.5 h-1.5 rounded-full bg-green-500 ring-pulse"
                style={{ boxShadow: "0 0 0 3px rgba(74,222,128,0.3)" }}
              />
              <span className="text-[11px] font-semibold text-green-800 tracking-widest uppercase">
                Live Community Feed
              </span>
            </div>

            {/* Main heading */}
            <h1
              className="text-3xl sm:text-4xl font-bold leading-tight tracking-tight mb-2"
              style={{ animation: "fadeSlideUp 0.55s ease 0.3s both" }}
            >
              <span className="shimmer-text">Community</span>
              <br />
              <span className="text-green-950">Issues Near You</span>
            </h1>

            {/* Sub-line */}
            <p
              className="text-sm sm:text-base text-green-900/50 font-medium leading-relaxed max-w-sm"
              style={{ animation: "fadeSlideUp 0.55s ease 0.4s both" }}
            >
              Report, follow, and resolve local problems together.
            </p>

            {/* Stats strip */}
            {posts.length > 0 && (
              <div
                className="flex items-center gap-4 mt-5 pt-4 border-t border-green-900/8"
                style={{ animation: "fadeSlideUp 0.55s ease 0.5s both" }}
              >
                <div className="flex items-center gap-1.5">
                  <MapPin size={13} className="text-green-600" strokeWidth={2.5} />
                  <span className="text-xs font-semibold text-green-800">
                    {posts.length} active{posts.length === 1 ? " report" : " reports"}
                  </span>
                </div>
                <div className="w-px h-4 bg-green-900/10" />
                <div className="flex items-center gap-1.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-green-400 animate-pulse" />
                  <span className="text-xs text-green-700/60 font-medium">Updated just now</span>
                </div>

                {/* Refresh - desktop right-aligned */}
                <div className="ml-auto">
                  <button
                    onClick={() => fetchPosts(true)}
                    disabled={refreshing}
                    aria-label="Refresh feed"
                    className="group flex items-center gap-1.5 px-3.5 py-1.5 rounded-full
                               text-xs font-semibold text-green-800
                               disabled:opacity-50
                               transition-all duration-300"
                    style={{
                      background: "rgba(255,255,255,0.8)",
                      border: "1px solid rgba(20,83,45,0.12)",
                      boxShadow: "0 2px 8px rgba(26,92,56,0.08)",
                    }}
                    onMouseEnter={e => e.currentTarget.style.boxShadow = "0 4px 16px rgba(26,92,56,0.16)"}
                    onMouseLeave={e => e.currentTarget.style.boxShadow = "0 2px 8px rgba(26,92,56,0.08)"}
                  >
                    <RefreshCw
                      size={12}
                      className={refreshing ? "animate-spin" : "group-hover:rotate-180 transition-transform duration-500"}
                    />
                    <span>{refreshing ? "Refreshing…" : "Refresh"}</span>
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* ── CONTENT AREA ── */}
        <div className="mx-auto max-w-2xl px-4 sm:px-8">

          {/* Error state */}
          {fetchError && (
            <div
              className="flex items-start gap-3 p-4 mb-4 rounded-2xl"
              style={{
                background: "rgba(254,242,242,0.9)",
                border: "1px solid rgba(252,165,165,0.5)",
                animation: "fadeSlideUp 0.4s ease both",
              }}
            >
              <span className="flex items-center justify-center w-8 h-8 rounded-xl bg-red-100 shrink-0">
                <AlertCircle size={15} className="text-red-500" />
              </span>
              <div className="flex-1 min-w-0">
                <p className="font-semibold text-red-700 text-sm">Could not load posts</p>
                <p className="text-red-400 text-xs mt-0.5 truncate">{fetchError}</p>
              </div>
              <button
                onClick={() => fetchPosts(true)}
                className="flex items-center gap-1 text-xs font-bold text-red-600
                           hover:text-red-800 transition-colors shrink-0 mt-0.5"
              >
                Retry <ArrowRight size={11} />
              </button>
            </div>
          )}

          {/* Skeleton loading */}
          {postsLoading && !fetchError && (
            <div className="space-y-3">
              {[0, 1, 2].map((i) => (
                <div key={i} style={{ opacity: 1 - i * 0.25, animation: `fadeSlideUp 0.4s ease ${i * 80}ms both` }}>
                  <SkeletonCard />
                </div>
              ))}
            </div>
          )}

          {/* Posts */}
          {!postsLoading && posts.length > 0 && (
            <div key={refreshKey} className="space-y-3 sm:space-y-4">
              {posts.map((post, i) => (
                <Reveal key={post._id} delay={i * 55}>
                  <div
                    className="card-hover rounded-3xl overflow-hidden"
                    style={{
                      background: "rgba(255,255,255,0.78)",
                      backdropFilter: "blur(16px) saturate(160%)",
                      WebkitBackdropFilter: "blur(16px) saturate(160%)",
                      border: "1px solid rgba(255,255,255,0.88)",
                      boxShadow: "0 2px 16px rgba(26,92,56,0.07), 0 1px 4px rgba(26,92,56,0.05), inset 0 1px 0 rgba(255,255,255,0.95)",
                    }}
                  >
                    <PostCard post={post} />
                  </div>
                </Reveal>
              ))}

              {/* End-of-feed divider */}
              <Reveal delay={100}>
                <div className="flex items-center gap-4 py-8 px-2">
                  <div className="flex-1 h-px" style={{ background: "linear-gradient(to right, transparent, rgba(20,83,45,0.12), transparent)" }} />
                  <div className="flex items-center gap-2 px-3 py-1 rounded-full"
                    style={{ background: "rgba(20,83,45,0.05)", border: "1px solid rgba(20,83,45,0.08)" }}>
                    <Sparkles size={11} className="text-green-600" />
                    <span className="text-[10px] font-semibold text-green-700/70 tracking-widest uppercase">All caught up</span>
                    <Sparkles size={11} className="text-green-600" />
                  </div>
                  <div className="flex-1 h-px" style={{ background: "linear-gradient(to left, transparent, rgba(20,83,45,0.12), transparent)" }} />
                </div>
              </Reveal>
            </div>
          )}

          {/* Empty state */}
          {!postsLoading && posts.length === 0 && !fetchError && (
            <div className="flex flex-col items-center justify-center min-h-[55vh] gap-5"
              style={{ animation: "fadeSlideUp 0.6s ease both" }}>

              {/* Layered rings + icon */}
              <div className="relative flex items-center justify-center">
                <div
                  className="absolute w-32 h-32 rounded-full ring-pulse"
                  style={{ background: "radial-gradient(circle, rgba(187,247,208,0.5) 0%, transparent 70%)" }}
                />
                <div
                  className="absolute w-20 h-20 rounded-full"
                  style={{
                    background: "rgba(187,247,208,0.3)",
                    animation: "pulseSoft 2.5s ease-in-out infinite 0.5s",
                  }}
                />
                <div
                  className="relative flex items-center justify-center w-16 h-16 rounded-[20px]"
                  style={{
                    background: "linear-gradient(135deg, #dcfce7 0%, #bbf7d0 100%)",
                    border: "1.5px solid rgba(74,222,128,0.4)",
                    boxShadow: "0 8px 24px rgba(26,92,56,0.12), inset 0 1px 0 rgba(255,255,255,0.9)",
                    animation: "floatY 3.5s ease-in-out infinite",
                  }}
                >
                  <Sparkles size={28} className="text-green-600" strokeWidth={1.5} />
                </div>
              </div>

              <div className="text-center space-y-2 max-w-xs">
                <p className="font-bold text-green-950 text-xl tracking-tight">
                  Nothing here yet
                </p>
                <p className="text-sm text-green-800/45 leading-relaxed">
                  Your community is quiet right now. Be the first to report an issue and spark change.
                </p>
              </div>

              <div
                className="flex items-center gap-2 px-5 py-2.5 rounded-full text-sm font-semibold text-green-800"
                style={{
                  background: "rgba(255,255,255,0.8)",
                  border: "1px solid rgba(20,83,45,0.12)",
                  boxShadow: "0 4px 16px rgba(26,92,56,0.1)",
                }}
              >
                <span>Tap</span>
                <span
                  className="inline-flex items-center justify-center w-6 h-6 rounded-lg text-white text-xs font-bold"
                  style={{ background: "linear-gradient(135deg, #22c55e, #15803d)" }}
                >+</span>
                <span>to get started</span>
              </div>
            </div>
          )}
        </div>
      </main>
    </>
  );
}