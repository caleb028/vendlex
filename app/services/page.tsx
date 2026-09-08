"use client";

import React, { useState, useMemo, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { MOCK_SERVICES, KENYAN_COUNTIES, KENYAN_TOWNS } from "@/lib/data/kenya-data";
import { ServiceCard } from "@/components/services/service-card";
import {
  Wrench,
  Search,
  MapPin,
  Sparkles,
  RotateCcw,
  CheckCircle2,
  ShieldCheck,
  Send,
  Zap,
  Users,
} from "lucide-react";

// Top 10 categories required per Guideline #15
const SERVICE_CATEGORIES = [
  "Electrician",
  "Plumber",
  "Solar Technician",
  "Phone Repair",
  "Computer Repair",
  "Mechanic",
  "Painter",
  "Mason",
  "Refrigeration Technician",
  "Appliance Repair",
];

function ServicesContent() {
  const searchParams = useSearchParams();
  const [query, setQuery] = useState(searchParams.get("search") || searchParams.get("q") || "");
  const [selectedCounty, setSelectedCounty] = useState(searchParams.get("county") || "all");
  const [selectedTown, setSelectedTown] = useState("all");
  const [selectedCategory, setSelectedCategory] = useState("all");

  // Quote Request State
  const [quoteRequestOpen, setQuoteRequestOpen] = useState(false);
  const [quoteService, setQuoteService] = useState("Electrician");
  const [quoteCounty, setQuoteCounty] = useState("Nairobi");
  const [quoteDesc, setQuoteDesc] = useState("");
  const [quoteSubmitted, setQuoteSubmitted] = useState(false);

  // Available towns based on selected county
  const availableTowns = useMemo(() => {
    if (selectedCounty !== "all" && KENYAN_TOWNS[selectedCounty]) {
      return KENYAN_TOWNS[selectedCounty];
    }
    return [];
  }, [selectedCounty]);

  const filtered = useMemo(() => {
    return MOCK_SERVICES.filter((s) => {
      if (query.trim()) {
        const q = query.toLowerCase();
        const matchesTitle = s.title.toLowerCase().includes(q);
        const matchesProvider = s.providerName.toLowerCase().includes(q);
        const matchesDesc = s.description.toLowerCase().includes(q);
        const matchesCat = s.category.toLowerCase().includes(q);
        if (!matchesTitle && !matchesProvider && !matchesDesc && !matchesCat) return false;
      }

      if (selectedCounty !== "all" && s.county.toLowerCase() !== selectedCounty.toLowerCase()) {
        return false;
      }

      if (selectedTown !== "all" && s.town && s.town.toLowerCase() !== selectedTown.toLowerCase()) {
        return false;
      }

      if (selectedCategory !== "all") {
        const catLower = selectedCategory.toLowerCase();
        const matches = s.title.toLowerCase().includes(catLower) || s.category.toLowerCase().includes(catLower);
        if (!matches) return false;
      }

      return true;
    });
  }, [query, selectedCounty, selectedTown, selectedCategory]);

  const handleQuoteSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setQuoteSubmitted(true);
    setTimeout(() => {
      setQuoteSubmitted(false);
      setQuoteRequestOpen(false);
      setQuoteDesc("");
    }, 2800);
  };

  return (
    <div className="bg-brand-off-white dark:bg-brand-dark-bg min-h-screen py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
        {/* Exact Guideline #15 Hero: "What service do you need?" */}
        <div className="bg-gradient-to-r from-brand-charcoal via-gray-900 to-brand-emerald-dark rounded-3xl p-8 sm:p-12 text-white shadow-xl space-y-6 relative overflow-hidden border border-brand-emerald/30">
          <div className="absolute top-0 right-0 -mt-8 -mr-8 w-72 h-72 bg-brand-emerald/20 rounded-full blur-2xl pointer-events-none" />

          <div className="max-w-3xl space-y-3 relative z-10">
            <div className="inline-flex items-center gap-2 bg-emerald-950/80 border border-emerald-400/60 text-emerald-200 text-xs font-black px-3.5 py-1.5 rounded-full uppercase tracking-wider shadow-sm">
              <Wrench className="w-3.5 h-3.5 text-amber-400" />
              <span>VendLex Prosper • Verified Technical Network</span>
            </div>
            <h1 className="text-3xl sm:text-5xl font-black tracking-tight leading-tight">
              What service do you need?
            </h1>
            <p className="text-xs sm:text-base text-gray-200 max-w-2xl leading-relaxed">
              Find verified Kenyan electricians, plumbers, solar engineers, and tech repair specialists across all 47 counties with transparent quotes and instant booking.
            </p>
          </div>

          {/* Quick Category Chips: 10 Primary Categories per Guideline #15 */}
          <div className="relative z-10 space-y-2 pt-2">
            <span className="text-xs font-bold text-amber-300">Popular Categories:</span>
            <div className="flex flex-wrap gap-2">
              <button
                onClick={() => setSelectedCategory("all")}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
                  selectedCategory === "all"
                    ? "bg-brand-emerald text-white shadow-sm"
                    : "bg-white/15 hover:bg-white/25 text-gray-200"
                }`}
              >
                All Services
              </button>
              {SERVICE_CATEGORIES.map((cat) => (
                <button
                  key={cat}
                  onClick={() => setSelectedCategory(cat)}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
                    selectedCategory === cat
                      ? "bg-brand-emerald text-white shadow-sm"
                      : "bg-white/15 hover:bg-white/25 text-gray-200 hover:text-white"
                  }`}
                >
                  {cat}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Filter Controls: Search, County, Town */}
        <div className="bg-white dark:bg-brand-dark-card border border-border dark:border-brand-dark-border rounded-2xl p-4 sm:p-5 shadow-sm grid grid-cols-1 sm:grid-cols-3 gap-3">
          <div className="relative">
            <Search className="w-4 h-4 absolute left-3 top-3.5 text-muted-foreground" />
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search service e.g. Electrician, Solar, Plumbing..."
              className="w-full bg-muted/40 dark:bg-brand-dark-bg/60 border border-border rounded-xl pl-9 pr-3 py-2.5 text-xs text-foreground focus:outline-none focus:border-brand-emerald font-semibold"
            />
          </div>

          <div className="relative">
            <MapPin className="w-4 h-4 absolute left-3 top-3.5 text-brand-red" />
            <select
              value={selectedCounty}
              onChange={(e) => {
                setSelectedCounty(e.target.value);
                setSelectedTown("all");
              }}
              className="w-full bg-muted/40 dark:bg-brand-dark-bg/60 border border-border rounded-xl pl-9 pr-3 py-2.5 text-xs text-foreground focus:outline-none focus:border-brand-emerald font-semibold"
            >
              <option value="all">All 47 Counties</option>
              {KENYAN_COUNTIES.map((c) => (
                <option key={c} value={c}>
                  {c} County
                </option>
              ))}
            </select>
          </div>

          <div className="relative">
            <select
              value={selectedTown}
              onChange={(e) => setSelectedTown(e.target.value)}
              disabled={availableTowns.length === 0}
              className="w-full bg-muted/40 dark:bg-brand-dark-bg/60 border border-border rounded-xl px-3 py-2.5 text-xs text-foreground focus:outline-none focus:border-brand-emerald font-semibold disabled:opacity-50"
            >
              <option value="all">
                {availableTowns.length > 0 ? `All Towns in ${selectedCounty}` : "Select County first for Towns"}
              </option>
              {availableTowns.map((t) => (
                <option key={t} value={t}>
                  {t}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Guideline #17: Quote Comparison & Fast Job Request Banner */}
        <div className="bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800/60 rounded-3xl p-6 sm:p-8 flex flex-col md:flex-row md:items-center justify-between gap-6 shadow-sm">
          <div className="space-y-1.5">
            <span className="text-xs font-black text-brand-emerald uppercase tracking-wider flex items-center gap-1.5">
              <Zap className="w-3.5 h-3.5" />
              <span>Multi-Provider Quote Comparison</span>
            </span>
            <h3 className="text-xl sm:text-2xl font-black text-foreground">
              Need Quotes for a Job? Compare Verified Pros
            </h3>
            <p className="text-xs sm:text-sm text-muted-foreground max-w-xl">
              Post your job description once. Receive up to 3 competitive quotes from verified local technicians in your town with arrival estimates and transparent pricing.
            </p>
          </div>

          <button
            onClick={() => setQuoteRequestOpen(!quoteRequestOpen)}
            className="bg-brand-emerald hover:bg-brand-emerald-dark text-white font-black px-6 py-3 rounded-xl text-xs sm:text-sm shadow-md transition-all shrink-0 flex items-center gap-2"
          >
            <span>{quoteRequestOpen ? "Close Request Form" : "Request Free Quotes"}</span>
            <Send className="w-3.5 h-3.5" />
          </button>
        </div>

        {/* Expandable Quote Request Form per Guideline #17 */}
        {quoteRequestOpen && (
          <form
            onSubmit={handleQuoteSubmit}
            className="bg-white dark:bg-brand-dark-card border border-border dark:border-brand-dark-border rounded-3xl p-6 sm:p-8 shadow-md space-y-4 animate-fadeIn"
          >
            <h4 className="text-base font-black text-foreground">Submit a Service Request for Multi-Quote Comparison</h4>
            
            {quoteSubmitted ? (
              <div className="p-6 bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300 rounded-2xl text-center space-y-2">
                <CheckCircle2 className="w-8 h-8 mx-auto text-brand-emerald" />
                <h5 className="font-bold text-sm">Quote Request Sent to 3 Local Technicians!</h5>
                <p className="text-xs">You will receive quotes via WhatsApp and SMS within 15 minutes.</p>
              </div>
            ) : (
              <>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <label className="text-xs font-bold text-foreground">Required Trade / Category</label>
                    <select
                      value={quoteService}
                      onChange={(e) => setQuoteService(e.target.value)}
                      className="w-full p-2.5 rounded-xl border border-border bg-muted/40 text-xs font-semibold"
                    >
                      {SERVICE_CATEGORIES.map((cat) => (
                        <option key={cat} value={cat}>{cat}</option>
                      ))}
                    </select>
                  </div>

                  <div className="space-y-1">
                    <label className="text-xs font-bold text-foreground">Your County Location</label>
                    <select
                      value={quoteCounty}
                      onChange={(e) => setQuoteCounty(e.target.value)}
                      className="w-full p-2.5 rounded-xl border border-border bg-muted/40 text-xs font-semibold"
                    >
                      {KENYAN_COUNTIES.map((c) => (
                        <option key={c} value={c}>{c} County</option>
                      ))}
                    </select>
                  </div>
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-bold text-foreground">Describe the Problem &amp; Preferred Time</label>
                  <textarea
                    required
                    rows={3}
                    value={quoteDesc}
                    onChange={(e) => setQuoteDesc(e.target.value)}
                    placeholder="e.g. Need electrical rewiring for a 3-bedroom house in Kilimani, Nairobi. Available tomorrow afternoon."
                    className="w-full p-3 rounded-xl border border-border bg-muted/40 text-xs text-foreground focus:outline-none focus:border-brand-emerald"
                  />
                </div>

                <button
                  type="submit"
                  className="bg-brand-emerald hover:bg-brand-emerald-dark text-white font-black py-3 px-6 rounded-xl text-xs shadow-md transition-all flex items-center gap-2"
                >
                  <Send className="w-3.5 h-3.5" />
                  <span>Send Request to Verified Technicians</span>
                </button>
              </>
            )}
          </form>
        )}

        {/* Results Header */}
        <div className="flex items-center justify-between text-xs text-muted-foreground border-b border-border pb-3">
          <span>
            Showing <strong className="text-foreground">{filtered.length}</strong> certified service providers
          </span>
          {(selectedCounty !== "all" || selectedCategory !== "all" || query) && (
            <button
              onClick={() => {
                setSelectedCounty("all");
                setSelectedTown("all");
                setSelectedCategory("all");
                setQuery("");
              }}
              className="text-brand-emerald font-bold hover:underline flex items-center gap-1"
            >
              <RotateCcw className="w-3 h-3" />
              <span>Reset filters</span>
            </button>
          )}
        </div>

        {/* Service Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filtered.map((service) => (
            <ServiceCard key={service.id} service={service} />
          ))}
        </div>
      </div>
    </div>
  );
}

export default function ServicesPage() {
  return (
    <Suspense fallback={<div className="p-12 text-center text-sm font-semibold">Loading VendLex Services...</div>}>
      <ServicesContent />
    </Suspense>
  );
}
