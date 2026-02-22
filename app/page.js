"use client";

import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import Loader from "@/components/ui/Loader";
import PostCard from "@/components/posts/PostCard";
import {
  AlertCircle,
  RefreshCw,
  ArrowRight,
  ArrowDown,
  MapPin,
  CheckCircle2,
  Users,
} from "lucide-react";

export default function Home() {
  const [loading, setLoading] = useState(true);
  const [posts, setPosts] = useState([]);
  const [fetchError, setFetchError] = useState("");
  const [refreshing, setRefreshing] = useState(false);
  const [show, setShow] = useState(false);
  const feedRef = useRef(null);

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
    const t = setTimeout(() => setShow(true), 80);
    return () => clearTimeout(t);
  }, []);

  const scrollToFeed = () =>
    feedRef.current?.scrollIntoView({ behavior: "smooth" });

  return (
    <>
      {loading && <Loader onComplete={() => setLoading(false)} />}

      <style>{`
        @keyframes fadeUp {
          from { opacity: 0; transform: translateY(16px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        .fade-up { animation: fadeUp 0.6s ease-out both; }
      `}</style>

      <main
        style={{ opacity: loading ? 0 : 1, transition: "opacity 0.4s ease" }}
        className="min-h-screen bg-[#fafafa]"
      >
        {/* ── Hero ── */}
        <section className="relative flex flex-col items-center justify-center px-5 text-center bg-white border-b border-gray-100" style={{ minHeight: "92dvh" }}>
          {/* subtle accent line */}
          <div className="absolute top-0 left-0 right-0 h-0.75 bg-primary" />

          <div
            style={{
              opacity: show ? 1 : 0,
              transform: show ? "translateY(0)" : "translateY(18px)",
              transition: "all 0.6s cubic-bezier(0.22,1,0.36,1) 0.1s",
            }}
          >
            <span className="inline-block mb-5 px-3 py-1 rounded-full text-xs font-medium tracking-wide uppercase text-primary bg-red-50 border border-red-100">
              Civic Platform
            </span>
          </div>

          <h1
            className="max-w-2xl font-bold text-gray-900 tracking-tight leading-[1.15]"
            style={{
              fontSize: "clamp(1.75rem, 5vw, 3.25rem)",
              opacity: show ? 1 : 0,
              transform: show ? "translateY(0)" : "translateY(18px)",
              transition: "all 0.6s cubic-bezier(0.22,1,0.36,1) 0.2s",
            }}
          >
            Report issues.{" "}
            <span className="text-primary">Build community.</span>
          </h1>

          <p
            className="mt-4 max-w-md text-gray-500 leading-relaxed"
            style={{
              fontSize: "clamp(0.95rem, 2vw, 1.1rem)",
              opacity: show ? 1 : 0,
              transform: show ? "translateY(0)" : "translateY(14px)",
              transition: "all 0.6s cubic-bezier(0.22,1,0.36,1) 0.35s",
            }}
          >
            A simple way for citizens and local authorities in Nepal to identify, track, and resolve neighbourhood problems.
          </p>

          {/* CTA */}
          <div
            className="mt-8 flex flex-col sm:flex-row gap-3"
            style={{
              opacity: show ? 1 : 0,
              transform: show ? "translateY(0)" : "translateY(14px)",
              transition: "all 0.6s cubic-bezier(0.22,1,0.36,1) 0.48s",
            }}
          >
            <Link
              href="/create-post"
              className="inline-flex items-center gap-2 px-6 py-3 rounded-lg bg-primary text-white text-sm font-semibold hover:bg-red-700 transition-colors"
            >
              Report an Issue
              <ArrowRight className="w-4 h-4" />
            </Link>
            <button
              onClick={scrollToFeed}
              className="inline-flex items-center gap-2 px-6 py-3 rounded-lg border border-gray-200 text-gray-700 text-sm font-semibold hover:bg-gray-50 transition-colors"
            >
              Browse Feed
            </button>
          </div>

          {/* Minimal stats */}
          <div
            className="mt-16 flex items-center gap-8 sm:gap-12 text-center"
            style={{
              opacity: show ? 1 : 0,
              transform: show ? "translateY(0)" : "translateY(14px)",
              transition: "all 0.6s cubic-bezier(0.22,1,0.36,1) 0.6s",
            }}
          >
            {[
              { icon: MapPin, value: "1,200+", label: "Reported", color: "#e8000c" },
              { icon: CheckCircle2, value: "890+", label: "Resolved", color: "#16a34a" },
              { icon: Users, value: "5,600+", label: "Citizens", color: "#1d398f" },
            ].map(({ icon: Icon, value, label, color }) => (
              <div key={label} className="flex flex-col items-center gap-1">
                <Icon className="w-4 h-4 mb-1" style={{ color }} />
                <span className="text-xl font-bold text-gray-900">{value}</span>
                <span className="text-[11px] text-gray-400 uppercase tracking-wider">{label}</span>
              </div>
            ))}
          </div>

          {/* scroll hint */}
          <button
            onClick={scrollToFeed}
            className="absolute bottom-6 text-gray-300 hover:text-gray-500 transition-colors"
            aria-label="Scroll down"
          >
            <ArrowDown className="w-5 h-5" />
          </button>
        </section>

        {/* ── How it works ── */}
        <section className="py-14 px-5 bg-[#fafafa]">
          <h2 className="text-center text-lg font-semibold text-gray-800 mb-8">How it works</h2>
          <div className="max-w-2xl mx-auto grid sm:grid-cols-3 gap-5">
            {[
              { n: "1", title: "Report", desc: "Describe the issue, add a photo and pin the location.", color: "#e8000c" },
              { n: "2", title: "Track", desc: "Follow status updates as authorities review your report.", color: "#1d398f" },
              { n: "3", title: "Resolve", desc: "See problems fixed and keep your community accountable.", color: "#16a34a" },
            ].map(({ n, title, desc, color }) => (
              <div key={n} className="p-5 rounded-xl bg-white border border-gray-100">
                <span
                  className="inline-flex items-center justify-center w-7 h-7 rounded-full text-white text-xs font-bold mb-3"
                  style={{ backgroundColor: color }}
                >
                  {n}
                </span>
                <h3 className="font-semibold text-gray-900 text-sm mb-1">{title}</h3>
                <p className="text-gray-500 text-[13px] leading-relaxed">{desc}</p>
              </div>
            ))}
          </div>
        </section>

        {/* ── Feed ── */}
        <section ref={feedRef} className="pb-28 bg-[#fafafa]">
          <div className="flex justify-between items-center px-4 pt-6 pb-2 max-w-lg mx-auto">
            <h2 className="font-semibold text-gray-800 text-base">Recent Issues</h2>
            <button
              onClick={() => fetchPosts(true)}
              disabled={refreshing}
              className="flex items-center gap-1 text-gray-400 hover:text-gray-600 text-xs transition"
              aria-label="Refresh feed"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${refreshing ? "animate-spin" : ""}`} />
              Refresh
            </button>
          </div>

          {fetchError && (
            <div className="flex items-center gap-2 px-3 py-2.5 mt-1 bg-red-50 border border-red-100 rounded-lg text-red-600 text-sm max-w-lg mx-auto">
              <AlertCircle className="w-4 h-4 shrink-0" />
              {fetchError}
            </div>
          )}

          {posts.length > 0 ? (
            <div className="space-y-3 mx-auto px-4 mt-2 max-w-lg">
              {posts.map((post, i) => (
                <div key={post._id} className="fade-up" style={{ animationDelay: `${i * 0.05}s` }}>
                  <PostCard post={post} />
                </div>
              ))}
            </div>
          ) : !fetchError ? (
            <div className="flex flex-col items-center gap-2 mt-16 max-w-lg mx-auto text-center">
              <p className="text-gray-500 text-sm">No issues reported yet.</p>
              <Link
                href="/create-post"
                className="mt-2 inline-flex items-center gap-1.5 px-4 py-2 rounded-lg bg-primary text-white text-sm font-medium hover:bg-red-700 transition-colors"
              >
                Report Now
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>
          ) : null}
        </section>
      </main>
    </>
  );
}
