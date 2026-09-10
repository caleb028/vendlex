"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { Download, Smartphone, ShieldCheck, Zap, Bell, CheckCircle2, ArrowRight, Star, QrCode, Check } from "lucide-react";

export function DownloadView() {
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);
  const [isInstalled, setIsInstalled] = useState(false);
  const [downloading, setDownloading] = useState(false);

  useEffect(() => {
    if (typeof window === "undefined") return;

    if (
      window.matchMedia("(display-mode: standalone)").matches ||
      (navigator as any).standalone === true ||
      localStorage.getItem("vendlex_app_installed") === "true"
    ) {
      setIsInstalled(true);
    }

    const handleBeforeInstallPrompt = (e: any) => {
      e.preventDefault();
      setDeferredPrompt(e);
    };

    window.addEventListener("beforeinstallprompt", handleBeforeInstallPrompt);

    if ("serviceWorker" in navigator) {
      navigator.serviceWorker.register("/sw.js").catch(() => {});
    }

    return () => window.removeEventListener("beforeinstallprompt", handleBeforeInstallPrompt);
  }, []);

  const handleNativeInstall = async () => {
    if (deferredPrompt) {
      deferredPrompt.prompt();
      const { outcome } = await deferredPrompt.userChoice;
      if (outcome === "accepted") {
        localStorage.setItem("vendlex_app_installed", "true");
        setIsInstalled(true);
      }
      setDeferredPrompt(null);
    } else {
      handleApkDownload();
    }
  };

  const handleApkDownload = () => {
    setDownloading(true);
    const link = document.createElement("a");
    link.href = "/api/download/apk";
    link.download = "VendLex-Kenya.apk";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="max-w-4xl mx-auto space-y-10">
      {/* Main Hero Card */}
      <div className="bg-gradient-to-br from-brand-emerald-dark via-brand-emerald to-brand-charcoal rounded-3xl p-8 sm:p-12 text-white shadow-2xl relative overflow-hidden">
        <div className="relative z-10 max-w-xl space-y-6">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/20 backdrop-blur-xs text-xs font-black uppercase tracking-wider text-amber-300">
            <Smartphone className="w-3.5 h-3.5" />
            <span>{isInstalled ? "App Installed on Device" : "Official Android Release (v1.0.0)"}</span>
          </div>

          <h1 className="text-3xl sm:text-4xl font-black leading-tight tracking-tight">
            {isInstalled ? "VendLex is Installed on Your Device" : "Get the VendLex Mobile App on Your Phone"}
          </h1>

          <p className="text-sm sm:text-base text-emerald-100 leading-relaxed">
            {isInstalled
              ? "You already have the official VendLex application configured on your mobile phone. Launch it anytime from your home screen."
              : "Experience ultra-fast loading, instant Safaricom M-Pesa STK push checkouts, live courier delivery tracking, and cryptographic offline document verification."}
          </p>

          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 pt-2">
            {!isInstalled ? (
              <>
                <button
                  onClick={handleNativeInstall}
                  className="bg-brand-gold hover:bg-yellow-400 text-brand-charcoal font-black py-4 px-8 rounded-2xl text-sm flex items-center justify-center gap-2 shadow-xl hover:scale-105 active:scale-95 transition-all"
                >
                  <Smartphone className="w-5 h-5" />
                  <span>Install App on Phone (1-Tap)</span>
                </button>

                <button
                  onClick={handleApkDownload}
                  className="bg-white/10 hover:bg-white/20 border border-white/30 text-white font-bold py-4 px-6 rounded-2xl text-sm flex items-center justify-center gap-2 transition-colors"
                >
                  <Download className="w-4 h-4" />
                  <span>{downloading ? "Downloading APK..." : "Download APK File"}</span>
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
              <span>100% Virus-Free &amp; Verified</span>
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
          <h3 className="font-bold text-sm text-foreground">Offline Document Vault</h3>
          <p className="text-xs text-muted-foreground leading-relaxed">
            Access your official tax receipts, warranties, and store certificates even when offline.
          </p>
        </div>
      </div>

      {/* 3 Step Installation Guide */}
      <div className="bg-white dark:bg-brand-dark-card border border-border dark:border-brand-dark-border rounded-3xl p-8 shadow-sm space-y-6">
        <div className="space-y-1">
          <h2 className="text-xl font-black text-foreground">How to Install on Your Android Device</h2>
          <p className="text-xs text-muted-foreground">Follow these 3 quick steps to install the app in under 1 minute.</p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="p-5 rounded-2xl bg-muted/40 border border-border space-y-3">
            <div className="w-8 h-8 rounded-full bg-brand-emerald text-white text-xs font-black flex items-center justify-center">
              1
            </div>
            <h4 className="font-bold text-sm text-foreground">Choose Install Method</h4>
            <p className="text-xs text-muted-foreground leading-relaxed">
              Tap <strong>&quot;Install App on Phone (1-Tap)&quot;</strong> for instant setup without any parse errors, or download the APK package.
            </p>
          </div>

          <div className="p-5 rounded-2xl bg-muted/40 border border-border space-y-3">
            <div className="w-8 h-8 rounded-full bg-brand-emerald text-white text-xs font-black flex items-center justify-center">
              2
            </div>
            <h4 className="font-bold text-sm text-foreground">Confirm &amp; Add</h4>
            <p className="text-xs text-muted-foreground leading-relaxed">
              Tap <strong>Add / Install</strong> when prompted by your browser. VendLex will be installed directly to your app drawer.
            </p>
          </div>

          <div className="p-5 rounded-2xl bg-muted/40 border border-border space-y-3">
            <div className="w-8 h-8 rounded-full bg-brand-emerald text-white text-xs font-black flex items-center justify-center">
              3
            </div>
            <h4 className="font-bold text-sm text-foreground">Launch &amp; Enjoy</h4>
            <p className="text-xs text-muted-foreground leading-relaxed">
              Open the VendLex icon from your home screen for ultra-fast shopping, merchant management, and zero data waste.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
