"use client";

import { useState, useSyncExternalStore } from "react";
import Loader from "@/components/ui/Loader";

// Read sessionStorage without subscribing — value only matters on initial mount
function getLoaderShown() {
  if (typeof window === "undefined") return false;
  return sessionStorage.getItem("loaderShown") === "1";
}

const subscribe = () => () => {}; // No-op: we never need to re-sync

/**
 * App-wide splash screen — renders in root layout.
 * Shows the animated Loader exactly ONCE per browser session,
 * then never again (survives client-side navigations).
 */
export default function AppLoader() {
  const alreadyShown = useSyncExternalStore(
    subscribe,
    getLoaderShown,
    () => false,
  );
  const [dismissed, setDismissed] = useState(false);

  if (alreadyShown || dismissed) return null;

  return (
    <Loader
      onComplete={() => {
        sessionStorage.setItem("loaderShown", "1");
        setDismissed(true);
      }}
    />
  );
}
