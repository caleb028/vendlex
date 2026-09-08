"use client";

import React, { useState } from "react";
import Link from "next/link";
import {
  Heart,
  MessageCircle,
  Share2,
  Bookmark,
  ShoppingBag,
  Sparkles,
  Store,
  MapPin,
  CheckCircle2,
  Send,
  Plus,
  Play,
} from "lucide-react";
import { formatKSh } from "@/lib/utils";

interface DiscoverPost {
  id: string;
  merchantName: string;
  merchantSlug: string;
  merchantLogo: string;
  county: string;
  type: "PRODUCT" | "VIDEO" | "DEAL" | "ANNOUNCEMENT" | "NEW_ARRIVAL";
  mediaUrl: string;
  caption: string;
  productTitle?: string;
  productPrice?: number;
  productSlug?: string;
  discount?: string;
  likes: number;
  commentsCount: number;
  timeAgo: string;
}

const INITIAL_POSTS: DiscoverPost[] = [
  {
    id: "post-1",
    merchantName: "Savanna Kicks & Apparel",
    merchantSlug: "savanna-kicks",
    merchantLogo: "https://images.unsplash.com/photo-1542291026-7eec264c27ff?q=80&w=200&auto=format&fit=crop",
    county: "Nairobi",
    type: "NEW_ARRIVAL",
    mediaUrl: "https://images.unsplash.com/photo-1552346154-21d32810aba3?q=80&w=800&auto=format&fit=crop",
    caption: "Just landed in our Nairobi CBD store! Premium athletic running sneakers with air-cushion soles. Available in sizes 40 to 45. Free same-day delivery across Nairobi County! 👟🇰🇪",
    productTitle: "Air Max Cushion Pro Sneakers (2026 Edition)",
    productPrice: 4800,
    productSlug: "air-max-cushion-pro",
    discount: "15% OFF",
    likes: 142,
    commentsCount: 28,
    timeAgo: "2 hours ago",
  },
  {
    id: "post-2",
    merchantName: "Nairobi Tech Hub",
    merchantSlug: "nairobi-tech-hub",
    merchantLogo: "https://images.unsplash.com/photo-1531403009284-440f080d1e12?q=80&w=200&auto=format&fit=crop",
    county: "Nairobi",
    type: "DEAL",
    mediaUrl: "https://images.unsplash.com/photo-1610945265064-0e34e5519bbf?q=80&w=800&auto=format&fit=crop",
    caption: "FLASH WEEKEND PROMO! Samsung Galaxy S24 Ultra (512GB) now discounted to KSh 154,999. Full 24-month official Safaricom warranty included. Pay securely via Lipa na M-Pesa. 📱⚡",
    productTitle: "Samsung Galaxy S24 Ultra (512GB)",
    productPrice: 154999,
    productSlug: "samsung-galaxy-s24-ultra",
    discount: "Save KSh 15,000",
    likes: 310,
    commentsCount: 64,
    timeAgo: "4 hours ago",
  },
  {
    id: "post-3",
    merchantName: "Kilifi Coconut Crafts",
    merchantSlug: "kilifi-coconut-crafts",
    merchantLogo: "https://images.unsplash.com/photo-1544717305-2782549b5136?q=80&w=200&auto=format&fit=crop",
    county: "Kilifi",
    type: "PRODUCT",
    mediaUrl: "https://images.unsplash.com/photo-1590874103328-eac38a683ce7?q=80&w=800&auto=format&fit=crop",
    caption: "Handcrafted genuine Kenyan coastal Sisal Kiondos woven by our women's cooperative in Malindi. Durable, eco-friendly, and perfect for work or weekend beach trips. 🌴✨",
    productTitle: "Handwoven Kenyan Sisal Kiondo Tote",
    productPrice: 2400,
    productSlug: "handwoven-kenyan-sisal-kiondo",
    likes: 215,
    commentsCount: 19,
    timeAgo: "6 hours ago",
  },
];

export default function DiscoverFeedPage() {
  const [posts, setPosts] = useState<DiscoverPost[]>(INITIAL_POSTS);
  const [likedPosts, setLikedPosts] = useState<Record<string, boolean>>({});
  const [savedPosts, setSavedPosts] = useState<Record<string, boolean>>({});
  const [activeCommentPost, setActiveCommentPost] = useState<string | null>(null);
  const [commentText, setCommentText] = useState("");

  const toggleLike = (id: string) => {
    setLikedPosts((prev) => {
      const isLiked = !!prev[id];
      setPosts((current) =>
        current.map((p) => (p.id === id ? { ...p, likes: p.likes + (isLiked ? -1 : 1) } : p))
      );
      return { ...prev, [id]: !isLiked };
    });
  };

  const toggleSave = (id: string) => {
    setSavedPosts((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  const handleCommentSubmit = (postId: string) => {
    if (!commentText.trim()) return;
    setPosts((prev) =>
      prev.map((p) => (p.id === postId ? { ...p, commentsCount: p.commentsCount + 1 } : p))
    );
    setCommentText("");
    setActiveCommentPost(null);
  };

  return (
    <div className="bg-brand-off-white dark:bg-brand-dark-bg min-h-screen py-8">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 space-y-6">
        {/* Header per Guideline #13 */}
        <div className="bg-white dark:bg-brand-dark-card border border-border dark:border-brand-dark-border rounded-3xl p-6 shadow-sm flex items-center justify-between">
          <div className="space-y-1">
            <div className="inline-flex items-center gap-1.5 px-3 py-0.5 rounded-full bg-emerald-50 dark:bg-emerald-950/60 text-brand-emerald text-xs font-bold border border-emerald-200">
              <Sparkles className="w-3.5 h-3.5 text-amber-500" />
              <span>VendLex Social Commerce</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-black text-foreground">
              Discover Kenya Feed
            </h1>
            <p className="text-xs text-muted-foreground">
              Explore product videos, new arrivals, announcements, and live deals from verified Kenyan merchants.
            </p>
          </div>

          <Link
            href="/seller/onboarding"
            className="hidden sm:inline-flex items-center gap-1.5 bg-brand-emerald hover:bg-brand-emerald-dark text-white font-bold py-2.5 px-4 rounded-xl text-xs shadow-sm transition-all"
          >
            <Plus className="w-4 h-4" />
            <span>Post as Merchant</span>
          </Link>
        </div>

        {/* Feed Posts */}
        <div className="space-y-6">
          {posts.map((post) => {
            const isLiked = !!likedPosts[post.id];
            const isSaved = !!savedPosts[post.id];

            return (
              <article
                key={post.id}
                className="bg-white dark:bg-brand-dark-card border border-border dark:border-brand-dark-border rounded-3xl overflow-hidden shadow-sm space-y-4"
              >
                {/* Post Merchant Header */}
                <div className="p-4 sm:p-5 pb-0 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <img
                      src={post.merchantLogo}
                      alt={post.merchantName}
                      className="w-10 h-10 rounded-full object-cover border border-border"
                    />
                    <div>
                      <div className="flex items-center gap-1.5">
                        <Link
                          href={`/businesses/${post.merchantSlug}`}
                          className="font-bold text-sm text-foreground hover:text-brand-emerald transition-colors"
                        >
                          {post.merchantName}
                        </Link>
                        <span className="text-[10px] font-bold text-blue-600 bg-blue-50 dark:bg-blue-950/60 px-1.5 py-0.2 rounded">
                          ✓ Verified
                        </span>
                      </div>
                      <div className="flex items-center gap-2 text-[11px] text-muted-foreground">
                        <span className="flex items-center gap-0.5">
                          <MapPin className="w-2.5 h-2.5 text-brand-red" />
                          <span>{post.county}</span>
                        </span>
                        <span>•</span>
                        <span>{post.timeAgo}</span>
                      </div>
                    </div>
                  </div>

                  <span className="text-[10px] font-black uppercase tracking-wider px-2.5 py-1 rounded-full bg-muted text-muted-foreground">
                    {post.type.replace("_", " ")}
                  </span>
                </div>

                {/* Caption */}
                <p className="px-4 sm:px-5 text-xs sm:text-sm text-foreground leading-relaxed">
                  {post.caption}
                </p>

                {/* Media Image / Video Container */}
                <div className="relative aspect-video w-full bg-black overflow-hidden">
                  <img
                    src={post.mediaUrl}
                    alt={post.caption}
                    className="w-full h-full object-cover"
                  />
                  {post.type === "VIDEO" && (
                    <div className="absolute inset-0 flex items-center justify-center bg-black/30">
                      <div className="w-14 h-14 rounded-full bg-white/90 text-brand-charcoal flex items-center justify-center shadow-xl">
                        <Play className="w-6 h-6 fill-current ml-1" />
                      </div>
                    </div>
                  )}

                  {post.discount && (
                    <span className="absolute top-3 left-3 bg-brand-red text-white text-xs font-black px-2.5 py-1 rounded-lg shadow-md">
                      {post.discount}
                    </span>
                  )}
                </div>

                {/* Connected Product Shoppable Pill per Guideline #13 */}
                {post.productTitle && (
                  <div className="mx-4 sm:mx-5 p-3 rounded-2xl bg-brand-off-white dark:bg-brand-dark-bg border border-border flex items-center justify-between gap-3">
                    <div className="truncate">
                      <span className="text-[10px] font-bold text-brand-emerald uppercase tracking-wider block">
                        Featured Product
                      </span>
                      <h4 className="text-xs font-bold text-foreground truncate">
                        {post.productTitle}
                      </h4>
                      <span className="text-xs font-black text-brand-emerald">
                        {formatKSh(post.productPrice || 0)}
                      </span>
                    </div>

                    <Link
                      href={post.productSlug ? `/products/${post.productSlug}` : "/marketplace"}
                      className="bg-brand-emerald hover:bg-brand-emerald-dark text-white font-black px-4 py-2 rounded-xl text-xs flex items-center gap-1.5 shadow-sm shrink-0 transition-all"
                    >
                      <ShoppingBag className="w-3.5 h-3.5" />
                      <span>Shop Now</span>
                    </Link>
                  </div>
                )}

                {/* Action Controls: Like, Comment, Share, Save per Guideline #13 */}
                <div className="px-4 sm:px-5 pb-4 flex items-center justify-between border-t border-border pt-3">
                  <div className="flex items-center gap-4">
                    {/* Like */}
                    <button
                      onClick={() => toggleLike(post.id)}
                      className={`flex items-center gap-1.5 text-xs font-bold transition-all ${
                        isLiked ? "text-brand-red scale-105" : "text-muted-foreground hover:text-brand-red"
                      }`}
                    >
                      <Heart className={`w-4 h-4 ${isLiked ? "fill-brand-red" : ""}`} />
                      <span>{post.likes}</span>
                    </button>

                    {/* Comment */}
                    <button
                      onClick={() => setActiveCommentPost(activeCommentPost === post.id ? null : post.id)}
                      className="flex items-center gap-1.5 text-xs font-bold text-muted-foreground hover:text-foreground transition-colors"
                    >
                      <MessageCircle className="w-4 h-4" />
                      <span>{post.commentsCount}</span>
                    </button>

                    {/* Share */}
                    <button
                      onClick={() => {
                        if (navigator.share) {
                          navigator.share({ title: post.caption, url: window.location.href });
                        }
                      }}
                      className="text-muted-foreground hover:text-foreground transition-colors"
                      title="Share Post"
                    >
                      <Share2 className="w-4 h-4" />
                    </button>
                  </div>

                  {/* Bookmark / Save */}
                  <button
                    onClick={() => toggleSave(post.id)}
                    className={`transition-colors ${
                      isSaved ? "text-brand-emerald" : "text-muted-foreground hover:text-foreground"
                    }`}
                    title="Save to Collection"
                  >
                    <Bookmark className={`w-4 h-4 ${isSaved ? "fill-brand-emerald" : ""}`} />
                  </button>
                </div>

                {/* Comment Box */}
                {activeCommentPost === post.id && (
                  <div className="px-4 sm:px-5 pb-4 pt-2 border-t border-border flex items-center gap-2 animate-fadeIn">
                    <input
                      type="text"
                      value={commentText}
                      onChange={(e) => setCommentText(e.target.value)}
                      placeholder="Ask the merchant a question..."
                      className="flex-1 px-3 py-2 rounded-xl border border-border bg-muted/30 text-xs text-foreground focus:outline-none focus:border-brand-emerald"
                    />
                    <button
                      onClick={() => handleCommentSubmit(post.id)}
                      className="bg-brand-emerald text-white p-2 rounded-xl text-xs font-bold"
                    >
                      <Send className="w-3.5 h-3.5" />
                    </button>
                  </div>
                )}
              </article>
            );
          })}
        </div>
      </div>
    </div>
  );
}
