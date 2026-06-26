"use client";

import { useEffect } from "react";
import { getAccessToken, isAccessTokenExpired } from "@/lib/auth";
import { handleSessionExpired } from "@/lib/session";

const CHECK_INTERVAL_MS = 60_000;

export default function SessionMonitor() {
  useEffect(() => {
    function checkExpiry() {
      const token = getAccessToken();
      if (token && isAccessTokenExpired(token)) {
        handleSessionExpired();
      }
    }

    checkExpiry();

    const intervalId = window.setInterval(checkExpiry, CHECK_INTERVAL_MS);
    const onVisible = () => {
      if (document.visibilityState === "visible") {
        checkExpiry();
      }
    };

    document.addEventListener("visibilitychange", onVisible);

    return () => {
      window.clearInterval(intervalId);
      document.removeEventListener("visibilitychange", onVisible);
    };
  }, []);

  return null;
}
