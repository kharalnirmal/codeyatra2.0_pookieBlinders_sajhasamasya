"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Home, Plus, User, LayoutDashboard, Rss, Globe } from "lucide-react";
import { useUser } from "@clerk/nextjs";
import Image from "next/image";

export default function Navbar() {
  const [lang, setLang] = useState("en");
  const [langFlip, setLangFlip] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [logoHov, setLogoHov] = useState(false);
  const pathname = usePathname();
  const { user, isSignedIn } = useUser();

  const isAuthority = user?.publicMetadata?.role === "authority";
  const accent = isAuthority ? "#6366f1" : "#22c55e";
  const accentDark = isAuthority ? "#4338ca" : "#15803d";

  useEffect(() => {
    const fn = () => setScrolled(window.scrollY > 6);
    window.addEventListener("scroll", fn, { passive: true });
    return () => window.removeEventListener("scroll", fn);
  }, []);

  const toggleLang = () => {
    setLangFlip(true);
    setTimeout(() => {
      setLang((p) => (p === "en" ? "ne" : "en"));
      setLangFlip(false);
    }, 140);
  };

  const isActive = (href) =>
    href === "/" ? pathname === "/" : pathname.startsWith(href);

  /* All bottom-bar items unified — lang toggle is just another "tab" */
  const citizenItems = [
    { href: "/", Icon: Home, label: lang === "en" ? "Home" : "गृह" },
    {
      href: "/create-post",
      Icon: Plus,
      label: lang === "en" ? "Report" : "रिपोर्ट",
      isFab: true,
    },
    {
      href: "/profile",
      Icon: User,
      label: lang === "en" ? "Profile" : "प्रोफाइल",
    },
    { isLang: true, Icon: Globe, label: lang === "en" ? "NP" : "EN" },
  ];

  const authorityItems = [
    {
      href: "/authority/dashboard",
      Icon: LayoutDashboard,
      label: lang === "en" ? "Dashboard" : "ड्यास",
    },
    { href: "/", Icon: Rss, label: lang === "en" ? "Feed" : "फिड" },
    {
      href: "/profile",
      Icon: User,
      label: lang === "en" ? "Profile" : "प्रोफाइल",
    },
    { isLang: true, Icon: Globe, label: lang === "en" ? "NP" : "EN" },
  ];

  const items = isAuthority ? authorityItems : citizenItems;

  return (
    <>
      <style>{`
        @keyframes shimmerBrand {
          from { background-position:-220% center; }
          to   { background-position: 220% center; }
        }
        @keyframes logoFloat {
          0%,100% { transform:translateY(0) rotate(0deg); }
          50%      { transform:translateY(-2.5px) rotate(-4deg); }
        }
        @keyframes navup {
          from { opacity:0; transform:translateY(26px) scale(0.93); }
          to   { opacity:1; transform:translateY(0)    scale(1);    }
        }
        @keyframes dotpop {
          from { transform:translateX(-50%) scale(0); opacity:0; }
          to   { transform:translateX(-50%) scale(1); opacity:1; }
        }

        .shimmer-green {
          background: linear-gradient(110deg,#14532d 0%,#16a34a 38%,#14532d 55%,#15803d 100%);
          background-size:220% auto;
          -webkit-background-clip:text; -webkit-text-fill-color:transparent;
          background-clip:text; animation:shimmerBrand 4.5s linear infinite;
        }
        .shimmer-indigo {
          background: linear-gradient(110deg,#312e81 0%,#6366f1 38%,#312e81 55%,#4338ca 100%);
          background-size:220% auto;
          -webkit-background-clip:text; -webkit-text-fill-color:transparent;
          background-clip:text; animation:shimmerBrand 4.5s linear infinite;
        }
        .logo-float { animation:logoFloat 3.2s ease-in-out infinite; }
        .nav-bar    { animation:navup 0.55s cubic-bezier(.34,1.56,.64,1) 0.05s both; }
        .dot-pop    { animation:dotpop 0.3s cubic-bezier(.34,1.56,.64,1) both; }
      `}</style>

      {/* ══════════════════════
          TOP HEADER
      ══════════════════════ */}
      <header
        className={[
          "sticky top-0 z-50 flex items-center justify-between",
          "px-4 sm:px-6 h-14 sm:h-16 transition-all duration-400",
          scrolled
            ? "shadow-[0_4px_28px_rgba(26,92,56,0.10)] border-b border-black/5"
            : "border-b border-transparent",
        ].join(" ")}
        style={{
          background: scrolled
            ? "rgba(255,255,255,0.90)"
            : "rgba(255,255,255,0.65)",
          backdropFilter: "blur(20px) saturate(180%)",
          WebkitBackdropFilter: "blur(20px) saturate(180%)",
        }}
      >
        {/* LEFT — role badge */}
        <div className="w-20 sm:w-24 flex items-center">
          {isSignedIn && isAuthority && (
            <span
              className="flex items-center gap-1.5 px-2.5 py-1 rounded-full
                             text-[10px] font-bold tracking-wide uppercase"
              style={{
                background: "rgba(99,102,241,0.10)",
                border: "1px solid rgba(99,102,241,0.22)",
                color: "#6366f1",
              }}
            >
              <span className="w-1.5 h-1.5 rounded-full bg-indigo-500 animate-pulse" />
              Authority
            </span>
          )}
          {isSignedIn && !isAuthority && (
            <span
              className="flex items-center gap-1.5 px-2.5 py-1 rounded-full
                             text-[10px] font-bold tracking-wide uppercase"
              style={{
                background: "rgba(34,197,94,0.10)",
                border: "1px solid rgba(34,197,94,0.22)",
                color: "#15803d",
              }}
            >
              <span className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse" />
              Citizen
            </span>
          )}
        </div>

        {/* CENTER — logo + brand (absolutely centered) */}
        <Link
          href={isAuthority ? "/authority/dashboard" : "/"}
          className="absolute left-1/2 -translate-x-1/2 flex items-center gap-2.5"
          onMouseEnter={() => setLogoHov(true)}
          onMouseLeave={() => setLogoHov(false)}
        >
          <div className="relative flex items-center justify-center w-9 h-9 shrink-0">
            <span
              style={{
                position: "absolute",
                inset: 0,
                borderRadius: "50%",
                border: "2px solid transparent",
                borderColor: logoHov
                  ? isAuthority
                    ? "rgba(99,102,241,0.55)"
                    : "rgba(74,222,128,0.55)"
                  : "transparent",
                transform: logoHov ? "scale(1.4)" : "scale(0.85)",
                transition:
                  "transform 0.45s cubic-bezier(.34,1.56,.64,1), border-color 0.35s ease",
              }}
            />
            <span
              style={{
                position: "absolute",
                inset: "-4px",
                borderRadius: "50%",
                background: logoHov
                  ? isAuthority
                    ? "radial-gradient(circle,rgba(165,180,252,0.5) 0%,transparent 70%)"
                    : "radial-gradient(circle,rgba(134,239,172,0.5) 0%,transparent 70%)"
                  : "none",
                filter: "blur(8px)",
                opacity: logoHov ? 1 : 0,
                transition: "opacity 0.4s ease",
              }}
            />
            <Image
              src="/logo.png"
              alt="SajhaSamasya"
              width={36}
              height={36}
              className={[
                "relative z-10 rounded-full border-2 shadow-sm",
                "transition-transform duration-400 ease-[cubic-bezier(.34,1.56,.64,1)]",
                logoHov ? "logo-float scale-105" : "",
                isAuthority ? "border-indigo-100" : "border-green-100",
              ].join(" ")}
            />
          </div>
          <span
            className={`font-extrabold text-[16px] sm:text-[17px] tracking-tight leading-none
                            transition-all duration-200
                            ${langFlip ? "opacity-0 translate-y-1" : "opacity-100 translate-y-0"}`}
          >
            <span className={isAuthority ? "shimmer-indigo" : "shimmer-green"}>
              {lang === "en" ? "SajhaSamasya" : "साझा समस्या"}
            </span>
          </span>
        </Link>

        {/* RIGHT — profile */}
        <div className="w-20 sm:w-24 flex justify-end">
          <Link
            href={isSignedIn ? "/profile" : "/sign-in"}
            aria-label="Profile"
            className="group relative flex items-center justify-center"
          >
            {/* Hover glow ring */}
            <span
              className="absolute rounded-full opacity-0 group-hover:opacity-100
                         transition-opacity duration-300 pointer-events-none"
              style={{
                inset: "-6px",
                background: isAuthority
                  ? "radial-gradient(circle,rgba(99,102,241,0.20) 0%,transparent 70%)"
                  : "radial-gradient(circle,rgba(34,197,94,0.20) 0%,transparent 70%)",
                filter: "blur(8px)",
              }}
            />

            {isSignedIn && user?.imageUrl ? (
              /* Avatar image — accent border always visible */
              <div
                className="relative z-10 rounded-full p-0.5
                           transition-all duration-300 ease-[cubic-bezier(.34,1.56,.64,1)]
                           group-hover:scale-110"
                style={{
                  background: `linear-gradient(135deg, ${accent}, ${accentDark})`,
                  boxShadow: `0 2px 10px ${accent}40`,
                }}
              >
                <div
                  className="rounded-full overflow-hidden"
                  style={{ width: 30, height: 30 }}
                >
                  <Image
                    src={user.imageUrl}
                    alt="Profile"
                    width={30}
                    height={30}
                    className="rounded-full object-cover block"
                  />
                </div>
              </div>
            ) : (
              /* Fallback icon — same w-11 h-11 bubble as bottom bar items */
              <span
                className="relative z-10 flex items-center justify-center w-9 h-9 rounded-xl
                           transition-all duration-300 ease-[cubic-bezier(.34,1.56,.64,1)]
                           group-hover:scale-110"
                style={{
                  background: isAuthority
                    ? "rgba(99,102,241,0.09)"
                    : "rgba(34,197,94,0.09)",
                  border: `1.5px solid ${
                    isAuthority
                      ? "rgba(99,102,241,0.28)"
                      : "rgba(34,197,94,0.28)"
                  }`,
                  boxShadow: `0 2px 8px ${accent}25`,
                  color: isAuthority ? "#4338ca" : "#15803d",
                }}
              >
                <User size={17} strokeWidth={1.9} />
              </span>
            )}
          </Link>
        </div>
      </header>

      {/* ══════════════════════
          BOTTOM FLOATING BAR
      ══════════════════════ */}
      <div
        className="fixed bottom-0 left-0 right-0 z-50 flex justify-center
                      px-4 pb-[max(env(safe-area-inset-bottom),14px)]
                      pointer-events-none"
      >
        <nav
          className="nav-bar pointer-events-auto flex items-center
                     w-full max-w-95 p-2 gap-1"
          style={{
            background: "rgba(255,255,255,0.90)",
            backdropFilter: "blur(24px) saturate(200%)",
            WebkitBackdropFilter: "blur(24px) saturate(200%)",
            border: "1.5px solid rgba(255,255,255,0.92)",
            borderRadius: "28px",
            boxShadow:
              "0 8px 32px rgba(26,92,56,0.12), 0 2px 8px rgba(26,92,56,0.06), inset 0 1px 0 rgba(255,255,255,0.95)",
          }}
          aria-label="Main navigation"
        >
          {items.map((item, idx) => {
            const { href, Icon, label, isFab, isLang } = item;
            const active = !isLang && !isFab && isActive(href);

            /* ────── FAB (center) ────── */
            if (isFab) {
              return (
                <Link
                  key="fab"
                  href={href}
                  aria-label={label}
                  className="group relative flex-1 flex flex-col items-center justify-center gap-1
                             py-1.5 rounded-2xl
                             active:scale-95
                             transition-all duration-300 ease-[cubic-bezier(.34,1.56,.64,1)]"
                >
                  {/* Elevated pill for FAB */}
                  <span
                    className="flex items-center justify-center w-11 h-11 rounded-2xl
                               group-hover:-translate-y-1 group-hover:scale-105
                               group-active:scale-95 group-active:translate-y-0
                               transition-all duration-300 ease-[cubic-bezier(.34,1.56,.64,1)]
                               relative overflow-hidden"
                    style={{
                      background: `linear-gradient(135deg, ${accent} 0%, ${accentDark} 100%)`,
                      boxShadow: `0 6px 20px ${accent}55, inset 0 1px 0 rgba(255,255,255,0.25)`,
                    }}
                  >
                    {/* shine */}
                    <span
                      className="absolute inset-0 pointer-events-none"
                      style={{
                        background:
                          "linear-gradient(115deg,rgba(255,255,255,0.22) 0%,transparent 55%)",
                      }}
                    />
                    <Icon
                      size={20}
                      strokeWidth={2.4}
                      color="white"
                      className="relative z-10 group-hover:rotate-90
                                 transition-transform duration-350 ease-[cubic-bezier(.34,1.56,.64,1)]"
                    />
                  </span>
                  <span
                    className="text-[10px] font-semibold tracking-wide leading-none"
                    style={{ color: accent }}
                  >
                    {label}
                  </span>
                </Link>
              );
            }

            /* ────── Language toggle ────── */
            if (isLang) {
              return (
                <button
                  key="lang"
                  onClick={toggleLang}
                  aria-label="Switch language"
                  className="group flex-1 flex flex-col items-center justify-center gap-1
                             py-1.5 rounded-2xl border-none cursor-pointer bg-transparent
                             hover:-translate-y-0.5 active:scale-95
                             transition-all duration-250 ease-[cubic-bezier(.34,1.56,.64,1)]"
                >
                  <span
                    className="flex items-center justify-center w-11 h-11 rounded-2xl
                               transition-all duration-250"
                    style={{
                      background: isAuthority
                        ? "rgba(99,102,241,0.08)"
                        : "rgba(34,197,94,0.08)",
                      border: isAuthority
                        ? "1.5px solid rgba(99,102,241,0.18)"
                        : "1.5px solid rgba(34,197,94,0.18)",
                    }}
                  >
                    <Icon
                      size={20}
                      strokeWidth={1.8}
                      style={{ color: isAuthority ? "#6366f1" : "#16a34a" }}
                      className="group-hover:rotate-20 transition-transform duration-300"
                    />
                  </span>
                  <span
                    className={`text-[10px] font-semibold tracking-wide leading-none
                                transition-all duration-150
                                ${langFlip ? "opacity-0 -translate-y-1" : "opacity-100 translate-y-0"}`}
                    style={{ color: isAuthority ? "#6366f1" : "#16a34a" }}
                  >
                    {label}
                  </span>
                </button>
              );
            }

            /* ────── Regular nav tab ────── */
            return (
              <Link
                key={href}
                href={href}
                aria-label={label}
                className={[
                  "group relative flex-1 flex flex-col items-center justify-center gap-1",
                  "py-1.5 rounded-2xl",
                  "hover:-translate-y-0.5 active:scale-95",
                  "transition-all duration-250 ease-[cubic-bezier(.34,1.56,.64,1)]",
                ].join(" ")}
              >
                {/* Icon bubble — same 44×44 as FAB and lang */}
                <span
                  className="flex items-center justify-center w-11 h-11 rounded-2xl
                             transition-all duration-250"
                  style={{
                    background: active
                      ? isAuthority
                        ? "rgba(99,102,241,0.12)"
                        : "rgba(34,197,94,0.12)"
                      : isAuthority
                        ? "rgba(99,102,241,0.08)"
                        : "rgba(34,197,94,0.08)",
                    border: active
                      ? isAuthority
                        ? "1.5px solid rgba(99,102,241,0.25)"
                        : "1.5px solid rgba(34,197,94,0.25)"
                      : isAuthority
                        ? "1.5px solid rgba(99,102,241,0.18)"
                        : "1.5px solid rgba(34,197,94,0.18)",
                  }}
                >
                  <Icon
                    size={20}
                    strokeWidth={active ? 2.2 : 1.8}
                    style={{
                      color: active
                        ? isAuthority
                          ? "#4338ca"
                          : "#15803d"
                        : isAuthority
                          ? "#6366f1"
                          : "#16a34a",
                    }}
                  />
                </span>

                {/* Label */}
                <span
                  className="text-[10px] font-semibold tracking-wide leading-none transition-colors duration-200"
                  style={{
                    color: active
                      ? isAuthority
                        ? "#4338ca"
                        : "#15803d"
                      : isAuthority
                        ? "#6366f1"
                        : "#16a34a",
                  }}
                >
                  {label}
                </span>

                {/* Active indicator dot */}
                {active && (
                  <span
                    className="dot-pop absolute -bottom-0.5 left-1/2 w-1 h-1 rounded-full"
                    style={{
                      transform: "translateX(-50%)",
                      background: isAuthority ? "#6366f1" : "#22c55e",
                    }}
                  />
                )}
              </Link>
            );
          })}
        </nav>
      </div>
    </>
  );
}
