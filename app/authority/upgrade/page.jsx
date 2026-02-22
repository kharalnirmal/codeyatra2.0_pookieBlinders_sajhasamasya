"use client";

import { useState, useEffect } from "react";
import { useUser, useClerk } from "@clerk/nextjs";
import { useRouter } from "next/navigation";
import Link from "next/link";

export default function AuthorityUpgradePage() {
  const { user, isLoaded } = useUser();
  const { signOut } = useClerk();
  const router = useRouter();

  const [secretCode, setSecretCode] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [debugInfo, setDebugInfo] = useState(null);

  // Fetch current role info from server
  useEffect(() => {
    fetch("/api/auth/debug-role")
      .then((r) => r.json())
      .then((d) => setDebugInfo(d))
      .catch(() => {});
  }, []);

  const handleUpgrade = async (e) => {
    e.preventDefault();
    if (!isLoaded || !user) return;
    setLoading(true);
    setError("");

    try {
      const res = await fetch("/api/auth/set-authority-role", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          secretCode,
          userId: user.id,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        setError(data?.error || "Failed to set authority role");
        return;
      }

      // Success — sign out so fresh JWT is issued with role: "authority"
      await signOut();
      router.push("/authority/sign-in?registered=1");
    } catch {
      setError("Network error. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  if (!isLoaded) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <p className="text-gray-500 text-sm">Loading...</p>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="flex justify-center items-center bg-blue-50 min-h-screen">
        <div className="bg-white shadow-lg p-8 rounded-2xl w-full max-w-md text-center">
          <p className="mb-4 text-gray-700">
            You must be signed in to upgrade your role.
          </p>
          <Link
            href="/authority/sign-in"
            className="text-blue-600 text-sm hover:underline"
          >
            Sign In
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="flex justify-center items-center bg-blue-50 px-4 min-h-screen">
      <div className="bg-white shadow-lg p-8 rounded-2xl w-full max-w-md">
        <Link
          href="/authority/sign-in"
          className="inline-block mb-4 text-gray-500 text-sm hover:underline"
        >
          ← Back
        </Link>
        <h1 className="mb-2 font-bold text-blue-700 text-2xl text-center">
          🏛️ Upgrade to Authority
        </h1>
        <p className="mb-6 text-gray-500 text-sm text-center">
          Already have an account? Enter your authority code to upgrade.
        </p>

        {/* Current account info */}
        <div className="bg-gray-50 mb-6 px-4 py-3 border border-gray-200 rounded-xl text-sm">
          <p className="mb-1 text-gray-500 text-xs">Signed in as</p>
          <p className="font-medium text-gray-800">
            {user.fullName || user.username || "User"}
          </p>
          <p className="text-gray-500 text-xs">
            {user.primaryEmailAddress?.emailAddress}
          </p>
          {debugInfo && (
            <p className="mt-2 text-xs">
              Current role:{" "}
              <span
                className={
                  debugInfo.role === "authority"
                    ? "text-green-600 font-semibold"
                    : "text-red-500 font-semibold"
                }
              >
                {debugInfo.role ?? "none"}
              </span>
            </p>
          )}
        </div>

        <form onSubmit={handleUpgrade} className="space-y-4">
          <input
            type="password"
            placeholder="Authority Secret Code"
            value={secretCode}
            onChange={(e) => setSecretCode(e.target.value)}
            className="px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400 w-full"
            required
          />
          {error && <p className="text-red-500 text-sm">{error}</p>}
          <button
            type="submit"
            disabled={loading}
            className="bg-blue-600 hover:bg-blue-700 disabled:opacity-50 py-2 rounded-lg w-full text-white transition"
          >
            {loading ? "Upgrading..." : "Set Authority Role & Re-login"}
          </button>
        </form>

        <p className="mt-4 text-gray-400 text-xs text-center">
          Don&apos;t have an account?{" "}
          <Link
            href="/authority/sign-up"
            className="text-blue-600 hover:underline"
          >
            Sign Up
          </Link>
        </p>
      </div>
    </div>
  );
}
