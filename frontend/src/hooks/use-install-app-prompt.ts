"use client";

import { useCallback, useEffect, useRef, useState } from "react";

export type InstallPlatform = "ios" | "android";

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: "accepted" | "dismissed" }>;
}

const INSTALL_PROMPT_STORAGE_KEY = "prokatilo_install_prompt_seen_v1";
const COOKIE_NOTICE_STORAGE_KEY = "prokatilo_cookie_notice_accepted";
const COOKIE_ACCEPTED_EVENT = "prokatilo:cookie-notice-accepted";

function getForcedPreviewPlatform(): InstallPlatform | null {
  const isLocalPreview = ["localhost", "127.0.0.1"].includes(
    window.location.hostname,
  );

  if (!isLocalPreview) return null;

  const requestedPlatform = new URLSearchParams(window.location.search).get(
    "install-guide",
  );

  return requestedPlatform === "ios" || requestedPlatform === "android"
    ? requestedPlatform
    : null;
}

function detectMobilePlatform(): InstallPlatform | null {
  const userAgent = navigator.userAgent.toLowerCase();
  const isTouchMac =
    navigator.platform === "MacIntel" && navigator.maxTouchPoints > 1;

  if (/iphone|ipad|ipod/.test(userAgent) || isTouchMac) return "ios";
  if (userAgent.includes("android")) return "android";

  return null;
}

function isRunningStandalone() {
  const navigatorWithStandalone = navigator as Navigator & {
    standalone?: boolean;
  };

  return (
    window.matchMedia("(display-mode: standalone)").matches ||
    navigatorWithStandalone.standalone === true
  );
}

export function useInstallAppPrompt() {
  const [isOpen, setIsOpen] = useState(false);
  const [platform, setPlatform] = useState<InstallPlatform | null>(null);
  const [canInstallDirectly, setCanInstallDirectly] = useState(false);
  const deferredPromptRef = useRef<BeforeInstallPromptEvent | null>(null);
  const isPreviewRef = useRef(false);

  useEffect(() => {
    const forcedPlatform = getForcedPreviewPlatform();
    const detectedPlatform = forcedPlatform ?? detectMobilePlatform();
    const isPreview = forcedPlatform !== null;
    let openTimerId: number | null = null;

    isPreviewRef.current = isPreview;

    const shouldOfferInstall = () =>
      Boolean(detectedPlatform) &&
      !isRunningStandalone() &&
      (isPreview || localStorage.getItem(INSTALL_PROMPT_STORAGE_KEY) !== "true");

    const openPrompt = () => {
      if (!shouldOfferInstall()) return;

      openTimerId = window.setTimeout(() => {
        setPlatform(detectedPlatform);
        setIsOpen(true);
      }, 500);
    };

    const openAfterCookieNotice = () => {
      if (
        isPreview ||
        localStorage.getItem(COOKIE_NOTICE_STORAGE_KEY) === "true"
      ) {
        openPrompt();
      }
    };

    const handleBeforeInstallPrompt = (event: Event) => {
      event.preventDefault();
      deferredPromptRef.current = event as BeforeInstallPromptEvent;
      setCanInstallDirectly(true);
    };

    const handleAppInstalled = () => {
      localStorage.setItem(INSTALL_PROMPT_STORAGE_KEY, "true");
      deferredPromptRef.current = null;
      setCanInstallDirectly(false);
      setIsOpen(false);
    };

    window.addEventListener("beforeinstallprompt", handleBeforeInstallPrompt);
    window.addEventListener("appinstalled", handleAppInstalled);
    window.addEventListener(COOKIE_ACCEPTED_EVENT, openPrompt);
    openAfterCookieNotice();

    return () => {
      if (openTimerId !== null) window.clearTimeout(openTimerId);
      window.removeEventListener(
        "beforeinstallprompt",
        handleBeforeInstallPrompt,
      );
      window.removeEventListener("appinstalled", handleAppInstalled);
      window.removeEventListener(COOKIE_ACCEPTED_EVENT, openPrompt);
    };
  }, []);

  const dismiss = useCallback(() => {
    if (!isPreviewRef.current) {
      localStorage.setItem(INSTALL_PROMPT_STORAGE_KEY, "true");
    }

    setIsOpen(false);
  }, []);

  const install = useCallback(async () => {
    const deferredPrompt = deferredPromptRef.current;

    if (!deferredPrompt) return false;

    await deferredPrompt.prompt();
    const choice = await deferredPrompt.userChoice;

    deferredPromptRef.current = null;
    setCanInstallDirectly(false);

    if (choice.outcome === "accepted") {
      localStorage.setItem(INSTALL_PROMPT_STORAGE_KEY, "true");
      setIsOpen(false);
      return true;
    }

    return false;
  }, []);

  return {
    canInstallDirectly,
    dismiss,
    install,
    isOpen,
    platform,
  };
}
