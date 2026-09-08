"use client";

import React, { useState, useEffect } from "react";
import { formatKSh, formatKenyanPhone } from "@/lib/utils";
import { Modal } from "@/components/ui/modal";
import {
  ShoppingBag,
  Truck,
  CheckCircle2,
  Clock,
  MapPin,
  Phone,
  MessageCircle,
  FileText,
  Search,
  Filter,
  Check,
  Circle,
  Store,
  Loader2,
} from "lucide-react";
import { useAuth } from "@/lib/store/auth-store";

interface SellerOrder {
  id: string;
  orderNumber: string;
  sellerName: string;
  customerName: string;
  customerPhone: string;
  customerEmail: string;
  items: { title: string; qty: number; price: number }[];
  subtotal: number;
  deliveryFee: number;
  total: number;
  county: string;
  town: string;
  address: string;
  paymentMethod: string;
  paymentStatus: "PAID" | "ESCROW_HELD" | "PENDING";
  mpesaReceipt: string;
  estimatedArrival: string;
  status: "PENDING_PAYMENT" | "PAID" | "PROCESSING" | "READY_FOR_DISPATCH" | "DISPATCHED" | "DELIVERED" | "CANCELLED";
  step: 1 | 2 | 3 | 4 | 5;
  date: string;
}

function mapStatusToStep(status: string): 1 | 2 | 3 | 4 | 5 {
  switch (status) {
    case "PENDING_PAYMENT":
    case "PAID":
      return 1;
    case "PROCESSING":
      return 2;
    case "READY_FOR_DISPATCH":
      return 3;
    case "DISPATCHED":
      return 4;
    case "DELIVERED":
      return 5;
    default:
      return 1;
  }
}

function getNextStatus(step: number): "PROCESSING" | "READY_FOR_DISPATCH" | "DISPATCHED" | "DELIVERED" {
  switch (step) {
    case 1:
      return "PROCESSING";
    case 2:
      return "READY_FOR_DISPATCH";
    case 3:
      return "DISPATCHED";
    case 4:
    default:
      return "DELIVERED";
  }
}

export default function SellerOrdersPage() {
  const { user, isAuthenticated } = useAuth();
  const [orders, setOrders] = useState<SellerOrder[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeStepFilter, setActiveStepFilter] = useState<number | "ALL">("ALL");
  const [selectedOrder, setSelectedOrder] = useState<SellerOrder | null>(null);
  const [search, setSearch] = useState("");
  const [updatingId, setUpdatingId] = useState<string | null>(null);

  const trackingSteps = [
    { step: 1, title: "Order confirmed" },
    { step: 2, title: "Seller preparing" },
    { step: 3, title: "Rider assigned" },
    { step: 4, title: "Out for delivery" },
    { step: 5, title: "Delivered" },
  ];

  const fetchOrders = async () => {
    try {
      setLoading(true);
      const res = await fetch("/api/orders");
      const data = await res.json();
      if (data.success && Array.isArray(data.orders)) {
        const mapped: SellerOrder[] = data.orders.map((o: any) => ({
          id: o.id,
          orderNumber: o.orderNumber || o.id,
          sellerName: o.sellerName || "Nairobi Tech Hub",
          customerName: o.customerName || "Customer",
          customerPhone: o.customerPhone || "+254700000000",
          customerEmail: o.customerEmail || "",
          items: (o.items || []).map((it: any) => ({
            title: it.title || it.productTitle || "Marketplace Item",
            qty: it.quantity || it.qty || 1,
            price: it.price || 0,
          })),
          subtotal: o.subtotal || o.total,
          deliveryFee: o.deliveryFee || 0,
          total: o.total || 0,
          county: o.county || "Nairobi",
          town: o.town || "CBD",
          address: o.address || o.estate || "Delivery Address",
          paymentMethod: o.paymentMethod || "M-Pesa Escrow",
          paymentStatus: o.paymentStatus || "PAID",
          mpesaReceipt: o.mpesaReceipt || "MPESA-CONFIRMED",
          estimatedArrival: o.courierTracking ? `Tracking: ${o.courierTracking}` : "Expected today via Fargo Courier",
          status: o.status,
          step: mapStatusToStep(o.status),
          date: new Date(o.createdAt || Date.now()).toLocaleDateString("en-US", {
            month: "short",
            day: "numeric",
            year: "numeric",
            hour: "2-digit",
            minute: "2-digit",
          }),
        }));
        setOrders(mapped);
      }
    } catch (e) {
      console.warn("Failed to fetch seller orders:", e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders();
  }, [isAuthenticated]);

  const advanceStep = async (orderId: string) => {
    const target = orders.find((o) => o.id === orderId);
    if (!target || target.step >= 5) return;

    const nextStatus = getNextStatus(target.step);
    const trackingCode = nextStatus === "DISPATCHED"
      ? `Fargo Express #FG-${Math.floor(100000 + Math.random() * 900000)}`
      : undefined;

    setUpdatingId(orderId);
    try {
      const res = await fetch(`/api/orders/${orderId}/status`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          status: nextStatus,
          courierTracking: trackingCode,
        }),
      });

      const data = await res.json();
      if (data.success) {
        setOrders((prev) =>
          prev.map((o) => {
            if (o.id === orderId) {
              const newStep = (o.step + 1) as any;
              return {
                ...o,
                status: nextStatus,
                step: newStep,
                estimatedArrival: trackingCode ? `Tracking: ${trackingCode}` : o.estimatedArrival,
              };
            }
            return o;
          })
        );
        if (selectedOrder && selectedOrder.id === orderId) {
          setSelectedOrder((prev) => prev ? { ...prev, status: nextStatus, step: (prev.step + 1) as any } : null);
        }
      }
    } catch (err) {
      console.error("Failed to advance order status:", err);
    } finally {
      setUpdatingId(null);
    }
  };

  const filteredOrders = orders.filter((o) => {
    if (activeStepFilter !== "ALL" && o.step !== activeStepFilter) return false;
    if (search.trim()) {
      const q = search.toLowerCase();
      return (
        o.orderNumber.toLowerCase().includes(q) ||
        o.customerName.toLowerCase().includes(q) ||
        o.county.toLowerCase().includes(q) ||
        o.mpesaReceipt.toLowerCase().includes(q)
      );
    }
    return true;
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-foreground">Order Tracking &amp; Pipeline</h1>
          <p className="text-xs text-muted-foreground">
            Monitor orders across all 47 counties with verified dispatch and live courier handover.
          </p>
        </div>

        {/* Search Input */}
        <div className="relative w-full sm:w-72">
          <Search className="w-4 h-4 absolute left-3 top-3 text-muted-foreground" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search Order ID, customer..."
            className="w-full pl-9 pr-3 py-2 text-xs rounded-xl bg-white dark:bg-brand-dark-card border border-border text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-brand-emerald"
          />
        </div>
      </div>

      {/* Pipeline Tabs */}
      <div className="flex flex-wrap items-center gap-2">
        <button
          onClick={() => setActiveStepFilter("ALL")}
          className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-colors ${
            activeStepFilter === "ALL"
              ? "bg-brand-emerald text-white shadow-sm"
              : "bg-white dark:bg-brand-dark-card border border-border text-muted-foreground hover:text-foreground"
          }`}
        >
          All Orders ({orders.length})
        </button>
        {trackingSteps.map((s) => (
          <button
            key={s.step}
            onClick={() => setActiveStepFilter(s.step)}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-colors ${
              activeStepFilter === s.step
                ? "bg-brand-emerald text-white shadow-sm"
                : "bg-white dark:bg-brand-dark-card border border-border text-muted-foreground hover:text-foreground"
            }`}
          >
            {s.title} ({orders.filter((o) => o.step === s.step).length})
          </button>
        ))}
      </div>

      {/* Orders List Cards with Visual Progress */}
      {loading ? (
        <div className="py-12 text-center text-xs text-muted-foreground flex justify-center items-center gap-2 bg-white dark:bg-brand-dark-card border border-border rounded-3xl p-8">
          <Loader2 className="w-4 h-4 animate-spin text-brand-emerald" />
          <span>Synchronizing orders from live server...</span>
        </div>
      ) : filteredOrders.length === 0 ? (
        <div className="py-12 text-center text-xs text-muted-foreground bg-white dark:bg-brand-dark-card border border-border rounded-3xl p-8 space-y-2">
          <ShoppingBag className="w-8 h-8 mx-auto text-muted-foreground opacity-50" />
          <p className="font-bold">No orders found in this view.</p>
          <p className="text-[11px]">When customers purchase your products, their orders will appear here automatically.</p>
        </div>
      ) : (
        <div className="space-y-4">
          {filteredOrders.map((order) => (
            <div
              key={order.id}
              className="bg-white dark:bg-brand-dark-card border border-border dark:border-brand-dark-border rounded-3xl p-5 sm:p-6 shadow-sm space-y-5"
            >
              {/* Top Bar: Order ID, Date, Amount */}
              <div className="flex flex-wrap items-center justify-between gap-3 border-b border-border pb-3">
                <div className="flex items-center gap-3">
                  <span className="font-mono font-black text-sm sm:text-base text-foreground bg-muted/60 dark:bg-brand-dark-bg px-3 py-1 rounded-xl">
                    {order.orderNumber}
                  </span>
                  <span className="text-xs text-muted-foreground">{order.date}</span>
                </div>

                <div className="flex items-center gap-3">
                  <span className="text-xs font-bold text-emerald-700 dark:text-emerald-300 bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-200 dark:border-emerald-800/60 px-2.5 py-0.5 rounded-full">
                    {order.paymentStatus} ({order.paymentMethod})
                  </span>
                  <span className="text-base font-black text-brand-emerald">
                    {formatKSh(order.total)}
                  </span>
                </div>
              </div>

              {/* Middle Grid: Seller, Customer, Items, Delivery */}
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4 text-xs">
                <div>
                  <span className="text-muted-foreground font-semibold">Seller / Store:</span>
                  <div className="font-bold text-foreground mt-0.5">{order.sellerName}</div>
                  <span className="text-[11px] text-muted-foreground">Receipt: {order.mpesaReceipt}</span>
                </div>

                <div>
                  <span className="text-muted-foreground font-semibold">Customer &amp; Phone:</span>
                  <div className="font-bold text-foreground mt-0.5">{order.customerName}</div>
                  <span className="font-mono text-muted-foreground">{order.customerPhone}</span>
                </div>

                <div>
                  <span className="text-muted-foreground font-semibold">Delivery Address:</span>
                  <div className="font-bold text-foreground mt-0.5 flex items-center gap-1">
                    <MapPin className="w-3.5 h-3.5 text-brand-red shrink-0" />
                    <span>{order.town}, {order.county}</span>
                  </div>
                  <span className="text-[11px] text-muted-foreground truncate block">{order.address}</span>
                </div>

                <div>
                  <span className="text-muted-foreground font-semibold">Estimated Arrival:</span>
                  <div className="font-bold text-emerald-600 dark:text-emerald-400 mt-0.5">
                    {order.estimatedArrival}
                  </div>
                </div>
              </div>

              {/* Ordered Items Pill */}
              <div className="p-3 bg-muted/30 dark:bg-brand-dark-bg/40 rounded-2xl text-xs space-y-1">
                <span className="font-bold text-muted-foreground">Items in Order:</span>
                <ul className="space-y-1">
                  {order.items.map((it, idx) => (
                    <li key={idx} className="flex justify-between font-medium">
                      <span>
                        <strong className="text-foreground">{it.qty}x</strong> {it.title}
                      </span>
                      <span className="font-bold text-brand-emerald">{formatKSh(it.price * it.qty)}</span>
                    </li>
                  ))}
                </ul>
              </div>

              {/* Visual 5-Step Tracking Experience */}
              <div className="pt-2 border-t border-border space-y-3">
                <span className="text-[11px] font-bold text-muted-foreground uppercase tracking-wider">
                  Live Fulfillment Progress:
                </span>
                <div className="grid grid-cols-5 gap-2 text-center text-xs">
                  {trackingSteps.map((stepItem) => {
                    const isDone = order.step > stepItem.step;
                    const isCurrent = order.step === stepItem.step;

                    return (
                      <div
                        key={stepItem.step}
                        className={`p-2.5 rounded-2xl border transition-all flex flex-col items-center gap-1.5 ${
                          isDone
                            ? "bg-emerald-50 dark:bg-emerald-950/60 border-emerald-300 dark:border-emerald-800 text-emerald-800 dark:text-emerald-300 font-bold"
                            : isCurrent
                            ? "bg-brand-emerald text-white border-brand-emerald shadow-md font-black"
                            : "bg-muted/30 border-border text-muted-foreground"
                        }`}
                      >
                        {isDone ? (
                          <Check className="w-4 h-4 stroke-[3]" />
                        ) : isCurrent ? (
                          <span className="w-2.5 h-2.5 rounded-full bg-white animate-ping" />
                        ) : (
                          <Circle className="w-3.5 h-3.5 opacity-40" />
                        )}
                        <span className="text-[10px] sm:text-[11px] leading-tight">
                          {stepItem.title}
                        </span>
                      </div>
                    );
                  })}
                </div>

                {/* Action Buttons */}
                <div className="flex flex-wrap items-center justify-between gap-3 pt-2">
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => setSelectedOrder(order)}
                      className="text-xs font-bold text-brand-emerald hover:underline"
                    >
                      View Full Details
                    </button>
                    <span className="text-muted-foreground">•</span>
                    <a
                      href={`https://wa.me/${order.customerPhone.replace(/\D/g, "")}?text=Hello%20${encodeURIComponent(order.customerName)},%20this%20is%20regarding%20your%20VendLex%20order%20${encodeURIComponent(order.orderNumber)}`}
                      target="_blank"
                      rel="noreferrer"
                      className="text-xs font-bold text-emerald-600 hover:underline flex items-center gap-1"
                    >
                      <MessageCircle className="w-3.5 h-3.5" />
                      <span>WhatsApp Customer</span>
                    </a>
                  </div>

                  {order.step < 5 && (
                    <button
                      onClick={() => advanceStep(order.id)}
                      disabled={updatingId === order.id}
                      className="bg-brand-emerald hover:bg-brand-emerald-dark disabled:opacity-60 text-white text-xs font-bold py-2 px-4 rounded-xl shadow-sm transition-all flex items-center gap-1.5"
                    >
                      {updatingId === order.id ? (
                        <>
                          <Loader2 className="w-3.5 h-3.5 animate-spin" />
                          <span>Updating status...</span>
                        </>
                      ) : (
                        <span>Advance to &quot;{trackingSteps[order.step].title}&quot; &rarr;</span>
                      )}
                    </button>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Order Detail Modal */}
      <Modal isOpen={!!selectedOrder} onClose={() => setSelectedOrder(null)} title={selectedOrder?.orderNumber || "Order Details"}>
        {selectedOrder && (
          <div className="space-y-4 text-xs">
            <div className="p-4 bg-muted/40 rounded-2xl space-y-2">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Customer:</span>
                <span className="font-bold text-foreground">{selectedOrder.customerName}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Phone:</span>
                <span className="font-mono text-foreground font-bold">{selectedOrder.customerPhone}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Estimated Arrival:</span>
                <span className="font-bold text-emerald-600">{selectedOrder.estimatedArrival}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Destination:</span>
                <span className="font-semibold text-foreground text-right">{selectedOrder.address}, {selectedOrder.town}, {selectedOrder.county}</span>
              </div>
            </div>

            <div className="flex gap-2 pt-2">
              <a
                href={`https://wa.me/${selectedOrder.customerPhone.replace(/\D/g, "")}?text=Hello%20${encodeURIComponent(selectedOrder.customerName)},%20this%20is%20regarding%20your%20VendLex%20order%20${encodeURIComponent(selectedOrder.orderNumber)}`}
                target="_blank"
                rel="noreferrer"
                className="flex-1 bg-emerald-500 hover:bg-emerald-600 text-white font-bold py-2.5 rounded-xl text-center flex items-center justify-center gap-1.5"
              >
                <MessageCircle className="w-4 h-4" />
                <span>WhatsApp Customer</span>
              </a>
              <a
                href={`tel:${selectedOrder.customerPhone}`}
                className="flex-1 bg-brand-emerald hover:bg-brand-emerald-dark text-white font-bold py-2.5 rounded-xl text-center flex items-center justify-center gap-1.5"
              >
                <Phone className="w-4 h-4" />
                <span>Call Customer</span>
              </a>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
}
