"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import {
  ShieldAlert,
  ShieldCheck,
  FileText,
  AlertTriangle,
  Upload,
  CheckCircle2,
  Clock,
  ArrowRight,
  Phone,
  Loader2,
} from "lucide-react";
import { formatKSh } from "@/lib/utils";
import { useAuth } from "@/lib/store/auth-store";

interface DisputeItem {
  id: string;
  orderNumber: string;
  sellerName: string;
  amount: number;
  reason: string;
  description?: string;
  status: "OPEN" | "UNDER_REVIEW" | "RESOLVED" | "REJECTED" | "REFUNDED";
  createdAt: string;
  mpesaReceipt: string;
}

export default function CustomerDisputesPage() {
  const { user, isAuthenticated } = useAuth();
  const [orders, setOrders] = useState<any[]>([]);
  const [disputes, setDisputes] = useState<DisputeItem[]>([]);
  const [loading, setLoading] = useState(true);

  const [selectedOrderId, setSelectedOrderId] = useState("");
  const [orderNo, setOrderNo] = useState("ORD-9842");
  const [reason, setReason] = useState("Item Damaged during Transit");
  const [desc, setDesc] = useState("");
  const [mpesaReceipt, setMpesaReceipt] = useState("QKH89421A");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submittedTicket, setSubmittedTicket] = useState<string | null>(null);
  const [errorMsg, setErrorMsg] = useState("");

  const fetchData = async () => {
    try {
      setLoading(true);
      const [ordersRes, disputesRes] = await Promise.all([
        fetch("/api/orders"),
        fetch("/api/disputes"),
      ]);

      const ordersData = await ordersRes.json();
      const disputesData = await disputesRes.json();

      if (ordersData.success && Array.isArray(ordersData.orders)) {
        setOrders(ordersData.orders);
        if (ordersData.orders.length > 0 && !selectedOrderId) {
          const first = ordersData.orders[0];
          setSelectedOrderId(first.id);
          setOrderNo(first.orderNumber);
          setMpesaReceipt(first.mpesaReceipt || "VNDQG89124");
        }
      }

      if (disputesData.success && Array.isArray(disputesData.disputes)) {
        setDisputes(disputesData.disputes);
      }
    } catch (e) {
      console.warn("Failed to fetch customer dispute data:", e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [isAuthenticated]);

  const handleOrderSelect = (orderId: string) => {
    setSelectedOrderId(orderId);
    const ord = orders.find((o) => o.id === orderId);
    if (ord) {
      setOrderNo(ord.orderNumber);
      setMpesaReceipt(ord.mpesaReceipt || "");
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg("");
    setIsSubmitting(true);

    try {
      const selectedOrder = orders.find((o) => o.id === selectedOrderId || o.orderNumber === orderNo);
      const res = await fetch("/api/disputes", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          orderNumber: orderNo,
          orderId: selectedOrder?.id,
          reason,
          description: desc,
          mpesaReceipt,
          amount: selectedOrder?.total,
        }),
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.error || "Failed to file dispute ticket.");
      }

      setSubmittedTicket(data.dispute.id);
      fetchData();
    } catch (err: any) {
      setErrorMsg(err.message || "Failed to file dispute.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="bg-brand-off-white dark:bg-brand-dark-bg min-h-screen py-8">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
        {/* Header */}
        <div className="bg-gradient-to-r from-brand-charcoal to-slate-900 rounded-3xl p-8 text-white shadow-xl flex flex-col md:flex-row md:items-center justify-between gap-6 border border-red-500/30">
          <div className="space-y-2">
            <div className="inline-flex items-center gap-2 bg-red-950/80 border border-red-500/50 text-red-200 text-xs font-black px-3 py-1 rounded-full uppercase tracking-wider">
              <ShieldAlert className="w-3.5 h-3.5 text-brand-red" />
              <span>VendLex Escrow Protection &amp; Dispute Resolution</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-black">Customer Dispute Center</h1>
            <p className="text-xs sm:text-sm text-gray-300 max-w-xl">
              All M-Pesa payments on VendLex are held in secure escrow until you confirm satisfactory delivery. Report an issue to immediately freeze merchant payouts.
            </p>
          </div>
        </div>

        {/* Dispute Form */}
        <div className="bg-white dark:bg-brand-dark-card border border-border dark:border-brand-dark-border rounded-3xl p-6 sm:p-8 shadow-sm space-y-6">
          <h2 className="text-lg font-black text-foreground">File a New Dispute Ticket</h2>

          {submittedTicket ? (
            <div className="p-6 bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300 rounded-2xl text-center space-y-3">
              <CheckCircle2 className="w-10 h-10 mx-auto text-brand-emerald" />
              <h3 className="font-bold text-base">Dispute Ticket #{submittedTicket} Opened Successfully!</h3>
              <p className="text-xs max-w-md mx-auto">
                Funds for <strong>{orderNo}</strong> have been frozen in escrow. Our trust &amp; safety team will contact both you and the seller within 4 hours.
              </p>
              <div className="flex justify-center gap-3 pt-2">
                <button
                  onClick={() => {
                    setSubmittedTicket(null);
                    setDesc("");
                  }}
                  className="bg-muted text-foreground font-bold px-4 py-2 rounded-xl text-xs"
                >
                  File Another Dispute
                </button>
                <Link
                  href="/customer/dashboard"
                  className="bg-brand-emerald text-white font-bold px-6 py-2 rounded-xl text-xs"
                >
                  Return to Dashboard
                </Link>
              </div>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4 text-xs">
              {errorMsg && (
                <div className="p-3 bg-red-50 dark:bg-red-950/50 border border-red-200 text-red-600 rounded-xl">
                  {errorMsg}
                </div>
              )}

              {orders.length > 0 && (
                <div className="space-y-1">
                  <label className="font-bold text-foreground">Select From Your Recent Orders</label>
                  <select
                    value={selectedOrderId}
                    onChange={(e) => handleOrderSelect(e.target.value)}
                    className="w-full p-2.5 rounded-xl border border-border bg-muted/40 font-semibold text-xs"
                  >
                    {orders.map((o) => (
                      <option key={o.id} value={o.id}>
                        {o.orderNumber} - {o.sellerName} ({formatKSh(o.total)}) - Status: {o.status}
                      </option>
                    ))}
                  </select>
                </div>
              )}

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="font-bold text-foreground">VendLex Order Number</label>
                  <input
                    type="text"
                    required
                    value={orderNo}
                    onChange={(e) => setOrderNo(e.target.value)}
                    placeholder="e.g. ORD-9842"
                    className="w-full p-2.5 rounded-xl border border-border bg-muted/40 font-mono font-bold text-xs"
                  />
                </div>

                <div className="space-y-1">
                  <label className="font-bold text-foreground">M-Pesa Receipt Code</label>
                  <input
                    type="text"
                    required
                    value={mpesaReceipt}
                    onChange={(e) => setMpesaReceipt(e.target.value)}
                    placeholder="e.g. QKH89421A"
                    className="w-full p-2.5 rounded-xl border border-border bg-muted/40 font-mono font-bold text-xs"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="font-bold text-foreground">Nature of the Dispute</label>
                <select
                  value={reason}
                  onChange={(e) => setReason(e.target.value)}
                  className="w-full p-2.5 rounded-xl border border-border bg-muted/40 font-semibold text-xs"
                >
                  <option value="Item Damaged during Transit">Item Damaged during Transit</option>
                  <option value="Package Never Delivered / Courier Lost">Package Never Delivered / Courier Lost</option>
                  <option value="Counterfeit or Not as Described">Counterfeit or Not as Described</option>
                  <option value="Wrong Item or Missing Accessories">Wrong Item or Missing Accessories</option>
                  <option value="Service Technician Incomplete Job">Service Technician Incomplete Job</option>
                </select>
              </div>

              <div className="space-y-1">
                <label className="font-bold text-foreground">Detailed Description &amp; Photo Evidence</label>
                <textarea
                  rows={4}
                  required
                  value={desc}
                  onChange={(e) => setDesc(e.target.value)}
                  placeholder="Explain what happened and what resolution you are requesting (replacement, full refund, or technician recall)..."
                  className="w-full p-3 rounded-xl border border-border bg-muted/40 text-xs text-foreground focus:outline-none focus:border-brand-emerald"
                />
              </div>

              <div className="p-4 rounded-2xl bg-amber-50 dark:bg-amber-950/40 border border-amber-200 text-xs text-amber-900 dark:text-amber-300 flex items-start gap-2.5">
                <AlertTriangle className="w-4 h-4 shrink-0 mt-0.5 text-amber-600" />
                <span>
                  Once submitted, the seller&apos;s escrow payout for this order will be paused immediately pending evidence review.
                </span>
              </div>

              <button
                type="submit"
                disabled={isSubmitting || !orderNo || !desc}
                className="w-full bg-brand-red hover:bg-red-700 disabled:opacity-60 text-white font-black py-3 rounded-xl text-xs sm:text-sm shadow-md transition-all flex items-center justify-center gap-2"
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>Filing Dispute...</span>
                  </>
                ) : (
                  <span>Submit Dispute &amp; Freeze Escrow Funds</span>
                )}
              </button>
            </form>
          )}
        </div>

        {/* Dispute History */}
        <div className="bg-white dark:bg-brand-dark-card border border-border dark:border-brand-dark-border rounded-3xl p-6 sm:p-8 shadow-sm space-y-4">
          <h2 className="text-base font-black text-foreground">Your Past Disputes</h2>
          {loading ? (
            <div className="py-8 text-center text-xs text-muted-foreground flex justify-center items-center gap-2">
              <Loader2 className="w-4 h-4 animate-spin text-brand-emerald" />
              <span>Loading dispute records...</span>
            </div>
          ) : disputes.length === 0 ? (
            <div className="py-6 text-center text-xs text-muted-foreground">
              No open or historical disputes on your account.
            </div>
          ) : (
            <div className="space-y-3">
              {disputes.map((d) => (
                <div
                  key={d.id}
                  className="p-4 rounded-2xl bg-muted/30 border border-border text-xs flex flex-col sm:flex-row sm:items-center justify-between gap-3"
                >
                  <div className="space-y-0.5">
                    <div className="font-bold text-foreground">
                      {d.id}: {d.orderNumber} ({formatKSh(d.amount)})
                    </div>
                    <div className="text-muted-foreground">Reason: {d.reason}</div>
                    {d.description && <div className="text-[11px] text-muted-foreground/80 italic">{d.description}</div>}
                    <div className="text-[11px] text-muted-foreground">
                      Seller: {d.sellerName} • Receipt: {d.mpesaReceipt}
                    </div>
                  </div>

                  <span className={`px-3 py-1 rounded-full text-[10px] font-black w-fit ${
                    d.status === "RESOLVED" || d.status === "REFUNDED"
                      ? "bg-emerald-100 text-brand-emerald dark:bg-emerald-950 dark:text-emerald-300"
                      : d.status === "REJECTED"
                      ? "bg-red-100 text-red-600"
                      : "bg-amber-100 text-amber-700"
                  }`}>
                    {d.status === "RESOLVED" || d.status === "REFUNDED" ? "✓ " : "⏳ "}
                    {d.status}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
