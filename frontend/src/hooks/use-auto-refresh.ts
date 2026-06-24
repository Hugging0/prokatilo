"use client";

import { useEffect, useRef } from "react";

type AutoRefreshReason = "focus" | "interval" | "online" | "visible";

interface UseAutoRefreshOptions {
  enabled?: boolean;
  intervalMs?: number;
  minDelayMs?: number;
  onRefresh: (reason: AutoRefreshReason) => Promise<void> | void;
  refreshOnEnable?: boolean;
}

type RefreshListener = (reason: AutoRefreshReason) => void;

const refreshListeners = new Set<RefreshListener>();
let detachGlobalListeners: (() => void) | null = null;

function notifyRefreshListeners(reason: AutoRefreshReason) {
  refreshListeners.forEach((listener) => listener(reason));
}

function ensureGlobalListeners() {
  if (detachGlobalListeners || typeof window === "undefined") {
    return;
  }

  const handleFocus = () => notifyRefreshListeners("focus");
  const handleOnline = () => notifyRefreshListeners("online");
  const handleVisibilityChange = () => {
    if (document.visibilityState === "visible") {
      notifyRefreshListeners("visible");
    }
  };

  window.addEventListener("focus", handleFocus);
  window.addEventListener("online", handleOnline);
  document.addEventListener("visibilitychange", handleVisibilityChange);

  detachGlobalListeners = () => {
    window.removeEventListener("focus", handleFocus);
    window.removeEventListener("online", handleOnline);
    document.removeEventListener("visibilitychange", handleVisibilityChange);
    detachGlobalListeners = null;
  };
}

function subscribeToRefreshEvents(listener: RefreshListener) {
  ensureGlobalListeners();
  refreshListeners.add(listener);

  return () => {
    refreshListeners.delete(listener);

    if (refreshListeners.size === 0 && detachGlobalListeners) {
      detachGlobalListeners();
    }
  };
}

function canRefreshNow() {
  if (typeof document !== "undefined" && document.visibilityState === "hidden") {
    return false;
  }

  return typeof navigator === "undefined" || navigator.onLine;
}

export function useAutoRefresh({
  enabled = true,
  intervalMs,
  minDelayMs = 5_000,
  onRefresh,
  refreshOnEnable = false,
}: UseAutoRefreshOptions) {
  const refreshRef = useRef(onRefresh);
  const isRunningRef = useRef(false);
  const lastRefreshAtRef = useRef(0);

  useEffect(() => {
    refreshRef.current = onRefresh;
  }, [onRefresh]);

  useEffect(() => {
    if (!enabled) {
      return;
    }

    const runRefresh = (reason: AutoRefreshReason) => {
      const now = Date.now();

      if (
        isRunningRef.current ||
        !canRefreshNow() ||
        now - lastRefreshAtRef.current < minDelayMs
      ) {
        return;
      }

      lastRefreshAtRef.current = now;
      isRunningRef.current = true;

      void Promise.resolve(refreshRef.current(reason)).finally(() => {
        isRunningRef.current = false;
      });
    };

    const unsubscribe = subscribeToRefreshEvents(runRefresh);
    const intervalId =
      intervalMs && intervalMs > 0
        ? window.setInterval(() => runRefresh("interval"), intervalMs)
        : null;

    if (refreshOnEnable) {
      runRefresh("visible");
    }

    return () => {
      unsubscribe();

      if (intervalId) {
        window.clearInterval(intervalId);
      }
    };
  }, [enabled, intervalMs, minDelayMs, refreshOnEnable]);
}
