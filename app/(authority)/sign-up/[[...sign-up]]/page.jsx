"use client";
import { useState } from "react";
import { useSignUp } from "@clerk/nextjs";
import { useRouter } from "next/navigation";

export default function AuthoritySignUpPage() {
  const { isLoaded, signUp, setActive } = useSignUp();
  const router = useRouter();

  const [step, setStep] = useState("secret"); // secret → details → verify
  const [secretCode, setSecretCode] = useState("");
  const [secretError, setSecretError] = useState("");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [otp, setOtp] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  // Step 1: Verify secret code
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

      setStep("details");
    } finally {
      setLoading(false);
    }
  };

  // Step 2: Create account
  const handleSignUp = async (e) => {
    e.preventDefault();
    if (!isLoaded) return;
    setLoading(true);
    setError("");
    try {
      await signUp.create({
        firstName: name,
        emailAddress: email,
        password,
      });
      await signUp.prepareEmailAddressVerification({ strategy: "email_code" });
      setStep("verify");
    } catch (err) {
      setError(err.errors?.[0]?.message || "Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  // Step 3: Verify OTP then set role
  const handleVerify = async (e) => {
    e.preventDefault();
    if (!isLoaded) return;
    setLoading(true);
    try {
      const result = await signUp.attemptEmailAddressVerification({
        code: otp,
      });
      if (result.status === "complete") {
        await setActive({ session: result.createdSessionId });

        const roleResponse = await fetch("/api/auth/set-authority-role", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ secretCode }),
        });

        if (!roleResponse.ok) {
          const roleData = await roleResponse.json();
          throw new Error(roleData?.error || "Failed to assign authority role");
        }

        router.push("/authority/dashboard");
      }
    } catch (err) {
      setError(err.errors?.[0]?.message || "Invalid OTP");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex justify-center items-center bg-blue-50 min-h-screen">
      <div className="bg-white shadow-lg p-8 rounded-2xl w-full max-w-md">
        <h1 className="mb-2 font-bold text-blue-700 text-2xl text-center">
          🏛️ Authority Sign Up
        </h1>
        <p className="mb-6 text-gray-500 text-sm text-center">
          SajhaSamasaya — Authority Access
        </p>

        {/* Step 1: Secret Code */}
        {step === "secret" && (
          <form onSubmit={handleSecretSubmit} className="space-y-4">
            <p className="text-gray-600 text-sm text-center">
              Enter the authority access code provided by admin
            </p>
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
              className="bg-blue-600 hover:bg-blue-700 py-2 rounded-lg w-full text-white transition"
            >
              {loading ? "Verifying..." : "Verify Code"}
            </button>
          </form>
        )}

        {/* Step 2: Account Details */}
        {step === "details" && (
          <form onSubmit={handleSignUp} className="space-y-4">
            <div className="bg-green-50 px-3 py-2 rounded-lg text-green-700 text-sm">
              ✅ Code verified! Create your authority account.
            </div>
            <input
              type="text"
              placeholder="Full Name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400 w-full"
              required
            />
            <input
              type="email"
              placeholder="Official Email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400 w-full"
              required
            />
            <input
              type="password"
              placeholder="Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400 w-full"
              required
            />
            {error && <p className="text-red-500 text-sm">{error}</p>}
            <button
              type="submit"
              disabled={loading}
              className="bg-blue-600 hover:bg-blue-700 disabled:opacity-50 py-2 rounded-lg w-full text-white transition"
            >
              {loading ? "Creating Account..." : "Create Authority Account"}
            </button>
          </form>
        )}

        {/* Step 3: OTP Verification */}
        {step === "verify" && (
          <form onSubmit={handleVerify} className="space-y-4">
            <p className="text-gray-600 text-sm text-center">
              Enter the OTP sent to <strong>{email}</strong>
            </p>
            <input
              type="text"
              placeholder="Enter OTP"
              value={otp}
              onChange={(e) => setOtp(e.target.value)}
              className="px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400 w-full text-2xl text-center tracking-widest"
              required
            />
            {error && <p className="text-red-500 text-sm">{error}</p>}
            <button
              type="submit"
              disabled={loading}
              className="bg-blue-600 hover:bg-blue-700 disabled:opacity-50 py-2 rounded-lg w-full text-white transition"
            >
              {loading ? "Verifying..." : "Verify & Complete"}
            </button>
          </form>
        )}

        <p className="mt-4 text-gray-500 text-sm text-center">
          Already have an account?{" "}
          <a
            href="/authority/sign-in"
            className="text-blue-600 hover:underline"
          >
            Sign In
          </a>
        </p>
      </div>
    </div>
  );
}
