"use client";

import React, { useState, useRef, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useAuth } from "@/lib/store/auth-store";
import { useCart } from "@/lib/store/cart-store";
import { formatKSh } from "@/lib/utils";
import {
  AIStructuredResponse,
  AIToolCallRecord,
} from "@/lib/ai/types";
import {
  Sparkles,
  X,
  Send,
  Bot,
  ShoppingBag,
  ExternalLink,
  Star,
  MapPin,
  Clock,
  ShieldCheck,
  TrendingUp,
  Package,
  ArrowRight,
  CheckCircle2,
  AlertCircle,
  MessageCircle,
} from "lucide-react";

interface ChatItem {
  id: string;
  sender: "user" | "bot";
  text: string;
  timestamp: string;
  structuredData?: AIStructuredResponse;
  toolsExecuted?: AIToolCallRecord[];
}

export function AIChatbot() {
  const router = useRouter();
  const { user, role } = useAuth();
  const { addToCart } = useCart();

  const [isOpen, setIsOpen] = useState(false);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [messages, setMessages] = useState<ChatItem[]>([
    {
      id: "welcome-1",
      sender: "bot",
      text: "Jambo! I am your VendLex AI Copilot, connected live to the Kenya marketplace database, order systems, and merchant tools.\n\nHow can I assist your biashara or shopping today?",
      timestamp: "Live",
      toolsExecuted: [
        {
          toolName: "systemInit",
          displayName: "VendLex Live Data Connected",
          status: "success",
          durationMs: 12,
        },
      ],
    },
  ]);

  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    if (isOpen) {
      scrollToBottom();
    }
  }, [messages, isOpen]);

  // Contextual role-based quick prompts per Section 34
  const contextualPrompts =
    role === "SELLER" || role === "BUSINESS_OWNER"
      ? [
          { label: "Analyze my sales", query: "How much did I make this month?" },
          { label: "Low-stock alert", query: "Which products are low in stock?" },
          { label: "Write product copy", query: "Write a high-converting product description" },
        ]
      : [
          { label: "Phones under 30k", query: "Find Samsung phones under 30k" },
          { label: "Track my order", query: "Where is order ORD-9842?" },
          { label: "Find a plumber", query: "Find a plumber in Nairobi" },
          { label: "How does escrow work?", query: "How does Lipa na M-Pesa escrow protection work?" },
        ];

  const handleSend = async (messageText?: string) => {
    const query = (messageText || input).trim();
    if (!query || loading) return;

    const userMsg: ChatItem = {
      id: `usr-${Date.now()}`,
      sender: "user",
      text: query,
      timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
    };

    setMessages((prev) => [...prev, userMsg]);
    setInput("");
    setLoading(true);

    try {
      // Real server-side API call
      const res = await fetch("/api/ai/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          message: query,
          conversationId: `conv-${user?.id || "guest"}`,
          context: {
            userId: user?.id,
            name: user?.name,
            phone: user?.phone,
            email: user?.email,
            role: role || "CUSTOMER",
            businessId: user?.businessId,
            businessName: user?.businessName || (role === "SELLER" ? "Nairobi Tech Hub" : undefined),
            currentPage: typeof window !== "undefined" ? window.location.pathname : "/",
            county: "Nairobi",
          },
        }),
      });

      if (!res.ok) {
        throw new Error(`Server returned status ${res.status}`);
      }

      const data: AIStructuredResponse = await res.json();

      const botMsg: ChatItem = {
        id: `bot-${Date.now()}`,
        sender: "bot",
        text: data.message,
        timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
        structuredData: data,
        toolsExecuted: data.toolsExecuted,
      };

      setMessages((prev) => [...prev, botMsg]);
    } catch (err) {
      console.error("AI Error:", err);
      const errorMsg: ChatItem = {
        id: `bot-err-${Date.now()}`,
        sender: "bot",
        text: "I couldn't retrieve that information right now. Please check your network connection or try again.",
        timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
        toolsExecuted: [
          {
            toolName: "networkRetry",
            displayName: "Connection Error",
            status: "failed",
            durationMs: 0,
          },
        ],
      };
      setMessages((prev) => [...prev, errorMsg]);
    } finally {
      setLoading(false);
    }
  };

  const handleActionClick = (action: { actionType: string; payload: string }) => {
    if (action.actionType === "navigate") {
      setIsOpen(false);
      router.push(action.payload);
    } else if (action.actionType === "prompt") {
      handleSend(action.payload);
    }
  };

  return (
    <>
      {/* Floating Pill Trigger (Section 21 & 33) */}
      <div className="fixed bottom-18 lg:bottom-6 right-4 lg:right-6 z-40">
        <button
          onClick={() => setIsOpen(!isOpen)}
          className="bg-brand-emerald hover:bg-brand-emerald-dark text-white font-black text-xs sm:text-sm py-2.5 px-4 rounded-full shadow-lg hover:shadow-xl transition-all duration-200 flex items-center gap-2 border border-emerald-400/40 hover:scale-103 active:scale-98"
          title="Open VendLex AI Copilot"
        >
          <Sparkles className="w-4 h-4 text-amber-300 animate-pulse" />
          <span>VendLex AI</span>
        </button>
      </div>

      {/* Slide-over Side Panel (Section 33) */}
      {isOpen && (
        <div className="fixed inset-0 z-50 flex justify-end">
          {/* Backdrop */}
          <div
            className="fixed inset-0 bg-black/40 backdrop-blur-xs transition-opacity animate-fadeIn"
            onClick={() => setIsOpen(false)}
          />

          {/* Drawer Content */}
          <aside className="relative w-full max-w-lg bg-white dark:bg-brand-dark-card shadow-2xl h-full flex flex-col justify-between z-10 animate-slideLeft">
            {/* 1. Header */}
            <div className="p-4 border-b border-border flex items-center justify-between bg-muted/20">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-xl bg-brand-emerald-soft text-brand-emerald flex items-center justify-center">
                  <Bot className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-xs font-black text-foreground flex items-center gap-1.5">
                    <span>VendLex AI Copilot</span>
                    <span className="px-1.5 py-0.5 bg-emerald-100 dark:bg-emerald-950/70 text-brand-emerald text-[9px] font-black rounded-md uppercase">
                      Live
                    </span>
                  </h3>
                  <span className="text-[10px] text-muted-foreground">
                    Connected to 47 Counties • Lipa na M-Pesa
                  </span>
                </div>
              </div>

              <button
                onClick={() => setIsOpen(false)}
                className="p-1.5 rounded-lg text-muted-foreground hover:text-foreground hover:bg-muted/50 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* 2. Contextual Suggestion Pills (Section 34) */}
            <div className="p-2.5 border-b border-border/60 bg-muted/10 overflow-x-auto scrollbar-thin">
              <div className="flex gap-1.5 whitespace-nowrap">
                {contextualPrompts.map((p) => (
                  <button
                    key={p.label}
                    onClick={() => handleSend(p.query)}
                    className="px-2.5 py-1 rounded-lg text-[11px] font-semibold bg-white dark:bg-brand-dark-bg border border-border hover:border-brand-emerald text-foreground flex items-center gap-1 transition-all shrink-0 shadow-2xs"
                  >
                    <span>{p.label}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* 3. Messages Feed */}
            <div className="flex-1 p-4 space-y-4 overflow-y-auto">
              {messages.map((item) => (
                <div
                  key={item.id}
                  className={`flex flex-col ${item.sender === "user" ? "items-end" : "items-start"}`}
                >
                  {/* Tool Execution Badges per Section 36 */}
                  {item.toolsExecuted && item.toolsExecuted.length > 0 && (
                    <div className="flex flex-wrap gap-1.5 mb-1.5">
                      {item.toolsExecuted.map((tool, idx) => (
                        <span
                          key={idx}
                          className={`inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-md border ${
                            tool.status === "success"
                              ? "bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300 border-emerald-200 dark:border-emerald-800"
                              : tool.status === "denied"
                              ? "bg-amber-50 dark:bg-amber-950/40 text-amber-700 dark:text-amber-300 border-amber-200 dark:border-amber-800"
                              : "bg-red-50 dark:bg-red-950/40 text-red-700 dark:text-red-300 border-red-200"
                          }`}
                        >
                          {tool.status === "success" ? (
                            <CheckCircle2 className="w-3 h-3 text-emerald-500" />
                          ) : (
                            <AlertCircle className="w-3 h-3 text-amber-500" />
                          )}
                          <span>{tool.displayName}</span>
                        </span>
                      ))}
                    </div>
                  )}

                  {/* Main Message Bubble */}
                  <div
                    className={`p-3.5 rounded-2xl text-xs max-w-[90%] leading-relaxed whitespace-pre-line ${
                      item.sender === "user"
                        ? "bg-brand-emerald text-white rounded-br-xs font-medium"
                        : "bg-muted/40 dark:bg-brand-dark-bg text-foreground border border-border rounded-bl-xs"
                    }`}
                  >
                    {item.text}
                  </div>

                  {/* Structured Data: Product Results (Section 9) */}
                  {item.structuredData?.data?.products && (
                    <div className="w-full mt-3 grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                      {item.structuredData.data.products.map((prod) => (
                        <div
                          key={prod.id}
                          className="p-3 bg-white dark:bg-brand-dark-card border border-border rounded-xl shadow-xs space-y-2 flex flex-col justify-between"
                        >
                          <div className="space-y-1.5">
                            <div className="aspect-4/3 w-full bg-muted rounded-lg overflow-hidden relative">
                              <img
                                src={prod.images[0]}
                                alt={prod.title}
                                className="w-full h-full object-cover"
                              />
                              {prod.businessVerified && (
                                <span className="absolute top-1.5 left-1.5 bg-blue-600 text-white text-[9px] font-black px-1.5 py-0.5 rounded shadow-xs">
                                  ✓ Verified
                                </span>
                              )}
                            </div>
                            <div className="font-bold text-xs text-foreground line-clamp-1">
                              {prod.title}
                            </div>
                            <div className="flex items-center justify-between text-[11px]">
                              <span className="font-black text-brand-emerald">
                                {formatKSh(prod.price)}
                              </span>
                              <span className="text-muted-foreground">{prod.county}</span>
                            </div>
                          </div>

                          <div className="flex items-center gap-1.5 pt-1">
                            <button
                              onClick={() => {
                                addToCart(prod, 1);
                                handleSend(`Added ${prod.title} to cart`);
                              }}
                              className="flex-1 bg-brand-emerald text-white font-bold py-1.5 px-2 rounded-lg text-[10px] flex items-center justify-center gap-1"
                            >
                              <ShoppingBag className="w-3 h-3" />
                              <span>Add</span>
                            </button>
                            <Link
                              href={`/products/${prod.slug}`}
                              onClick={() => setIsOpen(false)}
                              className="p-1.5 rounded-lg bg-muted text-foreground hover:bg-muted/80"
                              title="View details"
                            >
                              <ExternalLink className="w-3 h-3" />
                            </Link>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}

                  {/* Structured Data: Order Status Cards (Section 11) */}
                  {item.structuredData?.data?.orders && (
                    <div className="w-full mt-3 space-y-2.5">
                      {item.structuredData.data.orders.map((ord) => (
                        <div
                          key={ord.id}
                          className="p-3.5 bg-white dark:bg-brand-dark-card border border-border rounded-2xl shadow-xs space-y-2"
                        >
                          <div className="flex items-center justify-between border-b border-border/60 pb-2">
                            <div className="flex items-center gap-1.5">
                              <Package className="w-4 h-4 text-brand-emerald" />
                              <span className="font-mono font-black text-xs text-foreground">
                                {ord.orderNumber}
                              </span>
                            </div>
                            <span
                              className={`px-2 py-0.5 rounded-full text-[10px] font-black uppercase ${
                                ord.status === "DELIVERED"
                                  ? "bg-emerald-100 text-emerald-800"
                                  : ord.status === "DISPATCHED"
                                  ? "bg-blue-100 text-blue-800"
                                  : "bg-amber-100 text-amber-800"
                              }`}
                            >
                              {ord.status}
                            </span>
                          </div>

                          <div className="space-y-1 text-xs">
                            <div className="font-bold text-foreground">{ord.productTitle}</div>
                            <div className="flex justify-between text-muted-foreground text-[11px]">
                              <span>Store: {ord.storeName}</span>
                              <span className="font-bold text-foreground">{formatKSh(ord.amount)}</span>
                            </div>
                            {ord.courierTracking && (
                              <div className="flex items-center gap-1 text-[11px] text-blue-600 dark:text-blue-400 font-semibold pt-1">
                                <Clock className="w-3 h-3" />
                                <span>Tracking Code: {ord.courierTracking}</span>
                              </div>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  )}

                  {/* Structured Data: Seller Analytics Cards (Section 37) */}
                  {item.structuredData?.data?.analytics && (
                    <div className="w-full mt-3 p-4 bg-white dark:bg-brand-dark-card border border-border rounded-2xl shadow-xs space-y-3">
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-bold text-foreground">
                          {item.structuredData.data.analytics.storeName} Financials
                        </span>
                        <span className="text-[10px] font-bold text-brand-emerald bg-emerald-50 dark:bg-emerald-950/40 px-2 py-0.5 rounded">
                          Verified Ledger
                        </span>
                      </div>

                      <div className="grid grid-cols-2 gap-2">
                        <div className="p-2.5 bg-muted/40 rounded-xl">
                          <span className="text-[10px] text-muted-foreground font-semibold block">Total Revenue</span>
                          <span className="text-sm font-black text-foreground">
                            {formatKSh(item.structuredData.data.analytics.totalRevenue)}
                          </span>
                        </div>
                        <div className="p-2.5 bg-muted/40 rounded-xl">
                          <span className="text-[10px] text-muted-foreground font-semibold block">Orders</span>
                          <span className="text-sm font-black text-foreground">
                            {item.structuredData.data.analytics.orderCount} Orders
                          </span>
                        </div>
                        <div className="p-2.5 bg-muted/40 rounded-xl">
                          <span className="text-[10px] text-muted-foreground font-semibold block">Average Order</span>
                          <span className="text-sm font-black text-foreground">
                            {formatKSh(item.structuredData.data.analytics.averageOrderValue)}
                          </span>
                        </div>
                        <div className="p-2.5 bg-muted/40 rounded-xl">
                          <span className="text-[10px] text-muted-foreground font-semibold block">Low Stock Alerts</span>
                          <span className="text-sm font-black text-brand-red">
                            {item.structuredData.data.analytics.lowStockCount} Items
                          </span>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Structured Data: Services Results (Section 14) */}
                  {item.structuredData?.data?.services && (
                    <div className="w-full mt-3 space-y-2">
                      {item.structuredData.data.services.map((srv) => (
                        <div
                          key={srv.id}
                          className="p-3 bg-white dark:bg-brand-dark-card border border-border rounded-xl shadow-xs space-y-2"
                        >
                          <div className="flex items-center justify-between">
                            <span className="font-bold text-xs text-foreground">{srv.title}</span>
                            <span className="text-amber-500 font-bold text-xs flex items-center gap-0.5">
                              <Star className="w-3 h-3 fill-current" />
                              {srv.rating}
                            </span>
                          </div>
                          <div className="text-[11px] text-muted-foreground flex justify-between">
                            <span>{srv.providerName}</span>
                            <span>{srv.county}</span>
                          </div>
                          <div className="pt-1 flex items-center gap-2">
                            <a
                              href={`https://wa.me/254700000000?text=Hello%20${encodeURIComponent(srv.providerName)},%20I%20found%20your%20services%20on%20VendLex%20for%20${encodeURIComponent(srv.title)}.`}
                              target="_blank"
                              rel="noreferrer"
                              className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-bold py-1.5 px-2 rounded-lg text-[10px] flex items-center justify-center gap-1"
                            >
                              <MessageCircle className="w-3 h-3" />
                              <span>WhatsApp Pro</span>
                            </a>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}

                  {/* Navigation Action Button */}
                  {item.structuredData?.data?.navigationRoute && (
                    <div className="mt-2 w-full">
                      <button
                        onClick={() => {
                          setIsOpen(false);
                          router.push(item.structuredData!.data!.navigationRoute!);
                        }}
                        className="w-full py-2 px-3 bg-brand-emerald hover:bg-brand-emerald-dark text-white rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 transition-colors"
                      >
                        <span>{item.structuredData.data.navigationLabel || "Go to Page"}</span>
                        <ArrowRight className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  )}

                  {/* Action Suggestions per Section 23 */}
                  {item.structuredData?.suggestedActions && (
                    <div className="flex flex-wrap gap-1.5 mt-2">
                      {item.structuredData.suggestedActions.map((act) => (
                        <button
                          key={act.label}
                          onClick={() => handleActionClick(act)}
                          className="text-[10px] font-bold text-brand-emerald hover:text-brand-emerald-dark bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 px-2 py-1 rounded-lg transition-colors flex items-center gap-1"
                        >
                          <span>{act.label}</span>
                          <ArrowRight className="w-2.5 h-2.5" />
                        </button>
                      ))}
                    </div>
                  )}

                  {/* Verified Source Badges per Section 27 */}
                  {item.structuredData?.sources && item.structuredData.sources.length > 0 && (
                    <div className="text-[9px] text-muted-foreground mt-1 flex items-center gap-1">
                      <ShieldCheck className="w-3 h-3 text-brand-emerald" />
                      <span>{item.structuredData.sources.join(" • ")}</span>
                    </div>
                  )}
                </div>
              ))}

              {loading && (
                <div className="flex items-center gap-2 text-xs text-muted-foreground py-2 px-3 bg-muted/30 rounded-xl animate-pulse">
                  <Bot className="w-4 h-4 text-brand-emerald animate-spin" />
                  <span>VendLex AI is searching live platform records...</span>
                </div>
              )}
              <div ref={messagesEndRef} />
            </div>

            {/* 4. Input Form */}
            <form
              onSubmit={(e) => {
                e.preventDefault();
                handleSend();
              }}
              className="p-3 border-t border-border bg-white dark:bg-brand-dark-card flex items-center gap-2"
            >
              <input
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder="Ask about products, orders, sales, services..."
                className="flex-1 px-3.5 py-2.5 text-xs rounded-xl bg-muted/40 border border-border text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-brand-emerald"
                disabled={loading}
              />
              <button
                type="submit"
                disabled={loading || !input.trim()}
                className="bg-brand-emerald hover:bg-brand-emerald-dark disabled:opacity-50 text-white p-2.5 rounded-xl text-xs transition-colors shrink-0"
                title="Send message"
              >
                <Send className="w-4 h-4" />
              </button>
            </form>
          </aside>
        </div>
      )}
    </>
  );
}
