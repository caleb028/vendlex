"use client";

import React, { useState } from "react";
import { Sparkles, Wand2, Sun, Image as ImageIcon, Check, Download, RefreshCw, UploadCloud } from "lucide-react";

export function AIPhotoEnhancer() {
  const [imageSrc, setImageSrc] = useState<string | null>(
    "https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?q=80&w=800&auto=format&fit=crop"
  );
  const [isProcessing, setIsProcessing] = useState(false);
  const [bgRemoved, setBgRemoved] = useState(false);
  const [lightingCorrected, setLightingCorrected] = useState(false);
  const [sharpened, setSharpened] = useState(false);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        if (event.target?.result) {
          setImageSrc(event.target.result as string);
          setBgRemoved(false);
          setLightingCorrected(false);
          setSharpened(false);
        }
      };
      reader.readAsDataURL(file);
    }
  };

  const runAIEnhancement = (type: "bg" | "lighting" | "auto") => {
    setIsProcessing(true);
    setSuccessMsg(null);

    setTimeout(() => {
      setIsProcessing(false);
      if (type === "bg") {
        setBgRemoved(true);
        setSuccessMsg("AI Background Removal Complete! Clean white studio backdrop applied.");
      } else if (type === "lighting") {
        setLightingCorrected(true);
        setSuccessMsg("AI Lighting Correction Applied! Soft studio shadows & exposure balanced.");
      } else {
        setBgRemoved(true);
        setLightingCorrected(true);
        setSharpened(true);
        setSuccessMsg("Full AI Studio Enhancement Complete! Ready for marketplace listing.");
      }
    }, 1200);
  };

  return (
    <div className="bg-white dark:bg-brand-dark-card border border-border dark:border-brand-dark-border rounded-3xl p-6 shadow-sm space-y-6">
      <div className="flex items-center justify-between border-b border-border pb-4">
        <div className="flex items-center gap-2">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-600 text-white flex items-center justify-center shadow-md">
            <Wand2 className="w-5 h-5" />
          </div>
          <div>
            <h3 className="font-extrabold text-base text-foreground flex items-center gap-1.5">
              <span>AI Product Photo Enhancer</span>
              <span className="bg-amber-100 dark:bg-amber-950 text-amber-600 text-[10px] font-black px-2 py-0.5 rounded-full uppercase">
                PRO FEATURE
              </span>
            </h3>
            <p className="text-xs text-muted-foreground">Studio background removal, lighting correction &amp; HD optimization.</p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-center">
        {/* Preview Canvas */}
        <div className="relative aspect-square rounded-2xl overflow-hidden border border-border bg-muted/40 flex items-center justify-center group shadow-inner">
          {imageSrc ? (
            <img
              src={imageSrc}
              alt="AI Product Preview"
              className={`w-full h-full object-contain transition-all duration-500 ${
                bgRemoved ? "bg-white p-6 shadow-2xl scale-95" : ""
              } ${lightingCorrected ? "brightness-110 contrast-105 saturate-110" : ""} ${
                sharpened ? "drop-shadow-xl" : ""
              }`}
            />
          ) : (
            <div className="text-center text-muted-foreground p-4">
              <ImageIcon className="w-12 h-12 mx-auto mb-2 opacity-50" />
              <span className="text-xs">Upload product photo from your device</span>
            </div>
          )}

          {isProcessing && (
            <div className="absolute inset-0 bg-black/60 backdrop-blur-sm flex flex-col items-center justify-center text-white space-y-3 z-20">
              <RefreshCw className="w-8 h-8 animate-spin text-brand-emerald" />
              <span className="text-xs font-bold tracking-wider uppercase">Running AI Neural Enhancer...</span>
            </div>
          )}
        </div>

        {/* Controls Panel */}
        <div className="space-y-4">
          <div className="space-y-2">
            <label htmlFor="ai-photo-upload" className="w-full border-2 border-dashed border-border hover:border-brand-emerald bg-muted/20 hover:bg-muted/40 p-4 rounded-2xl cursor-pointer flex items-center justify-center gap-2 text-xs font-bold text-foreground transition-all">
              <UploadCloud className="w-5 h-5 text-brand-emerald" />
              <span>Upload Photo from Phone/PC</span>
            </label>
            <input type="file" id="ai-photo-upload" accept="image/*" onChange={handleFileUpload} className="hidden" />
          </div>

          <div className="space-y-2">
            <span className="text-xs font-bold text-muted-foreground uppercase tracking-wider">AI Enhancement Modes</span>

            <button
              onClick={() => runAIEnhancement("auto")}
              disabled={isProcessing}
              className="w-full bg-gradient-to-r from-brand-emerald via-emerald-600 to-teal-600 hover:opacity-95 text-white font-extrabold py-3 px-4 rounded-xl text-xs flex items-center justify-center gap-2 shadow-md transition-all"
            >
              <Sparkles className="w-4 h-4 text-amber-300 animate-spin" />
              <span>Full AI Studio Auto-Enhance</span>
            </button>

            <div className="grid grid-cols-2 gap-2">
              <button
                onClick={() => runAIEnhancement("bg")}
                disabled={isProcessing}
                className={`py-2.5 px-3 rounded-xl border text-xs font-bold flex items-center justify-center gap-1.5 transition-all ${
                  bgRemoved
                    ? "bg-emerald-50 dark:bg-emerald-950/60 border-brand-emerald text-brand-emerald"
                    : "border-border hover:bg-muted text-foreground"
                }`}
              >
                <Wand2 className="w-3.5 h-3.5" />
                <span>{bgRemoved ? "Background Removed ✓" : "Remove BG"}</span>
              </button>

              <button
                onClick={() => runAIEnhancement("lighting")}
                disabled={isProcessing}
                className={`py-2.5 px-3 rounded-xl border text-xs font-bold flex items-center justify-center gap-1.5 transition-all ${
                  lightingCorrected
                    ? "bg-emerald-50 dark:bg-emerald-950/60 border-brand-emerald text-brand-emerald"
                    : "border-border hover:bg-muted text-foreground"
                }`}
              >
                <Sun className="w-3.5 h-3.5" />
                <span>{lightingCorrected ? "Lighting Fixed ✓" : "Fix Lighting"}</span>
              </button>
            </div>
          </div>

          {successMsg && (
            <div className="p-3 bg-emerald-100 dark:bg-emerald-950/60 border border-emerald-300 text-brand-emerald rounded-xl text-xs font-bold flex items-center gap-2 animate-fadeIn">
              <Check className="w-4 h-4 shrink-0" />
              <span>{successMsg}</span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
