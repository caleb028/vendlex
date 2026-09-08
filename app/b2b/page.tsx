"use client";

import React, { useState } from "react";
import Link from "next/link";
import {
  Building2,
  Package,
  CheckCircle2,
  ShieldCheck,
  FileText,
  ArrowRight,
  Briefcase,
  GraduationCap,
  Landmark,
  HeartHandshake,
  CreditCard,
  UserCheck,
  Sparkles,
  Check,
} from "lucide-react";
import { formatKSh } from "@/lib/utils";

const TARGET_CLIENTS = [
  { title: "Corporate Enterprises", desc: "Office tech, furniture, stationery & hardware supplies at contracted rates.", icon: Building2 },
  { title: "NGOs & Non-Profits", desc: "Emergency supplies, solar arrays, water purification, and direct field dispatch.", icon: HeartHandshake },
  { title: "Educational Institutions", desc: "Laptops, science lab kits, school uniforms, and cafeteria provisions in bulk.", icon: GraduationCap },
  { title: "Government Contractors", desc: "Compliant procurement with automated KRA eTIMS invoice reconciliation.", icon: Landmark },
];

const B2B_CATALOG = [
  {
    id: "b2b-1",
    title: "Commercial SunKing 500X Solar Power Hubs (Contractor Pack)",
    supplier: "Rift Solar Energy Ltd",
    county: "Nakuru / Nairobi",
    moq: "5 Units",
    unitPrice: 32000,
    retailPrice: 38500,
    etims: "eTIMS Certified (VAT Inclusive)",
    leadTime: "48 Hours Countrywide",
  },
  {
    id: "b2b-2",
    title: "HP EliteBook 840 G10 Enterprise Laptop Bundles (10-Pack)",
    supplier: "Nairobi Tech Hub Corporate",
    county: "Nairobi CBD",
    moq: "10 Units",
    unitPrice: 84000,
    retailPrice: 98000,
    etims: "KRA Tax Invoice Provided",
    leadTime: "Same-Day Nairobi Delivery",
  },
  {
    id: "b2b-3",
    title: "Commercial Agricultural Drip Irrigation Bundles (500m Coils)",
    supplier: "Coast Agro Supplies KE",
    county: "Mombasa & Coast",
    moq: "4 Coils",
    unitPrice: 8500,
    retailPrice: 11200,
    etims: "Full Tax Clearance Available",
    leadTime: "24-48 Hours Linehaul",
  },
  {
    id: "b2b-4",
    title: "High-Grade Kenyan Sisal Eco-Bags & Corporate Hampers (500-Pack)",
    supplier: "Kilifi Women Craft Cooperative",
    county: "Kilifi",
    moq: "500 Units",
    unitPrice: 380,
    retailPrice: 650,
    etims: "KRA Compliant",
    leadTime: "Custom Branded in 5 Days",
  },
];

export default function B2BProcurementPage() {
  const [rfqModalOpen, setRfqModalOpen] = useState(false);
  const [rfqSubmitted, setRfqSubmitted] = useState(false);
  const [creditApplied, setCreditApplied] = useState(false);

  return (
    <div className="bg-brand-off-white dark:bg-brand-dark-bg min-h-screen py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-10">
        {/* Banner */}
        <div className="bg-gradient-to-r from-slate-950 via-brand-charcoal to-brand-emerald-dark rounded-3xl p-8 sm:p-12 text-white shadow-xl space-y-6 border border-brand-emerald/30">
          <div className="inline-flex items-center gap-2 bg-emerald-950/90 border border-emerald-400/60 text-emerald-200 text-xs font-black px-3.5 py-1.5 rounded-full uppercase tracking-wider">
            <Briefcase className="w-3.5 h-3.5 text-amber-400" />
            <span>VendLex B2B • Corporate &amp; Institutional Commerce</span>
          </div>

          <div className="max-w-3xl space-y-3">
            <h1 className="text-3xl sm:text-5xl font-black tracking-tight leading-tight">
              Enterprise Procurement Across All 47 Counties
            </h1>
            <p className="text-xs sm:text-base text-slate-300 leading-relaxed">
              Tailored procurement infrastructure for corporations, NGOs, schools, and government contractors. Direct supplier pricing, automated KRA eTIMS invoicing, 30-day credit lines, and dedicated account managers.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3 pt-2">
            <button
              onClick={() => setRfqModalOpen(true)}
              className="bg-brand-emerald hover:bg-brand-emerald-dark text-white font-black py-3 px-6 rounded-xl text-xs sm:text-sm shadow-md transition-all flex items-center gap-2 btn-glow-emerald"
            >
              <FileText className="w-4 h-4" />
              <span>Request Bulk RFQ Quote</span>
            </button>

            <button
              onClick={() => setCreditApplied(true)}
              className="bg-white/15 hover:bg-white/25 text-white font-bold py-3 px-5 rounded-xl text-xs sm:text-sm backdrop-blur-md transition-all flex items-center gap-2"
            >
              <CreditCard className="w-4 h-4 text-amber-400" />
              <span>Apply for 30-Day Credit Terms</span>
            </button>
          </div>
        </div>

        {creditApplied && (
          <div className="p-4 bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300 rounded-2xl text-xs font-bold flex items-center gap-2 animate-fadeIn">
            <Check className="w-4 h-4 text-emerald-600" />
            <span>Credit terms application initiated! A dedicated VendLex corporate account manager will contact your finance team within 2 hours.</span>
          </div>
        )}

        {/* 4 Target Sectors per Guideline #27 */}
        <div className="space-y-4">
          <div className="space-y-1">
            <h2 className="text-lg font-black text-foreground">Procurement Solutions Tailored by Sector</h2>
            <p className="text-xs text-muted-foreground">Serving verified Kenyan institutions with specialized supply-chain logistics</p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {TARGET_CLIENTS.map((client, i) => {
              const Icon = client.icon;
              return (
                <div
                  key={i}
                  className="p-5 bg-white dark:bg-brand-dark-card border border-border dark:border-brand-dark-border rounded-2xl shadow-sm space-y-3"
                >
                  <div className="p-2.5 rounded-xl bg-brand-emerald-soft text-brand-emerald w-fit">
                    <Icon className="w-5 h-5" />
                  </div>
                  <h3 className="font-bold text-sm text-foreground">{client.title}</h3>
                  <p className="text-xs text-muted-foreground leading-relaxed">{client.desc}</p>
                </div>
              );
            })}
          </div>
        </div>

        {/* 5 Key Corporate Features per Guideline #27 */}
        <div className="bg-white dark:bg-brand-dark-card border border-border dark:border-brand-dark-border rounded-3xl p-6 sm:p-8 shadow-sm space-y-6">
          <h2 className="text-lg font-black text-foreground">Why Kenya Enterprises Procure on VendLex</h2>
          <div className="grid grid-cols-1 sm:grid-cols-3 lg:grid-cols-5 gap-4 text-xs">
            <div className="space-y-1 p-3 rounded-xl bg-muted/30">
              <span className="font-bold text-brand-emerald block">1. Bulk Order Quotes</span>
              <p className="text-muted-foreground">Get multi-seller competitive pricing within 24 hours.</p>
            </div>
            <div className="space-y-1 p-3 rounded-xl bg-muted/30">
              <span className="font-bold text-brand-emerald block">2. Verified Directory</span>
              <p className="text-muted-foreground">100% KYC &amp; CR12 validated Kenyan manufacturers.</p>
            </div>
            <div className="space-y-1 p-3 rounded-xl bg-muted/30">
              <span className="font-bold text-brand-emerald block">3. eTIMS Automated Invoicing</span>
              <p className="text-muted-foreground">KRA-compliant fiscal electronic receipts on checkout.</p>
            </div>
            <div className="space-y-1 p-3 rounded-xl bg-muted/30">
              <span className="font-bold text-brand-emerald block">4. Net-30 Credit Terms</span>
              <p className="text-muted-foreground">Flexible institutional credit lines upon vetting.</p>
            </div>
            <div className="space-y-1 p-3 rounded-xl bg-muted/30">
              <span className="font-bold text-brand-emerald block">5. Account Manager</span>
              <p className="text-muted-foreground">Single point of contact for ordering and logistics.</p>
            </div>
          </div>
        </div>

        {/* Bulk Wholesale Catalog Showcase */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-lg font-black text-foreground">Featured Bulk Wholesale Listings</h2>
              <p className="text-xs text-muted-foreground">Tiered MOQs directly from verified Kenyan suppliers</p>
            </div>
            <span className="text-xs font-bold text-brand-emerald">All 47 Counties Coverage</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {B2B_CATALOG.map((item) => (
              <div
                key={item.id}
                className="bg-white dark:bg-brand-dark-card border border-border dark:border-brand-dark-border rounded-3xl p-5 shadow-sm space-y-4 flex flex-col justify-between"
              >
                <div className="space-y-2.5">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-black bg-emerald-100 text-brand-emerald px-2 py-0.5 rounded-md">
                      MOQ: {item.moq}
                    </span>
                    <span className="text-[10px] text-muted-foreground">{item.leadTime}</span>
                  </div>

                  <h3 className="font-bold text-sm text-foreground leading-snug">{item.title}</h3>

                  <div className="text-xs text-muted-foreground">
                    Supplier: <strong className="text-foreground">{item.supplier}</strong>
                    <div className="text-[11px] text-brand-emerald font-semibold mt-0.5">{item.county}</div>
                  </div>

                  <div className="p-3 bg-muted/40 rounded-xl text-xs space-y-1 border border-border/60">
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">B2B Unit Price:</span>
                      <span className="font-black text-brand-emerald">{formatKSh(item.unitPrice)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Retail Value:</span>
                      <span className="line-through text-muted-foreground">{formatKSh(item.retailPrice)}</span>
                    </div>
                  </div>

                  <span className="text-[10px] text-muted-foreground block font-medium">
                    ✓ {item.etims}
                  </span>
                </div>

                <button
                  onClick={() => alert(`Official B2B RFQ Quote generated for ${item.title}. Sent to your email.`)}
                  className="w-full bg-brand-charcoal dark:bg-brand-dark-bg hover:bg-gray-800 text-white font-bold py-2.5 px-3 rounded-xl text-xs flex items-center justify-center gap-1.5 transition-all shadow-sm"
                >
                  <FileText className="w-3.5 h-3.5 text-brand-gold" />
                  <span>Request Official RFQ</span>
                </button>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
