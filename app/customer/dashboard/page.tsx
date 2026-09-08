"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { formatKSh } from "@/lib/utils";
import {
  ShoppingBag,
  Heart,
  Store,
  MapPin,
  Bell,
  Award,
  Star,
  HelpCircle,
  Settings,
  Clock,
  CheckCircle2,
  Truck,
  ExternalLink,
  Phone,
  Gift,
  ArrowRight,
  ShieldCheck,
  Check,
  FileText,
  Download,
  Loader2,
} from "lucide-react";
import { useAuth } from "@/lib/store/auth-store";

interface CustomerOrder {
  id: string;
  orderNumber: string;
  date: string;
  seller: string;
  product: string;
  price: number;
  status: string;
  delivery: string;
  receipt: string;
  documentId?: string;
}

export default function CustomerDashboardPage() {
  const { user, isAuthenticated } = useAuth();
  const [activeTab, setActiveTab] = useState<
    "orders" | "documents" | "wishlist" | "stores" | "addresses" | "notifications" | "rewards" | "reviews" | "support" | "settings"
  >("orders");

  // Rewards State
  const [vendPoints, setVendPoints] = useState(1450);
  const [redeemedToast, setRedeemedToast] = useState("");

  const [orders, setOrders] = useState<CustomerOrder[]>([]);
  const [notifications, setNotifications] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadCustomerData() {
      try {
        setLoading(true);
        const [ordersRes, notifRes] = await Promise.all([
          fetch("/api/orders"),
          fetch("/api/notifications"),
        ]);
        const ordersData = await ordersRes.json();
        const notifData = await notifRes.json();

        if (ordersData.success && Array.isArray(ordersData.orders)) {
          const mapped = ordersData.orders.map((o: any) => ({
            id: o.id,
            orderNumber: o.orderNumber || o.id,
            date: new Date(o.createdAt || Date.now()).toLocaleDateString("en-US", {
              month: "short",
              day: "numeric",
              year: "numeric",
            }),
            seller: o.sellerName || "Verified Merchant",
            product: o.items?.[0]?.title || o.items?.[0]?.productTitle || "Marketplace Product",
            price: o.total || 0,
            status: o.status || "PAID",
            delivery: o.courierTracking ? `Tracking: ${o.courierTracking}` : `${o.town || "CBD"}, ${o.county || "Nairobi"}`,
            receipt: o.mpesaReceipt || "MPESA-CONFIRMED",
            documentId: o.documentId || "VLX-REC-2026-000182",
          }));
          setOrders(mapped);
        }

        if (notifData.success && Array.isArray(notifData.notifications)) {
          setNotifications(notifData.notifications);
        }
      } catch (e) {
        console.warn("Failed to load customer data:", e);
      } finally {
        setLoading(false);
      }
    }

    loadCustomerData();
  }, [isAuthenticated]);

  const savedStores = [
    { name: "Nairobi Tech Hub", slug: "nairobi-tech-hub", county: "Nairobi", rating: 4.9, products: 48 },
    { name: "Savanna Fashion House", slug: "savanna-fashion", county: "Nairobi", rating: 4.8, products: 32 },
    { name: "Kilifi Coconut Crafts", slug: "kilifi-coconut-crafts", county: "Kilifi", rating: 4.9, products: 19 },
  ];

  const rewards = [
    { id: "rw-1", title: "KSh 500 Off Any Order", cost: 500, desc: "Valid across any verified seller on VendLex." },
    { id: "rw-2", title: "Free Same-Day Delivery Voucher", cost: 300, desc: "Valid for Fargo/G4S courier delivery within Nairobi." },
    { id: "rw-3", title: "KSh 1,500 Electronics Coupon", cost: 1200, desc: "Applicable on smartphones and laptops." },
  ];

  const handleRedeem = (rw: { title: string; cost: number }) => {
    if (vendPoints >= rw.cost) {
      setVendPoints((prev) => prev - rw.cost);
      setRedeemedToast(`Redeemed "${rw.title}"! Applied to your next checkout.`);
      setTimeout(() => setRedeemedToast(""), 3500);
    }
  };

  const displayName = user?.name || "Grace Wanjiku";
  const displayPhone = user?.phone || "+254 712 987 654";
  const displayAvatar =
    user?.avatar ||
    "https://images.unsplash.com/photo-1534528741775-53994a69daeb?q=80&w=200&auto=format&fit=crop";

  return (
    <div className="bg-brand-off-white dark:bg-brand-dark-bg min-h-screen py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
        {/* Profile Card Header */}
        <div className="bg-white dark:bg-brand-dark-card border border-border dark:border-brand-dark-border rounded-3xl p-6 sm:p-8 shadow-sm flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 rounded-2xl overflow-hidden bg-brand-emerald-soft border-2 border-brand-emerald shrink-0">
              <img
                src={displayAvatar}
                alt={displayName}
                className="w-full h-full object-cover"
              />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-xl sm:text-2xl font-black text-foreground">{displayName}</h1>
                <span className="bg-emerald-100 text-brand-emerald text-[10px] font-black px-2.5 py-0.5 rounded-full">
                  ✓ Verified Account
                </span>
              </div>
              <p className="text-xs text-muted-foreground">{displayPhone} • {user?.email || "customer@vendlex.co.ke"}</p>
            </div>
          </div>

          {/* VendPoints Loyalty Pill */}
          <div className="bg-amber-50 dark:bg-amber-950/40 border border-amber-300 dark:border-amber-800/60 p-3 sm:p-4 rounded-2xl flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-amber-400 text-brand-charcoal font-black">
              <Award className="w-5 h-5" />
            </div>
            <div>
              <span className="text-[10px] font-black uppercase tracking-wider text-amber-900 dark:text-amber-200">
                VendPoints Balance
              </span>
              <div className="text-xl font-black text-foreground">{vendPoints} Pts</div>
            </div>
          </div>
        </div>

        {/* 10 Tab Navigation */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-2 border-b border-border scrollbar-thin">
          {[
            { id: "orders", label: "Orders", icon: ShoppingBag, count: orders.length },
            { id: "documents", label: "Documents", icon: FileText, badge: "VERIFIED" },
            { id: "wishlist", label: "Wishlist", icon: Heart },
            { id: "stores", label: "Saved Stores", icon: Store, count: savedStores.length },
            { id: "addresses", label: "Addresses", icon: MapPin },
            { id: "notifications", label: "Notifications", icon: Bell, count: notifications.length > 0 ? notifications.length : undefined },
            { id: "rewards", label: "Rewards & Points", icon: Gift, badge: `${vendPoints} Pts` },
            { id: "reviews", label: "Reviews", icon: Star },
            { id: "support", label: "Support", icon: HelpCircle },
            { id: "settings", label: "Account Settings", icon: Settings },
          ].map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`px-3.5 py-2 rounded-xl text-xs font-bold shrink-0 transition-all flex items-center gap-1.5 ${
                  isActive
                    ? "bg-brand-emerald text-white shadow-sm"
                    : "bg-white dark:bg-brand-dark-card border border-border text-muted-foreground hover:text-foreground"
                }`}
              >
                <Icon className="w-3.5 h-3.5" />
                <span>{tab.label}</span>
                {tab.count !== undefined && (
                  <span className={`text-[10px] px-1.5 py-0.2 rounded-full ${isActive ? "bg-white/20 text-white" : "bg-muted text-foreground"}`}>
                    {tab.count}
                  </span>
                )}
                {tab.badge && (
                  <span className={`text-[10px] font-black px-1.5 py-0.2 rounded-full ${isActive ? "bg-amber-400 text-brand-charcoal" : "bg-amber-100 text-amber-800"}`}>
                    {tab.badge}
                  </span>
                )}
              </button>
            );
          })}
        </div>

        {/* TAB 1: ORDERS */}
        {activeTab === "orders" && (
          <div className="space-y-4">
            <h2 className="text-base font-black text-foreground">Purchase History &amp; Active Deliveries</h2>
            {loading ? (
              <div className="py-12 text-center text-xs text-muted-foreground flex justify-center items-center gap-2 bg-white dark:bg-brand-dark-card border border-border rounded-3xl p-8">
                <Loader2 className="w-4 h-4 animate-spin text-brand-emerald" />
                <span>Loading your orders...</span>
              </div>
            ) : orders.length === 0 ? (
              <div className="py-12 text-center text-xs text-muted-foreground bg-white dark:bg-brand-dark-card border border-border rounded-3xl p-8 space-y-2">
                <ShoppingBag className="w-8 h-8 mx-auto text-muted-foreground opacity-50" />
                <p className="font-bold">No orders found.</p>
                <Link href="/marketplace" className="inline-block bg-brand-emerald text-white font-bold px-4 py-2 rounded-xl text-xs mt-2">
                  Browse Marketplace
                </Link>
              </div>
            ) : (
              <div className="space-y-4">
                {orders.map((ord) => (
                  <div
                    key={ord.id}
                    className="bg-white dark:bg-brand-dark-card border border-border rounded-3xl p-6 shadow-sm space-y-4"
                  >
                    <div className="flex flex-wrap items-center justify-between gap-3 border-b border-border pb-3">
                      <div>
                        <span className="font-mono font-black text-foreground">{ord.orderNumber}</span>
                        <span className="text-xs text-muted-foreground ml-3">{ord.date}</span>
                      </div>
                      <div className="flex items-center gap-3">
                        <span className="text-xs font-black text-brand-emerald">{formatKSh(ord.price)}</span>
                        <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black bg-emerald-100 dark:bg-emerald-950/60 text-brand-emerald">
                          {ord.status}
                        </span>
                      </div>
                    </div>

                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 text-xs">
                      <div className="space-y-1">
                        <div className="font-bold text-foreground">{ord.product}</div>
                        <div className="text-muted-foreground">Seller: <strong>{ord.seller}</strong> • Receipt: {ord.receipt}</div>
                        <div className="text-emerald-600 font-semibold flex items-center gap-1">
                          <Truck className="w-3.5 h-3.5" />
                          <span>{ord.delivery}</span>
                        </div>
                      </div>

                      <div className="flex items-center gap-2 shrink-0">
                        <Link
                          href="/delivery"
                          className="bg-brand-emerald hover:bg-brand-emerald-dark text-white font-bold py-2 px-3 rounded-xl text-xs flex items-center justify-center gap-1.5 shadow-sm"
                        >
                          <Truck className="w-3.5 h-3.5" />
                          <span>Track</span>
                        </Link>
                        <a
                          href={`/api/documents/${ord.documentId || "VLX-REC-2026-000182"}/download`}
                          className="bg-muted hover:bg-muted/80 text-foreground border border-border font-bold py-2 px-3 rounded-xl text-xs flex items-center justify-center gap-1.5 transition-colors"
                          title="Download Official PDF Receipt"
                        >
                          <FileText className="w-3.5 h-3.5 text-brand-emerald" />
                          <span>Receipt</span>
                        </a>
                        <Link
                          href={`/verify/${ord.documentId || "VLX-REC-2026-000182"}`}
                          target="_blank"
                          className="p-2 bg-muted hover:bg-muted/80 text-muted-foreground hover:text-foreground rounded-xl border border-border"
                          title="Verify on VendLex Portal"
                        >
                          <ShieldCheck className="w-3.5 h-3.5 text-brand-emerald" />
                        </Link>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* TAB: DOCUMENTS */}
        {activeTab === "documents" && (
          <div className="bg-white dark:bg-brand-dark-card border border-border rounded-3xl p-8 shadow-sm text-center space-y-4">
            <div className="w-12 h-12 rounded-2xl bg-emerald-50 dark:bg-emerald-950/40 text-brand-emerald flex items-center justify-center mx-auto">
              <FileText className="w-6 h-6" />
            </div>
            <h3 className="text-lg font-black text-foreground">Official Documents &amp; Verified Receipts</h3>
            <p className="text-xs text-muted-foreground max-w-md mx-auto leading-relaxed">
              Every purchase, delivery confirmation, and warranty comes with a cryptographic VendLex platform stamp and a verifiable QR code.
            </p>
            <Link
              href="/account/documents"
              className="inline-flex items-center gap-2 bg-brand-emerald hover:bg-brand-emerald-dark text-white font-bold px-6 py-2.5 rounded-xl text-xs shadow-sm transition-all"
            >
              <span>Open Document Center</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        )}

        {/* TAB 2: WISHLIST */}
        {activeTab === "wishlist" && (
          <div className="bg-white dark:bg-brand-dark-card border border-border rounded-3xl p-8 shadow-sm text-center space-y-4">
            <Heart className="w-12 h-12 text-brand-red mx-auto" />
            <h3 className="text-lg font-black text-foreground">Your Saved Wishlist</h3>
            <p className="text-xs text-muted-foreground max-w-sm mx-auto">
              Save products across any merchant store to watch price drops and flash sale discounts.
            </p>
            <Link
              href="/customer/wishlist"
              className="inline-block bg-brand-emerald text-white font-bold px-6 py-2.5 rounded-xl text-xs"
            >
              Open Wishlist Page &rarr;
            </Link>
          </div>
        )}

        {/* TAB 3: SAVED STORES */}
        {activeTab === "stores" && (
          <div className="space-y-4">
            <h2 className="text-base font-black text-foreground">Followed Kenyan Stores</h2>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              {savedStores.map((st, i) => (
                <div key={i} className="p-5 bg-white dark:bg-brand-dark-card border border-border rounded-2xl space-y-3">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-brand-emerald-soft text-brand-emerald flex items-center justify-center font-black">
                      <Store className="w-5 h-5" />
                    </div>
                    <div>
                      <h4 className="font-bold text-sm text-foreground">{st.name}</h4>
                      <span className="text-[11px] text-muted-foreground">{st.county} • {st.rating}★</span>
                    </div>
                  </div>
                  <Link
                    href={`/businesses/${st.slug}`}
                    className="w-full block text-center bg-muted/60 hover:bg-muted font-bold text-xs py-2 rounded-xl text-foreground"
                  >
                    Visit Storefront
                  </Link>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* TAB 6: REWARDS & VENDPOINTS */}
        {activeTab === "rewards" && (
          <div className="space-y-6">
            {redeemedToast && (
              <div className="p-4 bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300 rounded-2xl text-xs font-bold flex items-center gap-2 animate-fadeIn">
                <Check className="w-4 h-4 text-emerald-600" />
                <span>{redeemedToast}</span>
              </div>
            )}

            <div className="bg-gradient-to-r from-amber-500 via-brand-gold to-yellow-500 text-brand-charcoal rounded-3xl p-6 sm:p-8 shadow-md flex flex-col sm:flex-row sm:items-center justify-between gap-6">
              <div className="space-y-1">
                <span className="text-xs font-black uppercase tracking-wider">VendPoints Loyalty Program</span>
                <h3 className="text-2xl sm:text-3xl font-black">You have {vendPoints} VendPoints</h3>
                <p className="text-xs font-semibold max-w-md">
                  Earn 10 points for every KSh 1,000 spent via Lipa na M-Pesa, 50 points per verified review, and 200 points per friend referral.
                </p>
              </div>
            </div>

            <div className="space-y-3">
              <h4 className="text-sm font-black text-foreground">Available Rewards to Redeem:</h4>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                {rewards.map((rw) => (
                  <div
                    key={rw.id}
                    className="p-5 bg-white dark:bg-brand-dark-card border border-border rounded-2xl shadow-sm space-y-3 flex flex-col justify-between"
                  >
                    <div className="space-y-1.5">
                      <div className="flex justify-between items-start">
                        <h5 className="font-bold text-sm text-foreground">{rw.title}</h5>
                        <span className="bg-amber-100 text-amber-900 text-xs font-black px-2 py-0.5 rounded-full">
                          {rw.cost} Pts
                        </span>
                      </div>
                      <p className="text-xs text-muted-foreground leading-relaxed">{rw.desc}</p>
                    </div>

                    <button
                      onClick={() => handleRedeem(rw)}
                      disabled={vendPoints < rw.cost}
                      className="w-full py-2 px-3 rounded-xl text-xs font-black bg-brand-emerald hover:bg-brand-emerald-dark disabled:bg-muted disabled:text-muted-foreground text-white transition-all shadow-sm"
                    >
                      {vendPoints >= rw.cost ? "Redeem Voucher" : "Need more points"}
                    </button>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* TAB 4: ADDRESSES */}
        {activeTab === "addresses" && (
          <div className="bg-white dark:bg-brand-dark-card border border-border rounded-3xl p-6 shadow-sm space-y-4">
            <h3 className="text-base font-black text-foreground">Default Delivery Address</h3>
            <div className="p-4 rounded-2xl bg-muted/30 border border-border text-xs space-y-1">
              <div className="font-bold text-foreground">{displayName} ({displayPhone})</div>
              <div className="text-muted-foreground">Yaya Court, Apt 4B, Argwings Kodhek Rd</div>
              <div className="font-semibold text-brand-emerald">Kilimani, Nairobi County</div>
            </div>
          </div>
        )}

        {/* TAB 5: NOTIFICATIONS */}
        {activeTab === "notifications" && (
          <div className="bg-white dark:bg-brand-dark-card border border-border rounded-3xl p-6 shadow-sm space-y-3">
            <h3 className="text-base font-black text-foreground">System &amp; Order Alerts</h3>
            {notifications.length === 0 ? (
              <div className="py-6 text-center text-xs text-muted-foreground">
                No unread notifications at this time.
              </div>
            ) : (
              <div className="space-y-2">
                {notifications.map((n) => (
                  <div key={n.id} className="p-3.5 rounded-2xl bg-muted/30 border border-border text-xs flex items-center justify-between">
                    <div>
                      <span className="font-bold text-foreground block">{n.title}</span>
                      <span className="text-muted-foreground">{n.message}</span>
                    </div>
                    <span className="text-[10px] text-muted-foreground">
                      {new Date(n.createdAt).toLocaleDateString()}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* TAB 7: REVIEWS */}
        {activeTab === "reviews" && (
          <div className="bg-white dark:bg-brand-dark-card border border-border rounded-3xl p-6 shadow-sm space-y-3">
            <h3 className="text-base font-black text-foreground">Your Verified Reviews</h3>
            <div className="p-4 rounded-2xl bg-muted/30 border border-border text-xs space-y-1">
              <div className="flex items-center gap-1 text-amber-500 font-bold">
                <Star className="w-3.5 h-3.5 fill-current" />
                <span>5.0 ★ for Apple iPhone 15 Pro Max</span>
              </div>
              <p className="text-muted-foreground">&quot;Legitimate Apple phone, super fast delivery via Fargo Courier!&quot;</p>
            </div>
          </div>
        )}

        {/* TAB 8: SUPPORT */}
        {activeTab === "support" && (
          <div className="bg-white dark:bg-brand-dark-card border border-border rounded-3xl p-6 shadow-sm space-y-4">
            <h3 className="text-base font-black text-foreground">VendLex Customer Care</h3>
            <p className="text-xs text-muted-foreground">
              Have an issue with an order, delivery dispute, or payment? Our customer advocacy team is available 24/7.
            </p>
            <div className="flex flex-wrap gap-3">
              <Link
                href="/customer/disputes"
                className="bg-brand-red text-white text-xs font-bold px-4 py-2.5 rounded-xl shadow-sm"
              >
                Open Dispute Ticket
              </Link>
              <a
                href="mailto:support@vendlex.co.ke"
                className="bg-brand-emerald text-white text-xs font-bold px-4 py-2.5 rounded-xl shadow-sm"
              >
                Email Support Team
              </a>
            </div>
          </div>
        )}

        {/* TAB 9: SETTINGS */}
        {activeTab === "settings" && (
          <div className="bg-white dark:bg-brand-dark-card border border-border rounded-3xl p-6 shadow-sm space-y-4 text-xs">
            <h3 className="text-base font-black text-foreground">Security &amp; Preferences</h3>
            <div className="space-y-3 max-w-md">
              <div>
                <label className="font-bold text-foreground block mb-1">Full Name</label>
                <input
                  type="text"
                  defaultValue={displayName}
                  className="w-full p-2.5 rounded-xl border border-border bg-muted/30 text-xs"
                />
              </div>
              <div>
                <label className="font-bold text-foreground block mb-1">M-Pesa Primary Phone Number</label>
                <input
                  type="tel"
                  defaultValue={displayPhone}
                  className="w-full p-2.5 rounded-xl border border-border bg-muted/30 text-xs"
                />
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
