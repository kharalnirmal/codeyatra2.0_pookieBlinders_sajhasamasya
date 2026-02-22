"use client";

import { useRef, useState, useCallback, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useUser } from "@clerk/nextjs";
import { Camera, RefreshCw, X, Send, AlertCircle } from "lucide-react";
import { toast } from "sonner";
import dynamic from "next/dynamic";
import { DISTRICTS } from "@/lib/constants";

// Load Leaflet picker client-side only (no SSR)
const LocationPicker = dynamic(
  () => import("@/components/posts/LocationPicker"),
  { ssr: false, loading: () => <div className="bg-gray-100 rounded-xl h-[260px] animate-pulse" /> }
);

const CATEGORIES = [
  { value: "road", label: "Road / Infrastructure" },
  { value: "water", label: "Water Supply" },
  { value: "electricity", label: "Electricity" },
  { value: "garbage", label: "Garbage / Waste" },
  { value: "safety", label: "Public Safety" },
  { value: "other", label: "Other" },
];

const TARGET_GROUPS = [
  { value: "authority", label: "Report to Authority" },
  { value: "volunteer", label: "Request Volunteers" },
  { value: "both", label: "Both" },
];

// Resize + compress image to max 800px wide, JPEG 0.6 quality
function compressImage(dataUrl, maxWidth = 800) {
  return new Promise((resolve) => {
    const img = new window.Image();
    img.onload = () => {
      const canvas = document.createElement("canvas");
      const ratio = Math.min(1, maxWidth / img.width);
      canvas.width = Math.round(img.width * ratio);
      canvas.height = Math.round(img.height * ratio);
      canvas.getContext("2d").drawImage(img, 0, 0, canvas.width, canvas.height);
      resolve(canvas.toDataURL("image/jpeg", 0.6));
    };
    img.src = dataUrl;
  });
}

export default function CreatePostPage() {
  const router = useRouter();
  const { isSignedIn } = useUser();

  // Camera state
  const videoRef = useRef(null);
  const streamRef = useRef(null);
  const [cameraActive, setCameraActive] = useState(false);
  const [capturedPhoto, setCapturedPhoto] = useState(null);
  const [cameraError, setCameraError] = useState("");

  // Form state
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [category, setCategory] = useState("");
  const [targetGroup, setTargetGroup] = useState("authority");
  const [location, setLocation] = useState(null); // { lat, lng, address }
  const [district, setDistrict] = useState("");
  const [submitting, setSubmitting] = useState(false);

  // ── KEY FIX: assign stream AFTER video element mounts ──
  useEffect(() => {
    if (cameraActive && videoRef.current && streamRef.current) {
      videoRef.current.srcObject = streamRef.current;
    }
  }, [cameraActive]);

  // Stop camera when component unmounts
  useEffect(() => {
    return () => {
      if (streamRef.current) {
        streamRef.current.getTracks().forEach((t) => t.stop());
      }
    };
  }, []);

  const startCamera = useCallback(async () => {
    setCameraError("");
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: "environment", width: { ideal: 1280 }, height: { ideal: 720 } },
        audio: false,
      });
      streamRef.current = stream;
      setCameraActive(true); // video element mounts → useEffect assigns srcObject
    } catch {
      setCameraError("Camera access denied. Please allow camera permission and try again.");
    }
  }, []);

  const stopCamera = useCallback(() => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((t) => t.stop());
      streamRef.current = null;
    }
    setCameraActive(false);
  }, []);

  const capturePhoto = useCallback(async () => {
    const video = videoRef.current;
    if (!video || !video.videoWidth) return;

    // Draw raw frame
    const canvas = document.createElement("canvas");
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    canvas.getContext("2d").drawImage(video, 0, 0);
    const raw = canvas.toDataURL("image/jpeg", 1.0);

    stopCamera();

    // Compress before storing
    const compressed = await compressImage(raw, 800);
    setCapturedPhoto(compressed);
  }, [stopCamera]);

  const retakePhoto = useCallback(() => {
    setCapturedPhoto(null);
    startCamera();
  }, [startCamera]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!isSignedIn) { router.push("/sign-in"); return; }
    if (!title.trim() || !description.trim() || !category || !district) {
      toast.error("Please fill in all required fields.");
      return;
    }

    setSubmitting(true);
    try {
      const res = await fetch("/api/posts", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: title.trim(),
          description: description.trim(),
          category,
          targetGroup,
          photo: capturedPhoto || "",
          location: location || null,
          district,
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to create post");

      toast.success("Issue posted successfully!");
      router.push("/");
    } catch (err) {
      toast.error(err.message || "Something went wrong.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 pb-28">
      {/* Header */}
      <div className="top-[57px] z-40 sticky bg-white shadow-sm px-4 py-3 border-b">
        <div className="flex items-center gap-3 max-w-lg mx-auto">
          <button onClick={() => router.back()} className="text-gray-500 hover:text-gray-800 transition">
            <X className="w-5 h-5" />
          </button>
          <h2 className="font-semibold text-gray-800 text-base">Report an Issue</h2>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-5 mx-auto px-4 pt-5 max-w-lg">

        {/* ── Camera / Photo ── */}
        <div>
          <label className="block mb-1.5 font-medium text-gray-700 text-sm">Photo</label>
          <div className="overflow-hidden rounded-2xl">
            {capturedPhoto ? (
              <div className="relative">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={capturedPhoto} alt="Captured" className="w-full object-cover rounded-2xl" style={{ maxHeight: 300 }} />
                <button
                  type="button"
                  onClick={retakePhoto}
                  className="top-3 right-3 absolute flex items-center gap-1 bg-black/60 hover:bg-black/80 px-3 py-1.5 rounded-full text-white text-xs transition"
                >
                  <RefreshCw className="w-3.5 h-3.5" /> Retake
                </button>
              </div>
            ) : cameraActive ? (
              <div className="relative bg-black rounded-2xl overflow-hidden">
                <video
                  ref={videoRef}
                  autoPlay
                  playsInline
                  muted
                  className="w-full"
                  style={{ maxHeight: 340, display: "block" }}
                />
                {/* Capture button */}
                <div className="right-0 bottom-4 left-0 absolute flex justify-center">
                  <button
                    type="button"
                    onClick={capturePhoto}
                    className="flex justify-center items-center bg-white shadow-lg rounded-full w-16 h-16 active:scale-95 transition"
                    aria-label="Take photo"
                  >
                    <div className="bg-primary rounded-full w-12 h-12" />
                  </button>
                </div>
                <button
                  type="button"
                  onClick={stopCamera}
                  className="top-3 right-3 absolute bg-black/60 hover:bg-black/80 p-1.5 rounded-full text-white transition"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            ) : (
              <div
                onClick={startCamera}
                className="flex flex-col justify-center items-center gap-3 bg-gray-100 hover:bg-gray-200 py-10 border-2 border-gray-300 border-dashed rounded-2xl transition cursor-pointer"
              >
                <Camera className="w-10 h-10 text-gray-400" />
                <p className="font-medium text-gray-500 text-sm">Tap to open camera</p>
                {cameraError && (
                  <p className="flex items-center gap-1 px-4 text-red-500 text-xs text-center">
                    <AlertCircle className="w-3.5 h-3.5 shrink-0" /> {cameraError}
                  </p>
                )}
              </div>
            )}
          </div>
        </div>

        {/* ── Title ── */}
        <div>
          <label className="block mb-1 font-medium text-gray-700 text-sm">
            Title <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="e.g. Broken road near school"
            maxLength={100}
            required
            className="px-3 py-2.5 border border-gray-300 focus:border-primary rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/20 w-full text-sm transition"
          />
        </div>

        {/* ── Description ── */}
        <div>
          <label className="block mb-1 font-medium text-gray-700 text-sm">
            Description <span className="text-red-500">*</span>
          </label>
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Describe the issue in detail…"
            rows={4}
            maxLength={1000}
            required
            className="px-3 py-2.5 border border-gray-300 focus:border-primary rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/20 w-full text-sm resize-none transition"
          />
        </div>

        {/* ── Category ── */}
        <div>
          <label className="block mb-1 font-medium text-gray-700 text-sm">
            Category <span className="text-red-500">*</span>
          </label>
          <select
            value={category}
            onChange={(e) => setCategory(e.target.value)}
            required
            className="bg-white px-3 py-2.5 border border-gray-300 focus:border-primary rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/20 w-full text-sm transition"
          >
            <option value="">Select a category</option>
            {CATEGORIES.map((c) => (
              <option key={c.value} value={c.value}>{c.label}</option>
            ))}
          </select>
        </div>

        {/* ── District ── */}
        <div>
          <label className="block mb-1 font-medium text-gray-700 text-sm">
            District <span className="text-red-500">*</span>
          </label>
          <select
            value={district}
            onChange={(e) => setDistrict(e.target.value)}
            required
            className="bg-white px-3 py-2.5 border border-gray-300 focus:border-primary rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/20 w-full text-sm transition"
          >
            <option value="">Select a district</option>
            {DISTRICTS.map((d) => (
              <option key={d} value={d}>{d}</option>
            ))}
          </select>
        </div>

        {/* ── Target Group ── */}
        <div>
          <label className="block mb-2 font-medium text-gray-700 text-sm">
            Who should address this?
          </label>
          <div className="flex gap-2">
            {TARGET_GROUPS.map((tg) => (
              <button
                key={tg.value}
                type="button"
                onClick={() => setTargetGroup(tg.value)}
                className={`flex-1 py-2 rounded-xl text-xs font-medium border transition ${
                  targetGroup === tg.value
                    ? "bg-primary border-primary text-white"
                    : "bg-white border-gray-300 text-gray-600 hover:border-primary hover:text-primary"
                }`}
              >
                {tg.label}
              </button>
            ))}
          </div>
        </div>

        {/* ── Location (Leaflet) ── */}
        <LocationPicker value={location} onChange={setLocation} />

        {/* ── Submit ── */}
        <button
          type="submit"
          disabled={submitting}
          className="flex justify-center items-center gap-2 bg-primary hover:bg-red-700 disabled:opacity-60 px-4 py-3 rounded-2xl w-full font-semibold text-white transition"
        >
          {submitting ? (
            <svg className="w-5 h-5 animate-spin" viewBox="0 0 24 24" fill="none">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
            </svg>
          ) : (
            <Send className="w-4 h-4" />
          )}
          {submitting ? "Posting…" : "Post Issue"}
        </button>
      </form>
    </div>
  );
}
