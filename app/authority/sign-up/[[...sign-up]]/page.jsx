"use client";
import { useState } from "react";
import { SignUp } from "@clerk/nextjs";
import Link from "next/link";

export default function AuthoritySignUpPage() {
  const [step, setStep] = useState("secret");
  const [secretCode, setSecretCode] = useState("");
  const [secretError, setSecretError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSecretSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setSecretError("");
    try {
      const response = await fetch("/api/auth/verify-authority-code", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ secretCode }),
      });
      if (!response.ok) {
        const data = await response.json();
        setSecretError(data?.error || "Invalid authority code.");
        return;
      }
      // Save code so the complete-setup page can use it
      sessionStorage.setItem("authority_code", secretCode);
      setStep("signup");
    } catch {
      setSecretError("Network error. Try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex justify-center items-center bg-blue-50 px-4 min-h-screen">
      <div className="w-full max-w-md">
        <Link
          href="/authority/sign-in"
          className="inline-block mb-4 text-gray-500 text-sm hover:underline"
        >
          ← Back to Sign In
        </Link>
        <h1 className="mb-2 font-bold text-blue-700 text-2xl text-center">
          🏛️ Authority Sign Up
        </h1>
        <p className="mb-6 text-gray-500 text-sm text-center">
          SajhaSamasya — Authority Access
        </p>

        {step === "secret" && (
          <div className="bg-white shadow-lg p-8 rounded-2xl">
            <p className="mb-4 text-gray-600 text-sm text-center">
              Enter the authority access code provided by admin
            </p>
            <form onSubmit={handleSecretSubmit} className="space-y-4">
              <input
                type="password"
                placeholder="Authority Secret Code"
                value={secretCode}
                onChange={(e) => setSecretCode(e.target.value)}
                className="px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400 w-full"
                required
              />
              {secretError && (
                <p className="text-red-500 text-sm">{secretError}</p>
              )}
              <button
                type="submit"
                disabled={loading}
                className="bg-blue-600 hover:bg-blue-700 disabled:opacity-50 py-2 rounded-lg w-full text-white transition"
              >
                {loading ? "Verifying..." : "Verify Code"}
              </button>
            </form>
          </div>
        )}

        {step === "signup" && (
          <>
            <div className="bg-green-50 mb-4 px-4 py-3 border border-green-200 rounded-xl text-green-700 text-sm text-center">
              ✅ Code verified! Create your account below.
            </div>
            <SignUp
              path="/authority/sign-up"
              forceRedirectUrl="/authority/complete-setup"
              fallbackRedirectUrl="/authority/complete-setup"
              signInUrl="/authority/sign-in"
            />
          </>
        )}

        <p className="mt-4 text-gray-400 text-xs text-center">
          Already have an account?{" "}
          <Link
            href="/authority/sign-in"
            className="text-blue-600 hover:underline"
          >
            Sign In
          </Link>
        </p>
      </div>
    </div>
  );
}
