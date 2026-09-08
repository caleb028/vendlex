"use client";

import React, { useRef, useEffect, useState } from "react";
import Link from "next/link";
import {
  MapPin,
  Phone,
  MessageCircle,
  ExternalLink,
  Sparkles,
  Building2,
  Volume2,
  VolumeX,
} from "lucide-react";
import { ServerAdvertisement } from "@/lib/server-db/types";

// Active video tracking to ensure only 1 video plays at a time
let activePlayingVideo: HTMLVideoElement | null = null;

interface BusinessAdCardProps {
  ad: ServerAdvertisement;
  className?: string;
  compact?: boolean;
}

export function BusinessAdCard({ ad, className = "", compact = false }: BusinessAdCardProps) {
  const cardRef = useRef<HTMLDivElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const [hasTrackedImpression, setHasTrackedImpression] = useState(false);
  const [isMuted, setIsMuted] = useState(true);
  const [isPlaying, setIsPlaying] = useState(false);

  // Track impression once when 50% visible
  useEffect(() => {
    if (!cardRef.current || hasTrackedImpression) return;

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting && !hasTrackedImpression) {
            setHasTrackedImpression(true);
            fetch(`/api/advertisements/${ad.id}/event`, {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({ eventType: "impression" }),
            }).catch(() => {});
          }
        });
      },
      { threshold: 0.5 }
    );

    observer.observe(cardRef.current);
    return () => observer.disconnect();
  }, [ad.id, hasTrackedImpression]);

  // Handle video play/pause coordination
  const handleVideoPlay = () => {
    if (videoRef.current) {
      if (activePlayingVideo && activePlayingVideo !== videoRef.current) {
        activePlayingVideo.pause();
      }
      activePlayingVideo = videoRef.current;
      setIsPlaying(true);
    }
  };

  const handleVideoPause = () => {
    setIsPlaying(false);
    if (activePlayingVideo === videoRef.current) {
      activePlayingVideo = null;
    }
  };

  const trackClick = () => {
    fetch(`/api/advertisements/${ad.id}/event`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ eventType: "click" }),
    }).catch(() => {});
  };

  const telLink = `tel:${ad.contactPhone.replace(/\s+/g, "")}`;
  const whatsappNum = (ad.contactWhatsapp || ad.contactPhone).replace(/[^0-9]/g, "");
  const formattedWhatsapp = whatsappNum.startsWith("0")
    ? `254${whatsappNum.substring(1)}`
    : whatsappNum;
  const whatsappLink = `https://wa.me/${formattedWhatsapp}?text=${encodeURIComponent(
    `Hello ${ad.businessName}, I saw your advertisement on VendLex for "${ad.title}" and would like to inquire.`
  )}`;

  return (
    <div
      ref={cardRef}
      className={`group relative bg-white dark:bg-brand-dark-card border border-border/80 dark:border-brand-dark-border rounded-2xl overflow-hidden shadow-sm hover:shadow-md transition-all flex flex-col ${className}`}
    >
      {/* Top Banner: Sponsored badge & Category */}
      <div className="px-4 py-2 bg-gradient-to-r from-amber-500/10 via-amber-400/5 to-transparent border-b border-border/40 flex items-center justify-between">
        <div className="flex items-center gap-1.5">
          <span className="inline-flex items-center gap-1 bg-amber-500/15 text-amber-800 dark:text-amber-300 text-[10px] font-black uppercase px-2 py-0.5 rounded-md tracking-wider border border-amber-500/30">
            <Sparkles className="w-2.5 h-2.5" />
            Sponsored
          </span>
          <span className="text-[11px] font-semibold text-muted-foreground truncate max-w-[130px]">
            {ad.category}
          </span>
        </div>
        <div className="flex items-center gap-1 text-[11px] text-muted-foreground">
          <MapPin className="w-3 h-3 text-brand-emerald shrink-0" />
          <span className="truncate max-w-[110px]">{ad.town}, {ad.county}</span>
        </div>
      </div>

      {/* Media Box */}
      <div className="relative aspect-[16/10] sm:aspect-[16/9] bg-muted/40 w-full overflow-hidden">
        {ad.mediaType === "VIDEO" ? (
          <div className="relative w-full h-full bg-black flex items-center justify-center">
            <video
              ref={videoRef}
              src={ad.mediaUrl}
              poster={ad.posterUrl}
              preload="none"
              playsInline
              muted={isMuted}
              controls
              onPlay={handleVideoPlay}
              onPause={handleVideoPause}
              className="w-full h-full object-contain"
            />
            {isPlaying && (
              <button
                type="button"
                onClick={() => {
                  if (videoRef.current) {
                    videoRef.current.muted = !isMuted;
                    setIsMuted(!isMuted);
                  }
                }}
                className="absolute top-2 right-2 bg-black/70 hover:bg-black/90 text-white p-1.5 rounded-full z-10 transition-colors"
                title={isMuted ? "Unmute" : "Mute"}
              >
                {isMuted ? <VolumeX className="w-3.5 h-3.5" /> : <Volume2 className="w-3.5 h-3.5" />}
              </button>
            )}
          </div>
        ) : (
          <img
            src={ad.mediaUrl}
            alt={ad.title}
            loading="lazy"
            className="w-full h-full object-cover group-hover:scale-[1.02] transition-transform duration-300"
          />
        )}
      </div>

      {/* Content Area */}
      <div className="p-4 flex-1 flex flex-col justify-between space-y-3">
        <div className="space-y-1.5">
          {/* Business Name */}
          <div className="flex items-center gap-1.5 text-xs font-bold text-brand-emerald dark:text-emerald-400">
            <Building2 className="w-3.5 h-3.5 shrink-0" />
            <span className="truncate">{ad.businessName}</span>
          </div>

          {/* Ad Title */}
          <h3 className="font-extrabold text-sm sm:text-base text-foreground line-clamp-2 leading-snug">
            {ad.title}
          </h3>

          {/* Description */}
          <p className="text-xs text-muted-foreground line-clamp-2 leading-relaxed">
            {ad.description}
          </p>

          {ad.physicalAddress && !compact && (
            <p className="text-[11px] text-muted-foreground/80 flex items-center gap-1 truncate pt-0.5">
              <span className="font-semibold text-foreground/70">Location:</span> {ad.physicalAddress}
            </p>
          )}
        </div>

        {/* Action Buttons */}
        <div className="pt-2 border-t border-border/40 flex flex-wrap items-center gap-2">
          {/* Call button */}
          <a
            href={telLink}
            onClick={trackClick}
            className="flex-1 min-w-[90px] inline-flex items-center justify-center gap-1.5 bg-muted hover:bg-muted/80 text-foreground text-xs font-bold py-2 px-2.5 rounded-xl transition-colors"
          >
            <Phone className="w-3.5 h-3.5 text-brand-emerald" />
            <span>Call</span>
          </a>

          {/* WhatsApp button */}
          <a
            href={whatsappLink}
            target="_blank"
            rel="noopener noreferrer"
            onClick={trackClick}
            className="flex-1 min-w-[100px] inline-flex items-center justify-center gap-1.5 bg-emerald-500 hover:bg-emerald-600 text-white text-xs font-bold py-2 px-2.5 rounded-xl shadow-xs transition-colors"
          >
            <MessageCircle className="w-3.5 h-3.5" />
            <span>WhatsApp</span>
          </a>

          {/* Primary CTA / Website */}
          {ad.websiteUrl ? (
            <a
              href={ad.websiteUrl.startsWith("http") ? ad.websiteUrl : `https://${ad.websiteUrl}`}
              target="_blank"
              rel="noopener noreferrer"
              onClick={trackClick}
              className="w-full inline-flex items-center justify-center gap-1.5 bg-brand-charcoal dark:bg-zinc-800 hover:bg-black dark:hover:bg-zinc-700 text-white text-xs font-bold py-2 px-3 rounded-xl transition-colors"
            >
              <span>{ad.ctaLabel || "Visit Website"}</span>
              <ExternalLink className="w-3.5 h-3.5" />
            </a>
          ) : (
            <a
              href={telLink}
              onClick={trackClick}
              className="w-full inline-flex items-center justify-center gap-1.5 bg-brand-emerald hover:bg-brand-emerald-dark text-white text-xs font-bold py-2 px-3 rounded-xl shadow-sm transition-colors"
            >
              <span>{ad.ctaLabel || "Connect With Business"}</span>
              <ExternalLink className="w-3.5 h-3.5" />
            </a>
          )}
        </div>
      </div>
    </div>
  );
}
