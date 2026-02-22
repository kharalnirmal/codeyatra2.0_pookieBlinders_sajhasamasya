"use client";

import { useState } from "react";
import { SignIn } from "@clerk/nextjs";
import Link from "next/link";
import { Shield, Users, ChevronLeft, ArrowRight, Lock } from "lucide-react";

export default function SignInPage() {
  const [mode, setMode] = useState(null);

  if (mode === "citizen") {
    return (
      <div className="flex justify-center items-center bg-[#f8fafc] min-h-screen px-4">
        <div className="w-full max-w-md animate-in fade-in zoom-in duration-500">
          <button
            onClick={() => setMode(null)}
            className="group mb-8 flex items-center gap-2 text-[#1d398f]/60 text-xs font-black uppercase tracking-[0.2em] hover:text-[#e8000c] transition-colors"
          >
            <ChevronLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
            Back to Selection
          </button>

          <div className="text-center mb-10">
            <h1 className="text-2xl font-medium  text-[#1d398f]">
              Sajha<span className="text-[#e8000c]">Samasya</span>
            </h1>
            <div className="h-1 w-12 bg-[#e8000c] mx-auto mt-2 rounded-full" />
            <p className="mt-4 text-[10px] font-bold text-slate-400 uppercase tracking-[0.3em]">
              Citizen Portal Access
            </p>
          </div>

          <div className="bg-white p-2 rounded-[2.5rem] shadow-[0_20px_50px_rgba(29,57,143,0.1)] border border-slate-100">
            <SignIn
              path="/sign-in"
              signUpUrl="/sign-up"
              appearance={{
                elements: {
                  formButtonPrimary:
                    "bg-[#e8000c] hover:bg-[#1d398f] transition-all text-xs font-black uppercase tracking-widest h-12 rounded-2xl",
                  card: "shadow-none border-none bg-transparent",
                  headerTitle: "text-[#1d398f] font-black",
                  headerSubtitle: "text-slate-400 font-medium",
                },
              }}
            />
          </div>
        </div>
      </div>
    );
  }

  // ── ROLE CHOOSER VIEW ──
  return (
    <div className="relative flex justify-center items-center bg-[#f8fafc] px-4 min-h-screen overflow-hidden">
      {/* Decorative Background Elements */}
      <div className="absolute top-[-10%] right-[-10%] w-[40%] h-[40%] bg-[#1d398f]/5 blur-[120px] rounded-full" />
      <div className="absolute bottom-[-10%] left-[-10%] w-[40%] h-[40%] bg-[#e8000c]/5 blur-[120px] rounded-full" />

      <div className="w-full max-w-[440px] relative z-10">
        <header className="text-center mb-10">
          <div className="inline-flex items-center justify-center w-14 h-14 bg-white rounded-2xl border border-slate-100 mb-5">
            <Lock className="w-6 h-6 text-[#1d398f]" strokeWidth={1.5} />
          </div>

          <h1 className="text-3xl font-bold text-[#1d398f]">
            Sajha<span className="text-[#e8000c]">Samasya</span>
          </h1>

          <p className="mt-2 text-slate-500 text-sm">
            Select your access level to continue
          </p>
        </header>
        <div className="flex flex-col gap-5">
          {/* Citizen Option */}
          <button
            onClick={() => setMode("citizen")}
            className="group relative flex items-center gap-5 bg-white p-6 rounded-[2rem] border border-slate-100 shadow-[0_4px_20px_rgba(0,0,0,0.03)] hover:shadow-[0_20px_40px_rgba(29,57,143,0.08)] hover:-translate-y-1 transition-all duration-500"
          >
            <div className="flex justify-center items-center bg-slate-50 group-hover:bg-[#e8000c] rounded-2xl w-14 h-14 transition-colors duration-500">
              <Users className="w-6 h-6 text-[#1d398f] group-hover:text-white transition-colors" />
            </div>
            <div className="flex-1">
              <p className="font-black text-[#1d398f] uppercase tracking-wider text-sm">
                Citizen Portal
              </p>
              <p className="text-slate-400 text-xs font-medium mt-0.5">
                Report & track community issues
              </p>
            </div>
            <ArrowRight className="w-5 h-5 text-slate-300 group-hover:text-[#e8000c] group-hover:translate-x-1 transition-all" />
          </button>

          {/* Authority Option */}
          <Link
            href="/authority/sign-in"
            className="group relative flex items-center gap-5 bg-white p-6 rounded-[2rem] border border-slate-100 shadow-[0_4px_20px_rgba(0,0,0,0.03)] hover:shadow-[0_20px_40px_rgba(232,0,12,0.08)] hover:-translate-y-1 transition-all duration-500"
          >
            {/* Icon Container - Turns Blue on Hover to match the 'Authority' theme */}
            <div className="flex justify-center items-center bg-slate-50 group-hover:bg-[#1d398f] rounded-2xl w-14 h-14 transition-colors duration-500">
              <Shield className="w-6 h-6 text-[#e8000c] group-hover:text-white transition-colors" />
            </div>

            {/* Text Content */}
            <div className="flex-1">
              <p className="font-black text-[#e8000c] uppercase tracking-wider text-center text-sm">
                Authority Portal
              </p>
              <p className="text-slate-400 text-xs font-medium mt-0.5">
                Manage & dispatch official responses
              </p>
            </div>

            {/* Interaction Arrow */}
            <ArrowRight className="w-5 h-5 text-slate-300 group-hover:text-[#1d398f] group-hover:translate-x-1 transition-all" />
          </Link>
        </div>

        {/* Footer */}
        <div className="mt-10 text-center font-semibold">
          <p className="text-slate-500 text-sm">
            New to the platform?
            <Link
              href="/sign-up"
              className="text-[#e8000c] hover:underline ml-1 font-medium"
            >
              Create account
            </Link>
          </p>

          <div className="flex justify-center items-center gap-3 mt-6">
            <div className="h-px w-6 bg-slate-200" />
            <span className="text-xs text-slate-400">
              Secure Unified Access
            </span>
            <div className="h-px w-6 bg-slate-200" />
          </div>
        </div>
      </div>
    </div>
  );
}
