"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import {
  Megaphone,
  Sparkles,
  Eye,
  MousePointerClick,
  Clock,
  CheckCircle2,
  AlertTriangle,
  XCircle,
  Plus,
  RefreshCw,
  MapPin,
  Building2,
  Calendar,
  Loader2,
  ChevronRight,
  ExternalLink,
} from "lucide-react";
import { useAuth } from "@/lib/store/auth-store";
import { ServerAdvertisement } from "@/lib/server-db/types";

export default function AccountAdvertisementsPage() {
  const { user, isAuthenticated } = useAuth();
  const [ads, setAds] = useState<ServerAdvertisement[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [lookupPhone, setLookupPhone] = useState("");
  const [isRenewing, setIsRenewing] = useState<string | null>(null);

  const fetchAds = async () => {
    setIsLoading(true);
    try {
      let url = "/api/advertisements?limit=50";
      if (user?.id) {
        url += `&advertiserId=${encodeURIComponent(user.id)}`;
      }
      const res = await fetch(url);
      const data = await res.json();
      if (data.success && Array.isArray(data.advertisements)) {
        setAds(data.advertisements);
      }
    } catch (err) {
      console.error("Failed to load user advertisements:", err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchAds();
  }, [user]);

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "ACTIVE":
        return (
          <span className="inline-flex items-center gap-1 bg-green-500/10 text-green-700 dark:text-green-400 text-[11px] font-bold px-2.5 py-1 rounded-full border border-green-500/20">
            <CheckCircle2 className="w-3 h-3" />
            Active (Live)
          </span>
        );
      case "PENDING_REVIEW":
        return (
          <span className="inline-flex items-center gap-1 bg-amber-500/10 text-amber-700 dark:text-amber-400 text-[11px] font-bold px-2.5 py-1 rounded-full border border-amber-500/20">
            <Clock className="w-3 h-3" />
            Under Review
          </span>
        );
      case "REJECTED":
        return (
          <span className="inline-flex items-center gap-1 bg-red-500/10 text-red-700 dark:text-red-400 text-[11px] font-bold px-2.5 py-1 rounded-full border border-red-500/20">
            <XCircle className="w-3 h-3" />
            Rejected
          </span>
        );
      case "EXPIRED":
        return (
          <span className="inline-flex items-center gap-1 bg-muted text-muted-foreground text-[11px] font-bold px-2.5 py-1 rounded-full border border-border">
            Expired
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center gap-1 bg-muted text-muted-foreground text-[11px] font-bold px-2.5 py-1 rounded-full border border-border">
            {status}
          </span>
        );
    }
  };

  const calculateDaysRemaining = (expiryDate?: string) => {
    if (!expiryDate) return null;
    const diff = new Date(expiryDate).getTime() - Date.now();
    if (diff <= 0) return "Expired";
    const days = Math.ceil(diff / (1000 * 60 * 60 * 24));
    return `${days} day${days > 1 ? "s" : ""} left`;
  };

  return (
    <div className="min-h-[85vh] bg-brand-off-white dark:bg-brand-dark-bg py-8 sm:py-12">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
        {/* Top Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <Megaphone className="w-6 h-6 text-brand-emerald" />
              <h1 className="text-xl sm:text-2xl font-black text-foreground">
                My Business Advertisements
              </h1>
            </div>
            <p className="text-xs sm:text-sm text-muted-foreground">
              Monitor live performance, customer clicks, moderation status, and 30-day ad renewals.
            </p>
          </div>

          <Link
            href="/advertise"
            className="inline-flex items-center gap-2 bg-brand-emerald hover:bg-brand-emerald-dark text-white text-xs sm:text-sm font-bold py-2.5 px-4 rounded-xl shadow-md transition-all self-start sm:self-auto"
          >
            <Plus className="w-4 h-4" />
            <span>Create New Business Ad</span>
          </Link>
        </div>

        {/* Ads List */}
        {isLoading ? (
          <div className="py-16 text-center space-y-3">
            <Loader2 className="w-8 h-8 animate-spin text-brand-emerald mx-auto" />
            <p className="text-xs text-muted-foreground">Loading your advertisements...</p>
          </div>
        ) : ads.length > 0 ? (
          <div className="space-y-4">
            {ads.map((ad) => {
              const daysLeft = calculateDaysRemaining(ad.expiryDate);
              const ctr =
                ad.viewsCount > 0
                  ? ((ad.clicksCount / ad.viewsCount) * 100).toFixed(1)
                  : "0.0";

              return (
                <div
                  key={ad.id}
                  className="bg-white dark:bg-brand-dark-card border border-border dark:border-brand-dark-border rounded-2xl p-5 sm:p-6 shadow-sm hover:shadow-md transition-all flex flex-col lg:flex-row lg:items-center justify-between gap-6"
                >
                  {/* Left: Thumbnail & Details */}
                  <div className="flex items-start gap-4 flex-1">
                    <div className="w-20 sm:w-24 h-20 sm:h-24 rounded-xl bg-muted overflow-hidden shrink-0 border border-border">
                      {ad.mediaType === "VIDEO" ? (
                        <video
                          src={ad.mediaUrl}
                          className="w-full h-full object-cover"
                          preload="none"
                          muted
                        />
                      ) : (
                        <img
                          src={ad.mediaUrl}
                          alt={ad.title}
                          className="w-full h-full object-cover"
                        />
                      )}
                    </div>

                    <div className="space-y-1.5 flex-1 min-w-0">
                      <div className="flex flex-wrap items-center gap-2">
                        {getStatusBadge(ad.status)}
                        <span className="text-[11px] font-semibold text-muted-foreground bg-muted px-2 py-0.5 rounded-md">
                          {ad.category}
                        </span>
                        {daysLeft && ad.status === "ACTIVE" && (
                          <span className="text-[11px] font-bold text-brand-emerald bg-brand-emerald/10 px-2 py-0.5 rounded-md">
                            ⏳ {daysLeft}
                          </span>
                        )}
                      </div>

                      <h3 className="font-bold text-sm sm:text-base text-foreground truncate">
                        {ad.title}
                      </h3>

                      <div className="flex flex-wrap items-center gap-3 text-xs text-muted-foreground">
                        <span className="font-semibold text-foreground flex items-center gap-1">
                          <Building2 className="w-3.5 h-3.5 text-brand-emerald" />
                          {ad.businessName}
                        </span>
                        <span>&bull;</span>
                        <span className="flex items-center gap-1">
                          <MapPin className="w-3.5 h-3.5" />
                          {ad.town}, {ad.county}
                        </span>
                        {ad.mpesaReceipt && (
                          <>
                            <span>&bull;</span>
                            <span className="font-mono text-[11px]">M-Pesa: {ad.mpesaReceipt}</span>
                          </>
                        )}
                      </div>

                      {ad.moderationNote && ad.status === "REJECTED" && (
                        <div className="text-xs text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-950/40 p-2 rounded-lg border border-red-200 dark:border-red-900 mt-1">
                          <strong>Rejection Reason:</strong> {ad.moderationNote}
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Middle: Performance Metrics */}
                  <div className="grid grid-cols-3 gap-3 bg-muted/30 border border-border/60 rounded-xl p-3 text-center sm:min-w-[260px]">
                    <div>
                      <div className="text-xs text-muted-foreground flex items-center justify-center gap-1">
                        <Eye className="w-3 h-3 text-brand-emerald" />
                        <span>Views</span>
                      </div>
                      <div className="text-base font-black text-foreground mt-0.5">
                        {ad.viewsCount.toLocaleString()}
                      </div>
                    </div>
                    <div className="border-x border-border">
                      <div className="text-xs text-muted-foreground flex items-center justify-center gap-1">
                        <MousePointerClick className="w-3 h-3 text-blue-500" />
                        <span>Clicks</span>
                      </div>
                      <div className="text-base font-black text-foreground mt-0.5">
                        {ad.clicksCount.toLocaleString()}
                      </div>
                    </div>
                    <div>
                      <div className="text-xs text-muted-foreground">CTR</div>
                      <div className="text-base font-black text-foreground mt-0.5">
                        {ctr}%
                      </div>
                    </div>
                  </div>

                  {/* Right: Actions */}
                  <div className="flex flex-row lg:flex-col items-center gap-2 shrink-0">
                    <Link
                      href={`/advertise?renew=${ad.id}`}
                      className="flex-1 lg:w-full inline-flex items-center justify-center gap-1.5 bg-brand-emerald hover:bg-brand-emerald-dark text-white text-xs font-bold py-2 px-3.5 rounded-xl transition-all shadow-xs"
                    >
                      <RefreshCw className="w-3 h-3" />
                      <span>Renew (KES 1,020)</span>
                    </Link>

                    <Link
                      href="/"
                      className="flex-1 lg:w-full inline-flex items-center justify-center gap-1.5 bg-muted hover:bg-muted/80 text-foreground text-xs font-semibold py-2 px-3.5 rounded-xl transition-colors"
                    >
                      <span>Preview in Feed</span>
                      <ExternalLink className="w-3 h-3" />
                    </Link>
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          /* Empty State */
          <div className="bg-white dark:bg-brand-dark-card border border-border dark:border-brand-dark-border rounded-3xl p-10 sm:p-16 text-center space-y-4">
            <div className="w-16 h-16 rounded-3xl bg-brand-emerald/10 text-brand-emerald flex items-center justify-center mx-auto">
              <Megaphone className="w-8 h-8" />
            </div>
            <div className="space-y-1.5 max-w-md mx-auto">
              <h2 className="text-lg font-bold text-foreground">No Advertisements Yet</h2>
              <p className="text-xs text-muted-foreground">
                You have not published any business advertisements yet. Start showcasing your store or physical service across Kenya today!
              </p>
            </div>
            <div className="pt-2">
              <Link
                href="/advertise"
                className="inline-flex items-center gap-2 bg-brand-emerald hover:bg-brand-emerald-dark text-white text-xs sm:text-sm font-bold py-3 px-6 rounded-xl shadow-md transition-all"
              >
                <Plus className="w-4 h-4" />
                <span>Create Advertisement (KES 1,020 / 30 Days)</span>
              </Link>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
