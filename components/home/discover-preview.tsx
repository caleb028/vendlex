"use client";

import React from "react";
import Link from "next/link";
import { ArrowRight, Sparkles, Heart, MessageCircle } from "lucide-react";
import { formatKSh } from "@/lib/utils";

const TRENDING_POSTS = [
  {
    id: "post-1",
    merchant: "Savanna Kicks",
    image: "https://images.unsplash.com/photo-1552346154-21d32810aba3?q=80&w=600&auto=format&fit=crop",
    caption: "Air Max Cushion Pro (2026 Edition). Free same-day delivery in Nairobi.",
    price: 4800,
    likes: 142,
  },
  {
    id: "post-2",
    merchant: "Nairobi Tech Hub",
    image: "https://images.unsplash.com/photo-1610945265064-0e34e5519bbf?q=80&w=600&auto=format&fit=crop",
    caption: "Samsung Galaxy S24 Ultra (512GB) with 24-month local warranty.",
    price: 154999,
    likes: 310,
  },
  {
    id: "post-3",
    merchant: "Kilifi Coconut Crafts",
    image: "https://images.unsplash.com/photo-1590874103328-eac38a683ce7?q=80&w=600&auto=format&fit=crop",
    caption: "Handwoven Kenyan Sisal Kiondos woven in Malindi by our cooperative.",
    price: 2400,
    likes: 215,
  },
];

export function DiscoverPreview() {
  return (
    <section className="py-16 sm:py-20 bg-brand-off-white dark:bg-brand-dark-bg border-t border-border/50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
        {/* Header per Section 18 */}
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
          <div className="space-y-1">
            <div className="flex items-center gap-1.5 text-xs font-bold text-brand-emerald uppercase tracking-wider">
              <Sparkles className="w-3.5 h-3.5" />
              <span>Social Commerce</span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-black text-foreground tracking-tight">
              Discover what&apos;s trending
            </h2>
            <p className="text-xs sm:text-sm text-muted-foreground">
              New arrivals, store drops, and announcements from verified Kenyan sellers.
            </p>
          </div>

          <Link
            href="/discover"
            className="inline-flex items-center gap-1.5 text-xs sm:text-sm font-bold text-brand-emerald hover:text-brand-emerald-dark transition-colors"
          >
            <span>Explore Discover</span>
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>

        {/* 3 Preview Posts per Section 18 */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
          {TRENDING_POSTS.map((post) => (
            <Link
              key={post.id}
              href="/discover"
              className="group bg-white dark:bg-brand-dark-card border border-border dark:border-brand-dark-border rounded-2xl overflow-hidden shadow-xs hover:shadow-md hover:border-brand-emerald/40 transition-all flex flex-col justify-between"
            >
              <div className="space-y-3">
                <div className="aspect-4/3 w-full bg-muted overflow-hidden relative">
                  <img
                    src={post.image}
                    alt={post.caption}
                    className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-103"
                  />
                  <span className="absolute bottom-2.5 right-2.5 bg-black/70 backdrop-blur-md text-white text-[11px] font-bold px-2 py-0.5 rounded-lg">
                    {formatKSh(post.price)}
                  </span>
                </div>
                <div className="p-4 pt-0 space-y-1">
                  <span className="text-[10px] font-bold text-brand-emerald uppercase tracking-wider">
                    {post.merchant}
                  </span>
                  <p className="text-xs text-foreground font-medium line-clamp-2 leading-relaxed">
                    {post.caption}
                  </p>
                </div>
              </div>

              <div className="px-4 pb-4 pt-1 flex items-center justify-between text-[11px] text-muted-foreground border-t border-border/50">
                <div className="flex items-center gap-1 text-brand-red font-semibold">
                  <Heart className="w-3.5 h-3.5 fill-current" />
                  <span>{post.likes}</span>
                </div>
                <span className="font-semibold text-brand-emerald group-hover:underline">
                  View post &rarr;
                </span>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}
