"use client";

import React, { useState, useEffect } from "react";
import {
  Smartphone,
  X,
  CheckCircle2,
  ShieldCheck,
  Sparkles,
  ChevronDown,
  ChevronUp,
  Share2,
  MoreVertical,
  PlusSquare,
  Compass,
  ArrowRight,
  Download,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

type BrowserType = "chrome_android" | "safari_ios" | "samsung_internet" | "generic";

/**
 * Strict device detection: returns true ONLY for mobile phones and tablets.
 * PC desktops and laptops (Windows, macOS, Linux, ChromeOS) are strictly excluded.
 */
function isMobileOrTablet(): boolean {
  if (typeof window === "undefined" || typeof navigator === "undefined") return false;

  const ua = navigator.userAgent || navigator.vendor || (window as any).opera || "";

  // 1. Explicit Desktop / Laptop PC exclusions:
  // Windows Desktop or Laptop PC (Windows NT)
  const isWindows = /Windows NT/i.test(ua);
  if (isWindows && !/Windows Phone/i.test(ua)) {
    return false;
  }

  // macOS Desktop or Laptop PC (Macintosh)
  // iPadOS 13+ sends Macintosh in userAgent, but has multi-touch screen (> 1 touch points)
  const isMac = /Macintosh/i.test(ua);
  const isIPadOS = isMac && typeof navigator.maxTouchPoints === "number" && navigator.maxTouchPoints > 1;
  if (isMac && !isIPadOS) {
    return false;
  }

  // Linux Desktop (Linux or X11, without Android)
  const isLinuxDesktop = /Linux|X11/i.test(ua) && !/Android/i.test(ua);
  if (isLinuxDesktop) {
    return false;
  }

  // ChromeOS Desktop
  if (/CrOS/i.test(ua) && !/Mobile|Tablet/i.test(ua)) {
    return false;
  }

  // Navigator userAgentData mobile hint (Chrome, Edge, Samsung Internet, Opera)
  const uaData = (navigator as any).userAgentData;
  if (uaData && typeof uaData.mobile === "boolean") {
    if (!uaData.mobile && !isIPadOS && !/Android|Tablet|iPad/i.test(ua)) {
      return false;
    }
  }

  // 2. Positive Mobile Phone and Tablet validation:
  const isAndroid = /Android/i.test(ua);
  const isIOS = /iPhone|iPod|iPad/i.test(ua) || isIPadOS;
  const isOtherMobileOrTablet = /Mobile|Tablet|Silk|Kindle|BlackBerry|Opera Mini|IEMobile/i.test(ua);

  return isAndroid || isIOS || isOtherMobileOrTablet;
}

export function MobileAppPrompt() {
  const [isMobileDevice, setIsMobileDevice] = useState(false);
  const [isAlreadyInstalled, setIsAlreadyInstalled] = useState(false);
  const [modalOpen, setModalOpen] = useState(false);
  const [bannerVisible, setBannerVisible] = useState(false);
  const [showInstructions, setShowInstructions] = useState(false);
  const [browserType, setBrowserType] = useState<BrowserType>("chrome_android");
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);

  useEffect(() => {
    if (typeof window === "undefined") return;

    // 1. Strict device check: only mobile phones and tablets allowed (never PC)
    if (!isMobileOrTablet()) {
      setIsMobileDevice(false);
      return;
    }

    // 2. Check if running in standalone mode (already actively inside installed WebAPK / PWA)
    const isStandalone =
      window.matchMedia("(display-mode: standalone)").matches ||
      (navigator as any).standalone === true ||
      document.referrer.startsWith("android-app://");

    if (isStandalone) {
      setIsAlreadyInstalled(true);
      return; // Do NOT show prompt if actively running inside standalone app
    } else {
      setIsAlreadyInstalled(false);
    }

    // 3. Device confirmed as mobile phone or tablet
    setIsMobileDevice(true);

    const ua = navigator.userAgent || navigator.vendor || (window as any).opera || "";
    const isMac = /Macintosh/i.test(ua);
    const isIPadOS = isMac && typeof navigator.maxTouchPoints === "number" && navigator.maxTouchPoints > 1;
    const isIOS = /iPad|iPhone|iPod/i.test(ua) || isIPadOS;
    const isSamsung = /SamsungBrowser/i.test(ua);
    const isAndroid = /Android/i.test(ua);

    if (isIOS) {
      setBrowserType("safari_ios");
    } else if (isSamsung) {
      setBrowserType("samsung_internet");
    } else if (isAndroid) {
      setBrowserType("chrome_android");
    } else {
      setBrowserType("generic");
    }

    const sessionDismissed = sessionStorage.getItem("vendlex_prompt_dismissed") === "true";
    if (!sessionDismissed) {
      const timer = setTimeout(() => {
        setModalOpen(true);
        setBannerVisible(true);
      }, 1500);

      return () => clearTimeout(timer);
    } else {
      setBannerVisible(true);
    }

    // 3. Check for early captured prompt or listen for event
    if ((window as any).__vendlex_deferred_prompt) {
      setDeferredPrompt((window as any).__vendlex_deferred_prompt);
    }

    const handlePromptReady = () => {
      if ((window as any).__vendlex_deferred_prompt) {
        setDeferredPrompt((window as any).__vendlex_deferred_prompt);
      }
    };

    const handleBeforeInstallPrompt = (e: Event) => {
      e.preventDefault();
      (window as any).__vendlex_deferred_prompt = e;
      setDeferredPrompt(e);
    };

    window.addEventListener("beforeinstallprompt", handleBeforeInstallPrompt);
    window.addEventListener("vendlex:pwa-ready", handlePromptReady);

    // 4. Listen for native appinstalled event
    const handleAppInstalled = () => {
      localStorage.setItem("vendlex_app_installed", "true");
      setIsAlreadyInstalled(true);
      setModalOpen(false);
      setBannerVisible(false);
    };

    window.addEventListener("appinstalled", handleAppInstalled);

    return () => {
      window.removeEventListener("beforeinstallprompt", handleBeforeInstallPrompt);
      window.removeEventListener("vendlex:pwa-ready", handlePromptReady);
      window.removeEventListener("appinstalled", handleAppInstalled);
    };
  }, []);

  const handleInstallClick = async () => {
    const promptEvent = deferredPrompt || (typeof window !== "undefined" ? (window as any).__vendlex_deferred_prompt : null);

    if (promptEvent) {
      try {
        await promptEvent.prompt();
        const { outcome } = await promptEvent.userChoice;
        if (outcome === "accepted") {
          localStorage.setItem("vendlex_app_installed", "true");
          setIsAlreadyInstalled(true);
          setModalOpen(false);
          setBannerVisible(false);
        }
        setDeferredPrompt(null);
        if (typeof window !== "undefined") {
          (window as any).__vendlex_deferred_prompt = null;
        }
        return;
      } catch (err) {
        console.warn("[VendLex Install] Prompt error:", err);
      }
    }

    // If deferredPrompt is unavailable (iOS Safari, Samsung Internet, or browser policy), show interactive in-browser instructions
    setShowInstructions(true);
  };

  const handleDismissModal = () => {
    setModalOpen(false);
    sessionStorage.setItem("vendlex_prompt_dismissed", "true");
  };

  const handleMarkAsAlreadyInstalled = () => {
    localStorage.setItem("vendlex_app_installed", "true");
    setIsAlreadyInstalled(true);
    setModalOpen(false);
    setBannerVisible(false);
  };

  // If already installed or not on mobile, do not render
  if (isAlreadyInstalled || !isMobileDevice) return null;

  return (
    <>
      {/* 1. Sleek Mobile Top Banner */}
      <AnimatePresence>
        {bannerVisible && !modalOpen && (
          <motion.div
            initial={{ y: -60, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: -60, opacity: 0 }}
            className="sticky top-0 z-50 bg-gradient-to-r from-brand-emerald-dark via-brand-emerald to-brand-charcoal text-white px-3 py-2 shadow-md flex items-center justify-between gap-2 border-b border-white/10"
          >
            <div className="flex items-center gap-2.5 min-w-0">
              <div className="w-8 h-8 rounded-xl bg-white p-0.5 shrink-0 shadow-xs flex items-center justify-center overflow-hidden">
                <img src="/logo/vendlex-icon.png" alt="VendLex App" className="w-full h-full object-contain rounded-lg" />
              </div>
              <div className="min-w-0">
                <p className="text-xs font-bold text-white truncate flex items-center gap-1.5">
                  <span>VendLex App</span>
                  <span className="text-[9px] bg-amber-400 text-brand-charcoal px-1.5 py-0.2 rounded-sm font-black">
                    FREE
                  </span>
                </p>
                <p className="text-[10px] text-emerald-100 truncate">1-Tap M-Pesa &amp; Instant Live Delivery Alerts</p>
              </div>
            </div>

            <div className="flex items-center gap-1.5 shrink-0">
              <button
                onClick={() => setModalOpen(true)}
                className="bg-brand-gold text-brand-charcoal font-black text-xs px-3 py-1.5 rounded-lg flex items-center gap-1 shadow-sm active:scale-95 transition-transform"
              >
                <Smartphone className="w-3.5 h-3.5" />
                <span>Get App</span>
              </button>
              <button
                onClick={() => setBannerVisible(false)}
                className="p-1 text-white/70 hover:text-white"
                aria-label="Close banner"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* 2. Optional Slide-Up App Install Modal */}
      <AnimatePresence>
        {modalOpen && (
          <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 bg-black/60 backdrop-blur-xs">
            <motion.div
              initial={{ y: "100%", opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: "100%", opacity: 0 }}
              transition={{ type: "spring", damping: 25, stiffness: 300 }}
              className="w-full max-w-md bg-white dark:bg-brand-dark-card border-t sm:border border-border dark:border-brand-dark-border rounded-t-3xl sm:rounded-3xl p-6 shadow-2xl space-y-5 max-h-[90vh] overflow-y-auto"
            >
              {/* Header with Cancel / Close */}
              <div className="flex items-center justify-between pb-1">
                <div className="flex items-center gap-2">
                  <span className="px-2.5 py-0.5 rounded-full bg-emerald-100 dark:bg-emerald-950/60 text-brand-emerald text-[10px] font-black uppercase tracking-wider flex items-center gap-1">
                    <Sparkles className="w-3 h-3" />
                    <span>Official Mobile App</span>
                  </span>
                  <span className="text-[10px] text-muted-foreground">Optional Install</span>
                </div>
                <button
                  onClick={handleDismissModal}
                  className="p-1.5 rounded-full bg-muted text-muted-foreground hover:text-foreground transition-colors"
                  aria-label="Cancel download"
                  title="Cancel & Continue in Browser"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              {/* App Presentation Header */}
              <div className="flex items-center gap-4">
                <div className="w-16 h-16 rounded-2xl bg-white p-1 border-2 border-brand-emerald/30 shadow-md shrink-0 flex items-center justify-center overflow-hidden">
                  <img src="/logo/vendlex-icon.png" alt="VendLex" className="w-full h-full object-contain rounded-xl" />
                </div>
                <div className="space-y-1">
                  <h3 className="text-lg font-black text-foreground leading-tight">
                    Add VendLex to Your Phone
                  </h3>
                  <p className="text-xs text-muted-foreground">
                    Instant 1-tap Lipa na M-Pesa STK, real-time delivery alerts, and offline access.
                  </p>
                  <div className="flex items-center gap-1 text-amber-500 text-[11px] font-bold">
                    <span>★★★★★</span>
                    <span className="text-muted-foreground ml-1">4.9 • 100% Free &amp; Zero Install Errors</span>
                  </div>
                </div>
              </div>

              {/* Feature Highlights */}
              <div className="grid grid-cols-2 gap-2 text-xs">
                <div className="p-2.5 rounded-xl bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-100 dark:border-emerald-900/50 flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-brand-emerald shrink-0" />
                  <span className="font-semibold text-foreground text-[11px]">Instant M-Pesa STK</span>
                </div>
                <div className="p-2.5 rounded-xl bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-100 dark:border-emerald-900/50 flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-brand-emerald shrink-0" />
                  <span className="font-semibold text-foreground text-[11px]">Live Courier Tracking</span>
                </div>
                <div className="p-2.5 rounded-xl bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-100 dark:border-emerald-900/50 flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-brand-emerald shrink-0" />
                  <span className="font-semibold text-foreground text-[11px]">Offline Invoices &amp; QR</span>
                </div>
                <div className="p-2.5 rounded-xl bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-100 dark:border-emerald-900/50 flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-brand-emerald shrink-0" />
                  <span className="font-semibold text-foreground text-[11px]">Saves Mobile Data</span>
                </div>
              </div>

              {/* Action Buttons: 1-Tap Install + Direct APK Download */}
              <div className="space-y-2 pt-1">
                <div className="grid grid-cols-2 gap-2">
                  <button
                    onClick={handleInstallClick}
                    className="bg-brand-emerald hover:bg-brand-emerald-dark active:scale-[0.98] text-white font-extrabold py-3.5 px-3 rounded-2xl text-xs sm:text-sm flex items-center justify-center gap-1.5 shadow-lg transition-all"
                  >
                    <Smartphone className="w-4 h-4 text-amber-300" />
                    <span>1-Tap Install</span>
                  </button>

                  <a
                    href="/api/download/apk"
                    download="VendLex-Kenya.apk"
                    className="bg-brand-gold hover:bg-yellow-400 active:scale-[0.98] text-brand-charcoal font-black py-3.5 px-3 rounded-2xl text-xs sm:text-sm flex items-center justify-center gap-1.5 shadow-md transition-all text-center"
                  >
                    <Download className="w-4 h-4 text-brand-charcoal" />
                    <span>Direct APK</span>
                  </a>
                </div>

                {/* Explicit Cancel / Continue in Web Button & Already Installed */}
                <div className="flex items-center justify-between pt-1">
                  <button
                    onClick={handleDismissModal}
                    className="text-xs font-semibold text-muted-foreground hover:text-foreground py-1.5 transition-colors"
                  >
                    Cancel &amp; Continue in Browser
                  </button>

                  <button
                    onClick={handleMarkAsAlreadyInstalled}
                    className="text-xs font-semibold text-brand-emerald hover:underline py-1.5 transition-colors"
                  >
                    Already Installed
                  </button>
                </div>
              </div>

              {/* Browser-Tailored Installation Guide */}
              <div className="border-t border-border pt-3">
                <button
                  onClick={() => setShowInstructions(!showInstructions)}
                  className="w-full flex items-center justify-between text-xs font-bold text-brand-emerald hover:underline text-left"
                >
                  <span className="flex items-center gap-1.5">
                    <Compass className="w-3.5 h-3.5" />
                    <span>
                      {browserType === "safari_ios"
                        ? "How to Add on iPhone / Safari"
                        : browserType === "samsung_internet"
                        ? "How to Install on Samsung Internet"
                        : "How to Install on Android / Chrome"}
                    </span>
                  </span>
                  {showInstructions ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                </button>

                <AnimatePresence>
                  {showInstructions && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: "auto", opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      className="mt-2.5 p-3.5 rounded-2xl bg-muted/50 dark:bg-muted/20 text-xs space-y-2.5 border border-border"
                    >
                      {browserType === "safari_ios" ? (
                        <>
                          <div className="flex items-start gap-2.5">
                            <div className="w-5 h-5 rounded-full bg-brand-emerald text-white text-[11px] font-black flex items-center justify-center shrink-0 mt-0.5">
                              1
                            </div>
                            <p className="text-foreground leading-relaxed">
                              Tap the <strong>Share</strong> button <Share2 className="w-3.5 h-3.5 inline mx-0.5 text-brand-emerald" /> at the bottom of your Safari screen.
                            </p>
                          </div>
                          <div className="flex items-start gap-2.5">
                            <div className="w-5 h-5 rounded-full bg-brand-emerald text-white text-[11px] font-black flex items-center justify-center shrink-0 mt-0.5">
                              2
                            </div>
                            <p className="text-foreground leading-relaxed">
                              Scroll down and tap <strong>&quot;Add to Home Screen&quot;</strong> <PlusSquare className="w-3.5 h-3.5 inline mx-0.5 text-brand-emerald" />.
                            </p>
                          </div>
                          <div className="flex items-start gap-2.5">
                            <div className="w-5 h-5 rounded-full bg-brand-emerald text-white text-[11px] font-black flex items-center justify-center shrink-0 mt-0.5">
                              3
                            </div>
                            <p className="text-foreground leading-relaxed">
                              Tap <strong>Add</strong> at top right. VendLex will appear directly on your home screen like any native app.
                            </p>
                          </div>
                        </>
                      ) : browserType === "samsung_internet" ? (
                        <>
                          <div className="flex items-start gap-2.5">
                            <div className="w-5 h-5 rounded-full bg-brand-emerald text-white text-[11px] font-black flex items-center justify-center shrink-0 mt-0.5">
                              1
                            </div>
                            <p className="text-foreground leading-relaxed">
                              Tap the <strong>Menu</strong> button (<strong>☰</strong> bottom right) in Samsung Internet.
                            </p>
                          </div>
                          <div className="flex items-start gap-2.5">
                            <div className="w-5 h-5 rounded-full bg-brand-emerald text-white text-[11px] font-black flex items-center justify-center shrink-0 mt-0.5">
                              2
                            </div>
                            <p className="text-foreground leading-relaxed">
                              Tap <strong>&quot;Add page to&quot;</strong> &rarr; select <strong>&quot;Home screen&quot;</strong>.
                            </p>
                          </div>
                        </>
                      ) : (
                        <>
                          <div className="flex items-start gap-2.5">
                            <div className="w-5 h-5 rounded-full bg-brand-emerald text-white text-[11px] font-black flex items-center justify-center shrink-0 mt-0.5">
                              1
                            </div>
                            <p className="text-foreground leading-relaxed">
                              Tap the <strong>Install App on Phone (1-Tap)</strong> button above, or tap the browser menu <MoreVertical className="w-3.5 h-3.5 inline mx-0.5 text-brand-emerald" /> (3 dots at top right).
                            </p>
                          </div>
                          <div className="flex items-start gap-2.5">
                            <div className="w-5 h-5 rounded-full bg-brand-emerald text-white text-[11px] font-black flex items-center justify-center shrink-0 mt-0.5">
                              2
                            </div>
                            <p className="text-foreground leading-relaxed">
                              Select <strong>&quot;Install app&quot;</strong> or <strong>&quot;Add to Home screen&quot;</strong>.
                            </p>
                          </div>
                          <div className="flex items-start gap-2.5">
                            <div className="w-5 h-5 rounded-full bg-brand-emerald text-white text-[11px] font-black flex items-center justify-center shrink-0 mt-0.5">
                              3
                            </div>
                            <p className="text-foreground leading-relaxed">
                              Confirm <strong>Install</strong>. VendLex will be installed directly to your phone&apos;s app drawer with zero APK parsing errors.
                            </p>
                          </div>
                        </>
                      )}
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>

              {/* Trust & Verification Badge */}
              <div className="flex items-center justify-center gap-1.5 text-[11px] text-muted-foreground">
                <ShieldCheck className="w-3.5 h-3.5 text-brand-emerald" />
                <span>Official Direct WebAPK / PWA • VendLex Technologies Kenya</span>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </>
  );
}
