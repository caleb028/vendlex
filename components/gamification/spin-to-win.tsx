"use client";

import React, { useState } from "react";
import { Sparkles, Gift, X, CheckCircle2 } from "lucide-react";
import confetti from "canvas-confetti";

export function SpinToWinModal({
  isOpen,
  onClose,
}: {
  isOpen: boolean;
  onClose: () => void;
}) {
  const [isSpinning, setIsSpinning] = useState(false);
  const [rotation, setRotation] = useState(0);
  const [wonPrize, setWonPrize] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleSpin = () => {
    if (isSpinning) return;
    setIsSpinning(true);
    setWonPrize(null);

    const randomDegrees = 1440 + Math.floor(Math.random() * 360); // 4 full rotations
    setRotation(randomDegrees);

    setTimeout(() => {
      setIsSpinning(false);
      setWonPrize("KSh 200 OFF Coupon (Code: SOKO200)");
      try {
        confetti({ particleCount: 120, spread: 80, origin: { y: 0.6 } });
      } catch (e) {}
    }, 3000);
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-md flex items-center justify-center p-4">
      <div className="bg-white dark:bg-brand-dark-card border border-border rounded-3xl p-6 w-full max-w-md text-center space-y-5 shadow-2xl relative animate-scaleUp">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-1.5 rounded-full hover:bg-muted text-muted-foreground"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="space-y-1">
          <div className="inline-flex items-center gap-1.5 text-xs font-black text-amber-500 uppercase tracking-wider bg-amber-100 dark:bg-amber-950 px-3 py-1 rounded-full">
            <Gift className="w-4 h-4" />
            <span>VendLex Spin &amp; Win</span>
          </div>
          <h3 className="text-xl font-black text-foreground">Daily Lucky Wheel</h3>
          <p className="text-xs text-muted-foreground">Spin to win instant checkout discount coupons &amp; free delivery!</p>
        </div>

        {/* Wheel Container */}
        <div className="relative w-64 h-64 mx-auto my-4 flex items-center justify-center">
          {/* Wheel Pointer Triangle */}
          <div className="absolute -top-3 left-1/2 -translate-x-1/2 z-20 w-0 h-0 border-l-[12px] border-l-transparent border-r-[12px] border-r-transparent border-t-[20px] border-t-brand-red filter drop-shadow-md" />

          {/* Animated Wheel Circle */}
          <div
            className="w-full h-full rounded-full border-4 border-amber-400 shadow-2xl overflow-hidden transition-transform duration-[3000ms] cubic-bezier(0.15, 0.90, 0.20, 1.00) relative"
            style={{ transform: `rotate(${rotation}deg)` }}
          >
            <div className="absolute inset-0 bg-gradient-to-tr from-brand-emerald via-amber-400 to-teal-500 rounded-full flex items-center justify-center text-white font-extrabold text-xs shadow-inner">
              <span className="transform -rotate-45 block">KSh 200 OFF • FREE DELIVERY • 2X POINTS • 10% OFF</span>
            </div>
          </div>

          <button
            onClick={handleSpin}
            disabled={isSpinning}
            className="absolute z-30 w-16 h-16 rounded-full bg-brand-gold text-brand-charcoal font-black text-xs shadow-glow-yellow border-2 border-white hover:scale-105 active:scale-95 transition-all flex items-center justify-center uppercase tracking-wider"
          >
            {isSpinning ? "Spinning" : "SPIN"}
          </button>
        </div>

        {wonPrize && (
          <div className="p-4 bg-emerald-100 dark:bg-emerald-950/60 border border-emerald-300 text-brand-emerald rounded-2xl space-y-2 animate-fadeIn">
            <div className="flex items-center justify-center gap-1.5 font-black text-sm">
              <CheckCircle2 className="w-5 h-5" />
              <span>Asante! You Won:</span>
            </div>
            <p className="text-xs font-mono font-bold text-foreground">{wonPrize}</p>
          </div>
        )}
      </div>
    </div>
  );
}
