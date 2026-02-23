"use client";

import { useState } from "react";
import { SignIn } from "@clerk/nextjs";
import Link from "next/link";
import {
  Shield,
  Users,
  ChevronLeft,
  ArrowRight,
  Lock,
  Leaf,
} from "lucide-react";

export default function SignInPage() {
  const [mode, setMode] = useState(null);

  if (mode === "citizen") {
    return (
      <div className="flex flex-col justify-center items-center bg-[#f8fafc] selection:bg-[rgb(102,169,95)]/10 px-6 py-10 min-h-screen">
        <div className="slide-in-from-bottom-4 w-full max-w-md animate-in duration-500 fade-in">
          <button
            onClick={() => setMode(null)}
            className="group flex items-center gap-2 mb-10 font-black text-[12px] text-slate-800 hover:text-[rgb(102,169,95)] uppercase transition-all"
          >
            <ChevronLeft className="w-4 h-4 transition-transform group-hover:-translate-x-1" />
            Back to Selection
          </button>

          <div className="mb-8 text-center">
            <div className="inline-flex justify-center items-center bg-white shadow-sm mb-4 border border-green-50 rounded-3xl w-14 h-14">
              <Users className="w-6 h-6 text-[rgb(102,169,95)]" />
            </div>
            <h1 className="font-black text-slate-900 text-2xl tracking-tight">
              Citizen <span className="text-[rgb(102,169,95)]">Portal</span>
            </h1>
            <p className="mt-1 font-bold text-slate-400 text-xs uppercase tracking-widest">
              Authorized Access Only
            </p>
          </div>

          <div className="bg-white shadow-[0_20px_50px_rgba(102,169,95,0.1)] p-2 border border-green-50/50 rounded-[2.5rem]">
            <SignIn
              path="/sign-in"
              signUpUrl="/sign-up"
              appearance={{
                elements: {
                  rootBox: "w-full",
                  card: "shadow-none border-none bg-transparent w-full",
                  header: "hidden",
                  formButtonPrimary:
                    "bg-[rgb(102,169,95)] hover:bg-[#528d4c] transition-all text-xs font-black uppercase tracking-widest h-12 rounded-2xl shadow-lg shadow-green-900/10",
                  socialButtonsBlockButton:
                    "border-slate-100 hover:bg-slate-50 transition-colors rounded-2xl h-12",
                  formFieldInput:
                    "rounded-xl border-slate-100 focus:border-[rgb(102,169,95)] focus:ring-4 focus:ring-[rgb(102,169,95)]/5 h-11 transition-all",
                  footerActionLink:
                    "text-[rgb(102,169,95)] hover:text-[#528d4c] font-bold transition-colors",
                },
              }}
            />
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="relative flex justify-center items-center bg-[#f8fafc] px-6 min-h-screen overflow-hidden">
      {/* Soft Green Glow Accents */}
      <div className="top-[-5%] right-[-5%] absolute bg-[rgb(102,169,95)]/5 blur-[100px] rounded-full w-[300px] h-[300px]" />
      <div className="bottom-[-5%] left-[-5%] absolute bg-[rgb(102,169,95)]/5 blur-[100px] rounded-full w-[300px] h-[300px]" />

      <div className="z-10 relative w-full max-w-[420px] animate-in duration-700 fade-in zoom-in-95">
        <header className="mb-12 text-center">
          <div className="inline-flex justify-center items-center bg-white shadow-sm mb-6 border border-green-50 rounded-3xl w-16 h-16 hover:scale-105 transition-transform duration-500">
            <Lock className="w-7 h-7 text-[rgb(102,169,95)]" strokeWidth={2} />
          </div>

          <h1 className="font-black text-slate-900 text-4xl tracking-tighter">
            Sajha<span className="text-[rgb(102,169,95)]">Samasya</span>
          </h1>

          <p className="mt-3 font-medium text-slate-500 text-sm">
            Select your access level to continue
          </p>
        </header>

        <div className="flex flex-col gap-4">
          {/* Citizen Option */}
          <button
            onClick={() => setMode("citizen")}
            className="group relative flex items-center gap-5 bg-white shadow-[0_4px_20px_rgba(0,0,0,0.02)] hover:shadow-[0_20px_40px_rgba(102,169,95,0.08)] p-6 border border-slate-100 hover:border-[rgb(102,169,95)]/30 rounded-[2.2rem] transition-all hover:-translate-y-1 duration-500"
          >
            <div className="flex justify-center items-center bg-green-50 group-hover:bg-[rgb(102,169,95)] rounded-2xl w-14 h-14 transition-all duration-500">
              <Users className="w-6 h-6 text-[rgb(102,169,95)] group-hover:text-white transition-colors" />
            </div>
            <div className="flex-1 text-left">
              <p className="font-black text-[11px] text-slate-900 uppercase tracking-widest">
                Citizen Portal
              </p>
              <p className="mt-1 font-medium text-slate-400 text-xs">
                Report & track community issues
              </p>
            </div>
            <ArrowRight className="w-5 h-5 text-slate-200 group-hover:text-[rgb(102,169,95)] transition-all group-hover:translate-x-1" />
          </button>

          {/* Authority Option */}
          <Link
            href="/authority/sign-in"
            className="group relative flex items-center gap-5 bg-white shadow-[0_4px_20px_rgba(0,0,0,0.02)] hover:shadow-[0_20px_40px_rgba(0,0,0,0.05)] p-6 border border-slate-100 hover:border-slate-900/10 rounded-[2.2rem] transition-all hover:-translate-y-1 duration-500"
          >
            <div className="flex justify-center items-center bg-slate-900 shadow-lg shadow-slate-900/20 rounded-2xl w-14 h-14">
              <Shield className="w-6 h-6 text-white" />
            </div>

            <div className="flex-1 text-left">
              <p className="font-black text-[11px] text-slate-900 uppercase tracking-widest">
                Authority Portal
              </p>
              <p className="mt-1 font-medium text-slate-400 text-xs">
                Official dispatch & management
              </p>
            </div>

            <ArrowRight className="w-5 h-5 text-slate-200 group-hover:text-slate-900 transition-all group-hover:translate-x-1" />
          </Link>
        </div>
      </div>
    </div>
  );
}
