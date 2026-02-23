"use client";

import { SignIn } from "@clerk/nextjs";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { ChevronLeft, ShieldCheck, Landmark, CheckCircle2 } from "lucide-react";

export default function AuthoritySignInPage() {
  const searchParams = useSearchParams();
  const registered = searchParams.get("registered") === "1";

  return (
    <div className="flex justify-center items-center bg-[#f8fafc] min-h-screen px-4 py-10 selection:bg-[rgb(102,169,95)]/10">
      <div className="w-full max-w-md animate-in fade-in slide-in-from-bottom-4 duration-700">
        {/* Navigation Link */}
        <Link
          href="/sign-in"
          className="group mb-8 inline-flex items-center gap-2 text-slate-800 text-[12px] font-black uppercase  hover:text-[rgb(102,169,95)] transition-all"
        >
          <ChevronLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
          Back to Selection
        </Link>

        {/* Branding Section */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-14 h-14 bg-slate-900 rounded-2xl shadow-lg shadow-slate-900/20 mb-5 transition-transform hover:scale-105 duration-500">
            <Landmark className="w-7 h-7 text-white" />
          </div>

          <h1 className="text-3xl font-black text-slate-900 tracking-tighter">
            Authority<span className="text-[rgb(102,169,95)]"> Portal</span>
          </h1>
          <p className="mt-2 text-[10px] font-black text-slate-400 uppercase tracking-[0.3em]">
            Official Government Access
          </p>
        </div>

        {/* Registration Success Message */}
        {registered && (
          <div className="bg-green-50/50 mb-6 px-4 py-3 border border-[rgb(102,169,95)]/20 rounded-2xl flex items-center gap-3 animate-in zoom-in-95 duration-500">
            <CheckCircle2 className="w-5 h-5 text-[rgb(102,169,95)] flex-shrink-0" />
            <p className="text-[rgb(102,169,95)] text-xs font-bold leading-tight">
              Account created successfully! Sign in to access your dashboard.
            </p>
          </div>
        )}

        {/* Clerk Sign In Component */}
        <div className="bg-white p-2 rounded-[2.5rem] shadow-[0_25px_50px_-12px_rgba(102,169,95,0.15)] border border-green-50/50 overflow-hidden">
          <SignIn
            path="/authority/sign-in"
            forceRedirectUrl="/authority/dashboard"
            fallbackRedirectUrl="/authority/dashboard"
            signUpUrl="/authority/sign-up"
            appearance={{
              elements: {
                rootBox: "w-full",
                card: "shadow-none border-none bg-transparent w-full",
                header: "hidden",
                formButtonPrimary:
                  "bg-slate-900 hover:bg-slate-800 transition-all text-xs font-black uppercase tracking-widest h-12 rounded-2xl shadow-md shadow-slate-900/10",
                socialButtonsBlockButton:
                  "border-slate-100 hover:bg-slate-50 rounded-2xl h-12",
                formFieldInput:
                  "rounded-xl border-slate-100 focus:border-[rgb(102,169,95)] focus:ring-4 focus:ring-[rgb(102,169,95)]/5 h-11 transition-all",
                footerActionLink:
                  "text-[rgb(102,169,95)] hover:text-[#528d4c] font-bold transition-colors",
                formFieldLabel:
                  "text-slate-500 font-bold text-[10px] uppercase tracking-wider ml-1 mb-1",
              },
            }}
          />
        </div>

        {/* Footer Support Links */}
        <div className="mt-10 text-center space-y-4">
          <div className="flex flex-col gap-3">
            <p className="text-[11px] font-medium text-slate-500">
              New to the portal?{" "}
              <Link
                href="/authority/sign-up"
                className="text-[rgb(102,169,95)] font-black hover:underline underline-offset-4"
              >
                Apply for Access
              </Link>
            </p>
            <p className="text-[11px] font-medium text-slate-400 italic">
              Wrong role?{" "}
              <Link
                href="/authority/upgrade"
                className="text-slate-600 font-bold hover:underline"
              >
                Upgrade Citizen Account
              </Link>
            </p>
          </div>

          <div className="pt-4 flex items-center justify-center gap-2 border-t border-slate-100">
            <ShieldCheck className="w-3.5 h-3.5 text-slate-300" />
            <span className="text-[9px] font-black uppercase tracking-[0.2em] text-slate-300">
              Encrypted Multi-Factor Access
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
