"use client";

import { useState } from "react";
import { SignIn } from "@clerk/nextjs";
import Link from "next/link";
import { Shield, Users } from "lucide-react";

export default function SignInPage() {
  const [mode, setMode] = useState(null); // null = chooser, "citizen" = Clerk form

  // If user chose citizen → show Clerk SignIn
  if (mode === "citizen") {
    return (
      <div className="flex justify-center items-center bg-gray-50 min-h-screen">
        <div className="w-full max-w-md">
          <button
            onClick={() => setMode(null)}
            className="mb-4 text-gray-500 text-sm hover:underline"
          >
            ← Back
          </button>
          <h1 className="mb-6 font-bold text-green-700 text-2xl text-center">
            🏔️ SajhaSamasya
          </h1>
          <p className="mb-4 text-gray-500 text-sm text-center">
            Sign in as a Citizen
          </p>
          <SignIn path="/sign-in" signUpUrl="/sign-up" />
        </div>
      </div>
    );
  }

  // Default: role chooser
  return (
    <div className="flex justify-center items-center bg-gray-50 px-4 min-h-screen">
      <div className="w-full max-w-sm">
        <h1 className="mb-2 font-bold text-2xl text-center">🏔️ SajhaSamasya</h1>
        <p className="mb-8 text-gray-500 text-sm text-center">
          How would you like to sign in?
        </p>

        <div className="flex flex-col gap-4">
          {/* Citizen */}
          <button
            onClick={() => setMode("citizen")}
            className="flex items-center gap-4 bg-white hover:bg-green-50 p-5 border-2 border-gray-200 hover:border-green-500 rounded-xl w-full text-left transition"
          >
            <div className="flex justify-center items-center bg-green-100 rounded-full w-12 h-12">
              <Users className="w-6 h-6 text-green-700" />
            </div>
            <div>
              <p className="font-semibold text-gray-800">Citizen</p>
              <p className="text-gray-500 text-xs">
                Report issues in your community
              </p>
            </div>
          </button>

          {/* Authority */}
          <Link
            href="/authority/sign-in"
            className="flex items-center gap-4 bg-white hover:bg-blue-50 p-5 border-2 border-gray-200 hover:border-blue-500 rounded-xl w-full text-left transition"
          >
            <div className="flex justify-center items-center bg-blue-100 rounded-full w-12 h-12">
              <Shield className="w-6 h-6 text-blue-700" />
            </div>
            <div>
              <p className="font-semibold text-gray-800">Authority</p>
              <p className="text-gray-500 text-xs">
                Manage &amp; respond to civic issues
              </p>
            </div>
          </Link>
        </div>

        <p className="mt-6 text-gray-400 text-xs text-center">
          Don&apos;t have an account?{" "}
          <Link href="/sign-up" className="text-green-600 hover:underline">
            Sign Up
          </Link>
        </p>
      </div>
    </div>
  );
}
