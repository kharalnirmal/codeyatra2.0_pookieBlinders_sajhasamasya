import { useEffect, useRef, useCallback } from "react";

/**
 * Polls a callback at a fixed interval, pausing when the tab is hidden.
 * @param {Function} callback - async/sync function to call on each tick
 * @param {number} intervalMs - milliseconds between ticks (default 10 000)
 * @param {boolean} enabled - pass false to pause polling
 */
export function useAutoRefresh(callback, intervalMs = 10000, enabled = true) {
  const savedCb = useRef(callback);
  useEffect(() => {
    savedCb.current = callback;
  }, [callback]);

  const tick = useCallback(() => savedCb.current(), []);

  useEffect(() => {
    if (!enabled) return;

    let id = setInterval(tick, intervalMs);

    const onVisibility = () => {
      clearInterval(id);
      if (document.visibilityState === "visible") {
        tick(); // refresh immediately when tab becomes visible
        id = setInterval(tick, intervalMs);
      }
    };

    document.addEventListener("visibilitychange", onVisibility);
    return () => {
      clearInterval(id);
      document.removeEventListener("visibilitychange", onVisibility);
    };
  }, [tick, intervalMs, enabled]);
}
