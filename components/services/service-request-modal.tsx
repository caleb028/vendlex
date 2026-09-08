"use client";

import React, { useState } from "react";
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
} from "lucide-react";

import { usePlatform } from "@/lib/store/platform-store";

export function ServiceRequestModal({
  service,
  isOpen,
  onClose,
}: {
  service: Service | null;
  isOpen: boolean;
  onClose: () => void;
}) {
  const { addServiceRequest } = usePlatform();
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [county, setCounty] = useState("Nairobi");
  const [date, setDate] = useState("");
  const [details, setDetails] = useState("");
  const [submitted, setSubmitted] = useState(false);

  if (!service) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    addServiceRequest({
      customerName: name || "Grace Wanjiku",
      customerPhone: phone || "0722 123 456",
      county: county.split(",")[0]?.trim() || "Nairobi",
      town: county.split(",")[1]?.trim() || "Westlands",
      serviceTitle: service.title,
      category: service.category,
      providerName: service.providerName,
      quoteAmount: service.startingPrice,
      notes: details || "Customer requested inspection and quote.",
    });
    setSubmitted(true);
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={() => {
        setSubmitted(false);
        onClose();
      }}
      title={`Request Service: ${service.title}`}
      maxWidth="lg"
    >
      {submitted ? (
        <div className="text-center py-8 space-y-4">
          <div className="w-16 h-16 rounded-full bg-emerald-100 dark:bg-emerald-950/60 text-brand-emerald flex items-center justify-center mx-auto animate-bounce">
            <CheckCircle2 className="w-8 h-8" />
          </div>
          <h3 className="text-lg font-bold text-foreground">
            Service Request Sent Successfully!
          </h3>
          <p className="text-xs sm:text-sm text-muted-foreground max-w-sm mx-auto">
            {service.providerName} has been notified via SMS & WhatsApp. They will contact you at <span className="font-bold text-foreground">{phone || "your number"}</span> within 15 minutes.
          </p>
          <div className="pt-4">
            <button
              onClick={() => {
                setSubmitted(false);
                onClose();
              }}
              className="bg-brand-emerald text-white text-xs font-bold px-6 py-2.5 rounded-xl hover:bg-brand-emerald-dark transition-colors"
            >
              Done
            </button>
          </div>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Provider Summary */}
          <div className="p-3 bg-muted/40 dark:bg-brand-dark-bg/60 rounded-xl flex items-center justify-between text-xs">
            <div>
              <span className="text-muted-foreground">Provider:</span>
              <div className="font-bold text-foreground flex items-center gap-1 mt-0.5">
                <span>{service.providerName}</span>
                {service.providerVerified && <VerifiedBadge />}
              </div>
            </div>
            <div className="text-right">
              <span className="text-muted-foreground">Estimate:</span>
              <div className="text-sm font-black text-brand-emerald mt-0.5">
                From {formatKSh(service.startingPrice)}
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-foreground mb-1">
                Your Full Name *
              </label>
              <input
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g. Grace Wanjiku"
                className="w-full bg-white dark:bg-brand-dark-card border border-border dark:border-brand-dark-border rounded-xl px-3 py-2 text-xs text-foreground focus:outline-none focus:border-brand-emerald"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-foreground mb-1">
                Kenyan Phone Number (M-Pesa/Call) *
              </label>
              <input
                type="tel"
                required
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="07XX XXX XXX"
                className="w-full bg-white dark:bg-brand-dark-card border border-border dark:border-brand-dark-border rounded-xl px-3 py-2 text-xs text-foreground focus:outline-none focus:border-brand-emerald font-mono"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-foreground mb-1">
                Location (County & Estate) *
              </label>
              <input
                type="text"
                required
                value={county}
                onChange={(e) => setCounty(e.target.value)}
                placeholder="e.g. Nairobi, Kilimani"
                className="w-full bg-white dark:bg-brand-dark-card border border-border dark:border-brand-dark-border rounded-xl px-3 py-2 text-xs text-foreground focus:outline-none focus:border-brand-emerald"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-foreground mb-1">
                Preferred Appointment Date
              </label>
              <input
                type="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                className="w-full bg-white dark:bg-brand-dark-card border border-border dark:border-brand-dark-border rounded-xl px-3 py-2 text-xs text-foreground focus:outline-none focus:border-brand-emerald"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-foreground mb-1">
              Describe Your Specific Needs / Problem
            </label>
            <textarea
              rows={3}
              value={details}
              onChange={(e) => setDetails(e.target.value)}
              placeholder="Provide any details about the repair, shoot, cleaning, or project..."
              className="w-full bg-white dark:bg-brand-dark-card border border-border dark:border-brand-dark-border rounded-xl p-3 text-xs text-foreground focus:outline-none focus:border-brand-emerald resize-none"
            />
          </div>

          <button
            type="submit"
            className="w-full bg-brand-emerald hover:bg-brand-emerald-dark text-white font-bold py-3 rounded-xl text-xs flex items-center justify-center gap-2 shadow-md transition-all"
          >
            <Send className="w-4 h-4" />
            <span>Send Service Quote Request</span>
          </button>
        </form>
      )}
    </Modal>
  );
}
