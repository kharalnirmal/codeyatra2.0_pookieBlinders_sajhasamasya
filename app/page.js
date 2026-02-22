"use client";
import { useState } from "react";
import Loader from "@/components/ui/Loader";

export default function Home() {
  const [loading, setLoading] = useState(true);

  return (
    <>
      {loading && <Loader onComplete={() => setLoading(false)} />}
      <main
        style={{
          opacity: loading ? 0 : 1,
          transition: "opacity 0.5s ease",
        }}
      >
        <h1>Home Page</h1>
      </main>
    </>
  );
} 