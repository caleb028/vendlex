"use client";

import { useEffect } from "react";

export function ServiceWorkerRegister() {
  useEffect(() => {
    if (typeof window !== "undefined" && "serviceWorker" in navigator && process.env.NODE_ENV === "production") {
      navigator.serviceWorker
        .register("/sw.js")
        .then((reg) => {
          console.log("[VendLex PWA] Service Worker registered with scope:", reg.scope);
        })
        .catch((err) => {
          console.log("[VendLex PWA] Service Worker registration failed:", err);
        });
    }
  }, []);

  return null;
}
