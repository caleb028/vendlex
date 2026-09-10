import React from "react";
import type { Metadata } from "next";
import Link from "next/link";
import { Download, Smartphone, ShieldCheck, Zap, Bell, CheckCircle2, ArrowRight, Star, FileText, QrCode } from "lucide-react";

export const metadata: Metadata = {
  title: "Download VendLex App (APK for Android) | Fast & Free",
  description:
    "Download the official VendLex Android Mobile App APK directly onto your phone. Get instant Lipa na M-Pesa checkout, push alerts for dispatch & delivery, and offline receipt storage.",
  keywords: [
    "VendLex APK download",
    "VendLex Android App",
    "Kenya marketplace app",
    "Lipa na M-Pesa shopping app",
    "Download VendLex APK",
  ],
  openGraph: {
    title: "Download VendLex App (Official Android APK) | Kenya",
    description: "Get Kenya's premier digital commerce and business ecosystem directly on your mobile device. Fast, lightweight, Lipa na M-Pesa integrated.",
    images: [{ url: "/logo/vendlex-logo.png", width: 1200, height: 630, alt: "Download VendLex APK" }],
  },
};

export default function DownloadPage() {
  const structuredData = {
    "@context": "https://schema.org",
    "@type": "SoftwareApplication",
    name: "VendLex Kenya",
    operatingSystem: "Android",
    applicationCategory: "ShoppingApplication",
    offers: {
      "@type": "Offer",
      price: "0",
      priceCurrency: "KES",
    },
    aggregateRating: {
      "@type": "AggregateRating",
      ratingValue: "4.9",
      ratingCount: "3820",
    },
    downloadUrl: "https://vendlex.vercel.app/api/download/apk",
  };

  return (
    <div className="bg-brand-off-white dark:bg-brand-dark-bg min-h-screen py-10 px-4 sm:px-6 lg:px-8">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }}
      />

      <div className="max-w-4xl mx-auto space-y-10">
        {/* Main Hero Card */}
        <div className="bg-gradient-to-br from-brand-emerald-dark via-brand-emerald to-brand-charcoal rounded-3xl p-8 sm:p-12 text-white shadow-2xl relative overflow-hidden">
          <div className="relative z-10 max-w-xl space-y-6">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/20 backdrop-blur-xs text-xs font-black uppercase tracking-wider text-amber-300">
              <Smartphone className="w-3.5 h-3.5" />
              <span>Official Android Release (v1.0.0)</span>
            </div>

            <h1 className="text-3xl sm:text-4xl font-black leading-tight tracking-tight">
              Get the VendLex Mobile App on Your Phone
            </h1>

            <p className="text-sm sm:text-base text-emerald-100 leading-relaxed">
              Experience ultra-fast loading, instant Safaricom M-Pesa STK push checkouts, live courier delivery tracking, and cryptographic offline document verification.
            </p>

            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 pt-2">
              <a
                href="/api/download/apk"
                download="VendLex-Kenya.apk"
                className="bg-brand-gold hover:bg-yellow-400 text-brand-charcoal font-black py-4 px-8 rounded-2xl text-sm flex items-center justify-center gap-2 shadow-xl hover:scale-105 active:scale-95 transition-all"
              >
                <Download className="w-5 h-5" />
                <span>Download APK (Free)</span>
              </a>

              <Link
                href="/marketplace"
                className="bg-white/10 hover:bg-white/20 border border-white/30 text-white font-bold py-4 px-6 rounded-2xl text-sm flex items-center justify-center gap-2 transition-colors"
              >
                <span>Browse Marketplace</span>
                <ArrowRight className="w-4 h-4" />
              </Link>
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
              Optimized local cache saves mobile bundles and loads product catalogs in milliseconds.
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
            <h2 className="text-xl font-black text-foreground">How to Install the APK on Your Android Device</h2>
            <p className="text-xs text-muted-foreground">Follow these 3 quick steps to install the app in under 1 minute.</p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="p-5 rounded-2xl bg-muted/40 border border-border space-y-3">
              <div className="w-8 h-8 rounded-full bg-brand-emerald text-white text-xs font-black flex items-center justify-center">
                1
              </div>
              <h4 className="font-bold text-sm text-foreground">Download the APK</h4>
              <p className="text-xs text-muted-foreground leading-relaxed">
                Click the Download button. Your mobile browser will save <code className="font-mono text-[11px] font-bold">VendLex-Kenya.apk</code> to your phone.
              </p>
            </div>

            <div className="p-5 rounded-2xl bg-muted/40 border border-border space-y-3">
              <div className="w-8 h-8 rounded-full bg-brand-emerald text-white text-xs font-black flex items-center justify-center">
                2
              </div>
              <h4 className="font-bold text-sm text-foreground">Open File &amp; Allow</h4>
              <p className="text-xs text-muted-foreground leading-relaxed">
                Open your notification drawer or Downloads folder. If asked, toggle <em>&quot;Allow from this source&quot;</em> in your phone settings.
              </p>
            </div>

            <div className="p-5 rounded-2xl bg-muted/40 border border-border space-y-3">
              <div className="w-8 h-8 rounded-full bg-brand-emerald text-white text-xs font-black flex items-center justify-center">
                3
              </div>
              <h4 className="font-bold text-sm text-foreground">Install &amp; Launch</h4>
              <p className="text-xs text-muted-foreground leading-relaxed">
                Tap <strong>Install</strong>. Once completed, tap <strong>Open</strong> and start shopping and managing your Kenyan business!
              </p>
            </div>
          </div>

          <div className="text-center pt-2">
            <a
              href="/api/download/apk"
              download="VendLex-Kenya.apk"
              className="inline-flex items-center gap-2 bg-brand-emerald hover:bg-brand-emerald-dark text-white font-extrabold px-8 py-3.5 rounded-2xl text-xs sm:text-sm shadow-md transition-all"
            >
              <Download className="w-4 h-4 text-amber-300" />
              <span>Download VendLex APK Now</span>
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}
