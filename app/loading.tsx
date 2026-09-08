import React from "react";

export default function Loading() {
  return (
    <div className="min-h-[70vh] flex flex-col items-center justify-center p-6 space-y-6">
      {/* Branded Glowing Ring with Logo */}
      <div className="relative flex items-center justify-center">
        {/* Pulsing ambient glow */}
        <div className="absolute w-28 h-28 rounded-full bg-brand-emerald/20 blur-xl animate-pulse" />
        
        {/* Dual spinning conic border rings */}
        <div className="w-20 h-20 rounded-3xl border-2 border-brand-emerald/20 border-t-brand-emerald border-r-brand-gold animate-spin" />

        {/* Center Logo Icon */}
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="w-12 h-12 rounded-2xl bg-white dark:bg-brand-dark-card p-1.5 shadow-md flex items-center justify-center">
            <img
              src="/logo/vendlex-mark.png"
              alt="VendLex"
              className="w-full h-full object-contain"
            />
          </div>
        </div>
      </div>

      {/* Stylish Loading Status */}
      <div className="text-center space-y-1.5">
        <div className="inline-flex items-center gap-2 text-xs font-bold text-foreground tracking-wider uppercase">
          <span className="w-2 h-2 rounded-full bg-brand-emerald animate-ping" />
          <span>VendLex</span>
        </div>
        <div className="text-[10px] font-extrabold tracking-[0.16em] text-brand-gold uppercase">
          SHOP • GROW • PROSPER
        </div>
        <p className="text-[11px] text-muted-foreground">
          Connecting to Kenya&apos;s digital commerce network
        </p>
      </div>

      {/* Shimmer skeleton bars */}
      <div className="w-48 space-y-2 pt-2">
        <div className="h-1.5 w-full bg-muted rounded-full overflow-hidden">
          <div className="h-full bg-gradient-to-r from-brand-emerald via-emerald-400 to-brand-gold w-1/2 rounded-full animate-indeterminate" />
        </div>
      </div>
    </div>
  );
}
