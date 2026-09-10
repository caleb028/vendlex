"use client";

import React, { useState, useEffect } from "react";
import { Download, Smartphone, X, CheckCircle2, ShieldCheck, Sparkles, ChevronDown, ChevronUp, Check, ExternalLink } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

export function MobileAppPrompt() {
  const [isMobileDevice, setIsMobileDevice] = useState(false);
  const [isAlreadyInstalled, setIsAlreadyInstalled] = useState(false);
  const [modalOpen, setModalOpen] = useState(false);
  const [bannerVisible, setBannerVisible] = useState(false);
  const [showInstructions, setShowInstructions] = useState(false);
  const [downloadStarted, setDownloadStarted] = useState(false);
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);

  useEffect(() => {
    if (typeof window === "undefined") return;

    // 1. Check if running inside installed standalone app
    const isStandalone =
      window.matchMedia("(display-mode: standalone)").matches ||
      (navigator as any).standalone === true ||
      document.referrer.startsWith("android-app://");

    const markedInstalled = localStorage.getItem("vendlex_app_installed") === "true";

    if (isStandalone || markedInstalled) {
      setIsAlreadyInstalled(true);
      return; // Do NOT show prompt if already installed in mobile phone
    }

    // 2. Check if client is on mobile / tablet browser
    const ua = navigator.userAgent || navigator.vendor || (window as any).opera || "";
    const isMobileUA = /android|iphone|ipad|ipod|blackberry|iemobile|opera mini|mobile/i.test(ua);
    const isSmallScreen = window.innerWidth <= 860;

    if (isMobileUA || isSmallScreen) {
      setIsMobileDevice(true);

      // Check if user dismissed it during the current session
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
    }

    // 3. Register service worker and capture native PWA/WebAPK install event
    const handleBeforeInstallPrompt = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e);
    };

    window.addEventListener("beforeinstallprompt", handleBeforeInstallPrompt);

    if ("serviceWorker" in navigator) {
      navigator.serviceWorker.register("/sw.js").catch(() => {});
    }

    // 4. Listen for appinstalled event
    const handleAppInstalled = () => {
      localStorage.setItem("vendlex_app_installed", "true");
      setIsAlreadyInstalled(true);
      setModalOpen(false);
      setBannerVisible(false);
    };

    window.addEventListener("appinstalled", handleAppInstalled);

    return () => {
      window.removeEventListener("beforeinstallprompt", handleBeforeInstallPrompt);
      window.removeEventListener("appinstalled", handleAppInstalled);
    };
  }, []);

  const handleNativeInstall = async () => {
    if (deferredPrompt) {
      deferredPrompt.prompt();
      const { outcome } = await deferredPrompt.userChoice;
      if (outcome === "accepted") {
        localStorage.setItem("vendlex_app_installed", "true");
        setModalOpen(false);
        setBannerVisible(false);
      }
      setDeferredPrompt(null);
    } else {
      handleApkDownload();
    }
  };

  const handleApkDownload = () => {
    setDownloadStarted(true);
    const link = document.createElement("a");
    link.href = "/api/download/apk";
    link.download = "VendLex-Kenya.apk";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    setTimeout(() => {
      setShowInstructions(true);
    }, 1200);
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

  // If already installed or not on mobile, do not show anything
  if (isAlreadyInstalled || !isMobileDevice) return null;

  return (
    <>
      {/* 1. Optional Smart Top Banner for Mobile Browsers */}
      <AnimatePresence>
        {bannerVisible && !modalOpen && (
          <motion.div
            initial={{ y: -60, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: -60, opacity: 0 }}
            className="sticky top-0 z-50 bg-gradient-to-r from-brand-emerald-dark via-brand-emerald to-brand-charcoal text-white px-3 py-2 shadow-md flex items-center justify-between gap-2 border-b border-white/10"
          >
            <div className="flex items-center gap-2.5 min-w-0">
              <div className="w-8 h-8 rounded-xl bg-white p-1 shrink-0 shadow-xs flex items-center justify-center">
                <img src="/logo/vendlex-logo.png" alt="VendLex App" className="w-full h-full object-contain" />
              </div>
              <div className="min-w-0">
                <p className="text-xs font-bold text-white truncate flex items-center gap-1">
                  <span>VendLex App</span>
                  <span className="text-[9px] bg-amber-400 text-brand-charcoal px-1 py-0.2 rounded-sm font-black">ANDROID</span>
                </p>
                <p className="text-[10px] text-emerald-100 truncate">1-Tap Lipa na M-Pesa &amp; Push Alerts</p>
              </div>
            </div>

            <div className="flex items-center gap-1.5 shrink-0">
              <button
                onClick={() => setModalOpen(true)}
                className="bg-brand-gold text-brand-charcoal font-black text-xs px-3 py-1.5 rounded-lg flex items-center gap-1 shadow-sm active:scale-95 transition-transform"
              >
                <Download className="w-3.5 h-3.5" />
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

      {/* 2. Optional Slide-Up / Pop-up App Download Modal */}
      <AnimatePresence>
        {modalOpen && (
          <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 bg-black/60 backdrop-blur-xs">
            <motion.div
              initial={{ y: "100%", opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: 0, opacity: 0 }}
              transition={{ type: "spring", damping: 25, stiffness: 300 }}
              className="w-full max-w-md bg-white dark:bg-brand-dark-card border-t sm:border border-border dark:border-brand-dark-border rounded-t-3xl sm:rounded-3xl p-6 shadow-2xl space-y-5 max-h-[90vh] overflow-y-auto"
            >
              {/* Top Bar with Cancel / Close */}
              <div className="flex items-center justify-between pb-1">
                <div className="flex items-center gap-2">
                  <span className="px-2.5 py-0.5 rounded-full bg-emerald-100 dark:bg-emerald-950/60 text-brand-emerald text-[10px] font-black uppercase tracking-wider flex items-center gap-1">
                    <Sparkles className="w-3 h-3" />
                    <span>Android App</span>
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
                <div className="w-16 h-16 rounded-2xl bg-white p-2 border-2 border-brand-emerald/30 shadow-md shrink-0 flex items-center justify-center">
                  <img src="/logo/vendlex-logo.png" alt="VendLex" className="w-full h-full object-contain" />
                </div>
                <div className="space-y-1">
                  <h3 className="text-lg font-black text-foreground leading-tight">
                    Get the VendLex Mobile App
                  </h3>
                  <p className="text-xs text-muted-foreground">
                    Direct Lipa na M-Pesa, instant order alerts, and faster mobile shopping.
                  </p>
                  <div className="flex items-center gap-1 text-amber-500 text-[11px] font-bold">
                    <span>★★★★★</span>
                    <span className="text-muted-foreground ml-1">4.9 • 100% Free &amp; Optional</span>
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
                  <span className="font-semibold text-foreground text-[11px]">Live Delivery Tracker</span>
                </div>
                <div className="p-2.5 rounded-xl bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-100 dark:border-emerald-900/50 flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-brand-emerald shrink-0" />
                  <span className="font-semibold text-foreground text-[11px]">Offline Receipts &amp; QR</span>
                </div>
                <div className="p-2.5 rounded-xl bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-100 dark:border-emerald-900/50 flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-brand-emerald shrink-0" />
                  <span className="font-semibold text-foreground text-[11px]">Zero Data Waste</span>
                </div>
              </div>

              {/* Action Buttons: 1-Tap Install + Download APK + Cancel */}
              <div className="space-y-2 pt-1">
                {/* 1-Tap Browser Native Install (Guaranteed zero parse errors) */}
                <button
                  onClick={handleNativeInstall}
                  className="w-full bg-brand-emerald hover:bg-brand-emerald-dark active:scale-[0.98] text-white font-extrabold py-3.5 px-4 rounded-2xl text-sm flex items-center justify-center gap-2.5 shadow-lg transition-all"
                >
                  <Smartphone className="w-5 h-5 text-amber-300" />
                  <span>Install App on Phone (1-Tap)</span>
                </button>

                {/* Direct APK Download Option */}
                <button
                  onClick={handleApkDownload}
                  className="w-full bg-muted/60 hover:bg-muted text-foreground font-bold py-2.5 px-4 rounded-xl text-xs flex items-center justify-center gap-2 transition-colors border border-border"
                >
                  <Download className="w-4 h-4 text-brand-emerald" />
                  <span>{downloadStarted ? "Downloading APK..." : "Or Download APK Package (.apk)"}</span>
                </button>

                {/* Explicit Cancel / Continue in Web Button */}
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

              {/* How to Install Guidance */}
              <div className="border-t border-border pt-3">
                <button
                  onClick={() => setShowInstructions(!showInstructions)}
                  className="w-full flex items-center justify-between text-xs font-bold text-brand-emerald hover:underline text-left"
                >
                  <span className="flex items-center gap-1.5">
                    <Smartphone className="w-3.5 h-3.5" />
                    <span>How it Works on Android</span>
                  </span>
                  {showInstructions ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                </button>

                <AnimatePresence>
                  {showInstructions && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: "auto", opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      className="mt-2.5 p-3 rounded-xl bg-muted/40 text-xs space-y-2 border border-border"
                    >
                      <div className="flex items-start gap-2">
                        <span className="w-4 h-4 rounded-full bg-brand-emerald text-white text-[10px] font-bold flex items-center justify-center shrink-0 mt-0.5">✓</span>
                        <p className="text-muted-foreground">Tap <strong>&quot;Install App on Phone (1-Tap)&quot;</strong> for instant installation directly through your browser with zero parse issues.</p>
                      </div>
                      <div className="flex items-start gap-2">
                        <span className="w-4 h-4 rounded-full bg-brand-emerald text-white text-[10px] font-bold flex items-center justify-center shrink-0 mt-0.5">✓</span>
                        <p className="text-muted-foreground">Once installed on your phone, VendLex will launch like a native Android app and will not prompt you to download again.</p>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>

              {/* Trust & Verification Badge */}
              <div className="flex items-center justify-center gap-1.5 text-[11px] text-muted-foreground">
                <ShieldCheck className="w-3.5 h-3.5 text-brand-emerald" />
                <span>Verified Safe &amp; Lightweight • VendLex Technologies Kenya</span>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </>
  );
}
