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
      <div className="flex flex-col justify-center items-center bg-[#f8fafc] min-h-screen px-6 py-10 selection:bg-[rgb(102,169,95)]/10">
        <div className="w-full max-w-md animate-in fade-in slide-in-from-bottom-4 duration-500">
          <button
            onClick={() => setMode(null)}
            className="group mb-10 flex items-center gap-2  text-slate-800 text-[12px] font-black uppercase  hover:text-[rgb(102,169,95)] transition-all"
          >
            <ChevronLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
            Back to Selection
          </button>

          <div className="text-center mb-8">
            <div className="inline-flex items-center justify-center w-14 h-14 bg-white rounded-3xl shadow-sm border border-green-50 mb-4">
              <Users className="w-6 h-6 text-[rgb(102,169,95)]" />
            </div>
            <h1 className="text-2xl font-black text-slate-900 tracking-tight">
              Citizen <span className="text-[rgb(102,169,95)]">Portal</span>
            </h1>
            <p className="text-xs text-slate-400 font-bold uppercase tracking-widest mt-1">
              Authorized Access Only
            </p>
          </div>

          <div className="bg-white p-2 rounded-[2.5rem] shadow-[0_20px_50px_rgba(102,169,95,0.1)] border border-green-50/50">
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
      <div className="absolute top-[-5%] right-[-5%] w-[300px] h-[300px] bg-[rgb(102,169,95)]/5 blur-[100px] rounded-full" />
      <div className="absolute bottom-[-5%] left-[-5%] w-[300px] h-[300px] bg-[rgb(102,169,95)]/5 blur-[100px] rounded-full" />

      <div className="w-full max-w-[420px] relative z-10 animate-in fade-in zoom-in-95 duration-700">
        <header className="text-center mb-12">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-white rounded-3xl shadow-sm border border-green-50 mb-6 transition-transform hover:scale-105 duration-500">
            <Lock className="w-7 h-7 text-[rgb(102,169,95)]" strokeWidth={2} />
          </div>

          <h1 className="text-4xl font-black text-slate-900 tracking-tighter">
            Sajha<span className="text-[rgb(102,169,95)]">Samasya</span>
          </h1>

          <p className="mt-3 text-slate-500 font-medium text-sm">
            Select your access level to continue
          </p>
        </header>

        <div className="flex flex-col gap-4">
          {/* Citizen Option */}
          <button
            onClick={() => setMode("citizen")}
            className="group relative flex items-center gap-5 bg-white p-6 rounded-[2.2rem] border border-slate-100 shadow-[0_4px_20px_rgba(0,0,0,0.02)] hover:border-[rgb(102,169,95)]/30 hover:shadow-[0_20px_40px_rgba(102,169,95,0.08)] hover:-translate-y-1 transition-all duration-500"
          >
            <div className="flex justify-center items-center bg-green-50 group-hover:bg-[rgb(102,169,95)] rounded-2xl w-14 h-14 transition-all duration-500">
              <Users className="w-6 h-6 text-[rgb(102,169,95)] group-hover:text-white transition-colors" />
            </div>
            <div className="flex-1 text-left">
              <p className="font-black text-slate-900 uppercase tracking-widest text-[11px]">
                Citizen Portal
              </p>
              <p className="text-slate-400 text-xs font-medium mt-1">
                Report & track community issues
              </p>
            </div>
            <ArrowRight className="w-5 h-5 text-slate-200 group-hover:text-[rgb(102,169,95)] group-hover:translate-x-1 transition-all" />
          </button>

          {/* Authority Option */}
          <Link
            href="/authority/sign-in"
            className="group relative flex items-center gap-5 bg-white p-6 rounded-[2.2rem] border border-slate-100 shadow-[0_4px_20px_rgba(0,0,0,0.02)] hover:border-slate-900/10 hover:shadow-[0_20px_40px_rgba(0,0,0,0.05)] hover:-translate-y-1 transition-all duration-500"
          >
            <div className="flex justify-center items-center bg-slate-900 rounded-2xl w-14 h-14 shadow-lg shadow-slate-900/20">
              <Shield className="w-6 h-6 text-white" />
            </div>

            <div className="flex-1 text-left">
              <p className="font-black text-slate-900 uppercase tracking-widest text-[11px]">
                Authority Portal
              </p>
              <p className="text-slate-400 text-xs font-medium mt-1">
                Official dispatch & management
              </p>
            </div>

            <ArrowRight className="w-5 h-5 text-slate-200 group-hover:text-slate-900 group-hover:translate-x-1 transition-all" />
          </Link>
        </div>

        {/* Footer */}
        <div className="mt-12 text-center">
          <p className="text-slate-500 text-sm font-medium">
            New to the platform?
            <Link
              href="/sign-up"
              className="text-[rgb(102,169,95)] hover:underline ml-1.5 font-bold"
            >
              Create account
            </Link>
          </p>

          <div className="flex justify-center items-center gap-4 mt-8">
            <div className="h-px w-8 bg-slate-100" />
            <div className="flex items-center gap-1.5">
              <Leaf className="w-3 h-3 text-[rgb(102,169,95)]/40" />
              <span className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-300">
                Secure Civic Access
              </span>
            </div>
            <div className="h-px w-8 bg-slate-100" />
          </div>
        </div>
      </div>
    </div>
  );
}
