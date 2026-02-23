"use client";

import { useState, useEffect, useCallback } from "react";
import Loader from "@/components/ui/Loader";

export default function AppLoader() {
  const [showLoader, setShowLoader] = useState(true);

  // After hydration, check if loader was already shown this session
  useEffect(() => {
    if (sessionStorage.getItem("appLoaderShown")) {
      setShowLoader(false);
    }
  }, []);

  const handleComplete = useCallback(() => {
    sessionStorage.setItem("appLoaderShown", "true");
    setShowLoader(false);
  }, []);

  if (!showLoader) return null;

  return <Loader onComplete={handleComplete} />;
}
