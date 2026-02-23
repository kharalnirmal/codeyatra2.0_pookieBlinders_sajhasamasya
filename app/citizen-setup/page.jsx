"use client";

import { useEffect, useState } from "react";
import { useUser } from "@clerk/nextjs";
import { useRouter } from "next/navigation";
import { CheckCircle2, ShieldAlert, Loader2 } from "lucide-react";

export default function CitizenSetupPage() {
  const { user, isLoaded } = useUser();
  const router = useRouter();
  const [error, setError] = useState("");

  useEffect(() => {
    if (!isLoaded || !user) return;

    if (user.publicMetadata?.role) {
      if (user.publicMetadata.role === "authority") {
        router.replace("/authority/dashboard");
      } else {
        router.replace("/");
      }
      return;
    }

    fetch("/api/auth/set-citizen-role", { method: "POST" })
      .then((res) => res.json())
      .then((data) => {
        if (data.ok) {
          // Add a tiny delay for a smoother visual transition
          setTimeout(() => router.replace("/"), 800);
        } else {
          setError(data.error || "Failed to set up account");
        }
      })
      .catch(() => setError("Network error. Please try again."));
  }, [isLoaded, user, router]);

  // --- LOADING STATE ---
  if (!isLoaded || (!error && isLoaded)) {
    return (
      <div className="flex flex-col justify-center items-center min-h-screen bg-[#f8fafc] px-6">
        <div className="relative flex flex-col items-center max-w-sm w-full">
          {/* Animated Background Pulse */}
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-32 h-32 bg-[rgb(102,169,95)]/10 rounded-full blur-3xl animate-pulse" />

          <div className="relative z-10 flex flex-col items-center gap-6">
            <div className="p-4 rounded-[2rem] bg-white shadow-xl shadow-green-900/5 border border-green-50">
              <Loader2
                className="w-8 h-8 text-[rgb(102,169,95)] animate-spin"
                strokeWidth={2.5}
              />
            </div>

            <div className="text-center space-y-2">
              <h2 className="text-xl font-bold text-slate-900 tracking-tight">
                Setting up your{" "}
                <span className="text-[rgb(102,169,95)]">Portal</span>
              </h2>
              <p className="text-sm text-slate-400 font-medium">
                Preparing your personal neighborhood dashboard...
              </p>
            </div>
          </div>

          {/* Progress Indicator */}
          <div className="mt-12 w-32 h-1 bg-slate-100 rounded-full overflow-hidden">
            <div
              className="h-full bg-[rgb(102,169,95)] rounded-full animate-progress-flow"
              style={{ width: "60%" }}
            />
          </div>
        </div>
      </div>
    );
  }

  // --- ERROR STATE ---
  if (error) {
    return (
      <div className="flex justify-center items-center min-h-screen bg-[#f8fafc] px-6">
        <div className="bg-white p-8 rounded-[2.5rem] shadow-2xl shadow-red-900/5 border border-red-50 w-full max-w-sm text-center">
          <div className="w-16 h-16 bg-red-50 rounded-2xl flex items-center justify-center mx-auto mb-6">
            <ShieldAlert className="w-8 h-8 text-red-500" />
          </div>

          <h2 className="text-xl font-bold text-slate-900 mb-2">
            Setup Failed
          </h2>
          <p className="text-slate-500 text-sm mb-8 leading-relaxed">{error}</p>

          <button
            onClick={() => router.replace("/")}
            className="w-full bg-[rgb(102,169,95)] hover:bg-[#528d4c] py-4 rounded-2xl text-white font-bold text-sm shadow-lg shadow-green-900/20 transition-all active:scale-95"
          >
            Back to Home
          </button>
        </div>
      </div>
    );
  }

  return null;
}
