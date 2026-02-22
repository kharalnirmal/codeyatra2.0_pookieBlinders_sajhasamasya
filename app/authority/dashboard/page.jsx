"use client";

import { useEffect, useState, useCallback } from "react";
import { useUser, useClerk } from "@clerk/nextjs";
import { useRouter } from "next/navigation";
import Image from "next/image";
import {
  ClipboardList,
  Clock,
  CheckCircle,
  AlertTriangle,
  TrendingUp,
  Star,
  LogOut,
  Settings,
  X,
  ChevronDown,
  ChevronUp,
  MapPin,
  MessageSquare,
  RefreshCw,
  Shield,
} from "lucide-react";
import { toast } from "sonner";
import { DISTRICTS, CATEGORIES } from "@/lib/constants";

const CATEGORY_COLORS = {
  road: "bg-orange-100 text-orange-700",
  water: "bg-blue-100 text-blue-700",
  electricity: "bg-yellow-100 text-yellow-700",
  garbage: "bg-green-100 text-green-700",
  safety: "bg-red-100 text-red-700",
  other: "bg-gray-100 text-gray-600",
};

function RatingStars({ rating }) {
  const full = Math.floor(rating);
  const frac = rating - full;
  return (
    <div className="flex items-center gap-0.5">
      {[1, 2, 3, 4, 5].map((i) => (
        <Star
          key={i}
          className={`w-4 h-4 ${
            i <= full
              ? "text-yellow-400 fill-yellow-400"
              : i === full + 1 && frac >= 0.5
                ? "text-yellow-400 fill-yellow-200"
                : "text-gray-300"
          }`}
        />
      ))}
      <span className="ml-1 text-gray-600 text-xs">{rating.toFixed(1)}</span>
    </div>
  );
}

function timeAgo(dateStr) {
  const diff = Date.now() - new Date(dateStr).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return "just now";
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  return `${Math.floor(hrs / 24)}d ago`;
}

function isOverdue(post) {
  return (
    post.samasyaStatus !== "completed" &&
    post.deadline &&
    new Date(post.deadline) < new Date()
  );
}

export default function AuthorityDashboard() {
  const { isLoaded, isSignedIn } = useUser();
  const { signOut } = useClerk();
  const router = useRouter();

  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState("all");
  const [areaOpen, setAreaOpen] = useState(false);
  const [selectedCategories, setSelectedCategories] = useState([]);
  const [selectedDistrict, setSelectedDistrict] = useState("");
  const [savingArea, setSavingArea] = useState(false);
  const [responseModal, setResponseModal] = useState(null); // { postId, currentStatus }
  const [responseText, setResponseText] = useState("");
  const [updatingId, setUpdatingId] = useState(null);

  const fetchData = useCallback(
    async (filter = statusFilter) => {
      try {
        const res = await fetch(`/api/posts/authority?status=${filter}`);
        const json = await res.json();
        if (json.error) throw new Error(json.error);
        setData(json);
        if (json.authority?.area) {
          setSelectedCategories(json.authority.area.categories || []);
          setSelectedDistrict(json.authority.area.district || "");
        }
      } catch (err) {
        toast.error(err.message || "Failed to load dashboard");
      } finally {
        setLoading(false);
      }
    },
    [statusFilter],
  );

  useEffect(() => {
    if (!isLoaded) return;
    if (!isSignedIn) {
      router.push("/authority/sign-in");
      return;
    }
    fetchData();
  }, [isLoaded, isSignedIn, router, fetchData]);

  const handleFilterChange = (f) => {
    setStatusFilter(f);
    setLoading(true);
    fetchData(f);
  };

  const handleSaveArea = async () => {
    setSavingArea(true);
    try {
      const res = await fetch("/api/user/area", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          categories: selectedCategories,
          district: selectedDistrict,
        }),
      });
      const json = await res.json();
      if (json.error) throw new Error(json.error);
      toast.success("Coverage area saved!");
      setAreaOpen(false);
      fetchData();
    } catch (err) {
      toast.error(err.message || "Failed to save area");
    } finally {
      setSavingArea(false);
    }
  };

  const handleStatusUpdate = async (postId, newStatus) => {
    setUpdatingId(postId);
    try {
      const res = await fetch(`/api/posts/${postId}/status`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: newStatus, response: responseText }),
      });
      const json = await res.json();
      if (json.error) throw new Error(json.error);
      toast.success(`Marked as ${newStatus.replace("_", " ")}`);
      setResponseModal(null);
      setResponseText("");
      fetchData();
    } catch (err) {
      toast.error(err.message || "Failed to update status");
    } finally {
      setUpdatingId(null);
    }
  };

  const handleSignOut = async () => {
    await signOut();
    router.push("/");
  };

  const toggleCategory = (c) =>
    setSelectedCategories((prev) =>
      prev.includes(c) ? prev.filter((x) => x !== c) : [...prev, c],
    );

  if (!isLoaded || loading) {
    return (
      <div className="flex justify-center items-center min-h-[60vh]">
        <div className="border-blue-600 border-t-2 rounded-full w-8 h-8 animate-spin" />
      </div>
    );
  }

  const { posts = [], stats = {}, authority } = data || {};

  return (
    <div className="bg-gray-50 pb-28 min-h-screen">
      {/* ── Authority header ── */}
      <div className="bg-blue-700 px-4 pt-5 pb-6 text-white">
        <div className="flex justify-between items-start mx-auto max-w-2xl">
          <div className="flex items-center gap-3">
            {authority?.avatar ? (
              <Image
                src={authority.avatar}
                alt={authority.name}
                width={48}
                height={48}
                className="border-2 border-white/40 rounded-full object-cover"
              />
            ) : (
              <div className="flex justify-center items-center bg-white/20 rounded-full w-12 h-12 font-bold text-white text-xl">
                {authority?.name?.[0]?.toUpperCase()}
              </div>
            )}
            <div>
              <p className="font-bold text-base leading-tight">
                {authority?.name}
              </p>
              {authority?.department && (
                <p className="text-blue-200 text-xs">{authority.department}</p>
              )}
              <div className="mt-1">
                <RatingStars rating={authority?.rating ?? 5} />
              </div>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setAreaOpen((o) => !o)}
              className="flex items-center gap-1 bg-white/20 hover:bg-white/30 px-2 py-1.5 rounded-lg text-white text-xs transition"
            >
              <Settings className="w-3.5 h-3.5" />
              Area
            </button>
            <button
              onClick={handleSignOut}
              className="flex items-center gap-1 bg-white/20 hover:bg-red-500 px-2 py-1.5 rounded-lg text-white text-xs transition"
            >
              <LogOut className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        {/* Rating info */}
        <div className="mx-auto mt-2 max-w-2xl">
          <p className="text-blue-200 text-xs">
            {authority?.totalResolved ?? 0} resolved ·{" "}
            {authority?.totalIgnored ?? 0} ignored
            {(authority?.rating ?? 5) < 3.5 && (
              <span className="ml-2 text-yellow-300">
                ⚠ Low rating – respond to issues on time
              </span>
            )}
          </p>
        </div>
      </div>

      {/* ── Area settings panel ── */}
      {areaOpen && (
        <div className="bg-white shadow-md mx-auto px-4 py-4 border-b max-w-2xl">
          <div className="flex justify-between items-center mb-3">
            <h3 className="font-semibold text-gray-800 text-sm">
              Coverage Area Settings
            </h3>
            <button onClick={() => setAreaOpen(false)}>
              <X className="w-4 h-4 text-gray-400" />
            </button>
          </div>
          <p className="mb-3 text-gray-500 text-xs">
            Select the categories and your district. Only
            posts from your area will appear in your dashboard.
          </p>

          <div className="mb-3">
            <p className="mb-1.5 font-medium text-gray-700 text-xs">
              Categories
            </p>
            <div className="flex flex-wrap gap-1.5">
              {CATEGORIES.map((c) => (
                <button
                  key={c}
                  onClick={() => toggleCategory(c)}
                  className={`px-3 py-1 rounded-full text-xs capitalize border transition ${
                    selectedCategories.includes(c)
                      ? "bg-blue-600 border-blue-600 text-white"
                      : "bg-gray-50 border-gray-300 text-gray-600"
                  }`}
                >
                  {c}
                </button>
              ))}
            </div>
          </div>

          <div className="mb-4">
            <p className="mb-1.5 font-medium text-gray-700 text-xs">
              District
            </p>
            <select
              value={selectedDistrict}
              onChange={(e) => setSelectedDistrict(e.target.value)}
              className="bg-white px-3 py-2 border border-gray-300 focus:border-blue-500 rounded-xl focus:outline-none w-full text-sm"
            >
              <option value="">Select a district</option>
              {DISTRICTS.map((d) => (
                <option key={d} value={d}>{d}</option>
              ))}
            </select>
          </div>

          <button
            onClick={handleSaveArea}
            disabled={savingArea}
            className="bg-blue-600 hover:bg-blue-700 disabled:opacity-60 px-4 py-2 rounded-xl w-full font-medium text-white text-sm transition"
          >
            {savingArea ? "Saving…" : "Save Coverage Area"}
          </button>
        </div>
      )}

      <div className="space-y-4 mx-auto px-4 pt-4 max-w-2xl">
        {/* ── Stats grid ── */}
        <div className="gap-2 grid grid-cols-5">
          {[
            {
              label: "Total",
              value: stats.total ?? 0,
              icon: ClipboardList,
              color: "text-blue-500",
              bg: "bg-blue-50",
            },
            {
              label: "Pending",
              value: stats.pending ?? 0,
              icon: Clock,
              color: "text-yellow-500",
              bg: "bg-yellow-50",
            },
            {
              label: "Active",
              value: stats.inProgress ?? 0,
              icon: TrendingUp,
              color: "text-blue-400",
              bg: "bg-blue-50",
            },
            {
              label: "Done",
              value: stats.completed ?? 0,
              icon: CheckCircle,
              color: "text-green-500",
              bg: "bg-green-50",
            },
            {
              label: "Overdue",
              value: stats.overdue ?? 0,
              icon: AlertTriangle,
              color: "text-red-500",
              bg: "bg-red-50",
            },
          ].map((s) => (
            <div
              key={s.label}
              className="bg-white shadow-sm p-2 border rounded-xl text-center"
            >
              <div
                className={`flex justify-center items-center rounded-full w-7 h-7 mx-auto mb-1 ${s.bg}`}
              >
                <s.icon className={`w-3.5 h-3.5 ${s.color}`} />
              </div>
              <p className="font-bold text-gray-900 text-lg">{s.value}</p>
              <p className="text-[10px] text-gray-400">{s.label}</p>
            </div>
          ))}
        </div>

        {/* ── Filter tabs ── */}
        <div className="flex gap-1 bg-gray-100 p-1 rounded-xl">
          {["all", "pending", "in_progress", "completed"].map((f) => (
            <button
              key={f}
              onClick={() => handleFilterChange(f)}
              className={`flex-1 py-1.5 rounded-lg text-xs font-medium capitalize transition ${
                statusFilter === f
                  ? "bg-white shadow-sm text-blue-700"
                  : "text-gray-500 hover:text-gray-700"
              }`}
            >
              {f === "in_progress"
                ? "Active"
                : f === "all"
                  ? "All"
                  : f.charAt(0).toUpperCase() + f.slice(1)}
            </button>
          ))}
          <button
            onClick={() => {
              setLoading(true);
              fetchData();
            }}
            className="px-2 text-gray-400 hover:text-blue-600 transition"
          >
            <RefreshCw className="w-3.5 h-3.5" />
          </button>
        </div>

        {/* Coverage area hint */}
        {selectedCategories.length > 0 && (
          <div className="flex items-center gap-1.5 text-blue-600 text-xs">
            <Shield className="w-3.5 h-3.5" />
            Showing:{" "}
            {selectedCategories.map((c) => (
              <span key={c} className="mr-1 capitalize">
                {c}
              </span>
            ))}
            {selectedDistrict && (
              <>· {selectedDistrict}</>
            )}
          </div>
        )}

        {/* ── Post feed ── */}
        {posts.length === 0 ? (
          <div className="flex flex-col items-center gap-2 py-16 border-2 border-gray-200 border-dashed rounded-2xl text-center">
            <ClipboardList className="w-8 h-8 text-gray-300" />
            <p className="text-gray-400 text-sm">No issues found.</p>
            {selectedCategories.length === 0 && (
              <p className="text-gray-400 text-xs">
                Set your coverage area to filter relevant issues.
              </p>
            )}
          </div>
        ) : (
          <div className="space-y-3">
            {posts.map((post) => {
              const overdue = isOverdue(post);
              return (
                <div
                  key={post._id}
                  className={`bg-white shadow-sm rounded-2xl overflow-hidden border ${overdue ? "border-red-200" : "border-gray-100"}`}
                >
                  {/* Post photo */}
                  {post.photo && (
                    <div
                      className="relative bg-gray-100 w-full"
                      style={{ height: 160 }}
                    >
                      <Image
                        src={post.photo}
                        alt={post.title}
                        fill
                        className="object-cover"
                        sizes="640px"
                      />
                    </div>
                  )}

                  <div className="space-y-3 p-4">
                    {/* Header */}
                    <div className="flex justify-between items-start gap-2">
                      <div className="flex items-center gap-2 min-w-0">
                        {post.author?.avatar ? (
                          <Image
                            src={post.author.avatar}
                            alt={post.author.name}
                            width={28}
                            height={28}
                            className="rounded-full object-cover shrink-0"
                          />
                        ) : (
                          <div className="flex justify-center items-center bg-gray-200 rounded-full w-7 h-7 text-gray-500 text-xs shrink-0">
                            {post.author?.name?.[0]?.toUpperCase()}
                          </div>
                        )}
                        <div className="min-w-0">
                          <p className="font-medium text-gray-700 text-xs truncate">
                            {post.author?.name}
                          </p>
                          <p className="text-[10px] text-gray-400">
                            {timeAgo(post.createdAt)}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-1.5 shrink-0">
                        {overdue && (
                          <span className="flex items-center gap-0.5 bg-red-100 px-2 py-0.5 rounded-full text-[10px] text-red-600">
                            <AlertTriangle className="w-3 h-3" /> Overdue
                          </span>
                        )}
                        <span
                          className={`px-2 py-0.5 rounded-full text-[10px] font-medium capitalize ${CATEGORY_COLORS[post.category]}`}
                        >
                          {post.category}
                        </span>
                      </div>
                    </div>

                    {/* Title */}
                    <div>
                      <h3 className="font-semibold text-gray-900 text-sm leading-snug">
                        {post.title}
                      </h3>
                      <p className="mt-0.5 text-gray-500 text-xs line-clamp-2">
                        {post.description}
                      </p>
                    </div>

                    {/* Location */}
                    {post.location?.address && (
                      <p className="flex items-center gap-1 text-gray-400 text-xs">
                        <MapPin className="w-3 h-3 shrink-0" />
                        <span className="truncate">
                          {post.location.address}
                        </span>
                      </p>
                    )}

                    {/* Deadline */}
                    {post.deadline && post.samasyaStatus !== "completed" && (
                      <p
                        className={`text-xs ${overdue ? "text-red-500" : "text-gray-400"}`}
                      >
                        Deadline: {new Date(post.deadline).toLocaleString()}
                      </p>
                    )}

                    {/* Authority response if exists */}
                    {post.authorityResponse && (
                      <div className="bg-blue-50 px-3 py-2 rounded-lg">
                        <p className="text-blue-700 text-xs">
                          <span className="font-medium">Response: </span>
                          {post.authorityResponse}
                        </p>
                      </div>
                    )}

                    {/* Action buttons */}
                    {post.samasyaStatus !== "completed" && (
                      <div className="flex gap-2 pt-1">
                        {post.samasyaStatus === "pending" && (
                          <button
                            disabled={updatingId === post._id}
                            onClick={() =>
                              handleStatusUpdate(post._id, "in_progress")
                            }
                            className="flex flex-1 justify-center items-center gap-1 bg-blue-50 hover:bg-blue-100 disabled:opacity-50 py-2 border border-blue-200 rounded-xl font-medium text-blue-700 text-xs transition"
                          >
                            <TrendingUp className="w-3.5 h-3.5" />
                            Mark In Progress
                          </button>
                        )}
                        <button
                          disabled={updatingId === post._id}
                          onClick={() => {
                            setResponseModal({
                              postId: post._id,
                              currentStatus: post.samasyaStatus,
                            });
                            setResponseText("");
                          }}
                          className="flex flex-1 justify-center items-center gap-1 bg-green-50 hover:bg-green-100 disabled:opacity-50 py-2 border border-green-200 rounded-xl font-medium text-green-700 text-xs transition"
                        >
                          <CheckCircle className="w-3.5 h-3.5" />
                          Mark Complete
                        </button>
                        <button
                          onClick={() => {
                            setResponseModal({
                              postId: post._id,
                              currentStatus: post.samasyaStatus,
                              responseOnly: true,
                            });
                            setResponseText(post.authorityResponse || "");
                          }}
                          className="bg-gray-50 hover:bg-gray-100 p-2 border border-gray-200 rounded-xl text-gray-500 transition"
                        >
                          <MessageSquare className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    )}
                    {post.samasyaStatus === "completed" && (
                      <div className="flex items-center gap-1 text-green-600 text-xs">
                        <CheckCircle className="w-3.5 h-3.5" />
                        Resolved{" "}
                        {post.respondedAt ? timeAgo(post.respondedAt) : ""}
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* ── Response / Complete modal ── */}
      {responseModal && (
        <div className="z-50 fixed inset-0 flex justify-center items-end bg-black/50 p-4">
          <div className="bg-white shadow-xl p-5 rounded-2xl w-full max-w-lg">
            <div className="flex justify-between items-center mb-3">
              <h3 className="font-semibold text-gray-800 text-sm">
                {responseModal.responseOnly
                  ? "Add / Edit Response"
                  : "Mark as Completed"}
              </h3>
              <button onClick={() => setResponseModal(null)}>
                <X className="w-4 h-4 text-gray-400" />
              </button>
            </div>
            <textarea
              value={responseText}
              onChange={(e) => setResponseText(e.target.value)}
              placeholder="Add a response or note for the citizen… (optional)"
              rows={3}
              className="px-3 py-2 border border-gray-300 focus:border-blue-500 rounded-xl focus:outline-none w-full text-sm resize-none"
            />
            <div className="flex gap-2 mt-3">
              <button
                onClick={() => setResponseModal(null)}
                className="flex-1 hover:bg-gray-50 py-2 border border-gray-300 rounded-xl text-gray-600 text-sm transition"
              >
                Cancel
              </button>
              {!responseModal.responseOnly && (
                <button
                  disabled={updatingId === responseModal.postId}
                  onClick={() =>
                    handleStatusUpdate(responseModal.postId, "completed")
                  }
                  className="flex-1 bg-green-600 hover:bg-green-700 disabled:opacity-60 py-2 rounded-xl font-medium text-white text-sm transition"
                >
                  {updatingId === responseModal.postId
                    ? "Saving…"
                    : "Confirm Complete"}
                </button>
              )}
              {responseModal.responseOnly && (
                <button
                  disabled={updatingId === responseModal.postId}
                  onClick={() =>
                    handleStatusUpdate(
                      responseModal.postId,
                      responseModal.currentStatus,
                    )
                  }
                  className="flex-1 bg-blue-600 hover:bg-blue-700 disabled:opacity-60 py-2 rounded-xl font-medium text-white text-sm transition"
                >
                  {updatingId === responseModal.postId
                    ? "Saving…"
                    : "Save Response"}
                </button>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
