"use client";
import { SignIn } from "@clerk/nextjs";
import Link from "next/link";
import { useSearchParams } from "next/navigation";

export default function AuthoritySignInPage() {
  const searchParams = useSearchParams();
  const registered = searchParams.get("registered") === "1";

  return (
    <div className="flex justify-center items-center bg-blue-50 min-h-screen">
      <div className="w-full max-w-md">
        <Link
          href="/sign-in"
          className="inline-block mb-4 text-gray-500 text-sm hover:underline"
        >
          ← Back
        </Link>
        <h1 className="mb-2 font-bold text-blue-700 text-2xl text-center">
          🏛️ Authority Portal
        </h1>
        <p className="mb-6 text-gray-500 text-sm text-center">
          SajhaSamasya — Authority Access
        </p>

        {registered && (
          <div className="bg-green-50 mb-4 px-4 py-3 border border-green-200 rounded-xl text-green-700 text-sm text-center">
            ✅ Account created! Sign in to access your dashboard.
          </div>
        )}

        <SignIn
          path="/authority/sign-in"
          forceRedirectUrl="/authority/dashboard"
          fallbackRedirectUrl="/authority/dashboard"
          signUpUrl="/authority/sign-up"
        />

        <div className="space-y-1 mt-4 text-gray-400 text-xs text-center">
          <p>
            Don&apos;t have an authority account?{" "}
            <Link
              href="/authority/sign-up"
              className="text-blue-600 hover:underline"
            >
              Sign Up
            </Link>
          </p>
          <p>
            Already signed in but showing as citizen?{" "}
            <Link
              href="/authority/upgrade"
              className="text-blue-600 hover:underline"
            >
              Fix Role
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
