"use client";
import { useEffect, useState, useRef } from "react";
import Image from "next/image";
import logo from "@/public/logo.png";

export default function Loader({ onComplete }) {
  const [fadeOut, setFadeOut] = useState(false);
  const onCompleteRef = useRef(onComplete);

  // Keep ref in sync without restarting the timer
  useEffect(() => {
    onCompleteRef.current = onComplete;
  }, [onComplete]);

  useEffect(() => {
    const timer = setTimeout(() => {
      setFadeOut(true);
      setTimeout(() => onCompleteRef.current?.(), 700);
    }, 2800);

    return () => clearTimeout(timer);
  }, []);

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:wght@400;600&family=Lato:wght@300;400&display=swap');

        @keyframes floatLogo {
          0%, 100% { transform: translateY(0px) scale(1); }
          50% { transform: translateY(-12px) scale(1.03); }
        }

        @keyframes ping1 {
          0% { transform: scale(0.85); opacity: 0.5; }
          100% { transform: scale(1.6); opacity: 0; }
        }

        @keyframes ping2 {
          0% { transform: scale(0.85); opacity: 0.3; }
          100% { transform: scale(2.1); opacity: 0; }
        }

        @keyframes ping3 {
          0% { transform: scale(0.85); opacity: 0.2; }
          100% { transform: scale(2.7); opacity: 0; }
        }

        @keyframes fadeSlideUp {
          0% { opacity: 0; transform: translateY(18px); }
          100% { opacity: 1; transform: translateY(0); }
        }

        @keyframes dotBounce {
          0%, 80%, 100% { transform: scaleY(0.5); opacity: 0.3; }
          40% { transform: scaleY(1.2); opacity: 1; }
        }

        .loader-logo {
          animation: floatLogo 3s ease-in-out infinite;
          filter: drop-shadow(0 20px 40px rgba(220, 30, 30, 0.18))
                  drop-shadow(0 8px 16px rgba(0,0,0,0.08));
        }

        .ping-ring {
          position: absolute;
          top: 50%; left: 50%;
          width: 200px; height: 200px;
          margin-top: -100px; margin-left: -100px;
          border-radius: 50%;
          background: radial-gradient(circle, rgba(220,30,30,0.1) 0%, transparent 70%);
        }

        .ping-ring-1 { animation: ping1 2.4s ease-out 0.2s infinite; }
        .ping-ring-2 { animation: ping2 2.4s ease-out 0.7s infinite; }
        .ping-ring-3 { animation: ping3 2.4s ease-out 1.2s infinite; }

        .brand-text   { animation: fadeSlideUp 0.9s cubic-bezier(0.22,1,0.36,1) 0.4s both; }
        .tagline-text { animation: fadeSlideUp 0.9s cubic-bezier(0.22,1,0.36,1) 0.7s both; }

        .dot {
          width: 4px;
          height: 14px;
          border-radius: 3px;
          background: #c8201a;
          animation: dotBounce 1.1s ease-in-out infinite;
        }
        .dot:nth-child(2) { animation-delay: 0.15s; }
        .dot:nth-child(3) { animation-delay: 0.30s; }
      `}</style>

      <div
        style={{
          position: "fixed",
          inset: 0,
          zIndex: 9999,
          background: "#ffffff",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          transition: "opacity 0.7s cubic-bezier(0.4,0,0.2,1)",
          opacity: fadeOut ? 0 : 1,
          pointerEvents: fadeOut ? "none" : "all",
        }}
      >
        {/* Radial ambient glow */}
        <div
          style={{
            position: "absolute",
            inset: 0,
            background:
              "radial-gradient(ellipse 70% 60% at 50% 42%, rgba(220,30,30,0.05) 0%, transparent 70%)",
            pointerEvents: "none",
          }}
        />

        {/* Logo + ripple rings */}
        <div
          style={{
            position: "relative",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            marginBottom: "28px",
          }}
        >
          <div className="ping-ring ping-ring-1" />
          <div className="ping-ring ping-ring-2" />
          <div className="ping-ring ping-ring-3" />

          <div className="loader-logo">
            <Image
              src={logo}
              alt="Sajhasamasya Logo"
              width={250}
              height={160}
              style={{ objectFit: "contain" }}
              priority
            />
          </div>
        </div>

        {/* Brand name */}
        <div
          className="brand-text"
          style={{ textAlign: "center", marginBottom: "10px" }}
        >
          <span
            className="pl-2"
            style={{
              fontFamily: "'Playfair Display', serif",
              fontSize: "clamp(20px, 5vw, 32px)",
              fontWeight: 600,
              letterSpacing: "6px",
              textTransform: "uppercase",
              color: "#66a85e",
            }}
          >
            Sajha
          </span>
          <span
            style={{
              fontFamily: "'Playfair Display', serif",
              fontSize: "clamp(20px, 5vw, 32px)",
              fontWeight: 600,
              letterSpacing: "6px",
              textTransform: "uppercase",
              color: "#c8201a",
            }}
          >
            Samasya
          </span>
        </div>

        {/* Tagline */}
        <p
          className="tagline-text"
          style={{
            fontFamily: "'Lato', sans-serif",
            fontWeight: 400,
            fontSize: "clamp(9px, 2vw, 11px)",
            letterSpacing: "4px",
            textTransform: "uppercase",
            color: "#2563eb",
            margin: "0 0 44px 0",
          }}
        >
          Connecting Nepal
        </p>

        {/* Bouncing dots only */}
        <div style={{ display: "flex", gap: "5px", alignItems: "flex-end" }}>
          <div className="dot" />
          <div className="dot" />
          <div className="dot" />
        </div>
      </div>
    </>
  );
}
