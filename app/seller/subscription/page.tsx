"use client";

import React, { useState, useEffect, useRef } from "react";
import { PRICING_PLANS } from "@/lib/data/kenya-data";
import { formatKSh } from "@/lib/utils";
import { Modal } from "@/components/ui/modal";
import { Check, Sparkles, Zap, Smartphone, RefreshCw, AlertCircle, ShieldCheck } from "lucide-react";
import confetti from "canvas-confetti";

export default function SellerSubscriptionPage() {
  const [currentTier, setCurrentTier] = useState<string>("business");
  const [selectedPlanToUpgrade, setSelectedPlanToUpgrade] = useState<any | null>(null);
  const [phone, setPhone] = useState("0712345678");
  const [isProcessing, setIsProcessing] = useState(false);
  const [stkStatus, setStkStatus] = useState<"idle" | "sent" | "success" | "error">("idle");
  const [checkoutId, setCheckoutId] = useState<string | null>(null);
  const [receiptNo, setReceiptNo] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string>("");
  const [countdown, setCountdown] = useState<number>(45);

  const pollIntervalRef = useRef<NodeJS.Timeout | null>(null);

  const clearAllTimers = () => {
    if (pollIntervalRef.current) {
      clearInterval(pollIntervalRef.current);
      pollIntervalRef.current = null;
    }
  };

  useEffect(() => {
    return () => clearAllTimers();
  }, []);

  // STK Push Countdown Timer
  useEffect(() => {
    let timer: NodeJS.Timeout;
    if (stkStatus === "sent" && countdown > 0) {
      timer = setTimeout(() => setCountdown((c) => c - 1), 1000);
    } else if (stkStatus === "sent" && countdown <= 0) {
      clearAllTimers();
      setStkStatus("error");
      setErrorMessage("Payment timed out: No M-Pesa PIN was entered on your phone within 45 seconds. Your account was not debited.");
    }
    return () => clearTimeout(timer);
  }, [stkStatus, countdown]);

  const handleOpenUpgrade = (plan: any) => {
    clearAllTimers();
    setSelectedPlanToUpgrade(plan);
    setStkStatus("idle");
    setCheckoutId(null);
    setReceiptNo(null);
    setErrorMessage("");
    setCountdown(45);
  };

  const handleInitiateSTK = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedPlanToUpgrade) return;

    if (selectedPlanToUpgrade.monthlyPrice === 0) {
      setCurrentTier("free");
      setSelectedPlanToUpgrade(null);
      return;
    }

    clearAllTimers();
    setIsProcessing(true);
    setStkStatus("idle");
    setErrorMessage("");
    setCountdown(45);

    try {
      const res = await fetch("/api/mpesa/stkpush", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          phoneNumber: phone,
          amount: selectedPlanToUpgrade.monthlyPrice,
          accountReference: `SUB-${selectedPlanToUpgrade.name.toUpperCase()}`,
          transactionDesc: `${selectedPlanToUpgrade.name} Monthly Subscription`,
          sellerName: "Nairobi Tech Hub",
          purpose: "SUBSCRIPTION",
        }),
      });

      const data = await res.json();
      setIsProcessing(false);

      if (!res.ok || !data.success) {
        setStkStatus("error");
        setErrorMessage(data.error || "Failed to trigger M-Pesa prompt. Please ensure your phone number is valid.");
        return;
      }

      setCheckoutId(data.checkoutRequestId);
      setStkStatus("sent");

      // Poll transaction status from /api/mpesa/query
      pollIntervalRef.current = setInterval(async () => {
        try {
          const queryRes = await fetch(`/api/mpesa/query?checkoutRequestId=${encodeURIComponent(data.checkoutRequestId)}`);
          const queryData = await queryRes.json();

          if (queryData.success) {
            const status = queryData.status || queryData.transaction?.status;
            const confirmedReceipt = queryData.mpesaReceiptNumber || queryData.transaction?.mpesaReceiptNumber;

            if (status === "COMPLETED" && confirmedReceipt) {
              clearAllTimers();
              setReceiptNo(confirmedReceipt);
              setCurrentTier(selectedPlanToUpgrade.id);
              setStkStatus("success");
              try {
                confetti({ particleCount: 100, spread: 70, origin: { y: 0.6 } });
              } catch (e) {}
            } else if (status === "FAILED" || status === "CANCELLED") {
              clearAllTimers();
              setStkStatus("error");
              setErrorMessage(queryData.resultDesc || queryData.transaction?.resultDesc || "Payment failed: Transaction was cancelled or declined on your phone.");
            }
          }
        } catch (pollErr) {
          console.warn("M-Pesa polling check error:", pollErr);
        }
      }, 2500);
    } catch (error: any) {
      setIsProcessing(false);
      setStkStatus("error");
      setErrorMessage(error.message || "Network error communicating with Safaricom Daraja.");
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-black text-foreground">Subscription &amp; Merchant Tier</h1>
        <p className="text-xs text-muted-foreground">Manage your active VendLex subscription plan, billing receipts, and feature upgrades via direct Lipa na M-Pesa.</p>
      </div>

      {/* Current Active Plan Card */}
      <div className="bg-gradient-to-br from-brand-emerald-dark to-brand-charcoal text-white rounded-3xl p-6 sm:p-8 shadow-xl flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="space-y-2">
          <div className="inline-flex items-center gap-1.5 bg-brand-gold text-brand-charcoal text-[10px] font-black px-3 py-1 rounded-full uppercase tracking-wider">
            <Sparkles className="w-3.5 h-3.5" />
            <span>ACTIVE MERCHANT SUBSCRIPTION</span>
          </div>
          <h2 className="text-2xl sm:text-3xl font-black uppercase">
            {PRICING_PLANS.find((p) => p.id === currentTier)?.name || "BUSINESS"} PLAN ({formatKSh(PRICING_PLANS.find((p) => p.id === currentTier)?.monthlyPrice || 799)}/mo)
          </h2>
          <p className="text-xs text-emerald-100 max-w-lg leading-relaxed">
            Direct Lipa na M-Pesa automatic settlement, Verified Business badge, automated KRA PDF invoicing, and VendLex AI assistant tokens.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={() => handleOpenUpgrade(PRICING_PLANS.find((p) => p.id === "pro"))}
            className="bg-brand-emerald hover:bg-brand-emerald-light text-white font-bold py-3 px-6 rounded-xl text-xs shadow-md transition-all flex items-center gap-1.5 shrink-0"
          >
            <Zap className="w-4 h-4" />
            <span>Upgrade to Pro Enterprise</span>
          </button>
        </div>
      </div>

      {/* Plan Tiers Grid */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 pt-4">
        {PRICING_PLANS.map((plan) => {
          const isSelected = plan.id === currentTier;
          return (
            <div
              key={plan.id}
              className={`p-6 rounded-3xl border flex flex-col justify-between space-y-4 ${
                isSelected
                  ? "border-brand-emerald bg-white dark:bg-brand-dark-card shadow-md ring-2 ring-brand-emerald"
                  : "bg-white dark:bg-brand-dark-card border-border"
              }`}
            >
              <div className="space-y-2">
                <div className="flex justify-between items-center">
                  <h4 className="font-extrabold text-sm text-foreground">{plan.name}</h4>
                  {isSelected && (
                    <span className="text-[10px] bg-brand-emerald text-white px-2 py-0.5 rounded-full font-bold">
                      Current
                    </span>
                  )}
                </div>
                <div className="text-xl font-black text-brand-emerald">
                  {plan.monthlyPrice === 0 ? "FREE" : `${formatKSh(plan.monthlyPrice)}/mo`}
                </div>
                <p className="text-[11px] text-muted-foreground">{plan.description}</p>
              </div>

              <button
                onClick={() => handleOpenUpgrade(plan)}
                disabled={isSelected}
                className={`w-full py-2.5 rounded-xl text-xs font-bold transition-all ${
                  isSelected
                    ? "bg-muted text-muted-foreground cursor-default"
                    : "bg-brand-emerald text-white hover:bg-brand-emerald-dark"
                }`}
              >
                {isSelected ? "Active Plan" : `Upgrade via M-Pesa`}
              </button>
            </div>
          );
        })}
      </div>

      {/* M-Pesa STK Push Upgrade Modal */}
      <Modal
        isOpen={!!selectedPlanToUpgrade}
        onClose={() => {
          clearAllTimers();
          setSelectedPlanToUpgrade(null);
        }}
        title={`Subscribe to ${selectedPlanToUpgrade?.name} Plan`}
      >
        {selectedPlanToUpgrade && (
          <div className="space-y-5">
            <div className="p-4 bg-muted/40 rounded-2xl space-y-1">
              <div className="flex justify-between text-xs">
                <span className="text-muted-foreground">Plan Selected:</span>
                <span className="font-bold text-foreground">{selectedPlanToUpgrade.name}</span>
              </div>
              <div className="flex justify-between text-xs">
                <span className="text-muted-foreground">Monthly Fee:</span>
                <span className="font-black text-brand-emerald text-sm">{formatKSh(selectedPlanToUpgrade.monthlyPrice)}</span>
              </div>
            </div>

            {stkStatus === "idle" && (
              <form onSubmit={handleInitiateSTK} className="space-y-4">
                <div>
                  <label className="block text-xs font-bold text-foreground mb-1">
                    Safaricom M-Pesa Phone Number *
                  </label>
                  <div className="relative">
                    <Smartphone className="w-4 h-4 absolute left-3 top-3 text-muted-foreground" />
                    <input
                      type="tel"
                      required
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      placeholder="07XX XXX XXX"
                      className="w-full bg-muted/30 border border-border rounded-xl pl-9 pr-3 py-2.5 text-xs font-mono font-bold text-foreground focus:outline-none focus:border-brand-emerald"
                    />
                  </div>
                  <p className="text-[10px] text-muted-foreground mt-1">
                    An STK prompt will appear on your phone to authorize payment to VendLex.
                  </p>
                </div>

                <button
                  type="submit"
                  disabled={isProcessing}
                  className="w-full bg-brand-emerald hover:bg-brand-emerald-dark disabled:opacity-50 text-white font-bold py-3 rounded-xl text-xs flex items-center justify-center gap-2 shadow-md transition-all"
                >
                  <Smartphone className="w-4 h-4" />
                  <span>{isProcessing ? "Connecting to Daraja..." : `Pay ${formatKSh(selectedPlanToUpgrade.monthlyPrice)} via M-Pesa`}</span>
                </button>
              </form>
            )}

            {stkStatus === "sent" && (
              <div className="space-y-4 py-3 animate-fadeIn">
                <div className="relative w-16 h-16 mx-auto">
                  <div className="absolute inset-0 rounded-full border-4 border-brand-emerald/30 border-t-brand-emerald animate-spin" />
                  <div className="w-full h-full rounded-full flex items-center justify-center text-sm font-black text-brand-emerald font-mono">
                    {countdown}s
                  </div>
                </div>

                <div className="space-y-1 text-center">
                  <h4 className="font-bold text-sm text-foreground">Waiting for M-Pesa PIN...</h4>
                  <p className="text-xs text-muted-foreground">
                    Safaricom Daraja has sent an M-Pesa PIN prompt to <strong className="text-foreground">{phone}</strong>.
                  </p>
                  <p className="text-[11px] text-muted-foreground">
                    Enter your PIN to complete <strong>{formatKSh(selectedPlanToUpgrade.monthlyPrice)}</strong> payment.
                  </p>
                </div>

                <div className="p-3 rounded-xl bg-amber-50 dark:bg-amber-950/40 border border-amber-200 text-xs text-amber-800 dark:text-amber-300 text-left flex items-start gap-2">
                  <ShieldCheck className="w-4 h-4 shrink-0 mt-0.5" />
                  <span>
                    Do not share your M-Pesa PIN with anyone. VendLex will automatically detect confirmation.
                  </span>
                </div>
              </div>
            )}

            {stkStatus === "success" && (
              <div className="text-center py-6 space-y-4 animate-scaleUp">
                <div className="w-16 h-16 rounded-full bg-emerald-100 text-brand-emerald flex items-center justify-center mx-auto shadow-sm">
                  <Check className="w-8 h-8" />
                </div>
                <div className="space-y-1">
                  <h4 className="font-bold text-base text-foreground">Payment Confirmed! 🎉</h4>
                  <p className="text-xs text-muted-foreground">
                    Your store has been upgraded to <strong>{selectedPlanToUpgrade.name} Plan</strong>.
                  </p>
                  <div className="inline-flex items-center gap-1.5 bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-200 px-3 py-1 rounded-full text-xs font-bold font-mono mt-1">
                    <span>M-Pesa Receipt: {receiptNo}</span>
                  </div>
                </div>

                {/* Certificate Download Card */}
                <div className="p-4 bg-gradient-to-r from-amber-500/10 via-brand-gold/15 to-amber-500/10 border border-brand-gold/40 rounded-2xl space-y-2">
                  <p className="text-[11px] font-bold text-amber-900 dark:text-amber-200">
                    Your Official Stamped Merchant Certificate has been renewed!
                  </p>
                  <div className="flex justify-center gap-2">
                    <a
                      href="/api/documents/VLX-CERT-2026-000182/download"
                      target="_blank"
                      rel="noreferrer"
                      className="bg-brand-gold hover:bg-amber-400 text-brand-charcoal font-black py-2 px-4 rounded-xl text-xs flex items-center gap-1.5 shadow-sm transition-all"
                    >
                      <span>Download Stamped Certificate (PDF)</span>
                    </a>
                  </div>
                </div>

                <button
                  onClick={() => setSelectedPlanToUpgrade(null)}
                  className="bg-brand-emerald text-white text-xs font-bold px-6 py-2.5 rounded-xl hover:bg-brand-emerald-dark transition-colors"
                >
                  Done &amp; Return to Dashboard
                </button>
              </div>
            )}

            {stkStatus === "error" && (
              <div className="space-y-3 p-4 bg-red-50 dark:bg-red-950/40 border border-red-300 dark:border-red-800 rounded-2xl text-red-700 dark:text-red-300 text-xs animate-pop-up">
                <div className="flex items-center gap-2 font-bold text-sm text-red-800 dark:text-red-200">
                  <AlertCircle className="w-5 h-5 text-brand-red shrink-0" />
                  <span>Payment Incomplete</span>
                </div>
                <p className="text-xs text-red-700/90 dark:text-red-300/90 leading-relaxed">
                  {errorMessage || "We could not confirm your M-Pesa payment. The transaction was cancelled or timed out. Your M-Pesa account was not charged."}
                </p>
                <div className="flex gap-2 pt-1">
                  <button
                    type="button"
                    onClick={() => {
                      setStkStatus("idle");
                      setErrorMessage("");
                    }}
                    className="px-4 py-2 bg-brand-emerald hover:bg-brand-emerald-dark text-white rounded-xl text-xs font-bold transition-colors flex items-center gap-1.5"
                  >
                    <RefreshCw className="w-3.5 h-3.5" />
                    <span>Try Again</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setSelectedPlanToUpgrade(null)}
                    className="px-3 py-2 bg-white dark:bg-brand-dark-card border border-red-200 text-red-700 rounded-xl text-xs font-bold transition-colors"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            )}
          </div>
        )}
      </Modal>
    </div>
  );
}
