"use client";

import { useRef, useState, useCallback, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useUser } from "@clerk/nextjs";
import {
  Camera,
  RefreshCw,
  X,
  Send,
  AlertCircle,
  ChevronLeft,
  MapPin,
  ShieldCheck,
  Zap,
} from "lucide-react";
import { toast } from "sonner";
import dynamic from "next/dynamic";
import { DISTRICTS } from "@/lib/constants";

const LocationPicker = dynamic(
  () => import("@/components/posts/LocationPicker"),
  {
    ssr: false,
    loading: () => (
      <div className="h-64 rounded-3xl bg-slate-100 animate-pulse border-2 border-dashed border-slate-200" />
    ),
  },
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
  { value: "authority", label: "Official Authority", icon: ShieldCheck },
  { value: "volunteer", label: "Community Volunteers", icon: Zap },
  { value: "both", label: "Both (Maximum reach)", icon: Send },
];

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

/* ── Reusable Premium Components ── */
const GlassCard = ({ children, className = "" }) => (
  <div
    className={`bg-white/80 backdrop-blur-md border border-slate-200/60 shadow-[0_8px_30px_rgb(0,0,0,0.04)] rounded-[2.5rem] p-6 ${className}`}
  >
    {children}
  </div>
);

const Label = ({ children, required }) => (
  <label className="block mb-2 ml-1 text-[11px] font-black uppercase tracking-[0.15em] text-[#1d398f]/60">
    {children} {required && <span className="text-[#e8000c]">*</span>}
  </label>
);

export default function CreatePostPage() {
  const router = useRouter();
  const { isSignedIn } = useUser();
  const videoRef = useRef(null);
  const streamRef = useRef(null);

  const [cameraActive, setCameraActive] = useState(false);
  const [capturedPhoto, setCapturedPhoto] = useState(null);
  const [cameraError, setCameraError] = useState("");
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [category, setCategory] = useState("");
  const [targetGroup, setTargetGroup] = useState("authority");
  const [location, setLocation] = useState(null);
  const [district, setDistrict] = useState("");
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (cameraActive && videoRef.current && streamRef.current) {
      videoRef.current.srcObject = streamRef.current;
    }
  }, [cameraActive]);

  useEffect(
    () => () => streamRef.current?.getTracks().forEach((t) => t.stop()),
    [],
  );

  const startCamera = useCallback(async () => {
    setCameraError("");
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: "environment" },
        audio: false,
      });
      streamRef.current = stream;
      setCameraActive(true);
    } catch {
      setCameraError("Enable camera permissions to provide visual evidence.");
    }
  }, []);

  const capturePhoto = useCallback(async () => {
    const video = videoRef.current;
    if (!video?.videoWidth) return;
    const canvas = document.createElement("canvas");
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    canvas.getContext("2d").drawImage(video, 0, 0);
    const compressed = await compressImage(
      canvas.toDataURL("image/jpeg", 1.0),
      800,
    );
    setCapturedPhoto(compressed);
    streamRef.current?.getTracks().forEach((t) => t.stop());
    setCameraActive(false);
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!isSignedIn) return router.push("/sign-in");
    setSubmitting(true);
    try {
      const res = await fetch("/api/posts", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title,
          description,
          category,
          targetGroup,
          photo: capturedPhoto,
          location,
          district,
        }),
      });
      if (res.ok) {
        toast.success("Report Submitted to Authorities");
        router.push("/");
      }
    } catch (err) {
      toast.error("Submission failed");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#f8fafc] pb-32 font-sans selection:bg-[#1d398f]/10">
      <style>{`
        .premium-input {
          transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
          background: #f1f5f9;
        }
        .premium-input:focus {
          background: white;
          border-color: #1d398f;
          box-shadow: 0 0 0 4px rgba(29, 57, 143, 0.1);
          outline: none;
        }
        @keyframes ring-pulse {
          0% { box-shadow: 0 0 0 0 rgba(232, 0, 12, 0.4); }
          100% { box-shadow: 0 0 0 20px rgba(232, 0, 12, 0); }
        }
        .capture-pulse { animation: ring-pulse 2s infinite; }
      `}</style>

      {/* Header */}
      <nav className="sticky top-0 z-50 bg-white/70 backdrop-blur-xl border-b border-slate-200/50 px-6 py-4">
        <div className="max-w-xl mx-auto flex items-center justify-between">
          <button
            onClick={() => router.back()}
            className="p-2 hover:bg-slate-100 rounded-full transition"
          >
            <ChevronLeft className="w-6 h-6 text-[#1d398f]" />
          </button>
          <div className="text-center">
            <h1 className="text-[10px] font-black tracking-[0.3em] uppercase text-[#1d398f]/40">
              Municipal Reporting
            </h1>
            <p className="font-bold text-[#1d398f]">File Incident Report</p>
          </div>
          <div className="w-10" />
        </div>
      </nav>

      <main className="max-w-xl mx-auto px-4 mt-8 space-y-8">
        {/* Urgent Note */}
        <div className="flex items-center gap-3 p-4 bg-[#e8000c]/5 border border-[#e8000c]/10 rounded-3xl">
          <AlertCircle className="w-5 h-5 text-[#e8000c] shrink-0" />
          <p className="text-[11px] font-bold text-[#e8000c] uppercase tracking-wider">
            Reports are legally binding and sent to dispatch centers.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-8">
          {/* Visual Evidence Section */}
          <SectionTitle number="01" title="Visual Evidence" />
          <div className="relative group">
            {capturedPhoto ? (
              <div className="relative overflow-hidden rounded-[2.5rem] shadow-2xl">
                <img
                  src={capturedPhoto}
                  alt="Evidence"
                  className="w-full h-80 object-cover"
                />
                <button
                  type="button"
                  onClick={() => {
                    setCapturedPhoto(null);
                    startCamera();
                  }}
                  className="absolute bottom-6 right-6 bg-white/90 backdrop-blur-md text-[#e8000c] px-6 py-3 rounded-2xl text-xs font-black uppercase shadow-xl hover:bg-[#e8000c] hover:text-white transition-all"
                >
                  <RefreshCw className="w-4 h-4 inline mr-2" /> Retake Evidence
                </button>
              </div>
            ) : cameraActive ? (
              <div className="relative bg-black rounded-[2.5rem] overflow-hidden aspect-[4/5] shadow-2xl">
                <video
                  ref={videoRef}
                  autoPlay
                  playsInline
                  muted
                  className="w-full h-full object-cover opacity-90"
                />
                <div className="absolute bottom-10 inset-x-0 flex justify-center">
                  <button
                    type="button"
                    onClick={capturePhoto}
                    className="capture-pulse w-20 h-20 rounded-full border-8 border-white bg-[#e8000c] active:scale-90 transition-transform"
                  />
                </div>
                <button
                  type="button"
                  onClick={() => setCameraActive(false)}
                  className="absolute top-6 right-6 p-2 bg-white/20 rounded-full text-white"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            ) : (
              <div
                onClick={startCamera}
                className="group cursor-pointer py-16 bg-white border-2 border-dashed border-slate-200 rounded-[2.5rem] flex flex-col items-center gap-4 hover:border-[#1d398f] transition-all"
              >
                <div className="w-20 h-20 rounded-full bg-slate-50 flex items-center justify-center text-slate-400 group-hover:text-[#1d398f] group-hover:bg-[#1d398f]/5 transition-all">
                  <Camera size={32} strokeWidth={1.5} />
                </div>
                <div className="text-center">
                  <p className="text-sm font-bold text-[#1d398f]">
                    Launch Evidence Camera
                  </p>
                  <p className="text-[10px] text-slate-400 font-medium uppercase mt-1">
                    High resolution capture
                  </p>
                </div>
              </div>
            )}
          </div>
          {/* Details Section */}
          <SectionTitle number="02" title="Report Specifications" />
          <GlassCard className="space-y-6">
            <div>
              <Label required>Title</Label>
              <input
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                required
                placeholder="e.g. Structural Hazard: Main St Bridge"
                className="premium-input w-full px-5 py-4 rounded-2xl border-none text-sm font-bold text-[#1d398f]"
              />
            </div>

            <div>
              <Label required>Description</Label>
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                required
                rows={4}
                placeholder="Describe the report"
                className="premium-input w-full px-5 py-4 rounded-2xl border-none text-sm font-bold text-[#1d398f] resize-none"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label required>Category</Label>
                <select
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  required
                  className="premium-input w-full px-5 py-4 rounded-2xl border-none text-sm font-bold text-[#1d398f] appearance-none cursor-pointer"
                >
                  <option value="">Classification</option>
                  {CATEGORIES.map((c) => (
                    <option key={c.value} value={c.value}>
                      {c.label}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <Label required>District</Label>
                <select
                  value={district}
                  onChange={(e) => setDistrict(e.target.value)}
                  required
                  className="premium-input w-full px-5 py-4 rounded-2xl border-none text-sm font-bold text-[#1d398f] appearance-none cursor-pointer"
                >
                  <option value="">Locality</option>
                  {DISTRICTS.map((d) => (
                    <option key={d} value={d}>
                      {d}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </GlassCard>
          {/* Target Group Section */}
          <SectionTitle number="03" title="Target Authorities" />
          <div className="grid grid-cols-1 gap-3">
            {TARGET_GROUPS.map((tg) => {
              const Icon = tg.icon;
              const isActive = targetGroup === tg.value;
              return (
                <button
                  key={tg.value}
                  type="button"
                  onClick={() => setTargetGroup(tg.value)}
                  className={`flex items-center justify-between p-5 rounded-3xl border-2 transition-all ${
                    isActive
                      ? "border-[#1d398f] bg-[#1d398f]/5 shadow-lg"
                      : "border-white bg-white shadow-sm"
                  }`}
                >
                  <div className="flex items-center gap-4 text-left">
                    <div
                      className={`p-3 rounded-2xl ${isActive ? "bg-[#1d398f] text-white" : "bg-slate-100 text-[#1d398f]"}`}
                    >
                      <Icon size={20} />
                    </div>
                    <div>
                      <p
                        className={`text-sm font-bold ${isActive ? "text-[#1d398f]" : "text-slate-600"}`}
                      >
                        {tg.label}
                      </p>
                    </div>
                  </div>
                  <div
                    className={`w-6 h-6 rounded-full border-2 flex items-center justify-center transition-all ${isActive ? "border-[#1d398f] bg-[#1d398f]" : "border-slate-200"}`}
                  >
                    {isActive && (
                      <div className="w-2 h-2 rounded-full bg-white" />
                    )}
                  </div>
                </button>
              );
            })}
          </div>
          <SectionTitle number="04" title="Location" />
          <div className="overflow-hidden shadow-2xl border-4 border-white">
            <LocationPicker value={location} onChange={setLocation} />
          </div>

          {/* Submit Action */}
          <div className="pt-6">
            <button
              type="submit"
              disabled={submitting}
              className="group relative w-full h-16 bg-[#e8000c] rounded-[2rem] text-white font-black uppercase tracking-[0.2em] shadow-2xl shadow-red-500/30 overflow-hidden active:scale-[0.98] transition-all disabled:opacity-50"
            >
              <div className="relative z-10 flex justify-center items-center gap-3">
                {submitting ? (
                  <RefreshCw className="w-6 h-6 animate-spin" />
                ) : (
                  <>
                    <Send className="w-5 h-5 group-hover:translate-x-1 group-hover:-translate-y-1 transition-transform" />
                    <span>Broadcast Report</span>
                  </>
                )}
              </div>
              <div className="absolute inset-0 bg-[#1d398f] translate-y-full group-hover:translate-y-0 transition-transform duration-500" />
            </button>
          </div>
        </form>
      </main>
    </div>
  );
}

const SectionTitle = ({ number, title }) => (
  <div className="flex items-center gap-4 mb-4">
    <span className="text-2xl font-black text-[#1d398f]/10 tabular-nums">
      {number}
    </span>
    <h3 className="text-sm font-black uppercase tracking-[0.2em] text-[#1d398f]">
      {title}
    </h3>
    <div className="h-[1px] flex-1 bg-slate-200" />
  </div>
);
