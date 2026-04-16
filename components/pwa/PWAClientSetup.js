"use client";

import { useEffect } from "react";

function isStandaloneDisplayMode() {
  if (typeof window === "undefined") {
    return false;
  }

  const mediaStandalone = window.matchMedia?.("(display-mode: standalone)")?.matches;
  const iosStandalone = window.navigator.standalone === true;
  return Boolean(mediaStandalone || iosStandalone);
}

export default function PWAClientSetup() {
  useEffect(() => {
    if (typeof window === "undefined") {
      return;
    }

    if ("serviceWorker" in navigator) {
      window.addEventListener("load", () => {
        navigator.serviceWorker.register("/sw.js").catch(() => {});
      });
    }

    const applyStandaloneClass = () => {
      const standalone = isStandaloneDisplayMode();
      document.documentElement.classList.toggle("pwa-standalone", standalone);
      document.body.classList.toggle("pwa-standalone", standalone);
    };

    applyStandaloneClass();
    window.addEventListener("visibilitychange", applyStandaloneClass);
    window.addEventListener("focus", applyStandaloneClass);

    return () => {
      window.removeEventListener("visibilitychange", applyStandaloneClass);
      window.removeEventListener("focus", applyStandaloneClass);
    };
  }, []);

  return null;
}

