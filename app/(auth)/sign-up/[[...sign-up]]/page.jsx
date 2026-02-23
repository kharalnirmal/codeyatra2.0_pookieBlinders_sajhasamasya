"use client";

import { SignUp } from "@clerk/nextjs";
import Link from "next/link";
import { ChevronLeft, Landmark, ShieldCheck, Info } from "lucide-react";

export default function AuthoritySignUpPage() {
  return (
    <div className="flex justify-center items-center bg-[#f8fafc] min-h-screen px-4 py-10 selection:bg-slate-900/10">
      <div className="w-full max-w-md animate-in fade-in slide-in-from-bottom-4 duration-700">
        {/* Back Button */}
        <Link
          href="/sign-in"
          className="group mb-8 inline-flex items-center gap-2 text-slate-400 text-[10px] font-bold uppercase tracking-[0.2em] hover:text-slate-900 transition-all"
        >
          <ChevronLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
          Back to Selection
        </Link>

        {/* Branding Section */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-14 h-14 bg-slate-900 rounded-2xl shadow-lg shadow-slate-900/20 mb-5">
            <Landmark className="w-7 h-7 text-white" />
          </div>

          <h1 className="text-3xl font-black text-slate-900 tracking-tighter">
            Authority
            <span className="text-[rgb(102,169,95)]">Registration</span>
          </h1>
          <p className="mt-2 text-[10px] font-black text-slate-400 uppercase tracking-[0.3em]">
            Official Verification Required
          </p>
        </div>

        {/* Info Banner */}
        <div className="bg-blue-50/50 mb-6 px-4 py-3 border border-blue-100 rounded-2xl flex items-start gap-3">
          <Info className="w-4 h-4 text-blue-500 mt-0.5 flex-shrink-0" />
          <p className="text-[10px] text-blue-700 font-semibold leading-relaxed">
            Authority accounts require manual verification. Please use your
            official government or organizational email address.
          </p>
        </div>

        {/* Clerk Sign Up Component */}
        <div className="bg-white p-2 rounded-[2.5rem] shadow-[0_25px_50px_-12px_rgba(0,0,0,0.08)] border border-slate-100 overflow-hidden">
          <SignUp
            path="/authority/sign-up"
            signInUrl="/authority/sign-in"
            forceRedirectUrl="/authority/setup" // Points to a role-handling page for authorities
            fallbackRedirectUrl="/authority/setup"
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
                  "rounded-xl border-slate-100 focus:border-slate-900 focus:ring-4 focus:ring-slate-900/5 h-11 transition-all",
                footerActionLink:
                  "text-[rgb(102,169,95)] hover:text-[#528d4c] font-bold transition-colors",
                formFieldLabel:
                  "text-slate-500 font-bold text-[10px] uppercase tracking-wider ml-1 mb-1",
              },
            }}
          />
        </div>

        {/* Support Footer */}
        <div className="mt-10 text-center space-y-4">
          <div className="flex items-center justify-center gap-2">
            <div className="h-px w-6 bg-slate-200" />
            <div className="flex items-center gap-1.5 px-2">
              <ShieldCheck className="w-3.5 h-3.5 text-slate-400" />
              <span className="text-[9px] font-black uppercase tracking-[0.15em] text-slate-400">
                Official Personnel Only
              </span>
            </div>
            <div className="h-px w-6 bg-slate-200" />
          </div>

          <p className="text-[10px] text-slate-400 font-medium leading-relaxed max-w-[280px] mx-auto">
            By registering, you certify that you are an authorized
            representative of a public office or utility service.
          </p>

          <div className="pt-2">
            <Link
              href="/authority/sign-in"
              className="text-[10px] font-black uppercase tracking-widest text-slate-400 hover:text-[rgb(102,169,95)] transition-colors"
            >
              Already have an account? Sign In
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
