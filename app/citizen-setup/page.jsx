"use client";

import { useEffect, useState } from "react";
import { useUser } from "@clerk/nextjs";
import { useRouter } from "next/navigation";

export default function CitizenSetupPage() {
  const { user, isLoaded } = useUser();
  const router = useRouter();
  const [error, setError] = useState("");

  useEffect(() => {
    if (!isLoaded || !user) return;

    // If already has a role, just redirect
    if (user.publicMetadata?.role) {
      if (user.publicMetadata.role === "authority") {
        router.replace("/authority/dashboard");
      } else {
        router.replace("/");
      }
      return;
    }

    // Set citizen role
    fetch("/api/auth/set-citizen-role", { method: "POST" })
      .then((res) => res.json())
      .then((data) => {
        if (data.ok) {
          router.replace("/");
        } else {
          setError(data.error || "Failed to set up account");
        }
      })
      .catch(() => setError("Network error. Please try again."));
  }, [isLoaded, user, router]);

  if (!isLoaded) {
    return (
      <div className="flex flex-col justify-center items-center min-h-screen">
        <div className="mb-4 border-4 border-green-200 border-t-green-600 rounded-full w-10 h-10 animate-spin" />
        <p className="text-gray-500 text-sm">Loading...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="bg-white shadow-lg p-8 rounded-2xl w-full max-w-md text-center">
          <p className="mb-4 text-red-600">{error}</p>
          <button
            onClick={() => router.replace("/")}
            className="bg-green-600 hover:bg-green-700 px-6 py-2 rounded-lg text-white transition"
          >
            Go to Home
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col justify-center items-center min-h-screen">
      <div className="mb-4 border-4 border-green-200 border-t-green-600 rounded-full w-10 h-10 animate-spin" />
      <p className="text-gray-600 text-sm">Setting up your account...</p>
    </div>
  );
}
