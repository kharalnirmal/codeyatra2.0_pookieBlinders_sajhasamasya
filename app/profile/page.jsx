"use client";

import { useEffect, useState } from "react";
import { useUser, useClerk } from "@clerk/nextjs";
import { useRouter } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import {
  Mail,
  CalendarDays,
  Shield,
  LogOut,
  Star,
  TrendingUp,
  CheckCircle,
  Clock,
  AlertCircle,
  PlusCircle,
  Lock,
} from "lucide-react";

const CATEGORY_COLORS = {
  road: "bg-orange-100 text-orange-700",
  water: "bg-blue-100 text-blue-700",
  electricity: "bg-yellow-100 text-yellow-700",
  garbage: "bg-green-100 text-green-700",
  safety: "bg-red-100 text-red-700",
  other: "bg-gray-100 text-gray-600",
};

const STATUS_ICONS = {
  pending: { icon: Clock, color: "text-yellow-500" },
  in_progress: { icon: TrendingUp, color: "text-blue-500" },
  completed: { icon: CheckCircle, color: "text-green-500" },
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

export default function ProfilePage() {
  const { isLoaded, isSignedIn, user } = useUser();
  const { signOut } = useClerk();
  const router = useRouter();

  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!isLoaded) return;
    if (!isSignedIn) {
      router.push("/sign-in");
      return;
    }
    fetch("/api/user/profile")
      .then((r) => r.json())
      .then((d) => {
        if (d.error) setError(d.error);
        else setProfile(d);
      })
      .catch(() => setError("Failed to load profile"))
      .finally(() => setLoading(false));
  }, [isLoaded, isSignedIn, router]);

  const handleSignOut = async () => {
    await signOut();
    router.push("/");
  };

  if (!isLoaded || loading) {
    return (
      <div className="flex justify-center items-center min-h-[60vh]">
        <div className="border-primary border-t-2 rounded-full w-8 h-8 animate-spin" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center gap-2 bg-red-50 mx-4 mt-8 p-4 rounded-xl text-red-600 text-sm">
        <AlertCircle className="w-4 h-4 shrink-0" /> {error}
      </div>
    );
  }

  const { user: u, allBadges, recentPosts } = profile;
  const earnedBadges = allBadges.filter((b) => b.earned);
  const lockedBadges = allBadges.filter((b) => !b.earned);

  return (
    <div className="bg-gray-50 pb-28 min-h-screen">
      {/* ── Hero header ── */}
      <div className="bg-white shadow-sm px-4 pt-6 pb-5 border-b">
        <div className="flex justify-between items-start mx-auto max-w-lg">
          <div className="flex items-center gap-4">
            {u.avatar ? (
              <Image
                src={u.avatar}
                alt={u.name}
                width={64}
                height={64}
                className="rounded-full object-cover"
              />
            ) : (
              <div className="flex justify-center items-center bg-primary rounded-full w-16 h-16 font-bold text-white text-2xl">
                {u.name[0]?.toUpperCase()}
              </div>
            )}
            <div>
              <h2 className="font-bold text-gray-900 text-lg leading-tight">
                {u.name}
              </h2>
              <p className="mt-0.5 text-gray-500 text-xs">{u.email}</p>
              <span
                className={`inline-flex items-center gap-1 mt-1 rounded-full px-2 py-0.5 text-xs font-medium ${
                  u.role === "authority"
                    ? "bg-blue-100 text-blue-700"
                    : "bg-green-100 text-green-700"
                }`}
              >
                <Shield className="w-3 h-3" />
                {u.role === "authority" ? "Authority" : "Citizen"}
              </span>
            </div>
          </div>

          <button
            onClick={handleSignOut}
            className="flex items-center gap-1.5 bg-gray-100 hover:bg-red-50 px-3 py-2 rounded-xl text-gray-600 hover:text-red-600 text-xs transition"
          >
            <LogOut className="w-3.5 h-3.5" />
            Sign Out
          </button>
        </div>

        {/* Join date */}
        <div className="flex items-center gap-1.5 mx-auto mt-3 max-w-lg text-gray-400 text-xs">
          <CalendarDays className="w-3.5 h-3.5" />
          Joined{" "}
          {new Date(u.createdAt).toLocaleDateString("en-US", {
            month: "long",
            year: "numeric",
          })}
        </div>
      </div>

      <div className="space-y-5 mx-auto px-4 pt-5 max-w-lg">
        {/* ── Stats row ── */}
        <div className="gap-3 grid grid-cols-3">
          {[
            {
              label: "Points",
              value: u.points,
              icon: Star,
              color: "text-yellow-500",
              bg: "bg-yellow-50",
            },
            {
              label: "Raised",
              value: u.issuesRaised,
              icon: TrendingUp,
              color: "text-primary",
              bg: "bg-red-50",
            },
            {
              label: "Solved",
              value: u.issuesSolved,
              icon: CheckCircle,
              color: "text-green-600",
              bg: "bg-green-50",
            },
          ].map((s) => (
            <div
              key={s.label}
              className="bg-white shadow-sm p-3 border rounded-2xl text-center"
            >
              <div
                className={`flex justify-center items-center rounded-full w-8 h-8 mx-auto mb-1 ${s.bg}`}
              >
                <s.icon className={`w-4 h-4 ${s.color}`} />
              </div>
              <p className="font-bold text-gray-900 text-xl">{s.value}</p>
              <p className="text-gray-400 text-xs">{s.label}</p>
            </div>
          ))}
        </div>

        {/* ── Badges ── */}
        <div className="bg-white shadow-sm p-4 border rounded-2xl">
          <h3 className="mb-3 font-semibold text-gray-800 text-sm">
            Badges
            <span className="bg-primary/10 ml-2 px-2 py-0.5 rounded-full font-medium text-primary text-xs">
              {earnedBadges.length}/{allBadges.length}
            </span>
          </h3>

          {earnedBadges.length > 0 && (
            <div className="flex flex-wrap gap-2 mb-4">
              {earnedBadges.map((b) => (
                <div
                  key={b.id}
                  title={b.description}
                  className="flex items-center gap-1.5 bg-yellow-50 px-3 py-1.5 border border-yellow-200 rounded-xl"
                >
                  <span className="text-lg">{b.emoji}</span>
                  <div>
                    <p className="font-semibold text-gray-800 text-xs">
                      {b.label}
                    </p>
                    <p className="text-[10px] text-gray-400">{b.description}</p>
                  </div>
                </div>
              ))}
            </div>
          )}

          {lockedBadges.length > 0 && (
            <>
              <p className="mb-2 text-gray-400 text-xs">Locked</p>
              <div className="flex flex-wrap gap-2">
                {lockedBadges.map((b) => (
                  <div
                    key={b.id}
                    title={b.description}
                    className="flex items-center gap-1.5 bg-gray-50 opacity-60 px-3 py-1.5 border border-gray-200 rounded-xl"
                  >
                    <span className="relative grayscale text-lg">
                      {b.emoji}
                      <Lock className="top-0 right-0 absolute w-2.5 h-2.5 text-gray-400" />
                    </span>
                    <div>
                      <p className="font-medium text-gray-500 text-xs">
                        {b.label}
                      </p>
                      <p className="text-[10px] text-gray-400">
                        {b.description}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </>
          )}
        </div>

        {/* ── Recent Posts ── */}
        <div>
          <div className="flex justify-between items-center mb-3">
            <h3 className="font-semibold text-gray-800 text-sm">
              {u.role === "authority" ? "Handled Issues" : "Your Issues"}
            </h3>
            {u.role !== "authority" && (
              <Link
                href="/create-post"
                className="flex items-center gap-1 text-primary text-xs hover:underline"
              >
                <PlusCircle className="w-3.5 h-3.5" /> New
              </Link>
            )}
          </div>

          {recentPosts.length === 0 ? (
            <div className="flex flex-col items-center gap-2 py-10 border-2 border-gray-200 border-dashed rounded-2xl text-center">
              <p className="text-gray-400 text-sm">
                {u.role === "authority"
                  ? "No issues handled yet."
                  : "No issues reported yet."}
              </p>
              {u.role !== "authority" && (
                <Link
                  href="/create-post"
                  className="text-primary text-sm hover:underline"
                >
                  Report your first issue →
                </Link>
              )}
            </div>
          ) : (
            <div className="space-y-2">
              {recentPosts.map((post) => {
                const si =
                  STATUS_ICONS[post.samasyaStatus] || STATUS_ICONS.pending;
                return (
                  <div
                    key={post._id}
                    className="flex items-center gap-3 bg-white shadow-sm p-3 border rounded-xl"
                  >
                    {post.photo ? (
                      <Image
                        src={post.photo}
                        alt={post.title}
                        width={48}
                        height={48}
                        className="rounded-lg object-cover shrink-0"
                      />
                    ) : (
                      <div
                        className={`w-12 h-12 rounded-lg flex items-center justify-center shrink-0 ${CATEGORY_COLORS[post.category] || "bg-gray-100"}`}
                      >
                        <span className="text-lg capitalize">
                          {post.category[0]}
                        </span>
                      </div>
                    )}
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-gray-800 text-sm truncate">
                        {post.title}
                      </p>
                      <p className="text-gray-400 text-xs">
                        {timeAgo(post.createdAt)}
                      </p>
                    </div>
                    <si.icon className={`w-4 h-4 shrink-0 ${si.color}`} />
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
