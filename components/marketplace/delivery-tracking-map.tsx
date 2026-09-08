"use client";

import React, { useState } from "react";
import { Truck, MapPin, CheckCircle2, ShieldCheck, Clock, Navigation } from "lucide-react";
import { formatKSh } from "@/lib/utils";

export function DeliveryTrackingMap({
  trackingCode = "FARGO-89421",
  courier = "Fargo Courier KE",
  deliveryCounty = "Nairobi",
  deliveryTown = "Westlands",
}: {
  trackingCode?: string;
  courier?: string;
  deliveryCounty?: string;
  deliveryTown?: string;
}) {
  const [selectedCourier, setSelectedCourier] = useState(courier);
  const [hasInsurance, setHasInsurance] = useState(true);

  const steps = [
    { label: "Order Placed & Escrow Secured", date: "Aug 31, 09:30 AM", completed: true },
    { label: "Packed at Nairobi Tech Hub Store", date: "Aug 31, 11:15 AM", completed: true },
    { label: `Dispatched via ${selectedCourier}`, date: "Aug 31, 01:40 PM", completed: true },
    { label: `Out for Delivery in ${deliveryTown}, ${deliveryCounty}`, date: "Today, 03:15 PM", completed: true, active: true },
    { label: "Delivered & Buyer Confirmation", date: "Estimated 04:30 PM", completed: false },
  ];

  return (
    <div className="bg-white dark:bg-brand-dark-card border border-border dark:border-brand-dark-border rounded-3xl p-6 shadow-sm space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-border pb-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-brand-emerald text-white flex items-center justify-center shadow-md">
            <Truck className="w-5 h-5" />
          </div>
          <div>
            <h3 className="font-extrabold text-base text-foreground">
              Live Courier Tracking Map &amp; ETA Engine
            </h3>
            <p className="text-xs text-muted-foreground">Tracking Reference: <span className="font-mono text-brand-emerald font-bold">{trackingCode}</span></p>
          </div>
        </div>

        <span className="inline-flex items-center gap-1 bg-emerald-100 dark:bg-emerald-950 text-brand-emerald font-bold text-xs px-3 py-1 rounded-full border border-emerald-300">
          <Navigation className="w-3.5 h-3.5 animate-spin" />
          <span>Out for Delivery</span>
        </span>
      </div>

      {/* Simulated GPS Live Route Map Box */}
      <div className="relative h-48 w-full rounded-2xl bg-gradient-to-br from-emerald-900 via-gray-900 to-black overflow-hidden p-5 flex flex-col justify-between text-white shadow-inner border border-emerald-800">
        {/* Animated Map Grid Lines */}
        <div className="absolute inset-0 bg-[radial-gradient(#10b981_1px,transparent_1px)] [background-size:16px_16px] opacity-25" />

        <div className="relative z-10 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <MapPin className="w-4 h-4 text-brand-red animate-bounce" />
            <span className="text-xs font-bold">{deliveryTown}, {deliveryCounty} Route</span>
          </div>
          <span className="text-[11px] bg-white/20 px-2.5 py-0.5 rounded-full font-mono">
            GPS Signal: Lock (±4m)
          </span>
        </div>

        {/* Courier Rider Icon in Motion */}
        <div className="relative z-10 my-auto flex items-center justify-center gap-3">
          <div className="p-3 rounded-2xl bg-brand-emerald/80 backdrop-blur-md border border-emerald-400 shadow-glow-green flex items-center gap-2 animate-pulse">
            <Truck className="w-6 h-6 text-white" />
            <div>
              <span className="font-extrabold text-xs block">{selectedCourier} Dispatch</span>
              <span className="text-[10px] text-emerald-200 block">Rider: Joseph M. (+254 722 000 111)</span>
            </div>
          </div>
        </div>

        <div className="relative z-10 flex items-center justify-between text-xs text-gray-300">
          <span>Speed: 42 km/h</span>
          <span className="font-bold text-emerald-400">ETA: 25 mins remaining</span>
        </div>
      </div>

      {/* Timeline Steps */}
      <div className="space-y-3 pt-2">
        <h4 className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Order Delivery Milestones</h4>
        <div className="space-y-3">
          {steps.map((st, idx) => (
            <div key={idx} className="flex items-start gap-3 text-xs">
              <div className={`w-5 h-5 rounded-full flex items-center justify-center shrink-0 mt-0.5 ${
                st.completed
                  ? "bg-brand-emerald text-white"
                  : "bg-muted text-muted-foreground border border-border"
              }`}>
                {st.completed ? "✓" : idx + 1}
              </div>
              <div className="flex-1 min-w-0">
                <span className={`font-bold block ${st.active ? "text-brand-emerald" : "text-foreground"}`}>
                  {st.label}
                </span>
                <span className="text-[10px] text-muted-foreground">{st.date}</span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Insurance add-on option */}
      <div className="p-4 bg-muted/40 dark:bg-brand-dark-bg/60 border border-border rounded-2xl flex items-center justify-between gap-4">
        <div className="flex items-center gap-2.5">
          <ShieldCheck className="w-5 h-5 text-brand-emerald shrink-0" />
          <div>
            <span className="font-bold text-xs text-foreground block">VendLex Delivery Protection &amp; Insurance</span>
            <span className="text-[10px] text-muted-foreground block">Guarantees 100% full refund or immediate replacement if item is damaged during transit.</span>
          </div>
        </div>
        <label className="flex items-center gap-1.5 cursor-pointer shrink-0">
          <input
            type="checkbox"
            checked={hasInsurance}
            onChange={(e) => setHasInsurance(e.target.checked)}
            className="rounded text-brand-emerald accent-brand-emerald w-4 h-4"
          />
          <span className="text-xs font-bold text-brand-emerald">+KSh 150</span>
        </label>
      </div>
    </div>
  );
}
