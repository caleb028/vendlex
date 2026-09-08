"use client";

import React, { useState } from "react";
import { Users, MessageSquare, Award, Flame, ThumbsUp, MapPin, Sparkles, Plus, CheckCircle2 } from "lucide-react";

interface ForumPost {
  id: string;
  authorName: string;
  authorRole: string;
  county: string;
  title: string;
  content: string;
  category: string;
  upvotes: number;
  replies: number;
  timeAgo: string;
}

const INITIAL_POSTS: ForumPost[] = [
  {
    id: "post-1",
    authorName: "Amina Hassan",
    authorRole: "Verified Fashion Merchant",
    county: "Nairobi",
    title: "Best practices for photographing Kitenge apparel with phone camera?",
    content: "Hi fellow sellers! What lighting setup or background works best when using the AI Photo Enhancer tool for vibrant Kitenge dresses?",
    category: "Seller Growth",
    upvotes: 24,
    replies: 12,
    timeAgo: "2 hours ago",
  },
  {
    id: "post-2",
    authorName: "Peter Kamau",
    authorRole: "Master Technician",
    county: "Nairobi",
    title: "How we completed a 5kW Solar Inverter installation in Westlands under 4 hours",
    content: "Sharing our team's checklist for solar inverter wiring and battery backup setup. Customer gave us 5-star rating on VendLex!",
    category: "Technician Showcase",
    upvotes: 45,
    replies: 18,
    timeAgo: "5 hours ago",
  },
  {
    id: "post-3",
    authorName: "Ali Salim",
    authorRole: "Coast Agro Supplies",
    county: "Mombasa",
    title: "Fast Fargo & G4S courier dispatch tips for Coast region orders",
    content: "Pro-tip for Nyali and Malindi sellers: booking courier pick-up before 11 AM guarantees same-day dispatch to Nairobi!",
    category: "Logistics & Delivery",
    upvotes: 38,
    replies: 9,
    timeAgo: "1 day ago",
  },
];

export default function CommunityPage() {
  const [posts, setPosts] = useState<ForumPost[]>(INITIAL_POSTS);
  const [selectedGroup, setSelectedGroup] = useState("all");
  const [newTitle, setNewTitle] = useState("");
  const [newContent, setNewContent] = useState("");
  const [showNewPostModal, setShowNewPostModal] = useState(false);

  const handleUpvote = (id: string) => {
    setPosts((prev) =>
      prev.map((p) => (p.id === id ? { ...p, upvotes: p.upvotes + 1 } : p))
    );
  };

  const handleCreatePost = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle.trim() || !newContent.trim()) return;

    const newPost: ForumPost = {
      id: `post-${Date.now()}`,
      authorName: "Grace Wanjiku",
      authorRole: "Verified Merchant",
      county: "Nairobi",
      title: newTitle,
      content: newContent,
      category: "General Discussion",
      upvotes: 1,
      replies: 0,
      timeAgo: "Just now",
    };

    setPosts([newPost, ...posts]);
    setNewTitle("");
    setNewContent("");
    setShowNewPostModal(false);
  };

  return (
    <div className="bg-brand-off-white dark:bg-brand-dark-bg min-h-screen py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
        {/* Banner */}
        <div className="bg-gradient-to-r from-brand-charcoal via-brand-emerald-dark to-brand-emerald rounded-3xl p-8 sm:p-10 text-white shadow-xl flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="inline-flex items-center gap-2 bg-brand-gold text-brand-charcoal text-xs font-black px-3 py-1 rounded-full uppercase tracking-wider">
              <Users className="w-3.5 h-3.5" />
              <span>VendLex Kenyan Community &amp; Guilds</span>
            </div>
            <h1 className="text-3xl sm:text-4xl font-black tracking-tight">
              Seller Forum &amp; County Guilds
            </h1>
            <p className="text-xs sm:text-sm text-emerald-100 max-w-xl">
              Connect with fellow Kenyan merchants, swap growth tips, showcase technician work, and earn County Champion badges!
            </p>
          </div>

          <button
            onClick={() => setShowNewPostModal(true)}
            className="bg-white text-brand-emerald hover:bg-emerald-50 font-bold px-6 py-3.5 rounded-xl text-xs sm:text-sm shadow-md transition-all shrink-0 flex items-center gap-2"
          >
            <Plus className="w-4 h-4" />
            <span>Create Community Post</span>
          </button>
        </div>

        {/* 3-Column Layout: County Groups + Feed + Gamification Leaderboard */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* County Groups (3 cols) */}
          <div className="lg:col-span-3 bg-white dark:bg-brand-dark-card border border-border dark:border-brand-dark-border rounded-3xl p-5 shadow-sm space-y-4">
            <h3 className="font-extrabold text-sm text-foreground uppercase tracking-wider flex items-center gap-1.5">
              <MapPin className="w-4 h-4 text-brand-red" />
              <span>County Groups</span>
            </h3>

            <div className="space-y-1 text-xs">
              {[
                { name: "All County Feed", count: "1.2k members", id: "all" },
                { name: "Nairobi Merchants Guild", count: "480 members", id: "nairobi" },
                { name: "Mombasa Marine & Traders", count: "290 members", id: "mombasa" },
                { name: "Eldoret Agri & Tech Vendors", count: "210 members", id: "eldoret" },
                { name: "Nakuru Solar Technicians", count: "165 members", id: "nakuru" },
              ].map((grp) => (
                <button
                  key={grp.id}
                  onClick={() => setSelectedGroup(grp.id)}
                  className={`w-full flex items-center justify-between p-2.5 rounded-xl transition-all text-left ${
                    selectedGroup === grp.id
                      ? "bg-brand-emerald text-white font-bold"
                      : "hover:bg-muted text-muted-foreground hover:text-foreground"
                  }`}
                >
                  <span className="truncate">{grp.name}</span>
                  <span className="text-[10px] opacity-80">{grp.count}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Main Feed (6 cols) */}
          <div className="lg:col-span-6 space-y-4">
            {posts.map((post) => (
              <div
                key={post.id}
                className="bg-white dark:bg-brand-dark-card border border-border dark:border-brand-dark-border rounded-3xl p-6 shadow-sm space-y-3"
              >
                <div className="flex items-center justify-between text-xs">
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-full bg-brand-emerald-soft dark:bg-brand-dark-border font-bold text-brand-emerald flex items-center justify-center">
                      {post.authorName[0]}
                    </div>
                    <div>
                      <span className="font-bold text-foreground block">{post.authorName}</span>
                      <span className="text-[10px] text-muted-foreground">{post.authorRole} • {post.county}</span>
                    </div>
                  </div>
                  <span className="text-[10px] text-muted-foreground">{post.timeAgo}</span>
                </div>

                <h4 className="font-extrabold text-base text-foreground leading-snug">{post.title}</h4>
                <p className="text-xs text-muted-foreground leading-relaxed whitespace-pre-line">{post.content}</p>

                <div className="flex items-center justify-between pt-2 border-t border-border/60 text-xs">
                  <button
                    onClick={() => handleUpvote(post.id)}
                    className="flex items-center gap-1.5 text-muted-foreground hover:text-brand-emerald font-bold transition-colors"
                  >
                    <ThumbsUp className="w-4 h-4" />
                    <span>{post.upvotes} Upvotes</span>
                  </button>

                  <span className="text-muted-foreground flex items-center gap-1">
                    <MessageSquare className="w-4 h-4" />
                    <span>{post.replies} Replies</span>
                  </span>
                </div>
              </div>
            ))}
          </div>

          {/* Gamification & Leaderboard (3 cols) */}
          <div className="lg:col-span-3 space-y-6">
            <div className="bg-white dark:bg-brand-dark-card border border-border dark:border-brand-dark-border rounded-3xl p-5 shadow-sm space-y-4">
              <h3 className="font-extrabold text-sm text-foreground uppercase tracking-wider flex items-center gap-1.5">
                <Award className="w-4 h-4 text-brand-gold" />
                <span>County Champions</span>
              </h3>

              <div className="space-y-3 text-xs">
                {[
                  { rank: "1", name: "Nairobi Tech Hub", county: "Nairobi", pts: "4,820 pts", badge: "🏆 Gold Champion" },
                  { rank: "2", name: "Savanna Fashion", county: "Nairobi", pts: "3,940 pts", badge: "🥈 Silver Pro" },
                  { rank: "3", name: "Coast Agro Supplies", county: "Mombasa", pts: "3,110 pts", badge: "🥉 Bronze Pro" },
                ].map((lb) => (
                  <div key={lb.rank} className="p-3 bg-muted/30 rounded-2xl flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="font-black text-brand-emerald w-4">{lb.rank}.</span>
                      <div>
                        <span className="font-bold text-foreground block">{lb.name}</span>
                        <span className="text-[10px] text-amber-600 font-semibold">{lb.badge}</span>
                      </div>
                    </div>
                    <span className="font-bold text-muted-foreground">{lb.pts}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* New Post Modal */}
      {showNewPostModal && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white dark:bg-brand-dark-card border border-border rounded-3xl p-6 w-full max-w-lg space-y-4 shadow-2xl">
            <h3 className="font-extrabold text-base text-foreground">Create Community Discussion Post</h3>
            <form onSubmit={handleCreatePost} className="space-y-3">
              <div>
                <label className="block text-xs font-bold text-foreground mb-1">Post Title *</label>
                <input
                  type="text"
                  required
                  value={newTitle}
                  onChange={(e) => setNewTitle(e.target.value)}
                  placeholder="e.g. Best M-Pesa till setup tips..."
                  className="w-full bg-muted/40 border rounded-xl p-2.5 text-xs text-foreground focus:outline-none focus:border-brand-emerald"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-foreground mb-1">Discussion Content *</label>
                <textarea
                  rows={4}
                  required
                  value={newContent}
                  onChange={(e) => setNewContent(e.target.value)}
                  placeholder="Share your experience, question, or showcase..."
                  className="w-full bg-muted/40 border rounded-xl p-2.5 text-xs text-foreground resize-none focus:outline-none focus:border-brand-emerald"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowNewPostModal(false)}
                  className="px-4 py-2 rounded-xl text-xs font-semibold text-muted-foreground hover:bg-muted"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="bg-brand-emerald text-white font-bold px-6 py-2.5 rounded-xl text-xs shadow-sm"
                >
                  Publish Post
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
