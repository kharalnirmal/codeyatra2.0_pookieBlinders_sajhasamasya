"use client";

import { useEffect, useState, useRef } from "react";
import { useUser, useClerk } from "@clerk/nextjs";
import { useRouter } from "next/navigation";
import Link from "next/link";

export default function CompleteSetupPage() {
  const { user, isLoaded } = useUser();
  const { signOut } = useClerk();
  const router = useRouter();
  const attempted = useRef(false);

  const [status, setStatus] = useState("loading"); // loading | manual | setting | success | error
  const [error, setError] = useState("");
  const [manualCode, setManualCode] = useState("");
  const [manualLoading, setManualLoading] = useState(false);

  // Auto-assign role on mount if authority_code is in sessionStorage
  useEffect(() => {
    if (!isLoaded || !user || attempted.current) return;
    attempted.current = true;

    const code = sessionStorage.getItem("authority_code");
    if (!code) {
      setStatus("manual");
      return;
    }

    setStatus("setting");
    assignRole(code);
  }, [isLoaded, user]);

  const assignRole = async (code) => {
    try {
      const res = await fetch("/api/auth/set-authority-role", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ secretCode: code, userId: user.id }),
      });

      const data = await res.json();
      if (!res.ok) {
        setError(data?.error || "Failed to set authority role");
        setStatus("error");
        return;
      }

      sessionStorage.removeItem("authority_code");
      setStatus("success");

      // Sign out so the next sign-in gets a fresh session with role
      await signOut();
      router.push("/authority/sign-in?registered=1");
    } catch {
      setError("Network error. Please try again.");
      setStatus("error");
    }
  };

  const handleManualSubmit = async (e) => {
    e.preventDefault();
    if (!user) return;
    setManualLoading(true);
    setError("");
    setStatus("setting");
    await assignRole(manualCode);
    setManualLoading(false);
  };

  if (!isLoaded) {
    return (
      <div className="flex flex-col justify-center items-center bg-blue-50 min-h-screen">
        <div className="mb-4 border-4 border-blue-200 border-t-blue-600 rounded-full w-10 h-10 animate-spin" />
        <p className="text-gray-500 text-sm">Loading...</p>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="flex justify-center items-center bg-blue-50 min-h-screen">
        <div className="bg-white shadow-lg p-8 rounded-2xl w-full max-w-md text-center">
          <p className="mb-4 text-gray-700">Please sign in first.</p>
          <Link
            href="/authority/sign-in"
            className="text-blue-600 text-sm hover:underline"
          >
            Go to Sign In
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="flex justify-center items-center bg-blue-50 px-4 min-h-screen">
      <div className="bg-white shadow-lg p-8 rounded-2xl w-full max-w-md text-center">
        <h1 className="mb-2 font-bold text-blue-700 text-2xl">
          🏛️ Setting Up Authority
        </h1>

        {status === "loading" && (
          <div className="py-8">
            <div className="mx-auto mb-4 border-4 border-blue-200 border-t-blue-600 rounded-full w-10 h-10 animate-spin" />
            <p className="text-gray-500 text-sm">Preparing...</p>
          </div>
        )}

        {status === "setting" && (
          <div className="py-8">
            <div className="mx-auto mb-4 border-4 border-blue-200 border-t-blue-600 rounded-full w-10 h-10 animate-spin" />
            <p className="text-gray-600 text-sm">
              Assigning authority role to your account...
            </p>
          </div>
        )}

        {status === "success" && (
          <div className="py-8">
            <div className="mx-auto mb-4 text-4xl">✅</div>
            <p className="font-medium text-green-700">
              Authority role assigned!
            </p>
            <p className="mt-2 text-gray-500 text-sm">
              Redirecting to sign in...
            </p>
          </div>
        )}

        {status === "error" && (
          <div className="space-y-4 py-4">
            <div className="bg-red-50 px-4 py-3 border border-red-200 rounded-xl">
              <p className="text-red-600 text-sm">{error}</p>
            </div>
            <p className="text-gray-500 text-sm">
              Enter the authority code manually:
            </p>
            <form onSubmit={handleManualSubmit} className="space-y-3">
              <input
                type="password"
                placeholder="Authority Secret Code"
                value={manualCode}
                onChange={(e) => setManualCode(e.target.value)}
                className="px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400 w-full"
                required
              />
              <button
                type="submit"
                disabled={manualLoading}
                className="bg-blue-600 hover:bg-blue-700 disabled:opacity-50 py-2 rounded-lg w-full text-white transition"
              >
                {manualLoading ? "Setting role..." : "Set Authority Role"}
              </button>
            </form>
          </div>
        )}

        {status === "manual" && (
          <div className="space-y-4 py-4">
            <p className="text-gray-500 text-sm">
              Signed in as{" "}
              <strong>
                {user.primaryEmailAddress?.emailAddress || user.fullName}
              </strong>
            </p>
            <p className="text-gray-600 text-sm">
              Enter the authority code to complete setup:
            </p>
            <form onSubmit={handleManualSubmit} className="space-y-3">
              <input
                type="password"
                placeholder="Authority Secret Code"
                value={manualCode}
                onChange={(e) => setManualCode(e.target.value)}
                className="px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400 w-full"
                required
              />
              <button
                type="submit"
                disabled={manualLoading}
                className="bg-blue-600 hover:bg-blue-700 disabled:opacity-50 py-2 rounded-lg w-full text-white transition"
              >
                {manualLoading ? "Setting role..." : "Complete Authority Setup"}
              </button>
            </form>
          </div>
        )}
      </div>
    </div>
  );
}
