"use client";

import { useState } from "react";
import Link from "next/link";
import { Home, PlusCircle, User } from "lucide-react";
import { useUser } from "@clerk/nextjs";

export default function Navbar() {
  const [lang, setLang] = useState("en"); // "en" or "ne"
  const { isSignedIn } = useUser();

  const toggleLang = () => setLang((prev) => (prev === "en" ? "ne" : "en"));

  return (
    <>
      {/* ── Top Navbar ── */}
      <header className="top-0 z-50 sticky flex justify-between items-center bg-white shadow-sm px-4 py-3 border-b">
        <Link href="/" className="flex items-center gap-2">
          <span className="text-xl">🏔️</span>
          <h1 className="font-bold text-green-700 text-lg leading-tight">
            {lang === "en" ? "SajhaSamasya" : "साझा समस्या"}
          </h1>
        </Link>

        <button
          onClick={toggleLang}
          className="bg-gray-100 hover:bg-gray-200 px-3 py-1.5 rounded-full font-medium text-gray-700 text-xs transition"
          aria-label="Toggle language"
        >
          {lang === "en" ? "नेपाली" : "English"}
        </button>
      </header>

      {/* ── Bottom Tab Bar (Instagram-inspired) ── */}
      <nav className="right-0 bottom-0 left-0 z-50 fixed pb-[env(safe-area-inset-bottom,8px)] flex justify-around items-center bg-white pt-2 border-t">
        {/* Home */}
        <Link
          href="/"
          className="flex flex-col items-center gap-0.5 text-gray-600 hover:text-green-700 transition"
        >
          <Home className="w-6 h-6" />
          <span className="text-[10px]">{lang === "en" ? "Home" : "गृह"}</span>
        </Link>

        {/* Create Post – big center button */}
        <Link
          href={isSignedIn ? "/create-post" : "/sign-in"}
          className="flex justify-center items-center bg-green-600 hover:bg-green-700 shadow-lg -mt-6 rounded-full w-14 h-14 text-white transition"
          aria-label="Create Post"
        >
          <PlusCircle className="w-8 h-8" />
        </Link>

        {/* Profile */}
        <Link
          href={isSignedIn ? "/profile" : "/sign-in"}
          className="flex flex-col items-center gap-0.5 text-gray-600 hover:text-green-700 transition"
        >
          <User className="w-6 h-6" />
          <span className="text-[10px]">
            {lang === "en" ? "Profile" : "प्रोफाइल"}
          </span>
        </Link>
      </nav>
    </>
  );
}
