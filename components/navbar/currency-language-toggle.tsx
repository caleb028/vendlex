"use client";

import React, { useState } from "react";
import { Globe, DollarSign, ChevronDown } from "lucide-react";

export function CurrencyLanguageToggle() {
  const [currency, setCurrency] = useState<"KES" | "UGX" | "TZS" | "RWF">("KES");
  const [language, setLanguage] = useState<"EN" | "SW">("EN");
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-1.5 bg-muted/60 hover:bg-muted dark:bg-brand-dark-card border border-border px-2.5 py-1.5 rounded-xl text-xs font-bold text-foreground transition-all"
        title="Change Currency & Language"
      >
        <Globe className="w-3.5 h-3.5 text-brand-emerald" />
        <span>{currency}</span>
        <span className="text-[10px] text-muted-foreground font-mono">({language})</span>
        <ChevronDown className="w-3 h-3 text-muted-foreground" />
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-2 w-48 bg-white dark:bg-brand-dark-card border border-border dark:border-brand-dark-border rounded-2xl shadow-xl p-3 z-50 space-y-3 animate-scaleUp text-xs">
          <div>
            <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider block mb-1">
              Currency / Mfumo wa Pesa
            </span>
            <div className="grid grid-cols-2 gap-1 font-bold">
              {[
                { code: "KES", label: "🇰🇪 KES" },
                { code: "UGX", label: "🇺🇬 UGX" },
                { code: "TZS", label: "🇹🇿 TZS" },
                { code: "RWF", label: "🇷🇼 RWF" },
              ].map((c) => (
                <button
                  key={c.code}
                  onClick={() => {
                    setCurrency(c.code as any);
                    setIsOpen(false);
                  }}
                  className={`p-1.5 rounded-lg text-left transition-colors ${
                    currency === c.code ? "bg-brand-emerald text-white" : "hover:bg-muted text-foreground"
                  }`}
                >
                  {c.label}
                </button>
              ))}
            </div>
          </div>

          <div className="border-t border-border pt-2">
            <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider block mb-1">
              Language / Lugha
            </span>
            <div className="flex items-center gap-1 font-bold">
              <button
                onClick={() => {
                  setLanguage("EN");
                  setIsOpen(false);
                }}
                className={`flex-1 p-1.5 rounded-lg transition-colors ${
                  language === "EN" ? "bg-brand-emerald text-white" : "hover:bg-muted text-foreground"
                }`}
              >
                🇬🇧 English
              </button>
              <button
                onClick={() => {
                  setLanguage("SW");
                  setIsOpen(false);
                }}
                className={`flex-1 p-1.5 rounded-lg transition-colors ${
                  language === "SW" ? "bg-brand-emerald text-white" : "hover:bg-muted text-foreground"
                }`}
              >
                🇰🇪 Kiswahili
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
