"use client";

import React, { useState, useEffect, useMemo, Suspense } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { useAuth } from "@/lib/store/auth-store";
import {
  HelpCircle,
  Search,
  ShieldCheck,
  ShieldAlert,
  MessageSquare,
  Phone,
  Mail,
  Send,
  CheckCircle2,
  AlertCircle,
  FileText,
  Truck,
  Sparkles,
  Zap,
  ChevronDown,
  Clock,
  User,
  Plus,
  ArrowRight,
  ExternalLink,
  Lock,
} from "lucide-react";
import { ServerSupportTicket } from "@/lib/server-db/types";

function HelpSupportContent() {
  const { user } = useAuth();
  const searchParams = useSearchParams();
  const initialTicketParam = searchParams.get("ticket") || "";

  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string>("ALL");
  const [openFaqId, setOpenFaqId] = useState<string | null>("faq-1");

  // Ticket Lookup State
  const [lookupTicketNum, setLookupTicketNum] = useState(initialTicketParam);
  const [activeTicket, setActiveTicket] = useState<ServerSupportTicket | null>(null);
  const [lookupLoading, setLookupLoading] = useState(false);
  const [lookupError, setLookupError] = useState<string | null>(null);
  const [replyText, setReplyText] = useState("");
  const [replyLoading, setReplyLoading] = useState(false);

  // New Ticket Modal State
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [ticketSubject, setTicketSubject] = useState("");
  const [ticketCategory, setTicketCategory] = useState("ORDER_ESCROW");
  const [ticketDescription, setTicketDescription] = useState("");
  const [ticketOrderNum, setTicketOrderNum] = useState("");
  const [ticketPriority, setTicketPriority] = useState<"LOW" | "MEDIUM" | "HIGH" | "URGENT">("MEDIUM");
  const [ticketName, setTicketName] = useState(user?.name || "");
  const [ticketEmail, setTicketEmail] = useState(user?.email || "");
  const [ticketPhone, setTicketPhone] = useState(user?.phone || "");
  const [isSubmittingTicket, setIsSubmittingTicket] = useState(false);
  const [ticketSuccessMsg, setTicketSuccessMsg] = useState<string | null>(null);

  // Sync user info
  useEffect(() => {
    if (user) {
      if (!ticketName) setTicketName(user.name);
      if (!ticketEmail) setTicketEmail(user.email || "");
      if (!ticketPhone) setTicketPhone(user.phone || "");
    }
  }, [user]);

  // If URL has ?ticket=TKT-2026-XXXX, auto-fetch
  useEffect(() => {
    if (initialTicketParam) {
      handleLookupTicket(initialTicketParam);
    }
  }, [initialTicketParam]);

  const CATEGORIES = [
    { id: "ALL", label: "All Help Topics", icon: HelpCircle },
    { id: "ORDER_ESCROW", label: "Orders & Escrow", icon: ShieldCheck },
    { id: "PAYMENT_MPESA", label: "M-Pesa & Refunds", icon: Zap },
    { id: "SELLER_STORE", label: "Merchant Stores & KYC", icon: Sparkles },
    { id: "DELIVERY_COURIER", label: "Courier & Tracking", icon: Truck },
    { id: "SECURITY_FRAUD", label: "Trust, Security & Seals", icon: ShieldAlert },
    { id: "SERVICES_DIRECTORY", label: "Services & Quotes", icon: FileText },
  ];

  const FAQS = [
    {
      id: "faq-1",
      category: "ORDER_ESCROW",
      question: "How does VendLex Lipa na M-Pesa Escrow Protection work?",
      answer: "When you pay for an item via M-Pesa on VendLex, your money does not go directly to the merchant. Instead, funds are safely held in the secure VendLex Escrow vault. The merchant is notified to dispatch your order with live courier tracking. Only after the parcel arrives in your hands and you confirm satisfaction does VendLex release the payout to the merchant.",
      badge: "Buyer Protection",
    },
    {
      id: "faq-2",
      category: "ORDER_ESCROW",
      question: "What happens if an item is defective, damaged, or not as described?",
      answer: "You have 48 hours after delivery to inspect your package. If the item is defective or incorrect, you can lodge a formal dispute in your Dispute Center. The escrow funds remain frozen while VendLex mediation verifies the claim with the courier. You will receive a 100% refund via M-Pesa reversal or a free merchant replacement.",
      badge: "Guaranteed Refund",
    },
    {
      id: "faq-3",
      category: "PAYMENT_MPESA",
      question: "How do I make a payment on VendLex via M-Pesa?",
      answer: "VendLex utilizes official Safaricom Daraja Lipa na M-Pesa STK Push. Enter your Safaricom phone number at checkout, tap Pay, and an automatic PIN prompt will pop up on your mobile phone. Enter your M-Pesa PIN and press OK. Confirmation is instant and logged with a verified receipt.",
      badge: "Instant STK Push",
    },
    {
      id: "faq-4",
      category: "PAYMENT_MPESA",
      question: "What should I do if my M-Pesa account was debited but the order shows unpaid?",
      answer: "If network latency delays Safaricom webhook confirmation, our Daraja query engine automatically reconciles the transaction within seconds. You can also paste your M-Pesa Receipt code (e.g. QKH89421A) into the order status page or submit a support ticket here for immediate manual clearance.",
      badge: "Daraja 2.0",
    },
    {
      id: "faq-5",
      category: "SELLER_STORE",
      question: "How do I open an official verified store on VendLex?",
      answer: "Visit the Seller Onboarding portal (/seller/onboarding), enter your business name, county location, upload your CR12 or national ID for KYC verification, select your growth tier, and activate your store via M-Pesa. You will receive an official timestamped Merchant Accreditation Certificate (PDF) with QR seal verification.",
      badge: "Merchant Hub",
    },
    {
      id: "faq-6",
      category: "DELIVERY_COURIER",
      question: "Which courier partners handle shipping across Kenya's 47 counties?",
      answer: "VendLex partners with licensed nationwide logistics couriers including Fargo Courier, G4S Kenya, and Wells Fargo Courier. Same-day delivery is standard within Nairobi and Kiambu, while countrywide deliveries to Mombasa, Kisumu, Nakuru, Eldoret, and upcountry take 24–48 hours with real-time tracking.",
      badge: "47 Counties",
    },
    {
      id: "faq-7",
      category: "SECURITY_FRAUD",
      question: "How does VendLex verify genuine products and prevent scams?",
      answer: "All merchants undergo mandatory business document KYC verification. Sellers offering high-value electronics and luxury goods must submit supplier invoices or authorization letters. Furthermore, every transaction generates a cryptographic SHA-256 verifiable receipt stamped with the exact transaction timestamp.",
      badge: "Platform Stamp",
    },
    {
      id: "faq-8",
      category: "SERVICES_DIRECTORY",
      question: "How do I book a verified plumber, electrician, or service professional?",
      answer: "Explore our Services directory (/services) to search licensed Kenyan technicians. You can request a free custom quote, view provider reviews, communicate on WhatsApp, and pay for labor and materials securely through escrow.",
      badge: "Certified Pros",
    },
  ];

  const filteredFaqs = useMemo(() => {
    return FAQS.filter((faq) => {
      if (selectedCategory !== "ALL" && faq.category !== selectedCategory) {
        return false;
      }
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase().trim();
        const mQ = faq.question.toLowerCase().includes(q);
        const mA = faq.answer.toLowerCase().includes(q);
        const mB = faq.badge?.toLowerCase().includes(q);
        if (!mQ && !mA && !mB) return false;
      }
      return true;
    });
  }, [selectedCategory, searchQuery]);

  const handleLookupTicket = async (ticketNumToLookup?: string) => {
    const tNum = (ticketNumToLookup || lookupTicketNum).trim();
    if (!tNum) return;
    setLookupLoading(true);
    setLookupError(null);

    try {
      const res = await fetch(`/api/support/tickets?ticketNumber=${encodeURIComponent(tNum)}`);
      const data = await res.json();
      if (data.success && data.ticket) {
        setActiveTicket(data.ticket);
      } else {
        setLookupError(data.error || "Support ticket not found. Please check your ticket number (e.g. TKT-2026-00101).");
        setActiveTicket(null);
      }
    } catch (err: any) {
      setLookupError("Network error. Could not connect to support desk.");
    } finally {
      setLookupLoading(false);
    }
  };

  const handleSendReply = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeTicket || !replyText.trim()) return;
    setReplyLoading(true);

    try {
      const res = await fetch(`/api/support/tickets/${activeTicket.id}/reply`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          message: replyText.trim(),
          senderName: user?.name || activeTicket.userName,
        }),
      });
      const data = await res.json();
      if (data.success && data.ticket) {
        setActiveTicket(data.ticket);
        setReplyText("");
      }
    } catch (err) {
      console.error(err);
    } finally {
      setReplyLoading(false);
    }
  };

  const handleCreateTicketSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!ticketDescription.trim()) return;
    setIsSubmittingTicket(true);

    try {
      const res = await fetch("/api/support/tickets", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          userName: ticketName || "Customer",
          userEmail: ticketEmail || "customer@vendlex.ke",
          userPhone: ticketPhone || "+254700000000",
          category: ticketCategory,
          subject: ticketSubject || "Support Inquiry",
          description: ticketDescription,
          priority: ticketPriority,
          orderNumber: ticketOrderNum || undefined,
        }),
      });
      const data = await res.json();
      if (data.success && data.ticket) {
        setTicketSuccessMsg(`Ticket ${data.ticket.ticketNumber} created! Our Kenya support team has been notified.`);
        setActiveTicket(data.ticket);
        setLookupTicketNum(data.ticket.ticketNumber);
        setShowCreateModal(false);
        setTicketDescription("");
        setTicketSubject("");
        setTicketOrderNum("");
      } else {
        alert(data.error || "Failed to submit ticket.");
      }
    } catch (err: any) {
      alert("Network error: " + err.message);
    } finally {
      setIsSubmittingTicket(false);
    }
  };

  return (
    <div className="min-h-screen bg-brand-off-white dark:bg-brand-dark-bg py-8 sm:py-12">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
        {/* Top Hero Banner */}
        <div className="bg-gradient-to-br from-brand-charcoal via-gray-900 to-brand-emerald-dark text-white rounded-3xl p-6 sm:p-10 shadow-xl space-y-6 relative overflow-hidden">
          <div className="max-w-2xl space-y-3 relative z-10">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/10 backdrop-blur-md text-brand-gold text-[11px] font-black uppercase tracking-wider">
              <ShieldCheck className="w-3.5 h-3.5 text-brand-emerald-light" />
              <span>VendLex Kenya • 24/7 Customer Care &amp; Merchant Support</span>
            </div>
            <h1 className="text-2xl sm:text-4xl font-black tracking-tight">
              How can we assist you today?
            </h1>
            <p className="text-xs sm:text-sm text-gray-300 leading-relaxed">
              Find answers on M-Pesa escrow protection, courier delivery tracking, merchant verification, or open an official support inquiry with our Nairobi HQ team.
            </p>

            {/* Search Input */}
            <div className="relative pt-2">
              <Search className="w-4 h-4 absolute left-3.5 top-5 text-muted-foreground" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search help articles (e.g. escrow, refund, M-Pesa receipt, CR12, delivery)..."
                className="w-full bg-white text-gray-900 rounded-2xl pl-10 pr-4 py-3.5 text-xs sm:text-sm font-medium shadow-lg placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-brand-emerald"
              />
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-3 pt-2 relative z-10">
            <button
              onClick={() => setShowCreateModal(true)}
              className="bg-brand-emerald hover:bg-brand-emerald-dark text-white font-bold text-xs py-2.5 px-4 rounded-xl shadow-md transition-all flex items-center gap-1.5"
            >
              <Plus className="w-4 h-4" />
              <span>Submit Support Ticket</span>
            </button>

            <a
              href="https://wa.me/254700000000?text=Hello%20VendLex%20Support,%20I%20need%20assistance%20with%20the%20platform."
              target="_blank"
              rel="noreferrer"
              className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs py-2.5 px-4 rounded-xl shadow-md transition-all flex items-center gap-1.5"
            >
              <MessageSquare className="w-4 h-4" />
              <span>WhatsApp Direct Support</span>
            </a>

            <Link
              href="/customer/disputes"
              className="bg-white/10 hover:bg-white/20 text-white font-bold text-xs py-2.5 px-4 rounded-xl backdrop-blur-md transition-all flex items-center gap-1.5"
            >
              <ShieldAlert className="w-4 h-4 text-amber-300" />
              <span>Dispute &amp; Escrow Center</span>
            </Link>
          </div>
        </div>

        {ticketSuccessMsg && (
          <div className="p-4 bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-300 text-brand-emerald text-xs font-bold rounded-2xl flex items-center gap-2 animate-fadeIn">
            <CheckCircle2 className="w-4 h-4 shrink-0" />
            <span>{ticketSuccessMsg}</span>
          </div>
        )}

        {/* 3 Quick Contact Channel Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="bg-white dark:bg-brand-dark-card border border-border rounded-2xl p-5 shadow-xs space-y-2">
            <div className="w-9 h-9 rounded-xl bg-emerald-50 dark:bg-emerald-950 text-brand-emerald flex items-center justify-center">
              <Phone className="w-4 h-4" />
            </div>
            <h4 className="font-bold text-xs text-foreground">Phone &amp; Hotline / WhatsApp</h4>
            <p className="text-[11px] text-muted-foreground">Monday – Saturday (8:00 AM – 8:00 PM)</p>
            <a href="tel:+254798159503" className="font-mono text-xs font-black text-brand-emerald hover:underline block">+254 798 159 503</a>
          </div>

          <div className="bg-white dark:bg-brand-dark-card border border-border rounded-2xl p-5 shadow-xs space-y-2">
            <div className="w-9 h-9 rounded-xl bg-blue-50 dark:bg-blue-950 text-blue-600 flex items-center justify-center">
              <Mail className="w-4 h-4" />
            </div>
            <h4 className="font-bold text-xs text-foreground">Official Email Desk</h4>
            <p className="text-[11px] text-muted-foreground">General inquiries &amp; merchant onboarding</p>
            <a href="mailto:karibu@vendlex.vercel.app" className="text-xs font-bold text-foreground hover:text-brand-emerald transition-colors block">karibu@vendlex.vercel.app</a>
          </div>

          <div className="bg-white dark:bg-brand-dark-card border border-border rounded-2xl p-5 shadow-xs space-y-2">
            <div className="w-9 h-9 rounded-xl bg-purple-50 dark:bg-purple-950 text-purple-600 flex items-center justify-center">
              <Sparkles className="w-4 h-4" />
            </div>
            <h4 className="font-bold text-xs text-foreground">AI Business &amp; Help Copilot</h4>
            <p className="text-[11px] text-muted-foreground">Instant platform answers &amp; recommendations</p>
            <Link href="/seller/ai" className="text-xs font-bold text-purple-600 hover:underline inline-flex items-center gap-1">
              <span>Open AI Assistant</span>
              <ArrowRight className="w-3 h-3" />
            </Link>
          </div>
        </div>

        {/* Live Ticket Tracker Card */}
        <div className="bg-white dark:bg-brand-dark-card border border-border rounded-3xl p-6 shadow-xs space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-border pb-3">
            <div>
              <h3 className="font-bold text-sm text-foreground flex items-center gap-2">
                <HelpCircle className="w-4 h-4 text-brand-emerald" />
                <span>Track Support Inquiry Status</span>
              </h3>
              <p className="text-xs text-muted-foreground">Enter your Ticket Number (e.g. TKT-2026-00101) to view responses from the support team.</p>
            </div>
          </div>

          <div className="flex gap-2 max-w-md">
            <input
              type="text"
              value={lookupTicketNum}
              onChange={(e) => setLookupTicketNum(e.target.value)}
              placeholder="e.g. TKT-2026-00101"
              className="flex-1 bg-muted/40 border border-border rounded-xl px-3 py-2 text-xs font-mono font-bold text-foreground focus:outline-none focus:border-brand-emerald"
            />
            <button
              onClick={() => handleLookupTicket()}
              disabled={lookupLoading || !lookupTicketNum.trim()}
              className="bg-brand-emerald hover:bg-brand-emerald-dark disabled:opacity-60 text-white text-xs font-bold px-4 py-2 rounded-xl transition-all"
            >
              {lookupLoading ? "Looking up..." : "Track Ticket"}
            </button>
          </div>

          {lookupError && (
            <div className="p-3 bg-red-50 dark:bg-red-950/40 border border-red-200 text-brand-red text-xs rounded-xl flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{lookupError}</span>
            </div>
          )}

          {/* Active Ticket Conversation Thread */}
          {activeTicket && (
            <div className="mt-4 p-5 rounded-2xl bg-muted/20 border border-border space-y-4 animate-fadeIn">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-border/60 pb-3">
                <div className="space-y-0.5">
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-xs font-black bg-brand-emerald text-white px-2.5 py-0.5 rounded-lg">
                      {activeTicket.ticketNumber}
                    </span>
                    <h4 className="font-bold text-sm text-foreground">{activeTicket.subject}</h4>
                  </div>
                  <div className="text-[11px] text-muted-foreground">
                    Created: {new Date(activeTicket.createdAt).toLocaleString()} • Category: {activeTicket.category.replace("_", " ")}
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <span className={`px-2.5 py-1 rounded-full text-[10px] font-black uppercase ${
                    activeTicket.status === "RESOLVED" || activeTicket.status === "CLOSED"
                      ? "bg-emerald-100 text-emerald-800"
                      : activeTicket.status === "IN_PROGRESS"
                      ? "bg-blue-100 text-blue-800"
                      : "bg-amber-100 text-amber-800"
                  }`}>
                    {activeTicket.status}
                  </span>
                </div>
              </div>

              {/* Messages Thread */}
              <div className="space-y-3 max-h-80 overflow-y-auto pr-1 scrollbar-thin">
                {activeTicket.messages?.map((m) => {
                  const isAdmin = m.senderRole === "ADMIN";
                  return (
                    <div
                      key={m.id}
                      className={`p-3.5 rounded-2xl space-y-1 text-xs max-w-2xl ${
                        isAdmin
                          ? "bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-900 ml-auto text-right"
                          : "bg-white dark:bg-brand-dark-card border border-border"
                      }`}
                    >
                      <div className="flex items-center justify-between gap-2 text-[10px] text-muted-foreground">
                        <span className="font-bold text-foreground">{m.senderName}</span>
                        <span>{new Date(m.timestamp).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}</span>
                      </div>
                      <p className="text-foreground whitespace-pre-wrap leading-relaxed">{m.message}</p>
                    </div>
                  );
                })}
              </div>

              {/* Reply Box */}
              {activeTicket.status !== "CLOSED" && (
                <form onSubmit={handleSendReply} className="pt-2 flex gap-2">
                  <input
                    type="text"
                    value={replyText}
                    onChange={(e) => setReplyText(e.target.value)}
                    placeholder="Type your reply to the support team..."
                    className="flex-1 bg-white dark:bg-brand-dark-card border border-border rounded-xl px-3 py-2 text-xs text-foreground focus:outline-none focus:border-brand-emerald"
                  />
                  <button
                    type="submit"
                    disabled={replyLoading || !replyText.trim()}
                    className="bg-brand-emerald hover:bg-brand-emerald-dark disabled:opacity-60 text-white font-bold text-xs px-4 py-2 rounded-xl flex items-center gap-1.5"
                  >
                    <Send className="w-3.5 h-3.5" />
                    <span>{replyLoading ? "Sending..." : "Reply"}</span>
                  </button>
                </form>
              )}
            </div>
          )}
        </div>

        {/* Category Filter Pills */}
        <div className="space-y-4">
          <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-thin">
            {CATEGORIES.map((cat) => {
              const Icon = cat.icon;
              return (
                <button
                  key={cat.id}
                  onClick={() => setSelectedCategory(cat.id)}
                  className={`flex items-center gap-1.5 px-3.5 py-2 rounded-2xl text-xs font-bold whitespace-nowrap transition-all ${
                    selectedCategory === cat.id
                      ? "bg-brand-emerald text-white shadow-xs"
                      : "bg-white dark:bg-brand-dark-card border border-border text-muted-foreground hover:text-foreground"
                  }`}
                >
                  <Icon className="w-3.5 h-3.5" />
                  <span>{cat.label}</span>
                </button>
              );
            })}
          </div>

          {/* FAQ Accordion List */}
          <div className="bg-white dark:bg-brand-dark-card border border-border rounded-3xl p-6 sm:p-8 shadow-xs space-y-3">
            <h3 className="font-extrabold text-base text-foreground mb-4">
              Frequently Asked Questions ({filteredFaqs.length})
            </h3>

            {filteredFaqs.map((faq) => {
              const isOpen = openFaqId === faq.id;
              return (
                <div
                  key={faq.id}
                  className="border border-border/80 rounded-2xl overflow-hidden transition-colors"
                >
                  <button
                    onClick={() => setOpenFaqId(isOpen ? null : faq.id)}
                    className="w-full text-left p-4 sm:p-5 flex items-center justify-between gap-4 hover:bg-muted/30 transition-colors"
                  >
                    <div className="flex items-center gap-2.5">
                      <span className="text-[10px] font-black uppercase px-2 py-0.5 rounded bg-emerald-50 dark:bg-emerald-950/60 text-brand-emerald border border-emerald-200 dark:border-emerald-800 shrink-0">
                        {faq.badge}
                      </span>
                      <span className="font-bold text-xs sm:text-sm text-foreground">{faq.question}</span>
                    </div>
                    <ChevronDown className={`w-4 h-4 text-muted-foreground shrink-0 transition-transform duration-200 ${isOpen ? "rotate-180" : ""}`} />
                  </button>

                  {isOpen && (
                    <div className="p-4 sm:p-5 pt-0 text-xs text-muted-foreground leading-relaxed border-t border-border/50 bg-muted/10 animate-fadeIn">
                      {faq.answer}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* Modal: Create Support Ticket */}
        {showCreateModal && (
          <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
            <div className="bg-white dark:bg-brand-dark-card border border-border rounded-3xl max-w-lg w-full p-6 sm:p-8 shadow-2xl space-y-4 animate-pop-up">
              <div className="flex items-center justify-between pb-3 border-b border-border">
                <div className="space-y-0.5">
                  <h3 className="text-sm font-extrabold text-foreground flex items-center gap-2">
                    <MessageSquare className="w-4 h-4 text-brand-emerald" />
                    <span>Submit Support Inquiry</span>
                  </h3>
                  <p className="text-[11px] text-muted-foreground">Our customer desk in Nairobi will respond promptly.</p>
                </div>
                <button
                  onClick={() => setShowCreateModal(false)}
                  className="text-muted-foreground hover:text-foreground text-sm p-1 rounded-lg"
                >
                  ✕
                </button>
              </div>

              <form onSubmit={handleCreateTicketSubmit} className="space-y-3.5 text-xs">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block font-bold text-foreground mb-1">Your Full Name *</label>
                    <input
                      type="text"
                      required
                      value={ticketName}
                      onChange={(e) => setTicketName(e.target.value)}
                      placeholder="e.g. Grace Wanjiku"
                      className="w-full bg-muted/30 border border-border rounded-xl p-2.5 text-xs text-foreground focus:outline-none focus:border-brand-emerald"
                    />
                  </div>

                  <div>
                    <label className="block font-bold text-foreground mb-1">Kenyan Phone / WhatsApp *</label>
                    <input
                      type="tel"
                      required
                      value={ticketPhone}
                      onChange={(e) => setTicketPhone(e.target.value)}
                      placeholder="0712 345 678"
                      className="w-full bg-muted/30 border border-border rounded-xl p-2.5 text-xs font-mono text-foreground focus:outline-none focus:border-brand-emerald"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block font-bold text-foreground mb-1">Topic Category</label>
                    <select
                      value={ticketCategory}
                      onChange={(e) => setTicketCategory(e.target.value)}
                      className="w-full bg-muted/30 border border-border rounded-xl p-2.5 text-xs text-foreground focus:outline-none focus:border-brand-emerald"
                    >
                      <option value="ORDER_ESCROW">Order &amp; Escrow Protection</option>
                      <option value="PAYMENT_MPESA">M-Pesa STK Push / Refund</option>
                      <option value="SELLER_STORE">Seller Store &amp; KYC</option>
                      <option value="DELIVERY_COURIER">Courier Delivery Tracking</option>
                      <option value="SERVICES_DIRECTORY">Service Bookings</option>
                      <option value="SECURITY_FRAUD">Security &amp; Fraud Prevention</option>
                      <option value="GENERAL_INQUIRY">General Inquiry</option>
                    </select>
                  </div>

                  <div>
                    <label className="block font-bold text-foreground mb-1">Related Order # (Optional)</label>
                    <input
                      type="text"
                      value={ticketOrderNum}
                      onChange={(e) => setTicketOrderNum(e.target.value)}
                      placeholder="e.g. ORD-98401"
                      className="w-full bg-muted/30 border border-border rounded-xl p-2.5 text-xs font-mono text-foreground focus:outline-none focus:border-brand-emerald"
                    />
                  </div>
                </div>

                <div>
                  <label className="block font-bold text-foreground mb-1">Subject Title *</label>
                  <input
                    type="text"
                    required
                    value={ticketSubject}
                    onChange={(e) => setTicketSubject(e.target.value)}
                    placeholder="Brief summary of your question or issue"
                    className="w-full bg-muted/30 border border-border rounded-xl p-2.5 text-xs text-foreground focus:outline-none focus:border-brand-emerald"
                  />
                </div>

                <div>
                  <label className="block font-bold text-foreground mb-1">Detailed Description *</label>
                  <textarea
                    rows={4}
                    required
                    value={ticketDescription}
                    onChange={(e) => setTicketDescription(e.target.value)}
                    placeholder="Please provide details (order dates, M-Pesa receipt codes, specific inquiries)..."
                    className="w-full bg-muted/30 border border-border rounded-xl p-2.5 text-xs text-foreground focus:outline-none focus:border-brand-emerald resize-none"
                  />
                </div>

                <div className="flex items-center justify-end gap-2 pt-2 border-t border-border">
                  <button
                    type="button"
                    onClick={() => setShowCreateModal(false)}
                    className="px-4 py-2 rounded-xl border border-border hover:bg-muted font-bold text-muted-foreground"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={isSubmittingTicket}
                    className="px-5 py-2 rounded-xl bg-brand-emerald hover:bg-brand-emerald-dark disabled:opacity-60 text-white font-bold shadow-sm flex items-center gap-1.5"
                  >
                    <Send className="w-3.5 h-3.5" />
                    <span>{isSubmittingTicket ? "Submitting..." : "Submit Ticket"}</span>
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default function HelpSupportPage() {
  return (
    <Suspense fallback={<div className="p-12 text-center text-xs text-muted-foreground">Loading Help &amp; Support Desk...</div>}>
      <HelpSupportContent />
    </Suspense>
  );
}
