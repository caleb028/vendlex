"use client";

import React, { useState } from "react";
import Link from "next/link";
import { Service } from "@/lib/data/kenya-data";
import { formatKSh } from "@/lib/utils";
import { Star, MapPin, Clock, CheckCircle2, Wrench, ShieldCheck, MessageCircle, FileText, Zap } from "lucide-react";
import { ServiceRequestModal } from "./service-request-modal";

export function ServiceCard({ service }: { service: Service }) {
  const [modalOpen, setModalOpen] = useState(false);
  const [activeAction, setActiveAction] = useState<"book" | "quote">("book");

  const trustScore = Math.min(99, Math.round(service.rating * 20));
  const jobsCompleted = service.reviewCount * 4 + 12;

  const handleOpenModal = (action: "book" | "quote") => {
    setActiveAction(action);
    setModalOpen(true);
  };

  return (
    <>
      <div className="group bg-white dark:bg-brand-dark-card border border-border/80 dark:border-brand-dark-border rounded-2xl overflow-hidden shadow-card hover:shadow-card-hover hover:-translate-y-1 hover:border-brand-emerald/40 flex flex-col justify-between transition-all duration-300">
        <div>
          {/* Cover Photo */}
          <div className="relative h-48 w-full overflow-hidden bg-muted">
            <img
              src={service.image}
              alt={service.title}
              className="w-full h-full object-cover transition-transform duration-500 ease-out group-hover:scale-105"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/25 to-transparent" />

            {/* Profession Badge */}
            <span className="absolute top-3 left-3 bg-white/95 dark:bg-brand-dark-card/95 backdrop-blur-md text-foreground text-[10px] font-bold px-2.5 py-0.5 rounded-full shadow-sm">
              {service.category}
            </span>

            {/* Trust Score Pill */}
            <span className="absolute top-3 right-3 bg-emerald-950/90 text-emerald-200 border border-emerald-400/50 backdrop-blur-md text-[10px] font-black px-2 py-0.5 rounded-full shadow-sm flex items-center gap-1">
              <ShieldCheck className="w-3 h-3 text-amber-400" />
              <span>{trustScore}% Trust Score</span>
            </span>

            {/* Price overlay */}
            <div className="absolute bottom-3 right-3 bg-brand-emerald text-white text-xs font-black px-3 py-1 rounded-xl shadow-md">
              From {formatKSh(service.startingPrice)}
            </div>

            {/* Provider Mini Info */}
            <div className="absolute bottom-3 left-3 flex items-center gap-1.5 text-white text-xs font-bold drop-shadow-md">
              <span>{service.providerName}</span>
              {service.providerVerified && (
                <span className="text-[9px] bg-brand-emerald text-white px-1.5 py-0.5 rounded font-black">
                  ✓ Verified Pro
                </span>
              )}
            </div>
          </div>

          {/* Details */}
          <div className="p-4 sm:p-5 space-y-3">
            <div>
              <div className="flex items-center justify-between text-[11px] text-muted-foreground mb-1.5">
                <div className="flex items-center gap-1">
                  <MapPin className="w-3.5 h-3.5 text-brand-emerald shrink-0" />
                  <span className="font-semibold">{service.town}, {service.county}</span>
                </div>
                <div className="text-[10px] font-bold text-brand-emerald dark:text-emerald-400 bg-brand-emerald-soft/50 dark:bg-emerald-950/60 px-2 py-0.5 rounded-md flex items-center gap-1">
                  <span>⚡</span>
                  <span>~15m Response</span>
                </div>
              </div>

              <h3 className="font-black text-sm sm:text-base text-foreground group-hover:text-brand-emerald transition-colors line-clamp-2 leading-snug">
                {service.title}
              </h3>
            </div>

            <p className="text-xs text-muted-foreground line-clamp-2 leading-relaxed">
              {service.description}
            </p>

            {/* Performance Stats: Rating & Jobs Completed */}
            <div className="flex items-center justify-between text-xs py-2.5 border-y border-border/60 dark:border-brand-dark-border/60">
              <div className="flex items-center gap-1 text-amber-500 font-bold">
                <Star className="w-3.5 h-3.5 fill-current" />
                <span>{service.rating}</span>
                <span className="text-muted-foreground font-normal text-[11px]">
                  ({service.reviewCount} reviews)
                </span>
              </div>
              <div className="text-xs font-bold text-foreground">
                <strong className="text-brand-emerald">{jobsCompleted}</strong> jobs completed
              </div>
            </div>

            {/* Highlights */}
            {service.features && service.features.length > 0 && (
              <div className="space-y-1 pt-0.5">
                {service.features.slice(0, 2).map((feat, idx) => (
                  <div key={idx} className="flex items-center gap-1.5 text-[11px] text-muted-foreground">
                    <CheckCircle2 className="w-3.5 h-3.5 text-brand-emerald shrink-0" />
                    <span className="truncate">{feat}</span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* 3 Action Buttons per Guideline #16: REQUEST SERVICE, GET QUOTE, CHAT */}
        <div className="p-4 sm:p-5 pt-0 space-y-2">
          <div className="grid grid-cols-2 gap-2">
            <button
              onClick={() => handleOpenModal("book")}
              className="w-full bg-brand-emerald hover:bg-brand-emerald-dark text-white font-extrabold py-2.5 px-3 rounded-xl text-xs flex items-center justify-center gap-1.5 shadow-sm hover:shadow-glow-green focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-emerald/40 transition-all"
            >
              <Zap className="w-3.5 h-3.5" />
              <span>REQUEST SERVICE</span>
            </button>

            <button
              onClick={() => handleOpenModal("quote")}
              className="w-full bg-muted/70 hover:bg-muted text-foreground border border-border font-bold py-2.5 px-3 rounded-xl text-xs flex items-center justify-center gap-1.5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-emerald/40 transition-all"
            >
              <FileText className="w-3.5 h-3.5 text-brand-emerald" />
              <span>GET QUOTE</span>
            </button>
          </div>

          <a
            href={`https://wa.me/254798159503?text=Hello%20${encodeURIComponent(service.providerName)},%20I%20found%20your%20services%20on%20VendLex%20and%20need%20assistance%20with%20${encodeURIComponent(service.title)}.`}
            target="_blank"
            rel="noopener noreferrer"
            className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-bold py-2 rounded-xl text-[11px] flex items-center justify-center gap-1.5 transition-colors shadow-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500/40"
          >
            <MessageCircle className="w-3.5 h-3.5" />
            <span>CHAT ON WHATSAPP</span>
          </a>
        </div>
      </div>

      {/* Service Request & Quote Comparison Modal */}
      <ServiceRequestModal
        service={service}
        isOpen={modalOpen}
        initialMode={activeAction}
        onClose={() => setModalOpen(false)}
      />
    </>
  );
}
