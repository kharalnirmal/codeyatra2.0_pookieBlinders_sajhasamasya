"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Home, PlusCircle, User, LayoutDashboard, Rss } from "lucide-react";
import { useUser } from "@clerk/nextjs";
import Image from "next/image";

export default function Navbar() {
  const [lang, setLang] = useState("en"); // "en" or "ne"
  const { user } = useUser();
  const pathname = usePathname();

  const isAuthority = user?.publicMetadata?.role === "authority";

  const toggleLang = () => setLang((prev) => (prev === "en" ? "ne" : "en"));

  const citizenTabs = [
    {
      href: "/",
      icon: Home,
      label: lang === "en" ? "Home" : "गृह",
    },
    {
      href: "/create-post",
      icon: PlusCircle,
      label: lang === "en" ? "Post" : "पोस्ट",
      isFab: true,
    },
    {
      href: "/profile",
      icon: User,
      label: lang === "en" ? "Profile" : "प्रोफाइल",
    },
  ];

  const authorityTabs = [
    {
      href: "/authority/dashboard",
      icon: LayoutDashboard,
      label: lang === "en" ? "Dashboard" : "ड्यास",
    },
    {
      href: "/",
      icon: Rss,
      label: lang === "en" ? "Feed" : "फिड",
    },
    {
      href: "/profile",
      icon: User,
      label: lang === "en" ? "Profile" : "प्रोफाइल",
    },
  ];

  const tabs = isAuthority ? authorityTabs : citizenTabs;
  const activeColor = isAuthority ? "text-secondary" : "text-primary";
  const fabColor = "bg-primary hover:bg-red-700";

  return (
    <>
      {/* ── Top Navbar ── */}
      <header className="top-0 z-50 sticky flex justify-between items-center bg-white shadow-sm px-4 py-3 border-b">
        <Link
          href={isAuthority ? "/authority/dashboard" : "/"}
          className="flex items-center gap-2"
        >
          <Image
            src="/logo.png"
            alt="SajhaSamasya Logo"
            width={32}
            height={32}
            className="rounded-full"
          />
          <h1 className="font-bold text-primary text-lg leading-tight">
            {lang === "en" ? "SajhaSamasya" : "साझा समस्या"}
          </h1>
        </Link>

        <div className="flex items-center gap-2">
          {isAuthority && (
            <span className="bg-secondary/10 px-2 py-0.5 rounded-full font-medium text-secondary text-xs">
              Authority
            </span>
          )}
          <button
            onClick={toggleLang}
            className="bg-gray-100 hover:bg-gray-200 px-3 py-1.5 rounded-full font-medium text-gray-700 text-xs transition"
            aria-label="Toggle language"
          >
            {lang === "en" ? "नेपाली" : "English"}
          </button>
        </div>
      </header>

      {/* ── Bottom Tab Bar ── */}
      <nav className="right-0 bottom-0 left-0 z-50 fixed pb-[env(safe-area-inset-bottom,8px)] flex justify-around items-center bg-white pt-2 border-t">
        {tabs.map((tab) => {
          const isActive =
            tab.href === "/" ? pathname === "/" : pathname.startsWith(tab.href);
          const Icon = tab.icon;

          if (tab.isFab) {
            return (
              <Link
                key={tab.href}
                href={tab.href}
                className={`flex justify-center items-center ${fabColor} shadow-lg -mt-6 rounded-full w-14 h-14 text-white transition`}
                aria-label={tab.label}
              >
                <Icon className="w-8 h-8" />
              </Link>
            );
          }

          return (
            <Link
              key={tab.href}
              href={tab.href}
              className={`flex flex-col items-center gap-0.5 transition ${
                isActive
                  ? activeColor
                  : isAuthority
                    ? "text-gray-500 hover:text-secondary"
                    : "text-gray-500 hover:text-primary"
              }`}
            >
              <Icon className="w-6 h-6" />
              <span className="text-[10px]">{tab.label}</span>
            </Link>
          );
        })}
      </nav>
    </>
  );
}
