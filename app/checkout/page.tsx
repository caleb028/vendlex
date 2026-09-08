"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useCart } from "@/lib/store/cart-store";
import { useAuth } from "@/lib/store/auth-store";
import { usePlatform } from "@/lib/store/platform-store";
import { formatKSh, isValidKenyanPhone, formatKenyanPhone } from "@/lib/utils";
import { KENYAN_COUNTIES, KENYAN_TOWNS } from "@/lib/data/kenya-data";
import { MpesaModal } from "@/components/checkout/mpesa-modal";
import confetti from "canvas-confetti";
import {
  CheckCircle2,
  MapPin,
  Truck,
  CreditCard,
  Smartphone,
  ShieldCheck,
  ArrowRight,
  ArrowLeft,
  ShoppingBag,
  Printer,
  Calendar,
  Clock,
  User,
  Package,
} from "lucide-react";

export default function CheckoutPage() {
  const router = useRouter();
  const { user } = useAuth();
  const {
    items,
    itemCount,
    subtotal,
    deliveryFee,
    deliveryCounty,
    setDeliveryCounty,
    discountAmount,
    total,
    clearCart,
  } = useCart();

  // Step state (1 to 5)
  const [currentStep, setCurrentStep] = useState<number>(1);

  // Form Fields
  const [customerName, setCustomerName] = useState(user?.name || "Grace Wanjiku");
  const [customerEmail, setCustomerEmail] = useState(user?.email || "grace.wanjiku@gmail.com");
  const [customerPhone, setCustomerPhone] = useState(user?.phone || "+254 712 987 654");

  const [town, setTown] = useState("Kilimani");
  const [estate, setEstate] = useState("Yaya Court, Apt 4B");
  const [deliveryNotes, setDeliveryNotes] = useState("Call when at the gate.");

  const [shippingMethod, setShippingMethod] = useState<"express" | "courier" | "pickup">("express");
  const [paymentMethod, setPaymentMethod] = useState<"MPESA" | "CARD" | "COD">("MPESA");

  // M-Pesa Modal
  const [mpesaModalOpen, setMpesaModalOpen] = useState(false);
  const [orderConfirmed, setOrderConfirmed] = useState(false);
  const [confirmedOrderNumber, setConfirmedOrderNumber] = useState("SKL-89412");
  const [confirmedReceipt, setConfirmedReceipt] = useState("QGH89124K");

  // Form validation errors
  const [errors, setErrors] = useState<Record<string, string>>({});

  const validateStep1 = () => {
    const errs: Record<string, string> = {};
    if (!customerName.trim()) errs.name = "Please provide your full name.";
    if (!customerEmail.trim()) errs.email = "Please provide a valid email.";
    if (!customerPhone.trim() || !isValidKenyanPhone(customerPhone)) {
      errs.phone = "Enter a valid Kenyan number (07XX XXX XXX or +254 7XX...).";
    }
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const validateStep2 = () => {
    const errs: Record<string, string> = {};
    if (!town.trim()) errs.town = "Town/Area is required.";
    if (!estate.trim()) errs.estate = "Estate / Building details required.";
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const [isProcessingOrder, setIsProcessingOrder] = useState(false);
  const [checkoutError, setCheckoutError] = useState("");

  const handleNext = async () => {
    if (currentStep === 1 && !validateStep1()) return;
    if (currentStep === 2 && !validateStep2()) return;

    if (currentStep === 4) {
      setIsProcessingOrder(true);
      setCheckoutError("");

      try {
        const res = await fetch("/api/orders", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            customerName,
            customerPhone,
            customerEmail,
            county: deliveryCounty,
            town,
            estate,
            deliveryNotes,
            paymentMethod,
            items: items.map((i) => ({ productId: i.product.id, quantity: i.quantity })),
          }),
        });

        const data = await res.json();
        setIsProcessingOrder(false);

        if (!res.ok || !data.success || !data.order) {
          setCheckoutError(data.error || "Failed to initiate order.");
          return;
        }

        setConfirmedOrderNumber(data.order.orderNumber);

        if (paymentMethod === "MPESA") {
          setMpesaModalOpen(true);
        } else {
          completeOrder("CARD-AUTH-982", data.order.orderNumber);
        }
      } catch (err: any) {
        setIsProcessingOrder(false);
        setCheckoutError(err.message || "Network error processing order.");
      }
      return;
    }

    setCurrentStep((prev) => Math.min(5, prev + 1));
  };

  const { addOrder } = usePlatform();

  const completeOrder = (receipt: string, orderNo?: string) => {
    const finalOrderNumber = orderNo || confirmedOrderNumber || `ORD-${Math.floor(10000 + Math.random() * 90000)}`;
    setConfirmedOrderNumber(finalOrderNumber);
    setConfirmedReceipt(receipt);
    setOrderConfirmed(true);
    setCurrentStep(5);

    // Sync to platform store for UI continuity
    addOrder({
      customerName: customerName || "Grace Wanjiku",
      customerPhone: customerPhone || "0712 987 654",
      county: deliveryCounty,
      productTitle: items.map((i) => i.product.title).join(", ") || "Kenyan Marketplace Item",
      storeName: items[0]?.product.businessName || "VendLex Merchant",
      amount: total,
      mpesaReceipt: receipt,
    });

    try {
      confetti({ particleCount: 100, spread: 70, origin: { y: 0.6 } });
    } catch (e) {}
    clearCart();
  };

  if (items.length === 0 && !orderConfirmed) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-20 text-center space-y-4">
        <h2 className="text-xl font-bold text-foreground">No Items in Cart</h2>
        <p className="text-xs text-muted-foreground">Add items to your cart before proceeding to checkout.</p>
        <Link href="/marketplace" className="inline-block bg-brand-emerald text-white px-5 py-2.5 rounded-xl font-bold text-xs">
          Explore Marketplace
        </Link>
      </div>
    );
  }

  return (
    <div className="bg-brand-off-white dark:bg-brand-dark-bg min-h-screen py-10">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Step Progress Tracker */}
        <div className="mb-8">
          <div className="flex items-center justify-between max-w-2xl mx-auto">
            {[
              { num: 1, label: "Customer" },
              { num: 2, label: "Delivery" },
              { num: 3, label: "Shipping" },
              { num: 4, label: "Payment" },
              { num: 5, label: "Confirm" },
            ].map((st) => (
              <div key={st.num} className="flex flex-col items-center gap-1.5 flex-1 relative">
                <div
                  className={`w-8 h-8 sm:w-9 sm:h-9 rounded-full flex items-center justify-center font-bold text-xs transition-all ${
                    currentStep === st.num
                      ? "bg-brand-emerald text-white ring-4 ring-brand-emerald/20 shadow-md"
                      : currentStep > st.num
                      ? "bg-emerald-100 dark:bg-emerald-950 text-brand-emerald font-black"
                      : "bg-muted text-muted-foreground"
                  }`}
                >
                  {currentStep > st.num ? "✓" : st.num}
                </div>
                <span className={`text-[10px] sm:text-xs font-semibold ${currentStep >= st.num ? "text-foreground" : "text-muted-foreground"}`}>
                  {st.label}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* STEP 5: ORDER CONFIRMATION VIEW */}
        {currentStep === 5 ? (
          <div className="max-w-3xl mx-auto bg-white dark:bg-brand-dark-card border border-border dark:border-brand-dark-border rounded-3xl p-6 sm:p-10 shadow-xl space-y-8 animate-scaleUp">
            <div className="text-center space-y-3">
              <div className="w-16 h-16 rounded-full bg-emerald-100 dark:bg-emerald-950/60 text-brand-emerald flex items-center justify-center mx-auto shadow-sm">
                <CheckCircle2 className="w-10 h-10" />
              </div>
              <h1 className="text-2xl sm:text-3xl font-black text-foreground">
                Asante! Order Confirmed.
              </h1>
              <p className="text-xs sm:text-sm text-muted-foreground max-w-md mx-auto">
                Your order <strong className="text-foreground">#{confirmedOrderNumber}</strong> has been received and verified. The merchant has begun packing your items.
              </p>
            </div>

            {/* Receipt Summary Card */}
            <div className="bg-muted/30 dark:bg-brand-dark-bg/60 border border-border rounded-2xl p-5 space-y-3 text-xs">
              <div className="flex justify-between border-b border-border pb-2">
                <span className="text-muted-foreground">Order Reference:</span>
                <span className="font-bold text-foreground font-mono">#{confirmedOrderNumber}</span>
              </div>
              <div className="flex justify-between border-b border-border pb-2">
                <span className="text-muted-foreground">Payment Method:</span>
                <span className="font-bold text-foreground">
                  {paymentMethod === "MPESA" ? "M-Pesa STK Push (Paid)" : paymentMethod === "CARD" ? "Card Payment (Paid)" : "Cash on Delivery"}
                </span>
              </div>
              {confirmedReceipt && (
                <div className="flex justify-between border-b border-border pb-2">
                  <span className="text-muted-foreground">Transaction Receipt Code:</span>
                  <span className="font-mono text-brand-emerald font-bold">{confirmedReceipt}</span>
                </div>
              )}
              <div className="flex justify-between border-b border-border pb-2">
                <span className="text-muted-foreground">Delivery To:</span>
                <span className="font-semibold text-foreground">{customerName} • {town}, {deliveryCounty}</span>
              </div>
              <div className="flex justify-between pt-1 font-bold text-sm">
                <span>Total Amount Paid:</span>
                <span className="text-brand-emerald text-base font-black">{formatKSh(total)}</span>
              </div>
            </div>

            {/* Visual Order Lifecycle Timeline */}
            <div className="space-y-3 pt-2">
              <h3 className="font-bold text-xs uppercase tracking-wider text-muted-foreground">
                Order Delivery Timeline
              </h3>
              <div className="grid grid-cols-4 gap-2 text-center text-[10px]">
                <div className="p-2.5 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-300 text-brand-emerald font-bold">
                  <span>1. Confirmed ✓</span>
                </div>
                <div className="p-2.5 rounded-xl bg-muted/40 border border-border text-foreground font-medium">
                  <span>2. Processing</span>
                </div>
                <div className="p-2.5 rounded-xl bg-muted/40 border border-border text-muted-foreground">
                  <span>3. Out for Delivery</span>
                </div>
                <div className="p-2.5 rounded-xl bg-muted/40 border border-border text-muted-foreground">
                  <span>4. Delivered</span>
                </div>
              </div>
            </div>

            {/* Actions */}
            <div className="flex flex-wrap items-center justify-between gap-4 pt-4 border-t border-border">
              <button
                onClick={() => window.print()}
                className="flex items-center gap-1.5 text-xs font-bold text-foreground hover:bg-muted p-2.5 px-4 rounded-xl border border-border transition-colors"
              >
                <Printer className="w-4 h-4" />
                <span>Print Official Receipt</span>
              </button>

              <Link
                href="/customer/dashboard"
                className="bg-brand-emerald hover:bg-brand-emerald-dark text-white text-xs font-bold px-6 py-3 rounded-xl shadow-md transition-all"
              >
                View in Customer Portal &rarr;
              </Link>
            </div>
          </div>
        ) : (
          /* STEPS 1 TO 4 CHECKOUT WIZARD */
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
            {/* Left: Step Form Fields (7 cols) */}
            <div className="lg:col-span-7 bg-white dark:bg-brand-dark-card border border-border dark:border-brand-dark-border rounded-3xl p-6 sm:p-8 shadow-sm space-y-6">
              {/* STEP 1: CUSTOMER DETAILS */}
              {currentStep === 1 && (
                <div className="space-y-5 animate-fadeIn">
                  <div>
                    <h2 className="text-lg font-bold text-foreground">Step 1: Customer Contact Information</h2>
                    <p className="text-xs text-muted-foreground">We will send your M-Pesa prompt and delivery SMS updates here.</p>
                  </div>

                  <div className="space-y-4">
                    <div>
                      <label className="block text-xs font-bold text-foreground mb-1">Full Legal Name *</label>
                      <input
                        type="text"
                        value={customerName}
                        onChange={(e) => setCustomerName(e.target.value)}
                        placeholder="e.g. Grace Wanjiku"
                        className="w-full bg-muted/30 dark:bg-brand-dark-bg/60 border border-border rounded-xl p-3 text-xs text-foreground focus:outline-none focus:border-brand-emerald"
                      />
                      {errors.name && <p className="text-[11px] text-brand-red mt-1">{errors.name}</p>}
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <div>
                        <label className="block text-xs font-bold text-foreground mb-1">Email Address *</label>
                        <input
                          type="email"
                          value={customerEmail}
                          onChange={(e) => setCustomerEmail(e.target.value)}
                          placeholder="grace@example.com"
                          className="w-full bg-muted/30 dark:bg-brand-dark-bg/60 border border-border rounded-xl p-3 text-xs text-foreground focus:outline-none focus:border-brand-emerald"
                        />
                        {errors.email && <p className="text-[11px] text-brand-red mt-1">{errors.email}</p>}
                      </div>

                      <div>
                        <label className="block text-xs font-bold text-foreground mb-1">Kenyan Phone (M-Pesa) *</label>
                        <input
                          type="tel"
                          value={customerPhone}
                          onChange={(e) => setCustomerPhone(e.target.value)}
                          placeholder="+254 7XX XXX XXX"
                          className="w-full bg-muted/30 dark:bg-brand-dark-bg/60 border border-border rounded-xl p-3 text-xs text-foreground font-mono focus:outline-none focus:border-brand-emerald"
                        />
                        {errors.phone && <p className="text-[11px] text-brand-red mt-1">{errors.phone}</p>}
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* STEP 2: DELIVERY ADDRESS */}
              {currentStep === 2 && (
                <div className="space-y-5 animate-fadeIn">
                  <div>
                    <h2 className="text-lg font-bold text-foreground">Step 2: Delivery Destination</h2>
                    <p className="text-xs text-muted-foreground">Select your county and exact drop-off building or estate.</p>
                  </div>

                  <div className="space-y-4">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <div>
                        <label className="block text-xs font-bold text-foreground mb-1">County *</label>
                        <select
                          value={deliveryCounty}
                          onChange={(e) => setDeliveryCounty(e.target.value)}
                          className="w-full bg-muted/30 dark:bg-brand-dark-bg/60 border border-border rounded-xl p-3 text-xs text-foreground font-semibold focus:outline-none focus:border-brand-emerald"
                        >
                          {KENYAN_COUNTIES.map((c) => (
                            <option key={c} value={c}>
                              {c}
                            </option>
                          ))}
                        </select>
                      </div>

                      <div>
                        <label className="block text-xs font-bold text-foreground mb-1">Town / Area / Constituency *</label>
                        <input
                          type="text"
                          value={town}
                          onChange={(e) => setTown(e.target.value)}
                          placeholder="e.g. Kilimani, Westlands, Nyali"
                          className="w-full bg-muted/30 dark:bg-brand-dark-bg/60 border border-border rounded-xl p-3 text-xs text-foreground focus:outline-none focus:border-brand-emerald"
                        />
                        {errors.town && <p className="text-[11px] text-brand-red mt-1">{errors.town}</p>}
                      </div>
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-foreground mb-1">Estate, Street, House / Apt Number *</label>
                      <input
                        type="text"
                        value={estate}
                        onChange={(e) => setEstate(e.target.value)}
                        placeholder="e.g. Yaya Court, 3rd Floor Apt 4B, Argwings Kodhek Rd"
                        className="w-full bg-muted/30 dark:bg-brand-dark-bg/60 border border-border rounded-xl p-3 text-xs text-foreground focus:outline-none focus:border-brand-emerald"
                      />
                      {errors.estate && <p className="text-[11px] text-brand-red mt-1">{errors.estate}</p>}
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-foreground mb-1">Courier Rider Instructions (Optional)</label>
                      <textarea
                        rows={2}
                        value={deliveryNotes}
                        onChange={(e) => setDeliveryNotes(e.target.value)}
                        placeholder="e.g. Gate code #492 or call when near landmark..."
                        className="w-full bg-muted/30 dark:bg-brand-dark-bg/60 border border-border rounded-xl p-3 text-xs text-foreground resize-none"
                      />
                    </div>
                  </div>
                </div>
              )}

              {/* STEP 3: SHIPPING METHOD */}
              {currentStep === 3 && (
                <div className="space-y-5 animate-fadeIn">
                  <div>
                    <h2 className="text-lg font-bold text-foreground">Step 3: Choose Shipping Speed</h2>
                    <p className="text-xs text-muted-foreground">Select your preferred courier service for {deliveryCounty}.</p>
                  </div>

                  <div className="space-y-3">
                    <label
                      onClick={() => setShippingMethod("express")}
                      className={`flex items-center justify-between p-4 rounded-2xl border cursor-pointer transition-all ${
                        shippingMethod === "express"
                          ? "border-brand-emerald bg-brand-emerald-soft/30 dark:bg-brand-dark-bg"
                          : "border-border hover:bg-muted/30"
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <Truck className="w-5 h-5 text-brand-emerald" />
                        <div>
                          <div className="font-bold text-xs text-foreground">Same-Day Express Dispatch (2-4 Hours)</div>
                          <div className="text-[11px] text-muted-foreground">Dedicated motorcycle courier directly from store</div>
                        </div>
                      </div>
                      <span className="text-xs font-bold text-brand-emerald">{deliveryFee === 0 ? "FREE" : formatKSh(deliveryFee)}</span>
                    </label>

                    <label
                      onClick={() => setShippingMethod("courier")}
                      className={`flex items-center justify-between p-4 rounded-2xl border cursor-pointer transition-all ${
                        shippingMethod === "courier"
                          ? "border-brand-emerald bg-brand-emerald-soft/30 dark:bg-brand-dark-bg"
                          : "border-border hover:bg-muted/30"
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <Package className="w-5 h-5 text-blue-500" />
                        <div>
                          <div className="font-bold text-xs text-foreground">Standard 24-Hour Countrywide Parcel</div>
                          <div className="text-[11px] text-muted-foreground">Dispatched via Fargo / G4S with SMS tracking</div>
                        </div>
                      </div>
                      <span className="text-xs font-bold text-brand-emerald">{deliveryFee === 0 ? "FREE" : formatKSh(deliveryFee)}</span>
                    </label>

                    <label
                      onClick={() => setShippingMethod("pickup")}
                      className={`flex items-center justify-between p-4 rounded-2xl border cursor-pointer transition-all ${
                        shippingMethod === "pickup"
                          ? "border-brand-emerald bg-brand-emerald-soft/30 dark:bg-brand-dark-bg"
                          : "border-border hover:bg-muted/30"
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <MapPin className="w-5 h-5 text-amber-500" />
                        <div>
                          <div className="font-bold text-xs text-foreground">In-Store Merchant Pickup</div>
                          <div className="text-[11px] text-muted-foreground">Collect at physical retail shop in Nairobi CBD</div>
                        </div>
                      </div>
                      <span className="text-xs font-bold text-emerald-600">FREE</span>
                    </label>
                  </div>
                </div>
              )}

              {/* STEP 4: PAYMENT OPTIONS */}
              {currentStep === 4 && (
                <div className="space-y-5 animate-fadeIn">
                  <div>
                    <h2 className="text-lg font-bold text-foreground">Step 4: Secure Kenyan Payment</h2>
                    <p className="text-xs text-muted-foreground">Select your payment method. Escrow protected by VendLex.</p>
                  </div>

                  <div className="space-y-3">
                    {/* M-PESA Option */}
                    <label
                      onClick={() => setPaymentMethod("MPESA")}
                      className={`flex items-start justify-between p-4 rounded-2xl border cursor-pointer transition-all ${
                        paymentMethod === "MPESA"
                          ? "border-emerald-500 bg-emerald-50/50 dark:bg-emerald-950/20 shadow-sm"
                          : "border-border hover:bg-muted/30"
                      }`}
                    >
                      <div className="flex items-start gap-3">
                        <div className="w-9 h-9 rounded-xl bg-emerald-600 text-white flex items-center justify-center font-black text-xs shrink-0">
                          M
                        </div>
                        <div>
                          <div className="font-black text-xs text-foreground">Lipa na M-Pesa Online (STK Push)</div>
                          <p className="text-[11px] text-muted-foreground mt-0.5">
                            Enter your PIN on the prompt sent to <strong className="font-mono text-foreground">{customerPhone}</strong>.
                          </p>
                        </div>
                      </div>
                      <span className="text-[10px] bg-emerald-600 text-white font-bold px-2 py-0.5 rounded-full">
                        Instant
                      </span>
                    </label>

                    {/* Debit/Credit Card */}
                    <label
                      onClick={() => setPaymentMethod("CARD")}
                      className={`flex items-start justify-between p-4 rounded-2xl border cursor-pointer transition-all ${
                        paymentMethod === "CARD"
                          ? "border-brand-emerald bg-brand-emerald-soft/30 dark:bg-brand-dark-bg"
                          : "border-border hover:bg-muted/30"
                      }`}
                    >
                      <div className="flex items-start gap-3">
                        <CreditCard className="w-6 h-6 text-blue-600 shrink-0 mt-1" />
                        <div>
                          <div className="font-bold text-xs text-foreground">Debit / Credit Card (Visa, Mastercard)</div>
                          <p className="text-[11px] text-muted-foreground mt-0.5">
                            3D Secure Kenyan bank card checkout.
                          </p>
                        </div>
                      </div>
                    </label>

                    {/* Cash on Delivery */}
                    <label
                      onClick={() => setPaymentMethod("COD")}
                      className={`flex items-start justify-between p-4 rounded-2xl border cursor-pointer transition-all ${
                        paymentMethod === "COD"
                          ? "border-brand-emerald bg-brand-emerald-soft/30 dark:bg-brand-dark-bg"
                          : "border-border hover:bg-muted/30"
                      }`}
                    >
                      <div className="flex items-start gap-3">
                        <Smartphone className="w-6 h-6 text-amber-500 shrink-0 mt-1" />
                        <div>
                          <div className="font-bold text-xs text-foreground">Pay on Delivery via M-Pesa</div>
                          <p className="text-[11px] text-muted-foreground mt-0.5">
                            Inspect goods upon rider arrival before sending M-Pesa to store Till.
                          </p>
                        </div>
                      </div>
                    </label>
                  </div>
                </div>
              )}

              {checkoutError && (
                <div className="p-3 bg-red-50 dark:bg-red-950/50 border border-red-200 dark:border-red-900 text-brand-red rounded-xl text-xs font-semibold">
                  {checkoutError}
                </div>
              )}

              {/* Navigation Back / Next Buttons */}
              <div className="flex items-center justify-between pt-6 border-t border-border">
                {currentStep > 1 ? (
                  <button
                    onClick={() => setCurrentStep((prev) => prev - 1)}
                    disabled={isProcessingOrder}
                    className="flex items-center gap-1.5 text-xs font-bold text-muted-foreground hover:text-foreground py-2 px-3 rounded-xl border border-border"
                  >
                    <ArrowLeft className="w-4 h-4" />
                    <span>Back</span>
                  </button>
                ) : (
                  <Link href="/cart" className="text-xs text-muted-foreground hover:underline">
                    &larr; Back to Cart
                  </Link>
                )}

                <button
                  onClick={handleNext}
                  disabled={isProcessingOrder}
                  className="bg-brand-emerald hover:bg-brand-emerald-dark disabled:opacity-50 text-white font-bold py-3.5 px-6 rounded-xl text-xs sm:text-sm flex items-center gap-2 shadow-md hover:shadow-glow-green transition-all"
                >
                  <span>
                    {isProcessingOrder
                      ? "Processing Order..."
                      : currentStep === 4
                      ? `Pay ${formatKSh(total)} with ${paymentMethod === "MPESA" ? "M-Pesa" : "Card"}`
                      : "Continue to Next Step"}
                  </span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Right: Order Summary Sidebar (5 cols) */}
            <div className="lg:col-span-5 bg-white dark:bg-brand-dark-card border border-border dark:border-brand-dark-border rounded-3xl p-6 shadow-sm space-y-5">
              <h3 className="font-extrabold text-sm text-foreground border-b border-border pb-3">
                Order Items ({itemCount})
              </h3>

              <div className="space-y-3 max-h-64 overflow-y-auto pr-1">
                {items.map((item) => (
                  <div key={item.product.id} className="flex gap-3 text-xs">
                    <img
                      src={item.product.images[0]}
                      alt={item.product.title}
                      className="w-12 h-12 rounded-xl object-cover border shrink-0"
                    />
                    <div className="flex-1 min-w-0">
                      <div className="font-semibold text-foreground line-clamp-1">{item.product.title}</div>
                      <div className="text-[11px] text-muted-foreground">Qty: {item.quantity} • {item.product.businessName}</div>
                      <div className="text-xs font-black text-brand-emerald mt-0.5">
                        {formatKSh(item.product.price * item.quantity)}
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {/* Price Calculation */}
              <div className="space-y-2 pt-4 border-t border-border text-xs">
                <div className="flex justify-between text-muted-foreground">
                  <span>Subtotal</span>
                  <span className="font-semibold text-foreground">{formatKSh(subtotal)}</span>
                </div>
                {discountAmount > 0 && (
                  <div className="flex justify-between text-brand-red font-semibold">
                    <span>Discount</span>
                    <span>-{formatKSh(discountAmount)}</span>
                  </div>
                )}
                <div className="flex justify-between text-muted-foreground">
                  <span>Delivery ({deliveryCounty})</span>
                  <span className="font-semibold text-foreground">
                    {deliveryFee === 0 ? "FREE" : formatKSh(deliveryFee)}
                  </span>
                </div>
                <div className="border-t border-border pt-3 flex justify-between text-base font-black text-foreground">
                  <span>Total Due</span>
                  <span className="text-brand-emerald text-xl">{formatKSh(total)}</span>
                </div>
              </div>

              <div className="p-3 bg-brand-emerald-soft/50 dark:bg-brand-dark-bg/60 rounded-xl text-[11px] text-muted-foreground flex items-center gap-2">
                <ShieldCheck className="w-4 h-4 text-brand-emerald shrink-0" />
                <span>Protected by VendLex Buyer Escrow Guarantee</span>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* M-Pesa STK Push Simulation Modal */}
      <MpesaModal
        isOpen={mpesaModalOpen}
        onClose={() => setMpesaModalOpen(false)}
        phone={customerPhone}
        amount={total}
        orderNumber={`SKL-${Math.floor(10000 + Math.random() * 90000)}`}
        onSuccess={(receipt) => {
          setMpesaModalOpen(false);
          completeOrder(receipt);
        }}
        onFailure={() => setMpesaModalOpen(false)}
      />
    </div>
  );
}
