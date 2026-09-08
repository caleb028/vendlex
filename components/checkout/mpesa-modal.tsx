"use client";

import React, { useState, useEffect } from "react";
import { Modal } from "@/components/ui/modal";
import { formatKSh, formatKenyanPhone } from "@/lib/utils";
import confetti from "canvas-confetti";
import {
  Smartphone,
  CheckCircle2,
  AlertCircle,
  Clock,
  ShieldCheck,
  RefreshCw,
  X,
} from "lucide-react";

export interface MpesaPaymentProps {
  isOpen: boolean;
  onClose: () => void;
  phone: string;
  amount: number;
  orderNumber: string;
  onSuccess: (receiptCode: string) => void;
  onFailure: (errorMsg: string) => void;
}

export function MpesaModal({
  isOpen,
  onClose,
  phone,
  amount,
  orderNumber,
  onSuccess,
  onFailure,
}: MpesaPaymentProps) {
  const [step, setStep] = useState<"PROMPT" | "WAITING" | "SUCCESS" | "FAILED" | "TIMED_OUT">("PROMPT");
  const [countdown, setCountdown] = useState(30);
  const [receiptCode, setReceiptCode] = useState("");
  const [inputPhone, setInputPhone] = useState(phone);

  const [checkoutId, setCheckoutId] = useState<string>("");
  const [errorMessage, setErrorMessage] = useState<string>("");
  const [isInitiating, setIsInitiating] = useState<boolean>(false);

  useEffect(() => {
    if (isOpen) {
      setStep("PROMPT");
      setCountdown(45);
      setInputPhone(phone);
      setErrorMessage("");
      setCheckoutId("");
    }
  }, [isOpen, phone]);

  // Real Polling Effect when WAITING
  useEffect(() => {
    let pollInterval: any;
    let countdownInterval: any;

    if (step === "WAITING" && checkoutId) {
      // 1. Countdown timer
      countdownInterval = setInterval(() => {
        setCountdown((prev) => {
          if (prev <= 1) {
            clearInterval(countdownInterval);
            clearInterval(pollInterval);
            setStep("TIMED_OUT");
            return 0;
          }
          return prev - 1;
        });
      }, 1000);

      // 2. Poll transaction status
      pollInterval = setInterval(async () => {
        try {
          const res = await fetch(`/api/mpesa/query?checkoutRequestId=${encodeURIComponent(checkoutId)}`);
          if (res.ok) {
            const data = await res.json();
            const status = data.status || data.transaction?.status;
            const receipt = data.mpesaReceiptNumber || data.transaction?.mpesaReceiptNumber;

            if (status === "COMPLETED" && receipt) {
              clearInterval(pollInterval);
              clearInterval(countdownInterval);
              setReceiptCode(receipt);
              setStep("SUCCESS");
              try {
                confetti({ particleCount: 90, spread: 70, origin: { y: 0.6 } });
              } catch (e) {}
              setTimeout(() => onSuccess(receipt), 2000);
            } else if (status === "CANCELLED") {
              clearInterval(pollInterval);
              clearInterval(countdownInterval);
              setErrorMessage("Transaction was cancelled on the phone.");
              setStep("FAILED");
              onFailure("Payment cancelled on phone.");
            } else if (status === "FAILED") {
              clearInterval(pollInterval);
              clearInterval(countdownInterval);
              setErrorMessage(data.resultDesc || data.transaction?.resultDesc || "Payment failed or incorrect PIN entered.");
              setStep("FAILED");
              onFailure(data.resultDesc || data.transaction?.resultDesc || "Payment failed.");
            }
          }
        } catch (e) {
          console.warn("Poll error:", e);
        }
      }, 2500);
    }

    return () => {
      if (pollInterval) clearInterval(pollInterval);
      if (countdownInterval) clearInterval(countdownInterval);
    };
  }, [step, checkoutId, onSuccess, onFailure]);

  const handleSendSTK = async () => {
    setIsInitiating(true);
    setErrorMessage("");

    try {
      const res = await fetch("/api/mpesa/stkpush", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          phoneNumber: inputPhone,
          amount,
          accountReference: orderNumber,
          transactionDesc: `Order ${orderNumber}`,
          purpose: "PRODUCT_PURCHASE",
        }),
      });

      const data = await res.json();
      setIsInitiating(false);

      if (!res.ok || !data.success) {
        setErrorMessage(data.error || "Failed to initiate M-Pesa STK push.");
        return;
      }

      setCheckoutId(data.checkoutRequestId);
      setStep("WAITING");
      setCountdown(45);
    } catch (err: any) {
      setIsInitiating(false);
      setErrorMessage(err.message || "Network error initiating M-Pesa payment.");
    }
  };

  // Helper for testing environments without live Safaricom SIM card
  const handleSimulateSandboxCallback = async () => {
    if (!checkoutId) return;
    try {
      const receipt = `QKH${Math.floor(100000 + Math.random() * 900000)}A`;
      await fetch("/api/mpesa/callback", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          Body: {
            stkCallback: {
              MerchantRequestID: `MR-${Date.now()}`,
              CheckoutRequestID: checkoutId,
              ResultCode: 0,
              ResultDesc: "The service request is processed successfully.",
              CallbackMetadata: {
                Item: [
                  { Name: "Amount", Value: amount },
                  { Name: "MpesaReceiptNumber", Value: receipt },
                  { Name: "TransactionDate", Value: "20260904120000" },
                  { Name: "PhoneNumber", Value: inputPhone },
                ],
              },
            },
          },
        }),
      });
    } catch (e) {
      console.warn("Callback simulation error:", e);
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} maxWidth="md">
      <div className="space-y-6 text-center">
        {/* Safaricom M-Pesa Header */}
        <div className="flex items-center justify-between border-b border-border pb-3">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-emerald-600 text-white flex items-center justify-center font-black text-xs">
              M
            </div>
            <div className="text-left">
              <h3 className="font-bold text-sm text-foreground">Lipa na M-Pesa Online</h3>
              <p className="text-[10px] text-muted-foreground">Safaricom Daraja 2.0 STK Push</p>
            </div>
          </div>
          <span className="text-xs font-black text-brand-emerald bg-emerald-50 dark:bg-emerald-950/60 px-2.5 py-1 rounded-full border border-emerald-200">
            {formatKSh(amount)}
          </span>
        </div>

        {/* State 1: Prompt Confirmation & Phone input */}
        {step === "PROMPT" && (
          <div className="space-y-4 py-2">
            <div className="w-16 h-16 rounded-3xl bg-emerald-100 dark:bg-emerald-950/60 text-emerald-600 flex items-center justify-center mx-auto">
              <Smartphone className="w-8 h-8" />
            </div>

            <div className="space-y-1">
              <h4 className="font-bold text-base text-foreground">Enter M-Pesa Phone Number</h4>
              <p className="text-xs text-muted-foreground max-w-xs mx-auto leading-relaxed">
                We will send an instant Safaricom STK prompt to your Safaricom SIM card to complete payment.
              </p>
            </div>

            <div className="max-w-xs mx-auto text-left space-y-1.5">
              <label className="text-xs font-bold text-foreground">M-Pesa Phone Number</label>
              <input
                type="tel"
                value={inputPhone}
                onChange={(e) => setInputPhone(e.target.value)}
                placeholder="07XX XXX XXX or 2547..."
                className="w-full px-3 py-2.5 rounded-xl border border-border bg-white dark:bg-brand-dark-card text-foreground text-sm font-semibold focus:outline-none focus:border-brand-emerald"
              />
            </div>

            <div className="p-3 bg-muted/40 dark:bg-brand-dark-bg/60 rounded-xl text-left text-xs space-y-1.5 border border-border">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Merchant:</span>
                <span className="font-bold text-foreground">VENDLEX KENYA</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Order Ref:</span>
                <span className="font-mono text-foreground font-semibold">{orderNumber}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Amount:</span>
                <span className="font-bold text-brand-emerald">{formatKSh(amount)}</span>
              </div>
            </div>

            {errorMessage && (
              <div className="p-2.5 bg-red-50 dark:bg-red-950/50 border border-red-200 text-brand-red rounded-xl text-xs font-semibold">
                {errorMessage}
              </div>
            )}

            <button
              onClick={handleSendSTK}
              disabled={isInitiating}
              className="w-full bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 text-white font-black py-3.5 rounded-xl text-xs sm:text-sm shadow-md transition-all flex items-center justify-center gap-2"
            >
              <span>{isInitiating ? "Initiating STK..." : "Send STK Push"}</span>
            </button>
          </div>
        )}

        {/* State 2: Waiting for payment... */}
        {step === "WAITING" && (
          <div className="space-y-5 py-4">
            <div className="relative w-20 h-20 mx-auto">
              <div className="absolute inset-0 rounded-full border-4 border-emerald-200 border-t-emerald-600 animate-spin" />
              <div className="w-full h-full rounded-full flex items-center justify-center text-sm font-black text-emerald-600 font-mono">
                {countdown}s
              </div>
            </div>

            <div className="space-y-2">
              <h4 className="font-extrabold text-base text-foreground">
                Waiting for payment...
              </h4>
              <p className="text-xs text-muted-foreground max-w-sm mx-auto leading-relaxed">
                Check your phone screen now and enter your 4-digit M-Pesa PIN to authorize payment of <strong className="text-foreground">{formatKSh(amount)}</strong>.
              </p>
            </div>

            <div className="p-3 rounded-xl bg-amber-50 dark:bg-amber-950/40 border border-amber-200 text-xs text-amber-800 dark:text-amber-300 text-left flex items-start gap-2">
              <ShieldCheck className="w-4 h-4 shrink-0 mt-0.5" />
              <span>
                Do not share your M-Pesa PIN with anyone. VendLex never stores or asks for your private PIN.
              </span>
            </div>

            <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
              <button
                type="button"
                onClick={handleSimulateSandboxCallback}
                className="text-xs bg-emerald-50 dark:bg-emerald-950/50 border border-brand-emerald text-brand-emerald font-bold py-1.5 px-3 rounded-lg hover:bg-brand-emerald hover:text-white transition-colors"
                title="Simulate Safaricom callback on sandbox"
              >
                ⚡ Approve Sandbox PIN (Dev/Test)
              </button>

              <button
                type="button"
                onClick={() => setStep("TIMED_OUT")}
                className="text-xs text-muted-foreground hover:text-foreground underline"
              >
                Cancel or report timeout
              </button>
            </div>
          </div>
        )}

        {/* State 3: Payment successful ✓ */}
        {step === "SUCCESS" && (
          <div className="space-y-4 py-4 animate-scaleUp">
            <div className="w-16 h-16 rounded-full bg-emerald-100 text-brand-emerald flex items-center justify-center mx-auto animate-bounce">
              <CheckCircle2 className="w-10 h-10" />
            </div>

            <div className="space-y-1">
              <h4 className="font-black text-lg text-foreground">
                Payment successful ✓
              </h4>
              <p className="text-xs text-muted-foreground">
                M-Pesa Receipt Code: <strong className="font-mono text-foreground">{receiptCode}</strong>
              </p>
            </div>

            <p className="text-xs text-emerald-600 font-semibold">
              Redirecting to your order confirmation receipt...
            </p>
          </div>
        )}

        {/* State 4: Payment failed */}
        {step === "FAILED" && (
          <div className="space-y-4 py-4 animate-scaleUp">
            <div className="w-16 h-16 rounded-full bg-red-100 text-brand-red flex items-center justify-center mx-auto">
              <AlertCircle className="w-10 h-10" />
            </div>
            <h4 className="font-bold text-foreground">Payment failed</h4>
            <p className="text-xs text-muted-foreground">The transaction could not be completed by Safaricom.</p>
            <button
              onClick={() => setStep("PROMPT")}
              className="bg-brand-emerald text-white font-bold px-5 py-2.5 rounded-xl text-xs"
            >
              Try again
            </button>
          </div>
        )}

        {/* State 5: Payment timed out */}
        {step === "TIMED_OUT" && (
          <div className="space-y-4 py-4 animate-scaleUp">
            <div className="w-16 h-16 rounded-full bg-amber-100 text-amber-600 flex items-center justify-center mx-auto">
              <Clock className="w-10 h-10" />
            </div>
            <h4 className="font-bold text-foreground">Payment timed out</h4>
            <p className="text-xs text-muted-foreground">The M-Pesa prompt request timed out before confirmation.</p>
            <button
              onClick={() => setStep("PROMPT")}
              className="bg-brand-emerald text-white font-bold px-5 py-2.5 rounded-xl text-xs"
            >
              Try again
            </button>
          </div>
        )}
      </div>
    </Modal>
  );
}
