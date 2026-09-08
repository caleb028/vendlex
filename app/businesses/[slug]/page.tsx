"use client";

import React, { useState, use } from "react";
import Link from "next/link";
import { MOCK_BUSINESSES, MOCK_PRODUCTS, MOCK_SERVICES } from "@/lib/data/kenya-data";
import { VerifiedBadge } from "@/components/ui/badge";
import { ProductCard } from "@/components/marketplace/product-card";
import { ServiceCard } from "@/components/services/service-card";
import { Modal } from "@/components/ui/modal";
import {
  MapPin,
  Star,
  Phone,
  MessageCircle,
  Clock,
  Mail,
  Globe,
  Share2,
  Heart,
  Users,
  CheckCircle2,
  Store,
  ShieldCheck,
  Calendar,
  Send,
} from "lucide-react";

export default function BusinessProfilePage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const resolvedParams = use(params);
  const business = MOCK_BUSINESSES.find((b) => b.slug === resolvedParams.slug);

  const [activeTab, setActiveTab] = useState<"products" | "services" | "about" | "reviews" | "info">("products");
  const [isFollowing, setIsFollowing] = useState(false);
  const [followerCount, setFollowerCount] = useState(business?.followerCount || 1200);
  const [showContactModal, setShowContactModal] = useState(false);
  const [showReviewModal, setShowReviewModal] = useState(false);
  const [userRating, setUserRating] = useState(5);
  const [userComment, setUserComment] = useState("");
  const [reviewSubmitted, setReviewSubmitted] = useState(false);

  if (!business) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-20 text-center space-y-4">
        <h1 className="text-2xl font-bold text-foreground">Business Not Found</h1>
        <p className="text-sm text-muted-foreground">The business storefront does not exist or has been modified.</p>
        <Link href="/businesses" className="inline-block bg-brand-emerald text-white px-5 py-2.5 rounded-xl font-bold text-xs">
          Explore Kenyan Directory
        </Link>
      </div>
    );
  }

  const products = MOCK_PRODUCTS.filter((p) => p.businessId === business.id || p.businessSlug === business.slug);
  const services = MOCK_SERVICES.filter((s) => s.providerId === business.id || s.providerSlug === business.slug);

  const handleFollow = () => {
    if (isFollowing) {
      setIsFollowing(false);
      setFollowerCount((prev) => prev - 1);
    } else {
      setIsFollowing(true);
      setFollowerCount((prev) => prev + 1);
    }
  };

  const handleReviewSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setReviewSubmitted(true);
    setTimeout(() => {
      setShowReviewModal(false);
      setReviewSubmitted(false);
    }, 2000);
  };

  return (
    <div className="bg-brand-off-white dark:bg-brand-dark-bg min-h-screen pb-16">
      {/* 1. Header Banner */}
      <div className="relative h-64 sm:h-80 w-full overflow-hidden bg-brand-dark-bg">
        <img
          src={business.coverImage}
          alt={business.name}
          className="w-full h-full object-cover opacity-80"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent" />

        {/* Top Badges & Share */}
        <div className="absolute top-4 right-4 sm:right-8 flex items-center gap-2">
          <button
            onClick={() => {
              if (navigator.share) {
                navigator.share({ title: business.name, url: window.location.href });
              }
            }}
            className="p-2 rounded-xl bg-black/40 hover:bg-black/60 text-white backdrop-blur-md transition-colors"
            title="Share Store"
          >
            <Share2 className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* 2. Business Profile Card Container */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 -mt-20 relative z-10">
        <div className="bg-white dark:bg-brand-dark-card border border-border dark:border-brand-dark-border rounded-3xl p-6 sm:p-8 shadow-xl space-y-6">
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
            {/* Logo & Info */}
            <div className="flex flex-col sm:flex-row items-start sm:items-end gap-5">
              <div className="w-24 h-24 sm:w-28 sm:h-28 rounded-3xl overflow-hidden border-4 border-white dark:border-brand-dark-card shadow-xl bg-white shrink-0">
                <img src={business.logo} alt={business.name} className="w-full h-full object-cover" />
              </div>

              <div className="space-y-1.5">
                <div className="flex items-center gap-2 flex-wrap">
                  <h1 className="text-2xl sm:text-3xl font-black text-foreground">{business.name}</h1>
                  {business.isVerified && <VerifiedBadge />}
                  {business.badges && business.badges.map((b, i) => (
                    <span key={i} className="text-[10px] bg-brand-emerald-soft dark:bg-brand-dark-border text-brand-emerald dark:text-brand-emerald-light font-bold px-2 py-0.5 rounded-full">
                      {b}
                    </span>
                  ))}
                </div>

                <p className="text-xs sm:text-sm text-muted-foreground">{business.tagline}</p>

                <div className="flex flex-wrap items-center gap-4 text-xs text-muted-foreground pt-1">
                  <div className="flex items-center gap-1">
                    <MapPin className="w-3.5 h-3.5 text-brand-red" />
                    <span>{business.physicalLocation || `${business.town}, ${business.county}`}</span>
                  </div>
                  <div className="flex items-center gap-1 text-amber-500 font-bold">
                    <Star className="w-3.5 h-3.5 fill-current" />
                    <span>{business.rating}</span>
                    <span className="text-muted-foreground font-normal">({business.reviewCount} reviews)</span>
                  </div>
                  <div className="flex items-center gap-1 font-semibold text-foreground">
                    <Users className="w-3.5 h-3.5 text-brand-emerald" />
                    <span>{followerCount.toLocaleString()} Followers</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex flex-wrap items-center gap-2.5">
              <button
                onClick={handleFollow}
                className={`px-4 py-2.5 rounded-xl text-xs font-bold transition-all shadow-sm flex items-center gap-1.5 ${
                  isFollowing
                    ? "bg-brand-emerald-soft text-brand-emerald border border-brand-emerald/30"
                    : "bg-muted dark:bg-brand-dark-border text-foreground hover:bg-muted/80"
                }`}
              >
                <Heart className={`w-4 h-4 ${isFollowing ? "fill-brand-emerald" : ""}`} />
                <span>{isFollowing ? "Following" : "Follow Store"}</span>
              </button>

              <button
                onClick={() => setShowContactModal(true)}
                className="bg-brand-emerald hover:bg-brand-emerald-dark text-white text-xs font-bold px-5 py-2.5 rounded-xl transition-all shadow-sm flex items-center gap-1.5"
              >
                <MessageCircle className="w-4 h-4" />
                <span>Contact & Chat</span>
              </button>
            </div>
          </div>

          {/* Tab Navigation */}
          <div className="flex items-center gap-2 border-t border-border dark:border-brand-dark-border pt-4 overflow-x-auto pb-1 text-xs font-bold">
            <button
              onClick={() => setActiveTab("products")}
              className={`px-4 py-2 rounded-xl transition-all ${
                activeTab === "products"
                  ? "bg-brand-emerald text-white shadow-sm"
                  : "text-muted-foreground hover:text-foreground hover:bg-muted"
              }`}
            >
              Products ({products.length})
            </button>
            <button
              onClick={() => setActiveTab("services")}
              className={`px-4 py-2 rounded-xl transition-all ${
                activeTab === "services"
                  ? "bg-brand-emerald text-white shadow-sm"
                  : "text-muted-foreground hover:text-foreground hover:bg-muted"
              }`}
            >
              Services ({services.length})
            </button>
            <button
              onClick={() => setActiveTab("about")}
              className={`px-4 py-2 rounded-xl transition-all ${
                activeTab === "about"
                  ? "bg-brand-emerald text-white shadow-sm"
                  : "text-muted-foreground hover:text-foreground hover:bg-muted"
              }`}
            >
              About Business
            </button>
            <button
              onClick={() => setActiveTab("reviews")}
              className={`px-4 py-2 rounded-xl transition-all ${
                activeTab === "reviews"
                  ? "bg-brand-emerald text-white shadow-sm"
                  : "text-muted-foreground hover:text-foreground hover:bg-muted"
              }`}
            >
              Customer Reviews ({business.reviewCount})
            </button>
            <button
              onClick={() => setActiveTab("info")}
              className={`px-4 py-2 rounded-xl transition-all ${
                activeTab === "info"
                  ? "bg-brand-emerald text-white shadow-sm"
                  : "text-muted-foreground hover:text-foreground hover:bg-muted"
              }`}
            >
              Operating Hours & Contact
            </button>
          </div>
        </div>

        {/* 3. Tab Content Panes */}
        <div className="mt-8">
          {/* Products Tab */}
          {activeTab === "products" && (
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <h3 className="font-extrabold text-lg text-foreground">
                  All Products by {business.name}
                </h3>
                <span className="text-xs text-muted-foreground">
                  Direct dispatch from {business.town}, {business.county}
                </span>
              </div>
              {products.length === 0 ? (
                <div className="bg-white dark:bg-brand-dark-card border rounded-3xl p-12 text-center text-xs text-muted-foreground">
                  No products currently listed by this merchant.
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                  {products.map((p) => (
                    <ProductCard key={p.id} product={p} />
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Services Tab */}
          {activeTab === "services" && (
            <div className="space-y-6">
              <h3 className="font-extrabold text-lg text-foreground">
                Services Offered by {business.name}
              </h3>
              {services.length === 0 ? (
                <div className="bg-white dark:bg-brand-dark-card border rounded-3xl p-12 text-center text-xs text-muted-foreground">
                  This merchant does not offer bookable services at this time.
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                  {services.map((s) => (
                    <ServiceCard key={s.id} service={s} />
                  ))}
                </div>
              )}
            </div>
          )}

          {/* About Tab */}
          {activeTab === "about" && (
            <div className="bg-white dark:bg-brand-dark-card border border-border dark:border-brand-dark-border rounded-3xl p-6 sm:p-8 space-y-6">
              <div>
                <h3 className="text-lg font-bold text-foreground mb-3">About {business.name}</h3>
                <p className="text-sm text-muted-foreground leading-relaxed whitespace-pre-line">
                  {business.description}
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-4 border-t border-border">
                <div className="p-4 rounded-2xl bg-muted/40 dark:bg-brand-dark-bg/60">
                  <div className="text-xs text-muted-foreground font-semibold">Location</div>
                  <div className="text-sm font-bold text-foreground mt-1">{business.town}, {business.county}</div>
                  <div className="text-xs text-muted-foreground mt-0.5">{business.physicalLocation}</div>
                </div>

                <div className="p-4 rounded-2xl bg-muted/40 dark:bg-brand-dark-bg/60">
                  <div className="text-xs text-muted-foreground font-semibold">Verification Status</div>
                  <div className="text-sm font-bold text-brand-emerald mt-1 flex items-center gap-1">
                    <ShieldCheck className="w-4 h-4" /> Verified Merchant
                  </div>
                  <div className="text-xs text-muted-foreground mt-0.5">Vetted business registration & ID</div>
                </div>

                <div className="p-4 rounded-2xl bg-muted/40 dark:bg-brand-dark-bg/60">
                  <div className="text-xs text-muted-foreground font-semibold">Member Since</div>
                  <div className="text-sm font-bold text-foreground mt-1">{business.joinedDate}</div>
                  <div className="text-xs text-muted-foreground mt-0.5">VendLex Verified Partner</div>
                </div>
              </div>
            </div>
          )}

          {/* Reviews Tab */}
          {activeTab === "reviews" && (
            <div className="bg-white dark:bg-brand-dark-card border border-border dark:border-brand-dark-border rounded-3xl p-6 sm:p-8 space-y-6">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-lg font-bold text-foreground">Customer Reviews & Ratings</h3>
                  <p className="text-xs text-muted-foreground">Overall rating {business.rating} out of 5.0</p>
                </div>
                <button
                  onClick={() => setShowReviewModal(true)}
                  className="bg-brand-emerald text-white text-xs font-bold px-4 py-2 rounded-xl hover:bg-brand-emerald-dark"
                >
                  Write a Review +
                </button>
              </div>

              {/* Sample reviews */}
              <div className="space-y-4 divide-y divide-border/60">
                {[
                  { name: "Faith Ndung'u", rating: 5, date: "2 days ago", comment: "Super fast same day delivery in Nairobi. The item was 100% genuine and well packaged!" },
                  { name: "David Kiprono", rating: 5, date: "1 week ago", comment: "Excellent customer service on WhatsApp. Clarified all my warranty questions before I made the M-Pesa payment." },
                ].map((rev, idx) => (
                  <div key={idx} className="pt-4 space-y-1.5">
                    <div className="flex items-center justify-between text-xs">
                      <span className="font-bold text-foreground">{rev.name}</span>
                      <span className="text-muted-foreground">{rev.date}</span>
                    </div>
                    <div className="flex items-center text-amber-500">
                      {[...Array(rev.rating)].map((_, i) => (
                        <Star key={i} className="w-3.5 h-3.5 fill-current" />
                      ))}
                    </div>
                    <p className="text-xs text-muted-foreground">{rev.comment}</p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Info Tab */}
          {activeTab === "info" && (
            <div className="bg-white dark:bg-brand-dark-card border border-border dark:border-brand-dark-border rounded-3xl p-6 sm:p-8 space-y-6">
              <h3 className="text-lg font-bold text-foreground">Business Hours & Direct Contact</h3>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-3">
                  <h4 className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Operating Schedule</h4>
                  <div className="p-4 rounded-2xl bg-muted/40 dark:bg-brand-dark-bg/60 space-y-2 text-xs">
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Monday - Friday:</span>
                      <span className="font-bold text-foreground">{business.openingHours.weekdays}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Saturday:</span>
                      <span className="font-bold text-foreground">{business.openingHours.saturday}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Sunday:</span>
                      <span className="font-bold text-foreground">{business.openingHours.sunday}</span>
                    </div>
                  </div>
                </div>

                <div className="space-y-3">
                  <h4 className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Contact Details</h4>
                  <div className="p-4 rounded-2xl bg-muted/40 dark:bg-brand-dark-bg/60 space-y-2.5 text-xs">
                    <div className="flex items-center gap-2">
                      <Phone className="w-4 h-4 text-brand-emerald" />
                      <span className="font-mono">{business.phone}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Mail className="w-4 h-4 text-brand-emerald" />
                      <span>{business.email}</span>
                    </div>
                    {business.website && (
                      <div className="flex items-center gap-2">
                        <Globe className="w-4 h-4 text-brand-emerald" />
                        <a href={business.website} target="_blank" rel="noreferrer" className="text-brand-emerald hover:underline">
                          {business.website}
                        </a>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Contact Modal */}
      <Modal
        isOpen={showContactModal}
        onClose={() => setShowContactModal(false)}
        title={`Contact ${business.name}`}
      >
        <div className="space-y-4">
          <a
            href={`https://wa.me/${business.whatsapp.replace(/\D/g, "")}?text=Hello%20${encodeURIComponent(business.name)},%20I%20am%20viewing%20your%20storefront%20on%20VendLex`}
            target="_blank"
            rel="noopener noreferrer"
            className="w-full flex items-center justify-between p-3.5 rounded-xl bg-emerald-500 hover:bg-emerald-600 text-white font-bold text-sm transition-colors shadow-sm"
          >
            <div className="flex items-center gap-2.5">
              <MessageCircle className="w-5 h-5" />
              <span>Chat on WhatsApp</span>
            </div>
            <span className="text-xs bg-white/20 px-2 py-0.5 rounded font-mono">{business.whatsapp}</span>
          </a>

          <a
            href={`tel:${business.phone}`}
            className="w-full flex items-center justify-between p-3.5 rounded-xl bg-brand-emerald hover:bg-brand-emerald-dark text-white font-bold text-sm transition-colors shadow-sm"
          >
            <div className="flex items-center gap-2.5">
              <Phone className="w-5 h-5" />
              <span>Call Direct</span>
            </div>
            <span className="text-xs bg-white/20 px-2 py-0.5 rounded font-mono">{business.phone}</span>
          </a>
        </div>
      </Modal>

      {/* Review Modal */}
      <Modal
        isOpen={showReviewModal}
        onClose={() => setShowReviewModal(false)}
        title={`Review ${business.name}`}
      >
        {reviewSubmitted ? (
          <div className="text-center py-6 space-y-2">
            <CheckCircle2 className="w-12 h-12 text-brand-emerald mx-auto" />
            <h4 className="font-bold text-foreground">Thank you for your review!</h4>
            <p className="text-xs text-muted-foreground">Your verified review has been posted to this storefront.</p>
          </div>
        ) : (
          <form onSubmit={handleReviewSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-foreground mb-1">Your Rating</label>
              <div className="flex gap-2">
                {[1, 2, 3, 4, 5].map((star) => (
                  <button
                    type="button"
                    key={star}
                    onClick={() => setUserRating(star)}
                    className="p-1 text-amber-500"
                  >
                    <Star className={`w-6 h-6 ${star <= userRating ? "fill-current" : "text-gray-300"}`} />
                  </button>
                ))}
              </div>
            </div>
            <div>
              <label className="block text-xs font-bold text-foreground mb-1">Review Comments</label>
              <textarea
                rows={3}
                required
                value={userComment}
                onChange={(e) => setUserComment(e.target.value)}
                placeholder="Describe your purchase experience, customer service, or delivery speed..."
                className="w-full bg-muted border rounded-xl p-3 text-xs text-foreground resize-none"
              />
            </div>
            <button
              type="submit"
              className="w-full bg-brand-emerald text-white font-bold py-3 rounded-xl text-xs"
            >
              Submit Review
            </button>
          </form>
        )}
      </Modal>
    </div>
  );
}
