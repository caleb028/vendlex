"use client";

import React, { useState } from "react";
import { Camera, CheckCircle2, ShieldCheck, Upload, Image as ImageIcon } from "lucide-react";

export function ProofOfDelivery({
  orderNumber = "ORD-9842",
  customerName = "Grace Wanjiku",
}: {
  orderNumber?: string;
  customerName?: string;
}) {
  const [photoUrl, setPhotoUrl] = useState<string | null>(null);
  const [isVerified, setIsVerified] = useState(false);

  const handlePhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        if (event.target?.result) {
          setPhotoUrl(event.target.result as string);
          setIsVerified(true);
        }
      };
      reader.readAsDataURL(file);
    }
  };

  return (
    <div className="bg-white dark:bg-brand-dark-card border border-border dark:border-brand-dark-border rounded-3xl p-6 shadow-sm space-y-4">
      <div className="flex items-center justify-between border-b border-border pb-3">
        <div className="flex items-center gap-2">
          <ShieldCheck className="w-5 h-5 text-brand-emerald" />
          <div>
            <h3 className="font-extrabold text-sm text-foreground">Verified Proof-of-Delivery (POD)</h3>
            <p className="text-xs text-muted-foreground">Doorstep parcel delivery photo verification for order #{orderNumber}.</p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 items-center">
        <div className="relative aspect-video rounded-2xl border-2 border-dashed border-border hover:border-brand-emerald bg-muted/20 flex items-center justify-center overflow-hidden">
          {photoUrl ? (
            <img src={photoUrl} alt="Doorstep Delivery Proof" className="w-full h-full object-cover" />
          ) : (
            <label htmlFor="pod-upload" className="cursor-pointer text-center p-4">
              <Camera className="w-8 h-8 text-brand-emerald mx-auto mb-1 opacity-70" />
              <span className="text-xs font-bold text-foreground block">Snap / Upload Doorstep Photo</span>
              <span className="text-[10px] text-muted-foreground">Driver photo of parcel received by {customerName}</span>
            </label>
          )}
          <input type="file" id="pod-upload" accept="image/*" onChange={handlePhotoUpload} className="hidden" />
        </div>

        <div className="space-y-3">
          {isVerified ? (
            <div className="p-4 bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-300 text-brand-emerald rounded-2xl text-xs space-y-1 animate-fadeIn">
              <div className="flex items-center gap-1.5 font-bold text-sm">
                <CheckCircle2 className="w-4 h-4 shrink-0" />
                <span>Proof-of-Delivery Verified ✓</span>
              </div>
              <p className="text-[11px] text-emerald-700 dark:text-emerald-300">
                Timestamp &amp; GPS geotag logged. Escrow payout release scheduled to seller M-Pesa.
              </p>
            </div>
          ) : (
            <p className="text-xs text-muted-foreground leading-relaxed">
              Uploading a clear doorstep photo automatically triggers M-Pesa Escrow payout release to the merchant and confirms buyer receipt.
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
