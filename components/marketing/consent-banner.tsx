"use client";

import React, { useState, useEffect } from "react";
import { ShieldCheck, Cookie, Settings, Check, X } from "lucide-react";

export interface ConsentPreferences {
  essential: boolean;
  analytics: boolean;
  marketing: boolean;
}

export function MarketingConsentBanner() {
  const [isOpen, setIsOpen] = useState(false);
  const [showCustomizer, setShowCustomizer] = useState(false);
  const [preferences, setPreferences] = useState<ConsentPreferences>({
    essential: true,
    analytics: false,
    marketing: false,
  });

  useEffect(() => {
    // Check if consent has already been set in localStorage / cookie
    try {
      const saved = localStorage.getItem("vendlex_marketing_consent");
      if (!saved) {
        // Check server cookie via API or delay slightly for UX
        const timer = setTimeout(() => {
          setIsOpen(true);
        }, 1200);
        return () => clearTimeout(timer);
      } else {
        const parsed = JSON.parse(saved);
        setPreferences(parsed);
      }
    } catch {
      setIsOpen(true);
    }
  }, []);

  const saveConsent = async (prefs: ConsentPreferences) => {
    try {
      localStorage.setItem("vendlex_marketing_consent", JSON.stringify(prefs));
      await fetch("/api/marketing/consent", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(prefs),
      });
      // Dispatch custom window event so scripts/tracker can update in real-time
      window.dispatchEvent(
        new CustomEvent("vendlex_consent_updated", { detail: prefs })
      );
    } catch (e) {
      console.error("[Consent] Failed to save preferences", e);
    } finally {
      setIsOpen(false);
      setShowCustomizer(false);
    }
  };

  const handleAcceptAll = () => {
    const allIn = { essential: true, analytics: true, marketing: true };
    setPreferences(allIn);
    saveConsent(allIn);
  };

  const handleRejectNonEssential = () => {
    const onlyEssential = { essential: true, analytics: false, marketing: false };
    setPreferences(onlyEssential);
    saveConsent(onlyEssential);
  };

  const handleSaveCustom = () => {
    saveConsent(preferences);
  };

  if (!isOpen) return null;

  return (
    <aside
      aria-label="Cookie & Privacy Consent"
      className="fixed bottom-0 inset-x-0 z-50 p-4 sm:p-6 pointer-events-none flex justify-center"
    >
      <div className="pointer-events-auto max-w-2xl w-full bg-white dark:bg-brand-dark-card border border-border dark:border-brand-dark-border rounded-2xl shadow-2xl p-5 sm:p-6 transition-all duration-300">
        {!showCustomizer ? (
          <div className="space-y-4">
            <div className="flex items-start gap-3">
              <div className="p-2.5 bg-emerald-50 dark:bg-emerald-950/60 rounded-xl text-brand-emerald shrink-0">
                <Cookie className="w-5 h-5" />
              </div>
              <div className="space-y-1">
                <h3 className="text-sm font-bold text-foreground flex items-center gap-1.5">
                  Privacy & Advertising Preferences
                  <span className="text-[10px] bg-emerald-100 dark:bg-emerald-900/40 text-brand-emerald px-1.5 py-0.5 rounded font-medium">
                    Kenya DPA 2019 Compliant
                  </span>
                </h3>
                <p className="text-xs text-muted-foreground leading-relaxed">
                  VendLex uses essential cookies to process M-Pesa orders and ensure security.
                  With your consent, we also use privacy-first analytics and marketing cookies
                  (Google & Meta Ads) to personalize deals and measure Kenyan merchant campaigns.
                </p>
              </div>
            </div>

            <div className="flex flex-wrap items-center justify-between gap-2 pt-2 border-t border-border/60">
              <button
                type="button"
                onClick={() => setShowCustomizer(true)}
                className="text-xs text-muted-foreground hover:text-foreground inline-flex items-center gap-1.5 font-medium transition-colors"
              >
                <Settings className="w-3.5 h-3.5" />
                Customize Preferences
              </button>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={handleRejectNonEssential}
                  className="px-3 py-1.5 rounded-lg border border-border text-xs font-semibold hover:bg-muted text-muted-foreground hover:text-foreground transition-all"
                >
                  Reject Non-Essential
                </button>
                <button
                  type="button"
                  onClick={handleAcceptAll}
                  className="px-4 py-1.5 rounded-lg bg-brand-emerald hover:bg-brand-emerald-dark text-white text-xs font-bold shadow-sm transition-all"
                >
                  Accept All
                </button>
              </div>
            </div>
          </div>
        ) : (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-bold text-foreground flex items-center gap-2">
                <Settings className="w-4 h-4 text-brand-emerald" />
                Customize Tracking & Cookie Preferences
              </h3>
              <button
                type="button"
                onClick={() => setShowCustomizer(false)}
                className="text-muted-foreground hover:text-foreground p-1"
                aria-label="Close customizer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-3 divide-y divide-border/60 text-xs">
              {/* Essential */}
              <div className="pt-2 flex items-center justify-between gap-4">
                <div>
                  <div className="font-semibold text-foreground flex items-center gap-1.5">
                    Strictly Essential Cookies & Security
                    <span className="text-[10px] text-brand-emerald font-bold">(Always Active)</span>
                  </div>
                  <p className="text-[11px] text-muted-foreground">
                    Required for account authentication, shopping cart persistence, and Lipa na M-Pesa escrow verification.
                  </p>
                </div>
                <div className="w-9 h-5 bg-emerald-600 rounded-full flex items-center justify-end px-1 cursor-not-allowed opacity-80">
                  <div className="w-3.5 h-3.5 bg-white rounded-full" />
                </div>
              </div>

              {/* Analytics */}
              <div className="pt-3 flex items-center justify-between gap-4">
                <div>
                  <div className="font-semibold text-foreground">Analytics & Site Optimization</div>
                  <p className="text-[11px] text-muted-foreground">
                    Allows Google Analytics 4 to measure page response times, county delivery routes, and platform performance.
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() =>
                    setPreferences((p) => ({ ...p, analytics: !p.analytics }))
                  }
                  className={`w-9 h-5 rounded-full flex items-center transition-colors px-0.5 ${
                    preferences.analytics
                      ? "bg-brand-emerald justify-end"
                      : "bg-muted-foreground/30 justify-start"
                  }`}
                  aria-pressed={preferences.analytics}
                >
                  <div className="w-3.5 h-3.5 bg-white rounded-full shadow-sm" />
                </button>
              </div>

              {/* Marketing */}
              <div className="pt-3 flex items-center justify-between gap-4">
                <div>
                  <div className="font-semibold text-foreground">Advertising & Conversion Measurement</div>
                  <p className="text-[11px] text-muted-foreground">
                    Enables Google Ads and Meta Ads (Facebook/Instagram) to show relevant Kenyan deals and credit merchant campaigns.
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() =>
                    setPreferences((p) => ({ ...p, marketing: !p.marketing }))
                  }
                  className={`w-9 h-5 rounded-full flex items-center transition-colors px-0.5 ${
                    preferences.marketing
                      ? "bg-brand-emerald justify-end"
                      : "bg-muted-foreground/30 justify-start"
                  }`}
                  aria-pressed={preferences.marketing}
                >
                  <div className="w-3.5 h-3.5 bg-white rounded-full shadow-sm" />
                </button>
              </div>
            </div>

            <div className="flex items-center justify-end gap-2 pt-3 border-t border-border/60">
              <button
                type="button"
                onClick={() => setShowCustomizer(false)}
                className="px-3 py-1.5 rounded-lg border border-border text-xs font-semibold hover:bg-muted text-muted-foreground"
              >
                Back
              </button>
              <button
                type="button"
                onClick={handleSaveCustom}
                className="px-4 py-1.5 rounded-lg bg-brand-emerald hover:bg-brand-emerald-dark text-white text-xs font-bold shadow-sm"
              >
                Save Preferences
              </button>
            </div>
          </div>
        )}
      </div>
    </aside>
  );
}
