"use client";

import { useRef, useState, useCallback, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useUser } from "@clerk/nextjs";
import {
  Camera, RefreshCw, X, Send, AlertCircle,
  ChevronLeft, MapPin, Zap, Trash2, Droplets,
  ShieldAlert, MoreHorizontal, Construction,
} from "lucide-react";
import { toast } from "sonner";
import dynamic from "next/dynamic";

const LocationPicker = dynamic(
  () => import("@/components/posts/LocationPicker"),
  {
    ssr: false,
    loading: () => (
      <div className="h-64 rounded-2xl bg-green-50/60 border border-green-100 animate-pulse" />
    ),
  }
);

const CATEGORIES = [
  { value: "road",        label: "Road",        sub: "Infrastructure", Icon: Construction  },
  { value: "water",       label: "Water",       sub: "Supply",         Icon: Droplets      },
  { value: "electricity", label: "Electricity", sub: "Power",          Icon: Zap           },
  { value: "garbage",     label: "Garbage",     sub: "Waste",          Icon: Trash2        },
  { value: "safety",      label: "Safety",      sub: "Public",         Icon: ShieldAlert   },
  { value: "other",       label: "Other",       sub: "General",        Icon: MoreHorizontal},
];

const TARGET_GROUPS = [
  { value: "authority", label: "Authority",  desc: "Report to officials"    },
  { value: "volunteer", label: "Volunteers", desc: "Request community help" },
  { value: "both",      label: "Both",       desc: "Maximum reach"          },
];

function compressImage(dataUrl, maxWidth = 800) {
  return new Promise((resolve) => {
    const img = new window.Image();
    img.onload = () => {
      const canvas = document.createElement("canvas");
      const ratio = Math.min(1, maxWidth / img.width);
      canvas.width  = Math.round(img.width * ratio);
      canvas.height = Math.round(img.height * ratio);
      canvas.getContext("2d").drawImage(img, 0, 0, canvas.width, canvas.height);
      resolve(canvas.toDataURL("image/jpeg", 0.6));
    };
    img.src = dataUrl;
  });
}

/* ── Step dot ── */
function StepDot({ n, active, done }) {
  return (
    <div
      className="flex items-center justify-center w-7 h-7 rounded-full font-bold text-xs"
      style={{
        transition: "all 0.4s cubic-bezier(.34,1.3,.64,1)",
        background:
          done || active
            ? "linear-gradient(135deg,#22c55e,#15803d)"
            : "rgba(20,83,45,0.08)",
        color: done || active ? "white" : "rgba(20,83,45,0.4)",
        boxShadow: active ? "0 4px 14px rgba(26,92,56,0.35)" : "none",
        transform: active ? "scale(1.12)" : "scale(1)",
      }}
    >
      {done ? (
        <svg width="13" height="13" viewBox="0 0 13 13" fill="none">
          <path d="M2 7l3.5 3.5L11 3" stroke="white" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      ) : n}
    </div>
  );
}

/* ── Scroll-reveal section ── */
function Section({ children, delay = 0 }) {
  const ref = useRef(null);
  const [vis, setVis] = useState(false);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const obs = new IntersectionObserver(
      ([e]) => { if (e.isIntersecting) { setVis(true); obs.disconnect(); } },
      { threshold: 0.05 }
    );
    obs.observe(el);
    return () => obs.disconnect();
  }, []);
  return (
    <div
      ref={ref}
      style={{
        opacity: vis ? 1 : 0,
        transform: vis ? "translateY(0)" : "translateY(18px)",
        transition: `opacity 0.55s ease ${delay}ms, transform 0.55s cubic-bezier(.34,1.3,.64,1) ${delay}ms`,
      }}
    >
      {children}
    </div>
  );
}

/* ── Reusable glass card ── */
function GlassCard({ children, className = "" }) {
  return (
    <div
      className={`rounded-3xl p-5 border ${className}`}
      style={{
        background: "rgba(255,255,255,0.72)",
        backdropFilter: "blur(20px) saturate(160%)",
        WebkitBackdropFilter: "blur(20px) saturate(160%)",
        border: "1.5px solid rgba(255,255,255,0.88)",
        boxShadow:
          "0 2px 16px rgba(26,92,56,0.07), 0 1px 4px rgba(26,92,56,0.04), inset 0 1px 0 rgba(255,255,255,0.95)",
      }}
    >
      {children}
    </div>
  );
}

/* ── Field label ── */
function FieldLabel({ children }) {
  return (
    <label className="block mb-2 text-[11px] font-bold uppercase tracking-widest text-green-900/55">
      {children}
    </label>
  );
}

export default function CreatePostPage() {
  const router = useRouter();
  const { isSignedIn } = useUser();

  const videoRef  = useRef(null);
  const streamRef = useRef(null);
  const [cameraActive,  setCameraActive]  = useState(false);
  const [capturedPhoto, setCapturedPhoto] = useState(null);
  const [cameraError,   setCameraError]   = useState("");

  const [title,       setTitle]       = useState("");
  const [description, setDescription] = useState("");
  const [category,    setCategory]    = useState("");
  const [targetGroup, setTargetGroup] = useState("authority");
  const [location,    setLocation]    = useState(null);
  const [submitting,  setSubmitting]  = useState(false);
  const [mounted,     setMounted]     = useState(false);

  useEffect(() => { setTimeout(() => setMounted(true), 60); }, []);

  useEffect(() => {
    if (cameraActive && videoRef.current && streamRef.current)
      videoRef.current.srcObject = streamRef.current;
  }, [cameraActive]);

  useEffect(() => () => {
    streamRef.current?.getTracks().forEach((t) => t.stop());
  }, []);

  const startCamera = useCallback(async () => {
    setCameraError("");
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: "environment", width: { ideal: 1280 }, height: { ideal: 720 } },
        audio: false,
      });
      streamRef.current = stream;
      setCameraActive(true);
    } catch {
      setCameraError("Camera access denied. Please allow permission and try again.");
    }
  }, []);

  const stopCamera = useCallback(() => {
    streamRef.current?.getTracks().forEach((t) => t.stop());
    streamRef.current = null;
    setCameraActive(false);
  }, []);

  const capturePhoto = useCallback(async () => {
    const video = videoRef.current;
    if (!video?.videoWidth) return;
    const canvas = document.createElement("canvas");
    canvas.width  = video.videoWidth;
    canvas.height = video.videoHeight;
    canvas.getContext("2d").drawImage(video, 0, 0);
    stopCamera();
    setCapturedPhoto(await compressImage(canvas.toDataURL("image/jpeg", 1.0), 800));
  }, [stopCamera]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!isSignedIn) { router.push("/sign-in"); return; }
    if (!title.trim() || !description.trim() || !category) {
      toast.error("Please fill in all required fields."); return;
    }
    setSubmitting(true);
    try {
      const res  = await fetch("/api/posts", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: title.trim(), description: description.trim(),
          category, targetGroup,
          photo: capturedPhoto || "",
          location: location || null,
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

  const step1Done = !!capturedPhoto;
  const step2Done = !!title.trim() && !!description.trim() && !!category;
  const step3Done = !!location;

  return (
    <>
      <style>{`
        @keyframes captureRing {
          0%   { box-shadow: 0 0 0 0   rgba(74,222,128,0.7); }
          100% { box-shadow: 0 0 0 14px rgba(74,222,128,0); }
        }
        @keyframes spin { to { transform: rotate(360deg); } }
        .capture-ring { animation: captureRing 1.4s ease-out infinite; }
        .spin-svg { animation: spin 0.85s linear infinite; }
        .field-focus:focus {
          border-color: rgba(34,197,94,0.7) !important;
          box-shadow: 0 0 0 3px rgba(34,197,94,0.14), 0 2px 8px rgba(26,92,56,0.08) !important;
          background: rgba(255,255,255,0.97) !important;
          outline: none;
        }
      `}</style>

      {/* ── Page shell ── */}
      <div
        className="relative min-h-screen pb-28"
        style={{ background: "linear-gradient(160deg,#f0f7f2 0%,#f8f8f4 45%,#f0f5f2 100%)" }}
      >

        {/* Ambient blobs */}
        <div aria-hidden className="pointer-events-none fixed inset-0 -z-10 overflow-hidden">
          <div
            className="absolute -top-20 -right-20 w-80 h-80 opacity-60"
            style={{
              borderRadius: "60% 40% 70% 30%/50% 60% 40% 50%",
              background: "radial-gradient(circle,rgba(187,247,208,0.6) 0%,transparent 70%)",
              filter: "blur(50px)",
            }}
          />
          <div
            className="absolute bottom-24 -left-16 w-64 h-64 opacity-50"
            style={{
              borderRadius: "40% 60% 30% 70%/60% 40% 70% 30%",
              background: "radial-gradient(circle,rgba(167,243,208,0.45) 0%,transparent 70%)",
              filter: "blur(45px)",
            }}
          />
        </div>

        {/* ── STICKY HEADER ── */}
        <div
          className="sticky z-40 border-b border-green-900/8"
          style={{
            top: 56,
            background: "rgba(240,247,242,0.82)",
            backdropFilter: "blur(20px) saturate(180%)",
            WebkitBackdropFilter: "blur(20px) saturate(180%)",
            opacity: mounted ? 1 : 0,
            transform: mounted ? "translateY(0)" : "translateY(-8px)",
            transition: "opacity 0.45s ease, transform 0.45s ease",
          }}
        >
          <div className="mx-auto max-w-xl flex items-center gap-3 px-4 py-3">
            {/* Back button */}
            <button
              onClick={() => router.back()}
              className="flex items-center justify-center w-9 h-9 rounded-xl shrink-0
                         text-green-900 border-none cursor-pointer
                         bg-green-900/7 hover:bg-green-900/14
                         hover:scale-105 active:scale-95
                         transition-all duration-200"
            >
              <ChevronLeft size={18} strokeWidth={2.5} />
            </button>

            {/* Title */}
            <div className="flex-1 min-w-0">
              <h2 className="font-extrabold text-base text-green-900 tracking-tight leading-tight m-0">
                Report an Issue
              </h2>
              <p className="text-[11px] text-green-900/50 font-medium m-0">
                Help improve your community
              </p>
            </div>

            {/* Step progress */}
            <div className="flex items-center gap-1.5 shrink-0">
              <StepDot n={1} active={!step1Done} done={step1Done} />
              <div
                className="w-4 h-0.5 rounded-full transition-all duration-500"
                style={{ background: step1Done ? "#22c55e" : "rgba(20,83,45,0.12)" }}
              />
              <StepDot n={2} active={step1Done && !step2Done} done={step2Done} />
              <div
                className="w-4 h-0.5 rounded-full transition-all duration-500"
                style={{ background: step2Done ? "#22c55e" : "rgba(20,83,45,0.12)" }}
              />
              <StepDot n={3} active={step2Done && !step3Done} done={step3Done} />
            </div>
          </div>
        </div>

        {/* ── FORM ── */}
        <form
          onSubmit={handleSubmit}
          className="relative z-10 mx-auto max-w-xl px-4 pt-5 flex flex-col gap-4"
        >

          {/* 1. PHOTO */}
          <Section delay={40}>
            <GlassCard>
              <FieldLabel>📸 Photo</FieldLabel>

              {capturedPhoto ? (
                <div className="relative rounded-2xl overflow-hidden">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={capturedPhoto} alt="Captured"
                    className="w-full object-cover block"
                    style={{ maxHeight: 280 }}
                  />
                  {/* Bottom fade */}
                  <div className="absolute bottom-0 left-0 right-0 h-16 pointer-events-none"
                    style={{ background: "linear-gradient(to top,rgba(0,0,0,0.5),transparent)" }} />
                  {/* Retake pill */}
                  <button
                    type="button"
                    onClick={() => { setCapturedPhoto(null); startCamera(); }}
                    className="absolute bottom-3 right-3 flex items-center gap-1.5
                               px-3 py-1.5 rounded-full border-none cursor-pointer
                               text-xs font-bold text-green-700
                               shadow-[0_2px_8px_rgba(0,0,0,0.2)]
                               transition-transform duration-200 hover:scale-105 active:scale-95"
                    style={{ background: "rgba(255,255,255,0.92)", backdropFilter: "blur(8px)" }}
                  >
                    <RefreshCw size={12} /> Retake
                  </button>
                  {/* Check badge */}
                  <div className="absolute top-3 left-3 w-7 h-7 rounded-full flex items-center justify-center
                                  shadow-[0_2px_8px_rgba(26,92,56,0.4)]"
                    style={{ background: "linear-gradient(135deg,#22c55e,#15803d)" }}>
                    <svg width="13" height="13" viewBox="0 0 13 13" fill="none">
                      <path d="M2 7l3.5 3.5L11 3" stroke="white" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                  </div>
                </div>

              ) : cameraActive ? (
                <div className="relative bg-black rounded-2xl overflow-hidden">
                  <video
                    ref={videoRef} autoPlay playsInline muted
                    className="w-full block object-cover"
                    style={{ maxHeight: 320 }}
                  />
                  {/* Viewfinder corners */}
                  {[
                    { t: "12px", l: "12px", borderTop: "2.5px solid rgba(74,222,128,0.8)", borderLeft: "2.5px solid rgba(74,222,128,0.8)", borderRadius: "3px 0 0 0" },
                    { t: "12px", r: "12px", borderTop: "2.5px solid rgba(74,222,128,0.8)", borderRight: "2.5px solid rgba(74,222,128,0.8)", borderRadius: "0 3px 0 0" },
                    { b: "12px", l: "12px", borderBottom: "2.5px solid rgba(74,222,128,0.8)", borderLeft: "2.5px solid rgba(74,222,128,0.8)", borderRadius: "0 0 0 3px" },
                    { b: "12px", r: "12px", borderBottom: "2.5px solid rgba(74,222,128,0.8)", borderRight: "2.5px solid rgba(74,222,128,0.8)", borderRadius: "0 0 3px 0" },
                  ].map((s, i) => (
                    <div key={i} className="absolute w-5 h-5 pointer-events-none" style={{
                      top: s.t, bottom: s.b, left: s.l, right: s.r,
                      borderTop: s.borderTop, borderBottom: s.borderBottom,
                      borderLeft: s.borderLeft, borderRight: s.borderRight,
                      borderRadius: s.borderRadius,
                    }} />
                  ))}
                  {/* Capture */}
                  <div className="absolute bottom-4 left-0 right-0 flex justify-center">
                    <button
                      type="button"
                      onClick={capturePhoto}
                      className="capture-ring w-16 h-16 rounded-full bg-white border-none cursor-pointer
                                 flex items-center justify-center
                                 active:scale-95 transition-transform duration-150"
                    >
                      <div className="w-12 h-12 rounded-full"
                        style={{ background: "linear-gradient(135deg,#22c55e,#15803d)" }} />
                    </button>
                  </div>
                  {/* Close */}
                  <button
                    type="button" onClick={stopCamera}
                    className="absolute top-3 right-3 w-8 h-8 rounded-full border-none cursor-pointer
                               flex items-center justify-center text-white
                               hover:scale-105 active:scale-95 transition-transform duration-150"
                    style={{ background: "rgba(0,0,0,0.5)", backdropFilter: "blur(4px)" }}
                  >
                    <X size={15} />
                  </button>
                </div>

              ) : (
                <div
                  onClick={startCamera}
                  className="group flex flex-col items-center justify-center gap-2.5
                             py-9 px-5 rounded-2xl cursor-pointer
                             border-2 border-dashed border-green-500/35
                             bg-green-50/60
                             hover:bg-green-100/80 hover:border-green-500/55
                             transition-all duration-250"
                >
                  <div className="w-13 h-13 rounded-2xl flex items-center justify-center
                                  border border-green-500/20"
                    style={{ background: "linear-gradient(135deg,rgba(34,197,94,0.18),rgba(21,128,61,0.10))" }}>
                    <Camera size={24} className="text-green-600" strokeWidth={1.8} />
                  </div>
                  <div className="text-center">
                    <p className="text-sm font-bold text-green-700 m-0">Take a Photo</p>
                    <p className="text-xs text-green-900/45 font-medium mt-0.5">Optional but recommended</p>
                  </div>
                  {cameraError && (
                    <p className="flex items-center gap-1.5 text-xs text-red-500 text-center">
                      <AlertCircle size={13} className="shrink-0" /> {cameraError}
                    </p>
                  )}
                </div>
              )}
            </GlassCard>
          </Section>

          {/* 2. TITLE */}
          <Section delay={100}>
            <GlassCard>
              <FieldLabel>✏️ Title *</FieldLabel>
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="e.g. Broken road near school"
                maxLength={100}
                required
                className="field-focus w-full px-3.5 py-3 rounded-[14px] text-sm text-green-900
                           border border-green-900/15 bg-white/85
                           placeholder:text-green-900/35
                           transition-all duration-250"
                style={{ backdropFilter: "blur(8px)" }}
              />
              <div className="flex justify-end mt-1">
                <span className={`text-[11px] font-medium transition-colors duration-200 ${title.length > 80 ? "text-amber-500" : "text-green-900/30"}`}>
                  {title.length}/100
                </span>
              </div>
            </GlassCard>
          </Section>

          {/* 3. DESCRIPTION */}
          <Section delay={140}>
            <GlassCard>
              <FieldLabel>📝 Description *</FieldLabel>
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Describe the issue — what, where, and how it affects people…"
                rows={4}
                maxLength={1000}
                required
                className="field-focus w-full px-3.5 py-3 rounded-[14px] text-sm text-green-900 resize-none
                           border border-green-900/15 bg-white/85
                           placeholder:text-green-900/35
                           transition-all duration-250"
                style={{ backdropFilter: "blur(8px)" }}
              />
              <div className="flex justify-end mt-1">
                <span className={`text-[11px] font-medium transition-colors duration-200 ${description.length > 850 ? "text-amber-500" : "text-green-900/30"}`}>
                  {description.length}/1000
                </span>
              </div>
            </GlassCard>
          </Section>

          {/* 4. CATEGORY */}
          <Section delay={180}>
            <GlassCard>
              <FieldLabel>🏷️ Category *</FieldLabel>
              <div className="grid grid-cols-3 gap-2">
                {CATEGORIES.map(({ value, label, sub, Icon }) => {
                  const active = category === value;
                  return (
                    <button
                      key={value}
                      type="button"
                      onClick={() => setCategory(value)}
                      className="flex flex-col items-center gap-1.5 py-3 px-2 rounded-2xl
                                 cursor-pointer border transition-all duration-250
                                 active:scale-95"
                      style={{
                        border: active ? "1.5px solid rgba(34,197,94,0.7)" : "1.5px solid rgba(20,83,45,0.1)",
                        background: active
                          ? "linear-gradient(135deg,rgba(34,197,94,0.12),rgba(21,128,61,0.08))"
                          : "rgba(255,255,255,0.6)",
                        transform: active ? "scale(1.04)" : "scale(1)",
                        boxShadow: active ? "0 4px 16px rgba(26,92,56,0.18)" : "none",
                      }}
                    >
                      <div
                        className="w-9 h-9 rounded-[10px] flex items-center justify-center transition-all duration-250"
                        style={{
                          background: active
                            ? "linear-gradient(135deg,#22c55e,#15803d)"
                            : "rgba(20,83,45,0.07)",
                        }}
                      >
                        <Icon size={16} color={active ? "white" : "rgba(20,83,45,0.55)"} strokeWidth={1.8} />
                      </div>
                      <div className="text-center">
                        <p className={`text-[11px] font-bold m-0 ${active ? "text-green-700" : "text-gray-700"}`}>
                          {label}
                        </p>
                        <p className={`text-[9px] font-medium m-0 ${active ? "text-green-600/65" : "text-black/35"}`}>
                          {sub}
                        </p>
                      </div>
                    </button>
                  );
                })}
              </div>
            </GlassCard>
          </Section>

          {/* 5. TARGET GROUP */}
          <Section delay={220}>
            <GlassCard>
              <FieldLabel>🎯 Who should address this?</FieldLabel>
              <div className="flex flex-col gap-2">
                {TARGET_GROUPS.map(({ value, label, desc }) => {
                  const active = targetGroup === value;
                  return (
                    <button
                      key={value}
                      type="button"
                      onClick={() => setTargetGroup(value)}
                      className="flex items-center gap-3 px-3.5 py-3 rounded-2xl
                                 cursor-pointer text-left border
                                 transition-all duration-250 active:scale-[0.98]"
                      style={{
                        border: active ? "1.5px solid rgba(34,197,94,0.6)" : "1.5px solid rgba(20,83,45,0.1)",
                        background: active
                          ? "linear-gradient(135deg,rgba(34,197,94,0.1),rgba(21,128,61,0.06))"
                          : "rgba(255,255,255,0.5)",
                      }}
                    >
                      {/* Custom radio */}
                      <div
                        className="w-4.5 h-4.5 rounded-full bg-white shrink-0 transition-all duration-250"
                        style={{
                          border: active ? "5px solid #22c55e" : "2px solid rgba(20,83,45,0.25)",
                        }}
                      />
                      <div>
                        <p className={`text-[13px] font-bold m-0 ${active ? "text-green-700" : "text-gray-700"}`}>
                          {label}
                        </p>
                        <p className="text-[11px] text-green-900/45 font-medium m-0">{desc}</p>
                      </div>
                    </button>
                  );
                })}
              </div>
            </GlassCard>
          </Section>

          {/* 6. LOCATION */}
          <Section delay={260}>
            <GlassCard>
              <label className="flex items-center gap-1.5 mb-3 text-[11px] font-bold uppercase tracking-widest text-green-900/55">
                <MapPin size={11} className="shrink-0" />
                Location
                <span className="ml-1 text-[10px] text-green-900/38 normal-case tracking-normal font-medium">
                  optional
                </span>
              </label>
              <LocationPicker value={location} onChange={setLocation} />
            </GlassCard>
          </Section>

          {/* 7. SUBMIT */}
          <Section delay={300}>
            <button
              type="submit"
              disabled={submitting}
              className="w-full h-14 rounded-[18px] border-none flex items-center justify-center gap-2.5
                         text-white font-extrabold text-[15px] tracking-tight cursor-pointer
                         disabled:opacity-70 disabled:cursor-not-allowed
                         hover:not-disabled:-translate-y-0.5 hover:not-disabled:scale-[1.01]
                         active:not-disabled:scale-[0.98] active:not-disabled:translate-y-0
                         transition-all duration-300 ease-[cubic-bezier(.34,1.56,.64,1)]"
              style={{
                background: "linear-gradient(135deg,#22c55e 0%,#15803d 60%,#14532d 100%)",
                boxShadow: "0 8px 24px rgba(26,92,56,0.32), inset 0 1px 0 rgba(255,255,255,0.22)",
              }}
            >
              {submitting ? (
                <>
                  <svg
                    className="spin-svg w-5 h-5"
                    viewBox="0 0 24 24" fill="none"
                  >
                    <circle cx="12" cy="12" r="10" stroke="rgba(255,255,255,0.3)" strokeWidth="3" />
                    <path d="M12 2a10 10 0 0 1 10 10" stroke="white" strokeWidth="3" strokeLinecap="round" />
                  </svg>
                  Posting…
                </>
              ) : (
                <>
                  <Send size={17} strokeWidth={2.5} />
                  Post Issue
                </>
              )}
            </button>
            <p className="text-center text-[11px] text-green-900/38 font-medium mt-2.5">
              Your report helps the whole community 🌿
            </p>
          </Section>

        </form>
      </div>
    </>
  );
}