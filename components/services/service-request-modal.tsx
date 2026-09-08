"use client";

import React, { useState, useEffect } from "react";
import { Service } from "@/lib/data/kenya-data";
import { Modal } from "@/components/ui/modal";
import { formatKSh } from "@/lib/utils";
import { VerifiedBadge } from "@/components/ui/badge";
import {
  Calendar,
  Clock,
  MapPin,
  Send,
  CheckCircle2,
  Phone,
  MessageCircle,
  FileText,
  Zap,
} from "lucide-react";
import { usePlatform } from "@/lib/store/platform-store";

export function ServiceRequestModal({
  service,
  isOpen,
  onClose,
  initialMode = "book",
}: {
  service: Service | null;
  isOpen: boolean;
  onClose: () => void;
  initialMode?: "book" | "quote";
}) {
  const { addServiceRequest } = usePlatform();
  const [activeTab, setActiveTab] = useState<"book" | "quote">(initialMode);
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [county, setCounty] = useState("Nairobi");
  const [date, setDate] = useState("");
  const [urgency, setUrgency] = useState("Standard (Within 24 Hours)");
  const [details, setDetails] = useState("");
  const [submitted, setSubmitted] = useState(false);

  useEffect(() => {
    if (initialMode) {
      setActiveTab(initialMode);
    }
  }, [initialMode, isOpen]);

  if (!service) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    addServiceRequest({
      customerName: name || "Customer",
      customerPhone: phone || "0798 159 503",
      county: county.split(",")[0]?.trim() || "Nairobi",
      town: county.split(",")[1]?.trim() || "Central",
      serviceTitle: service.title,
      category: service.category,
      providerName: service.providerName,
      quoteAmount: service.startingPrice,
      notes: `${activeTab === "book" ? "[BOOKING APPOINTMENT]" : "[PRICE QUOTE REQUEST]"} (${urgency}) - ${details || "Customer requested service consultation."}`,
    });
    setSubmitted(true);
  };

  const isBooking = activeTab === "book";

  return (
    <Modal
      isOpen={isOpen}
      onClose={() => {
        setSubmitted(false);
        onClose();
      }}
      title={
        <div className="flex items-center gap-2">
          {isBooking ? <Zap className="w-4 h-4 text-brand-emerald" /> : <FileText className="w-4 h-4 text-brand-gold" />}
          <span>{isBooking ? "Book Professional Service" : "Request Custom Price Quote"}</span>
        </div>
      }
      maxWidth="lg"
    >
      {submitted ? (
        <div className="text-center py-6 sm:py-8 space-y-4">
          <div className="w-16 h-16 rounded-full bg-emerald-100 dark:bg-emerald-950/60 text-brand-emerald flex items-center justify-center mx-auto animate-bounce">
            <CheckCircle2 className="w-8 h-8" />
          </div>
          <h3 className="text-lg font-black text-foreground">
            {isBooking ? "Booking Request Confirmed!" : "Quote Request Dispatched!"}
          </h3>
          <p className="text-xs sm:text-sm text-muted-foreground max-w-sm mx-auto leading-relaxed">
            <strong>{service.providerName}</strong> and the VendLex dispatch team have received your request. You will be contacted via SMS &amp; WhatsApp at <span className="font-bold text-foreground">{phone || "+254 798 159 503"}</span> shortly.
          </p>
          <div className="pt-2 flex flex-col sm:flex-row items-center justify-center gap-3">
            <button
              onClick={() => {
                setSubmitted(false);
                onClose();
              }}
              className="w-full sm:w-auto bg-brand-emerald text-white text-xs font-bold px-6 py-2.5 rounded-xl hover:bg-brand-emerald-dark transition-colors"
            >
              Back to Services
            </button>
            <a
              href={`https://wa.me/254798159503?text=Hello%20${encodeURIComponent(service.providerName)},%20I%20just%20submitted%20a%20${isBooking ? "booking" : "quote"}%20request%20on%20VendLex%20for%20${encodeURIComponent(service.title)}.`}
              target="_blank"
              rel="noopener noreferrer"
              className="w-full sm:w-auto bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold px-5 py-2.5 rounded-xl flex items-center justify-center gap-1.5 shadow-sm transition-colors"
            >
              <MessageCircle className="w-3.5 h-3.5" />
              <span>Message on WhatsApp</span>
            </a>
          </div>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Mode Switcher Tabs */}
          <div className="grid grid-cols-2 gap-1.5 p-1 bg-muted/60 dark:bg-brand-dark-bg/60 rounded-xl border border-border">
            <button
              type="button"
              onClick={() => setActiveTab("book")}
              className={`py-2 px-3 rounded-lg text-xs font-black transition-all flex items-center justify-center gap-1.5 ${
                isBooking
                  ? "bg-white dark:bg-brand-dark-card text-brand-emerald shadow-sm"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              <Zap className="w-3.5 h-3.5" />
              <span>Request Service</span>
            </button>
            <button
              type="button"
              onClick={() => setActiveTab("quote")}
              className={`py-2 px-3 rounded-lg text-xs font-black transition-all flex items-center justify-center gap-1.5 ${
                !isBooking
                  ? "bg-white dark:bg-brand-dark-card text-brand-gold shadow-sm"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              <FileText className="w-3.5 h-3.5" />
              <span>Get Price Quote</span>
            </button>
          </div>

          {/* Provider Summary Badge */}
          <div className="p-3 bg-muted/30 dark:bg-brand-dark-bg/40 border border-border/80 rounded-2xl flex items-center justify-between text-xs">
            <div className="space-y-0.5">
              <span className="text-[10px] uppercase font-bold tracking-wider text-muted-foreground">Technician / Provider</span>
              <div className="font-black text-foreground flex items-center gap-1.5">
                <span>{service.providerName}</span>
                {service.providerVerified && <VerifiedBadge />}
              </div>
              <span className="text-[11px] text-muted-foreground">{service.title}</span>
            </div>
            <div className="text-right shrink-0">
              <span className="text-[10px] uppercase font-bold tracking-wider text-muted-foreground">Base Rate</span>
              <div className="text-xs sm:text-sm font-black text-brand-emerald mt-0.5">
                From {formatKSh(service.startingPrice)}
              </div>
              <span className="text-[9px] text-emerald-600 dark:text-emerald-400 font-semibold">⚡ ~15m Response</span>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-foreground mb-1">
                Your Full Name *
              </label>
              <input
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g. Grace Wanjiku"
                className="w-full bg-muted/20 border border-border rounded-xl px-3 py-2.5 text-xs text-foreground focus:outline-none focus:border-brand-emerald"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-foreground mb-1">
                Kenyan Phone / WhatsApp *
              </label>
              <input
                type="tel"
                required
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="07XX XXX XXX"
                className="w-full bg-muted/20 border border-border rounded-xl px-3 py-2.5 text-xs text-foreground focus:outline-none focus:border-brand-emerald font-mono font-bold"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-foreground mb-1">
                Your Location (County &amp; Estate / Town) *
              </label>
              <input
                type="text"
                required
                value={county}
                onChange={(e) => setCounty(e.target.value)}
                placeholder="e.g. Nairobi, Westlands"
                className="w-full bg-muted/20 border border-border rounded-xl px-3 py-2.5 text-xs text-foreground focus:outline-none focus:border-brand-emerald"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-foreground mb-1">
                {isBooking ? "Preferred Appointment Date" : "Expected Project Timeline"}
              </label>
              {isBooking ? (
                <input
                  type="date"
                  value={date}
                  onChange={(e) => setDate(e.target.value)}
                  className="w-full bg-muted/20 border border-border rounded-xl px-3 py-2.5 text-xs text-foreground focus:outline-none focus:border-brand-emerald"
                />
              ) : (
                <select
                  value={urgency}
                  onChange={(e) => setUrgency(e.target.value)}
                  className="w-full bg-muted/20 border border-border rounded-xl px-3 py-2.5 text-xs text-foreground focus:outline-none focus:border-brand-emerald"
                >
                  <option value="Emergency (Immediate)">Emergency (Immediate / ASAP)</option>
                  <option value="Standard (Within 24 Hours)">Standard (Within 24 Hours)</option>
                  <option value="Planning (Within Next 7 Days)">Planning (Within Next 7 Days)</option>
                </select>
              )}
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-foreground mb-1">
              {isBooking ? "Describe Work / Repair Scope *" : "Project Details for Accurate Quote *"}
            </label>
            <textarea
              rows={3}
              required
              value={details}
              onChange={(e) => setDetails(e.target.value)}
              placeholder={
                isBooking
                  ? "Describe the issue (e.g. power tripping in kitchen, leaking pipe under sink, car brake inspection)..."
                  : "Detail the scope of work, materials required, square footage, or any specific constraints..."
              }
              className="w-full bg-muted/20 border border-border rounded-xl p-3 text-xs text-foreground focus:outline-none focus:border-brand-emerald resize-none"
            />
          </div>

          <div className="pt-1">
            <button
              type="submit"
              className="w-full bg-brand-emerald hover:bg-brand-emerald-dark text-white font-black py-3 rounded-xl text-xs sm:text-sm flex items-center justify-center gap-2 shadow-md transition-all btn-glow-emerald"
            >
              <Send className="w-4 h-4" />
              <span>{isBooking ? "Confirm Service Booking Request" : "Submit for Official Price Quote"}</span>
            </button>
          </div>
        </form>
      )}
    </Modal>
  );
}
