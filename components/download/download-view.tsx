"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import {
  Smartphone,
  ShieldCheck,
  Zap,
  Bell,
  CheckCircle2,
  ArrowRight,
  Star,
  QrCode,
  Share2,
  MoreVertical,
  PlusSquare,
  Sparkles,
  Check,
} from "lucide-react";

export function DownloadView() {
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);
  const [isInstalled, setIsInstalled] = useState(false);
  const [activeTab, setActiveTab] = useState<"android" | "ios" | "samsung">("android");
  const [copiedLink, setCopiedLink] = useState(false);

  useEffect(() => {
    if (typeof window === "undefined") return;

    if (
      window.matchMedia("(display-mode: standalone)").matches ||
      (navigator as any).standalone === true ||
      localStorage.getItem("vendlex_app_installed") === "true"
    ) {
      setIsInstalled(true);
    }

    if ((window as any).__vendlex_deferred_prompt) {
      setDeferredPrompt((window as any).__vendlex_deferred_prompt);
    }

    const handlePromptReady = () => {
      if ((window as any).__vendlex_deferred_prompt) {
        setDeferredPrompt((window as any).__vendlex_deferred_prompt);
      }
    };

    const handleBeforeInstallPrompt = (e: any) => {
      e.preventDefault();
      (window as any).__vendlex_deferred_prompt = e;
      setDeferredPrompt(e);
    };

    window.addEventListener("beforeinstallprompt", handleBeforeInstallPrompt);
    window.addEventListener("vendlex:pwa-ready", handlePromptReady);

    const handleAppInstalled = () => {
      localStorage.setItem("vendlex_app_installed", "true");
      setIsInstalled(true);
    };

    window.addEventListener("appinstalled", handleAppInstalled);

    return () => {
      window.removeEventListener("beforeinstallprompt", handleBeforeInstallPrompt);
      window.removeEventListener("vendlex:pwa-ready", handlePromptReady);
      window.removeEventListener("appinstalled", handleAppInstalled);
    };
  }, []);

  const handleNativeInstall = async () => {
    const promptEvent = deferredPrompt || (typeof window !== "undefined" ? (window as any).__vendlex_deferred_prompt : null);

    if (promptEvent) {
      try {
        await promptEvent.prompt();
        const { outcome } = await promptEvent.userChoice;
        if (outcome === "accepted") {
          localStorage.setItem("vendlex_app_installed", "true");
          setIsInstalled(true);
        }
        setDeferredPrompt(null);
        if (typeof window !== "undefined") {
          (window as any).__vendlex_deferred_prompt = null;
        }
      } catch (err) {
        console.warn("[Download View] Install prompt error:", err);
      }
    } else {
      // Scroll to instructions
      const element = document.getElementById("installation-instructions");
      if (element) {
        element.scrollIntoView({ behavior: "smooth" });
      }
    }
  };

  const handleCopyLink = () => {
    if (typeof window !== "undefined") {
      navigator.clipboard.writeText("https://vendlex.vercel.app");
      setCopiedLink(true);
      setTimeout(() => setCopiedLink(false), 2500);
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-10">
      {/* Main Hero Card */}
      <div className="bg-gradient-to-br from-brand-emerald-dark via-brand-emerald to-brand-charcoal rounded-3xl p-8 sm:p-12 text-white shadow-2xl relative overflow-hidden">
        <div className="relative z-10 max-w-xl space-y-6">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/20 backdrop-blur-xs text-xs font-black uppercase tracking-wider text-amber-300">
            <Sparkles className="w-3.5 h-3.5" />
            <span>{isInstalled ? "App Installed on Device" : "Direct Mobile App Installation"}</span>
          </div>

          <h1 className="text-3xl sm:text-4xl font-black leading-tight tracking-tight">
            {isInstalled ? "VendLex is Installed on Your Device" : "Get the VendLex App on Your Phone"}
          </h1>

          <p className="text-sm sm:text-base text-emerald-100 leading-relaxed">
            {isInstalled
              ? "You already have the official VendLex application configured on your mobile phone. Launch it anytime from your home screen."
              : "Install VendLex directly through your browser in 1 tap. Enjoy instant Lipa na M-Pesa STK checkout, live courier tracking, push notifications, and offline receipts with zero APK download issues."}
          </p>

          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 pt-2">
            {!isInstalled ? (
              <>
                <button
                  onClick={handleNativeInstall}
                  className="bg-brand-gold hover:bg-yellow-400 text-brand-charcoal font-black py-4 px-8 rounded-2xl text-sm flex items-center justify-center gap-2.5 shadow-xl hover:scale-105 active:scale-95 transition-all"
                >
                  <Smartphone className="w-5 h-5 text-brand-charcoal" />
                  <span>Install App on Phone (1-Tap)</span>
                </button>

                <button
                  onClick={handleCopyLink}
                  className="bg-white/10 hover:bg-white/20 border border-white/30 text-white font-bold py-4 px-6 rounded-2xl text-sm flex items-center justify-center gap-2 transition-colors"
                >
                  {copiedLink ? (
                    <>
                      <Check className="w-4 h-4 text-amber-300" />
                      <span>Link Copied!</span>
                    </>
                  ) : (
                    <>
                      <Share2 className="w-4 h-4" />
                      <span>Share Install Link</span>
                    </>
                  )}
                </button>
              </>
            ) : (
              <Link
                href="/marketplace"
                className="bg-brand-gold text-brand-charcoal font-black py-4 px-8 rounded-2xl text-sm flex items-center justify-center gap-2 shadow-xl hover:scale-105 transition-all"
              >
                <span>Launch Marketplace</span>
                <ArrowRight className="w-4 h-4" />
              </Link>
            )}
          </div>

          <div className="flex items-center gap-4 text-xs text-emerald-100 pt-2">
            <div className="flex items-center gap-1.5">
              <ShieldCheck className="w-4 h-4 text-amber-300" />
              <span>Direct WebAPK • No Play Store Needed</span>
            </div>
            <div className="flex items-center gap-1.5">
              <Star className="w-4 h-4 text-amber-300 fill-current" />
              <span>4.9 / 5.0 (3,800+ Users)</span>
            </div>
          </div>
        </div>

        <div className="hidden md:block absolute -right-10 -bottom-10 w-96 h-96 opacity-15">
          <Smartphone className="w-full h-full text-white" />
        </div>
      </div>

      {/* 4 Feature Highlights */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white dark:bg-brand-dark-card border border-border dark:border-brand-dark-border rounded-2xl p-6 shadow-sm space-y-2">
          <div className="w-10 h-10 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 text-brand-emerald flex items-center justify-center font-bold">
            <Zap className="w-5 h-5" />
          </div>
          <h3 className="font-bold text-sm text-foreground">5x Faster Speed</h3>
          <p className="text-xs text-muted-foreground leading-relaxed">
            Optimized local cache saves mobile data bundles and loads product catalogs in milliseconds.
          </p>
        </div>

        <div className="bg-white dark:bg-brand-dark-card border border-border dark:border-brand-dark-border rounded-2xl p-6 shadow-sm space-y-2">
          <div className="w-10 h-10 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 text-brand-emerald flex items-center justify-center font-bold">
            <Smartphone className="w-5 h-5" />
          </div>
          <h3 className="font-bold text-sm text-foreground">Direct M-Pesa STK</h3>
          <p className="text-xs text-muted-foreground leading-relaxed">
            Pay seamlessly via Lipa na M-Pesa with instant PIN prompts and automated receipt generation.
          </p>
        </div>

        <div className="bg-white dark:bg-brand-dark-card border border-border dark:border-brand-dark-border rounded-2xl p-6 shadow-sm space-y-2">
          <div className="w-10 h-10 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 text-brand-emerald flex items-center justify-center font-bold">
            <Bell className="w-5 h-5" />
          </div>
          <h3 className="font-bold text-sm text-foreground">Live Push Alerts</h3>
          <p className="text-xs text-muted-foreground leading-relaxed">
            Real-time notifications for order confirmation, courier dispatch, tracking and deliveries.
          </p>
        </div>

        <div className="bg-white dark:bg-brand-dark-card border border-border dark:border-brand-dark-border rounded-2xl p-6 shadow-sm space-y-2">
          <div className="w-10 h-10 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 text-brand-emerald flex items-center justify-center font-bold">
            <QrCode className="w-5 h-5" />
          </div>
          <h3 className="font-bold text-sm text-foreground">Offline Invoices &amp; QR</h3>
          <p className="text-xs text-muted-foreground leading-relaxed">
            Access your official tax receipts, warranties, and store certificates even when offline.
          </p>
        </div>
      </div>

      {/* Tabbed Interactive Installation Guide */}
      <div id="installation-instructions" className="bg-white dark:bg-brand-dark-card border border-border dark:border-brand-dark-border rounded-3xl p-6 sm:p-8 shadow-sm space-y-6">
        <div className="space-y-1">
          <h2 className="text-xl font-black text-foreground">How to Install in 30 Seconds</h2>
          <p className="text-xs text-muted-foreground">Select your mobile device or browser to see the simple install steps.</p>
        </div>

        {/* Tab Selection */}
        <div className="flex items-center gap-2 p-1.5 rounded-2xl bg-muted/60 max-w-md">
          <button
            onClick={() => setActiveTab("android")}
            className={`flex-1 py-2 text-xs font-bold rounded-xl transition-all ${
              activeTab === "android" ? "bg-brand-emerald text-white shadow-sm" : "text-muted-foreground hover:text-foreground"
            }`}
          >
            Android (Chrome)
          </button>
          <button
            onClick={() => setActiveTab("ios")}
            className={`flex-1 py-2 text-xs font-bold rounded-xl transition-all ${
              activeTab === "ios" ? "bg-brand-emerald text-white shadow-sm" : "text-muted-foreground hover:text-foreground"
            }`}
          >
            iPhone (Safari)
          </button>
          <button
            onClick={() => setActiveTab("samsung")}
            className={`flex-1 py-2 text-xs font-bold rounded-xl transition-all ${
              activeTab === "samsung" ? "bg-brand-emerald text-white shadow-sm" : "text-muted-foreground hover:text-foreground"
            }`}
          >
            Samsung Internet
          </button>
        </div>

        {/* Tab Contents */}
        {activeTab === "android" && (
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 animate-fadeIn">
            <div className="p-5 rounded-2xl bg-muted/40 border border-border space-y-3">
              <div className="w-8 h-8 rounded-full bg-brand-emerald text-white text-xs font-black flex items-center justify-center">
                1
              </div>
              <h4 className="font-bold text-sm text-foreground">Tap Install</h4>
              <p className="text-xs text-muted-foreground leading-relaxed">
                Click <strong>&quot;Install App on Phone (1-Tap)&quot;</strong> above, or tap the browser menu (<strong>⋮</strong> 3 dots at top right).
              </p>
            </div>

            <div className="p-5 rounded-2xl bg-muted/40 border border-border space-y-3">
              <div className="w-8 h-8 rounded-full bg-brand-emerald text-white text-xs font-black flex items-center justify-center">
                2
              </div>
              <h4 className="font-bold text-sm text-foreground">Confirm &amp; Add</h4>
              <p className="text-xs text-muted-foreground leading-relaxed">
                Select <strong>&quot;Install app&quot;</strong> or <strong>&quot;Add to Home screen&quot;</strong> and tap <strong>Install</strong>.
              </p>
            </div>

            <div className="p-5 rounded-2xl bg-muted/40 border border-border space-y-3">
              <div className="w-8 h-8 rounded-full bg-brand-emerald text-white text-xs font-black flex items-center justify-center">
                3
              </div>
              <h4 className="font-bold text-sm text-foreground">Launch App</h4>
              <p className="text-xs text-muted-foreground leading-relaxed">
                VendLex will appear in your phone&apos;s app drawer and home screen. Launches instantly in full-screen standalone mode.
              </p>
            </div>
          </div>
        )}

        {activeTab === "ios" && (
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 animate-fadeIn">
            <div className="p-5 rounded-2xl bg-muted/40 border border-border space-y-3">
              <div className="w-8 h-8 rounded-full bg-brand-emerald text-white text-xs font-black flex items-center justify-center">
                1
              </div>
              <h4 className="font-bold text-sm text-foreground">Tap Share Icon</h4>
              <p className="text-xs text-muted-foreground leading-relaxed">
                Open Safari on your iPhone/iPad and tap the <strong>Share</strong> button (<Share2 className="w-3.5 h-3.5 inline mx-0.5 text-brand-emerald" /> at the bottom).
              </p>
            </div>

            <div className="p-5 rounded-2xl bg-muted/40 border border-border space-y-3">
              <div className="w-8 h-8 rounded-full bg-brand-emerald text-white text-xs font-black flex items-center justify-center">
                2
              </div>
              <h4 className="font-bold text-sm text-foreground">Add to Home Screen</h4>
              <p className="text-xs text-muted-foreground leading-relaxed">
                Scroll down the share sheet and tap <strong>&quot;Add to Home Screen&quot;</strong> (<PlusSquare className="w-3.5 h-3.5 inline mx-0.5 text-brand-emerald" />).
              </p>
            </div>

            <div className="p-5 rounded-2xl bg-muted/40 border border-border space-y-3">
              <div className="w-8 h-8 rounded-full bg-brand-emerald text-white text-xs font-black flex items-center justify-center">
                3
              </div>
              <h4 className="font-bold text-sm text-foreground">Tap Add</h4>
              <p className="text-xs text-muted-foreground leading-relaxed">
                Tap <strong>Add</strong> in the top right corner. VendLex will be installed directly on your iOS home screen.
              </p>
            </div>
          </div>
        )}

        {activeTab === "samsung" && (
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 animate-fadeIn">
            <div className="p-5 rounded-2xl bg-muted/40 border border-border space-y-3">
              <div className="w-8 h-8 rounded-full bg-brand-emerald text-white text-xs font-black flex items-center justify-center">
                1
              </div>
              <h4 className="font-bold text-sm text-foreground">Tap Menu</h4>
              <p className="text-xs text-muted-foreground leading-relaxed">
                Tap the <strong>Menu</strong> icon (<strong>☰</strong> three lines) at the bottom right corner of Samsung Internet.
              </p>
            </div>

            <div className="p-5 rounded-2xl bg-muted/40 border border-border space-y-3">
              <div className="w-8 h-8 rounded-full bg-brand-emerald text-white text-xs font-black flex items-center justify-center">
                2
              </div>
              <h4 className="font-bold text-sm text-foreground">Add Page To</h4>
              <p className="text-xs text-muted-foreground leading-relaxed">
                Select <strong>&quot;Add page to&quot;</strong> and choose <strong>&quot;Home screen&quot;</strong>.
              </p>
            </div>

            <div className="p-5 rounded-2xl bg-muted/40 border border-border space-y-3">
              <div className="w-8 h-8 rounded-full bg-brand-emerald text-white text-xs font-black flex items-center justify-center">
                3
              </div>
              <h4 className="font-bold text-sm text-foreground">Confirm</h4>
              <p className="text-xs text-muted-foreground leading-relaxed">
                Tap <strong>Add</strong> to complete the install. VendLex will launch like a native application.
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
