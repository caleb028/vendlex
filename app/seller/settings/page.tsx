"use client";

import React, { useState } from "react";
import { useAuth } from "@/lib/store/auth-store";
import { KENYAN_COUNTIES } from "@/lib/data/kenya-data";
import { Settings, Save, CheckCircle2, ShieldCheck, Smartphone, Clock, Store } from "lucide-react";

export default function SellerSettingsPage() {
  const { user } = useAuth();
  const [savedToast, setSavedToast] = useState(false);

  // Form states
  const [storeName, setStoreName] = useState(user?.businessName || "Nairobi Tech Hub");
  const [tagline, setTagline] = useState("Your Premier Source for Genuine Gadgets & Laptops");
  const [county, setCounty] = useState("Nairobi");
  const [town, setTown] = useState("CBD");
  const [location, setLocation] = useState("Bazaar Plaza, 4th Floor, Suite 412, Moi Avenue");
  const [phone, setPhone] = useState("+254 712 345 678");
  const [whatsapp, setWhatsapp] = useState("+254 712 345 678");

  // M-Pesa Settlement
  const [mpesaTill, setMpesaTill] = useState("894120");
  const [mpesaPaybill, setMpesaPaybill] = useState("400200");
  const [accountName, setAccountName] = useState("Nairobi Tech Hub KE");

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    setSavedToast(true);
    setTimeout(() => setSavedToast(false), 2500);
  };

  return (
    <div className="space-y-6 max-w-4xl">
      <div>
        <h1 className="text-2xl font-black text-foreground">Store Settings & Settlement</h1>
        <p className="text-xs text-muted-foreground">Configure your public storefront branding, contact information, and M-Pesa payout endpoints.</p>
      </div>

      {savedToast && (
        <div className="bg-emerald-100 dark:bg-emerald-950/60 border border-emerald-300 text-brand-emerald p-4 rounded-2xl text-xs font-bold flex items-center gap-2 animate-fadeIn">
          <CheckCircle2 className="w-4 h-4" />
          <span>Storefront settings and M-Pesa settlement details saved successfully!</span>
        </div>
      )}

      <form onSubmit={handleSave} className="space-y-6">
        {/* Store Profile Card */}
        <div className="bg-white dark:bg-brand-dark-card border border-border rounded-3xl p-6 shadow-sm space-y-4">
          <h3 className="font-extrabold text-sm text-foreground flex items-center gap-2">
            <Store className="w-4 h-4 text-brand-emerald" />
            <span>Storefront Profile Information</span>
          </h3>

          <div className="space-y-3">
            <div>
              <label className="block text-xs font-bold text-foreground mb-1">Business Store Name *</label>
              <input
                type="text"
                required
                value={storeName}
                onChange={(e) => setStoreName(e.target.value)}
                className="w-full bg-muted/30 border border-border rounded-xl p-3 text-xs text-foreground focus:outline-none focus:border-brand-emerald font-semibold"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-foreground mb-1">Headline Tagline</label>
              <input
                type="text"
                value={tagline}
                onChange={(e) => setTagline(e.target.value)}
                className="w-full bg-muted/30 border border-border rounded-xl p-3 text-xs text-foreground focus:outline-none focus:border-brand-emerald"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-bold text-foreground mb-1">County *</label>
                <select
                  value={county}
                  onChange={(e) => setCounty(e.target.value)}
                  className="w-full bg-muted/30 border border-border rounded-xl p-3 text-xs text-foreground focus:outline-none focus:border-brand-emerald font-semibold"
                >
                  {KENYAN_COUNTIES.map((c) => (
                    <option key={c} value={c}>{c}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-foreground mb-1">Town / Area *</label>
                <input
                  type="text"
                  value={town}
                  onChange={(e) => setTown(e.target.value)}
                  className="w-full bg-muted/30 border border-border rounded-xl p-3 text-xs text-foreground focus:outline-none focus:border-brand-emerald"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-foreground mb-1">Physical Store / Office Address</label>
              <input
                type="text"
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                className="w-full bg-muted/30 border border-border rounded-xl p-3 text-xs text-foreground focus:outline-none focus:border-brand-emerald"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-bold text-foreground mb-1">Public Phone Call Number *</label>
                <input
                  type="tel"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  className="w-full bg-muted/30 border border-border rounded-xl p-3 text-xs text-foreground font-mono focus:outline-none focus:border-brand-emerald"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-foreground mb-1">Public WhatsApp Contact *</label>
                <input
                  type="tel"
                  value={whatsapp}
                  onChange={(e) => setWhatsapp(e.target.value)}
                  className="w-full bg-muted/30 border border-border rounded-xl p-3 text-xs text-foreground font-mono focus:outline-none focus:border-brand-emerald"
                />
              </div>
            </div>
          </div>
        </div>

        {/* M-Pesa Settlement Configuration */}
        <div className="bg-white dark:bg-brand-dark-card border border-border rounded-3xl p-6 shadow-sm space-y-4">
          <h3 className="font-extrabold text-sm text-foreground flex items-center gap-2">
            <Smartphone className="w-4 h-4 text-emerald-600" />
            <span>M-Pesa Payout & Settlement Settings</span>
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div>
              <label className="block text-xs font-bold text-foreground mb-1">M-Pesa Buy Goods Till No.</label>
              <input
                type="text"
                value={mpesaTill}
                onChange={(e) => setMpesaTill(e.target.value)}
                placeholder="894120"
                className="w-full bg-muted/30 border border-border rounded-xl p-3 text-xs text-foreground font-mono font-bold focus:outline-none focus:border-brand-emerald"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-foreground mb-1">M-Pesa Paybill Number</label>
              <input
                type="text"
                value={mpesaPaybill}
                onChange={(e) => setMpesaPaybill(e.target.value)}
                placeholder="400200"
                className="w-full bg-muted/30 border border-border rounded-xl p-3 text-xs text-foreground font-mono focus:outline-none focus:border-brand-emerald"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-foreground mb-1">M-Pesa Registered Account Name</label>
              <input
                type="text"
                value={accountName}
                onChange={(e) => setAccountName(e.target.value)}
                className="w-full bg-muted/30 border border-border rounded-xl p-3 text-xs text-foreground focus:outline-none focus:border-brand-emerald"
              />
            </div>
          </div>
        </div>

        <div className="flex justify-end">
          <button
            type="submit"
            className="bg-brand-emerald hover:bg-brand-emerald-dark text-white font-bold py-3.5 px-8 rounded-xl text-xs sm:text-sm shadow-md transition-all flex items-center gap-2"
          >
            <Save className="w-4 h-4" />
            <span>Save All Settings</span>
          </button>
        </div>
      </form>
    </div>
  );
}
