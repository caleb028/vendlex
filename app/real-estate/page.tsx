"use client";

import React from "react";
import { Home as HomeIcon, MapPin, ShieldCheck, Key, CheckCircle2, ArrowRight } from "lucide-react";
import { formatKSh } from "@/lib/utils";

const PROPERTY_LISTINGS = [
  { id: "prop-1", title: "50x100 Commercial Plot with Title Deed", type: "Land Plot", location: "Ruiru, Kiambu County", price: 2850000, deposit: 50000, verified: true },
  { id: "prop-2", title: "Modern 2-Bedroom Apartment with Balcony", type: "For Rent", location: "Kilimani, Nairobi", price: 65000, deposit: 65000, verified: true },
  { id: "prop-3", title: "Beachfront Commercial Retail Shop Space", type: "Commercial Lease", location: "Nyali, Mombasa", price: 45000, deposit: 45000, verified: true },
];

export default function RealEstatePage() {
  return (
    <div className="bg-brand-off-white dark:bg-brand-dark-bg min-h-screen py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
        <div className="bg-gradient-to-r from-emerald-900 via-teal-900 to-brand-charcoal rounded-3xl p-8 text-white shadow-xl flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2">
            <span className="bg-amber-400 text-brand-charcoal text-xs font-black px-3 py-1 rounded-full uppercase tracking-wider">
              🏡 Title Deed &amp; Escrow Deposit Protected
            </span>
            <h1 className="text-3xl sm:text-4xl font-black">Real Estate &amp; Property Rentals</h1>
            <p className="text-xs sm:text-sm text-emerald-200 max-w-xl">
              Verified land plots, commercial retail shops, and residential apartments across all 47 Kenyan counties.
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {PROPERTY_LISTINGS.map((prop) => (
            <div key={prop.id} className="bg-white dark:bg-brand-dark-card border border-border rounded-3xl p-6 space-y-4 shadow-sm flex flex-col justify-between">
              <div className="space-y-3">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-bold bg-muted px-2.5 py-0.5 rounded text-foreground">{prop.type}</span>
                  <span className="text-brand-emerald font-bold flex items-center gap-1">
                    <ShieldCheck className="w-3.5 h-3.5" />
                    Title Verified
                  </span>
                </div>
                <h3 className="font-extrabold text-base text-foreground leading-snug">{prop.title}</h3>
                <div className="flex items-center gap-1 text-xs text-muted-foreground">
                  <MapPin className="w-3.5 h-3.5 text-brand-red shrink-0" />
                  <span>{prop.location}</span>
                </div>
                <div className="p-3 bg-emerald-50 dark:bg-emerald-950/40 rounded-xl text-xs flex justify-between items-center border border-emerald-200">
                  <span className="text-muted-foreground font-semibold">Total Price:</span>
                  <span className="text-base font-black text-brand-emerald">{formatKSh(prop.price)}</span>
                </div>
              </div>

              <button
                onClick={() => alert(`Escrow Viewing Deposit of KSh ${prop.deposit} reserved for ${prop.title}`)}
                className="w-full bg-brand-emerald hover:bg-brand-emerald-dark text-white font-bold py-3 rounded-xl text-xs flex items-center justify-center gap-2 shadow-sm transition-all"
              >
                <Key className="w-4 h-4" />
                <span>Reserve Viewing via Escrow</span>
              </button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
