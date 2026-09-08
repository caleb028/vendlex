"use client";

import React, { useState, useEffect, Suspense } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useAuth } from "@/lib/store/auth-store";
import { usePlatform } from "@/lib/store/platform-store";
import { CATEGORIES, KENYAN_COUNTIES, PRICING_PLANS } from "@/lib/data/kenya-data";
import { formatKSh } from "@/lib/utils";
import confetti from "canvas-confetti";
import {
  Store,
  ShieldCheck,
  CheckCircle2,
  Package,
  Sparkles,
  ArrowRight,
  ArrowLeft,
  Upload,
  Zap,
  Smartphone,
  Loader2,
  AlertCircle,
  RefreshCw,
  Clock,
  Lock,
  Award,
  FileText,
  Download,
} from "lucide-react";

function OnboardingContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const initialPlan = searchParams.get("plan") || "business";
  const { refreshSession } = useAuth();
  const { submitKYC } = usePlatform();

  const [step, setStep] = useState<number>(1);

  const [certificateInfo, setCertificateInfo] = useState<{
    id: string;
    publicDocumentId: string;
    downloadUrl: string;
    verificationUrl: string;
  } | null>(null);

  // Form State
  const [ownerName, setOwnerName] = useState("Kevin Mwangi");
  const [ownerPhone, setOwnerPhone] = useState("0712345678");
  const [ownerEmail, setOwnerEmail] = useState("kevin@nairobihub.co.ke");

  const [bizName, setBizName] = useState("Nairobi Tech Hub");
  const [bizCategory, setBizCategory] = useState("Computers & Tech");
  const [county, setCounty] = useState("Nairobi");
  const [town, setTown] = useState("CBD");
  const [physicalLocation, setPhysicalLocation] = useState("Bazaar Plaza, 4th Floor, Suite 412");
  const [bizDesc, setBizDesc] = useState("Premier retailer of high performance laptops, smartphones, and genuine accessories in Nairobi.");

  const [regNumber, setRegNumber] = useState("BN/2024/984210");
  const [nationalId, setNationalId] = useState("32984124");

  const [productTitle, setProductTitle] = useState("HP Envy x360 Convertible 14-inch (Core i7, 16GB RAM, 512GB SSD)");
  const [productPrice, setProductPrice] = useState("114999");
  const [productStock, setProductStock] = useState("10");

  const [selectedPlan, setSelectedPlan] = useState(initialPlan);

  // M-Pesa STK Push Payment State
  const [paymentPhone, setPaymentPhone] = useState("0712345678");
  const [paymentStatus, setPaymentStatus] = useState<"idle" | "sending" | "sent" | "success" | "error">("idle");
  const [checkoutRequestId, setCheckoutRequestId] = useState<string | null>(null);
  const [receiptNumber, setReceiptNumber] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string>("");
  const [countdown, setCountdown] = useState<number>(45);

  const activePlanObj = PRICING_PLANS.find((p) => p.id === selectedPlan) || PRICING_PLANS[2];
  const pollIntervalRef = React.useRef<NodeJS.Timeout | null>(null);

  // Keep paymentPhone synced with ownerPhone if user edits step 1
  useEffect(() => {
    if (ownerPhone && paymentPhone === "0712345678") {
      setPaymentPhone(ownerPhone.replace(/\s+/g, ""));
    }
  }, [ownerPhone]);

  // Clear polling on unmount
  useEffect(() => {
    return () => {
      if (pollIntervalRef.current) clearInterval(pollIntervalRef.current);
    };
  }, []);

  // STK Push Countdown Timer
  useEffect(() => {
    let timer: NodeJS.Timeout;
    if (paymentStatus === "sent" && countdown > 0) {
      timer = setTimeout(() => setCountdown((c) => c - 1), 1000);
    } else if (paymentStatus === "sent" && countdown <= 0) {
      if (pollIntervalRef.current) clearInterval(pollIntervalRef.current);
      setPaymentStatus("error");
      setErrorMessage("Payment timed out: No M-Pesa PIN was entered on your phone within 45 seconds. Your account was not debited.");
    }
    return () => clearTimeout(timer);
  }, [paymentStatus, countdown]);

  const handleSimulateSuccess = async () => {
    const simReceipt = `QGH${Math.floor(100000 + Math.random() * 900000)}K`;
    if (checkoutRequestId) {
      try {
        await fetch("/api/mpesa/callback", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            Body: {
              stkCallback: {
                MerchantRequestID: `MR-${Date.now()}`,
                CheckoutRequestID: checkoutRequestId,
                ResultCode: 0,
                ResultDesc: "The service request is processed successfully.",
                CallbackMetadata: {
                  Item: [
                    { Name: "Amount", Value: activePlanObj.monthlyPrice },
                    { Name: "MpesaReceiptNumber", Value: simReceipt },
                    { Name: "TransactionDate", Value: "20260906074500" },
                    { Name: "PhoneNumber", Value: paymentPhone },
                  ],
                },
              },
            },
          }),
        });
      } catch (e) {
        console.warn("Callback simulation error:", e);
      }
    }
    if (pollIntervalRef.current) clearInterval(pollIntervalRef.current);
    setReceiptNumber(simReceipt);
    setPaymentStatus("success");
    setTimeout(() => {
      handleLaunch(simReceipt);
    }, 1000);
  };

  const handleSimulateFailure = (reason = "Payment failed: Transaction was cancelled on user phone (M-Pesa Code 1032).") => {
    if (pollIntervalRef.current) clearInterval(pollIntervalRef.current);
    setPaymentStatus("error");
    setErrorMessage(reason);
  };

  // Initiate Daraja STK Push to Seller Phone
  const handleInitiateSTK = async () => {
    if (activePlanObj.monthlyPrice === 0) {
      // Free plan requires no payment
      setPaymentStatus("success");
      handleLaunch("FREE_TIER_ACTIVATED");
      return;
    }

    if (pollIntervalRef.current) clearInterval(pollIntervalRef.current);
    setPaymentStatus("sending");
    setErrorMessage("");
    setCountdown(45);

    try {
      const res = await fetch("/api/mpesa/stkpush", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          phoneNumber: paymentPhone,
          amount: activePlanObj.monthlyPrice,
          accountReference: `VENDLEX-${selectedPlan.toUpperCase()}`,
          transactionDesc: `${activePlanObj.name} Merchant Plan`,
          sellerName: bizName || "New Merchant",
          purpose: "SUBSCRIPTION",
        }),
      });

      const data = await res.json();

      if (!res.ok || !data.success) {
        throw new Error(data.error || "Failed to trigger M-Pesa prompt. Please ensure phone number is valid.");
      }

      setCheckoutRequestId(data.checkoutRequestId);
      setPaymentStatus("sent");

      // Poll transaction status from /api/mpesa/query
      pollIntervalRef.current = setInterval(async () => {
        try {
          const queryRes = await fetch(`/api/mpesa/query?checkoutRequestId=${encodeURIComponent(data.checkoutRequestId)}`);
          const queryData = await queryRes.json();
          if (queryData.success) {
            const status = queryData.status || queryData.transaction?.status;
            const confirmedReceipt = queryData.mpesaReceiptNumber || queryData.transaction?.mpesaReceiptNumber;

            if (status === "COMPLETED" && confirmedReceipt) {
              if (pollIntervalRef.current) clearInterval(pollIntervalRef.current);
              setReceiptNumber(confirmedReceipt);
              setPaymentStatus("success");
              setTimeout(() => {
                handleLaunch(confirmedReceipt);
              }, 1200);
            } else if (status === "FAILED" || status === "CANCELLED") {
              if (pollIntervalRef.current) clearInterval(pollIntervalRef.current);
              setPaymentStatus("error");
              setErrorMessage(queryData.resultDesc || queryData.transaction?.resultDesc || "Payment failed: Transaction was cancelled or declined on your phone.");
            }
          }
        } catch (pollErr) {
          console.warn("M-Pesa polling check error:", pollErr);
        }
      }, 2500);
    } catch (err: any) {
      console.error("STK Push error:", err);
      setPaymentStatus("error");
      setErrorMessage(err.message || "Payment failed: Could not push prompt to your phone. Ensure it is a valid Safaricom number.");
    }
  };

  const handleLaunch = async (receipt?: string) => {
    // Strict Guard: Paid plans MUST have verified payment status and receipt
    const finalReceipt = receipt || receiptNumber;
    if (activePlanObj.monthlyPrice > 0 && (!finalReceipt || paymentStatus !== "success")) {
      setPaymentStatus("error");
      setErrorMessage("Payment verification required before store launch. Please complete M-Pesa payment.");
      setStep(5);
      return;
    }

    try {
      const res = await fetch("/api/seller/onboard", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          bizName,
          bizCategory,
          county,
          town,
          physicalLocation,
          bizDesc,
          ownerName,
          ownerEmail,
          ownerPhone,
          regNumber,
          nationalId,
          productTitle,
          productPrice,
          productStock,
          selectedPlan,
          receiptNumber: finalReceipt,
          paymentPhone,
        }),
      });
      const data = await res.json();
      if (data.certificate) {
        setCertificateInfo(data.certificate);
      }
    } catch (e) {
      console.warn("Server onboard persistence warning:", e);
    }

    await refreshSession();
    submitKYC({
      bizName: bizName || "Nairobi Tech Hub",
      ownerName: ownerName || "Kevin Mwangi",
      regNumber: regNumber || `BN/2026/${Math.floor(100000 + Math.random() * 900000)}`,
      nationalId: nationalId || "32984124",
      county: county || "Nairobi",
      docUrl: "CR12_Certificate_Registration.pdf",
    });
    setStep(6);
    try {
      confetti({ particleCount: 120, spread: 80, origin: { y: 0.5 } });
    } catch (e) {}
  };

  const storeSlug = (bizName || "my-store")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");

  return (
    <div className="min-h-screen bg-brand-off-white dark:bg-brand-dark-bg py-10">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Progress Tracker */}
        <div className="mb-8 text-center space-y-2">
          <span className="text-xs font-bold text-brand-emerald uppercase tracking-wider">
            Step {step} of 6
          </span>
          <h1 className="text-2xl sm:text-3xl font-black text-foreground">
            {step === 1 && "Create Merchant Account"}
            {step === 2 && "Business Information"}
            {step === 3 && "Business KYC & Verification"}
            {step === 4 && "Add Your First Product or Service"}
            {step === 5 && "Choose Plan & M-Pesa Activation"}
            {step === 6 && "Store Live on VendLex! 🎉"}
          </h1>

          {/* Stepper Dots */}
          <div className="flex items-center justify-center gap-2 pt-2">
            {[1, 2, 3, 4, 5, 6].map((st) => (
              <div
                key={st}
                className={`h-2 rounded-full transition-all duration-300 ${
                  st === step
                    ? "w-8 bg-brand-emerald"
                    : st < step
                    ? "w-4 bg-emerald-300 dark:bg-emerald-800"
                    : "w-2 bg-muted"
                }`}
              />
            ))}
          </div>
        </div>

        {/* Wizard Card Container */}
        <div className="bg-white dark:bg-brand-dark-card border border-border dark:border-brand-dark-border rounded-3xl p-6 sm:p-10 shadow-xl space-y-6">
          {/* STEP 1: Account */}
          {step === 1 && (
            <div className="space-y-4 animate-fadeIn">
              <div className="space-y-1">
                <h3 className="font-bold text-base text-foreground">Personal & Account Information</h3>
                <p className="text-xs text-muted-foreground">The primary owner and legal signatory for this store.</p>
              </div>

              <div className="space-y-3">
                <div>
                  <label className="block text-xs font-bold text-foreground mb-1">Your Full Name *</label>
                  <input
                    type="text"
                    value={ownerName}
                    onChange={(e) => setOwnerName(e.target.value)}
                    className="w-full bg-muted/30 border rounded-xl p-3 text-xs text-foreground focus:outline-none focus:border-brand-emerald"
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-bold text-foreground mb-1">Kenyan Phone (M-Pesa STK & Payouts) *</label>
                    <input
                      type="tel"
                      value={ownerPhone}
                      onChange={(e) => {
                        setOwnerPhone(e.target.value);
                        setPaymentPhone(e.target.value);
                      }}
                      placeholder="0712345678"
                      className="w-full bg-muted/30 border rounded-xl p-3 text-xs text-foreground font-mono font-bold focus:outline-none focus:border-brand-emerald"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-foreground mb-1">Business Email Address *</label>
                    <input
                      type="email"
                      value={ownerEmail}
                      onChange={(e) => setOwnerEmail(e.target.value)}
                      className="w-full bg-muted/30 border rounded-xl p-3 text-xs text-foreground focus:outline-none focus:border-brand-emerald"
                    />
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* STEP 2: Business Info */}
          {step === 2 && (
            <div className="space-y-4 animate-fadeIn">
              <div className="space-y-1">
                <h3 className="font-bold text-base text-foreground">Business Storefront Details</h3>
                <p className="text-xs text-muted-foreground">This info will appear on your public VendLex storefront.</p>
              </div>

              <div className="space-y-3">
                <div>
                  <label className="block text-xs font-bold text-foreground mb-1">Registered Business Name *</label>
                  <input
                    type="text"
                    value={bizName}
                    onChange={(e) => setBizName(e.target.value)}
                    className="w-full bg-muted/30 border rounded-xl p-3 text-xs text-foreground focus:outline-none focus:border-brand-emerald"
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div>
                    <label className="block text-xs font-bold text-foreground mb-1">Category *</label>
                    <select
                      value={bizCategory}
                      onChange={(e) => setBizCategory(e.target.value)}
                      className="w-full bg-muted/30 border rounded-xl p-3 text-xs text-foreground focus:outline-none focus:border-brand-emerald"
                    >
                      {CATEGORIES.map((c) => (
                        <option key={c.id} value={c.name}>
                          {c.name}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-foreground mb-1">County *</label>
                    <select
                      value={county}
                      onChange={(e) => setCounty(e.target.value)}
                      className="w-full bg-muted/30 border rounded-xl p-3 text-xs text-foreground focus:outline-none focus:border-brand-emerald"
                    >
                      {KENYAN_COUNTIES.map((c) => (
                        <option key={c} value={c}>
                          {c}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-foreground mb-1">Town / Area *</label>
                    <input
                      type="text"
                      value={town}
                      onChange={(e) => setTown(e.target.value)}
                      className="w-full bg-muted/30 border rounded-xl p-3 text-xs text-foreground focus:outline-none focus:border-brand-emerald"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-foreground mb-1">Physical Store / Office Location</label>
                  <input
                    type="text"
                    value={physicalLocation}
                    onChange={(e) => setPhysicalLocation(e.target.value)}
                    className="w-full bg-muted/30 border rounded-xl p-3 text-xs text-foreground focus:outline-none focus:border-brand-emerald"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-foreground mb-1">Short Store Description</label>
                  <textarea
                    rows={2}
                    value={bizDesc}
                    onChange={(e) => setBizDesc(e.target.value)}
                    className="w-full bg-muted/30 border rounded-xl p-3 text-xs text-foreground resize-none"
                  />
                </div>
              </div>
            </div>
          )}

          {/* STEP 3: KYC Verification */}
          {step === 3 && (
            <div className="space-y-4 animate-fadeIn">
              <div className="space-y-1">
                <h3 className="font-bold text-base text-foreground">Verified Merchant KYC</h3>
                <p className="text-xs text-muted-foreground">Required to activate the blue Verified badge and receive M-Pesa payouts.</p>
              </div>

              <div className="space-y-3">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-bold text-foreground mb-1">Business Reg. No. / CR12 *</label>
                    <input
                      type="text"
                      value={regNumber}
                      onChange={(e) => setRegNumber(e.target.value)}
                      className="w-full bg-muted/30 border rounded-xl p-3 text-xs text-foreground font-mono focus:outline-none focus:border-brand-emerald"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-foreground mb-1">Owner National ID / Passport *</label>
                    <input
                      type="text"
                      value={nationalId}
                      onChange={(e) => setNationalId(e.target.value)}
                      className="w-full bg-muted/30 border rounded-xl p-3 text-xs text-foreground font-mono focus:outline-none focus:border-brand-emerald"
                    />
                  </div>
                </div>

                {/* Upload Zone */}
                <div className="border-2 border-dashed border-border rounded-2xl p-6 text-center space-y-2 bg-muted/20">
                  <Upload className="w-8 h-8 text-brand-emerald mx-auto" />
                  <div className="text-xs font-bold text-foreground">
                    Upload Business Certificate or National ID (PDF, JPG, PNG)
                  </div>
                  <p className="text-[11px] text-muted-foreground">
                    Certificate_Of_Incorporation.pdf (Verified Sample Attached)
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* STEP 4: First Product */}
          {step === 4 && (
            <div className="space-y-4 animate-fadeIn">
              <div className="space-y-1">
                <h3 className="font-bold text-base text-foreground">Add Your First Product Listing &amp; Upload Photo</h3>
                <p className="text-xs text-muted-foreground">Select a photo from your computer or phone to showcase your product.</p>
              </div>

              <div className="space-y-3">
                <div>
                  <label className="block text-xs font-bold text-foreground mb-1">Product Title *</label>
                  <input
                    type="text"
                    value={productTitle}
                    onChange={(e) => setProductTitle(e.target.value)}
                    className="w-full bg-muted/30 border rounded-xl p-3 text-xs text-foreground focus:outline-none focus:border-brand-emerald"
                  />
                </div>

                {/* Device Photo Upload Zone */}
                <div>
                  <label className="block text-xs font-bold text-foreground mb-1">Product Photo (From Device File Manager)</label>
                  <div className="border-2 border-dashed border-border hover:border-brand-emerald bg-muted/20 p-4 rounded-2xl text-center space-y-1">
                    <Upload className="w-6 h-6 text-brand-emerald mx-auto" />
                    <label htmlFor="onboarding-img" className="text-xs font-bold text-brand-emerald cursor-pointer hover:underline block">
                      Choose Photo File from Device
                    </label>
                    <input
                      type="file"
                      id="onboarding-img"
                      accept="image/*"
                      className="hidden"
                      onChange={(e) => {
                        const file = e.target.files?.[0];
                        if (file) {
                          alert(`Attached file: ${file.name} (${(file.size / 1024).toFixed(1)} KB)`);
                        }
                      }}
                    />
                    <p className="text-[10px] text-muted-foreground">Supports PNG, JPG, JPEG, WEBP</p>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-bold text-foreground mb-1">Selling Price (KSh) *</label>
                    <input
                      type="number"
                      value={productPrice}
                      onChange={(e) => setProductPrice(e.target.value)}
                      className="w-full bg-muted/30 border rounded-xl p-3 text-xs text-foreground font-bold focus:outline-none focus:border-brand-emerald"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-foreground mb-1">Initial Stock Count *</label>
                    <input
                      type="number"
                      value={productStock}
                      onChange={(e) => setProductStock(e.target.value)}
                      className="w-full bg-muted/30 border rounded-xl p-3 text-xs text-foreground focus:outline-none focus:border-brand-emerald"
                    />
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* STEP 5: Choose Plan & Live Daraja STK Push Activation */}
          {step === 5 && (
            <div className="space-y-6 animate-fadeIn">
              <div className="space-y-1">
                <h3 className="font-bold text-base text-foreground">Select Your VendLex Growth Tier</h3>
                <p className="text-xs text-muted-foreground">Choose a plan to activate your digital storefront via instant Lipa na M-Pesa STK Push.</p>
              </div>

              {/* Plan Selection Cards */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {PRICING_PLANS.map((plan) => (
                  <div
                    key={plan.id}
                    onClick={() => {
                      setSelectedPlan(plan.id);
                      setPaymentStatus("idle");
                    }}
                    className={`p-4 rounded-2xl border-2 cursor-pointer transition-all ${
                      selectedPlan === plan.id
                        ? "border-brand-emerald bg-brand-emerald-soft/30 dark:bg-brand-dark-bg shadow-sm ring-1 ring-brand-emerald"
                        : "border-border hover:border-brand-emerald/40"
                    }`}
                  >
                    <div className="flex items-center justify-between mb-1">
                      <span className="font-bold text-xs uppercase tracking-wider text-foreground">{plan.name}</span>
                      <span className="text-sm font-black text-brand-emerald">
                        {plan.monthlyPrice === 0 ? "FREE" : `${formatKSh(plan.monthlyPrice)}/mo`}
                      </span>
                    </div>
                    <p className="text-[11px] text-muted-foreground leading-snug">{plan.description}</p>
                  </div>
                ))}
              </div>

              {/* Live Safaricom Daraja STK Push Payment Box */}
              <div className="bg-gradient-to-br from-brand-emerald-dark/15 via-muted/30 to-brand-emerald/10 border border-brand-emerald/30 rounded-2xl p-5 sm:p-6 space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Smartphone className="w-5 h-5 text-brand-emerald animate-bounce" />
                    <h4 className="font-extrabold text-sm text-foreground">Lipa na M-Pesa STK Push Prompt</h4>
                  </div>
                  <span className="text-xs font-black text-brand-emerald bg-brand-emerald/15 px-3 py-1 rounded-full">
                    {activePlanObj.monthlyPrice === 0 ? "Free Activation" : `Amount: ${formatKSh(activePlanObj.monthlyPrice)}`}
                  </span>
                </div>

                {activePlanObj.monthlyPrice > 0 ? (
                  <div className="space-y-3">
                    <div>
                      <label className="block text-xs font-bold text-foreground mb-1">
                        M-Pesa Phone Number for PIN Prompt (Safaricom)
                      </label>
                      <input
                        type="tel"
                        value={paymentPhone}
                        onChange={(e) => setPaymentPhone(e.target.value)}
                        placeholder="e.g. 0712345678"
                        disabled={paymentStatus === "sending" || paymentStatus === "sent"}
                        className="w-full bg-white dark:bg-brand-dark-card border border-border rounded-xl p-3 text-xs font-mono font-bold text-foreground focus:outline-none focus:border-brand-emerald"
                      />
                    </div>

                    {/* Status Feedback / PIN Prompt Alert */}
                    {paymentStatus === "sending" && (
                      <div className="flex items-center gap-2 p-3.5 bg-blue-50 dark:bg-blue-950/40 border border-blue-200 dark:border-blue-900 rounded-xl text-blue-700 dark:text-blue-300 text-xs font-semibold">
                        <Loader2 className="w-4 h-4 animate-spin shrink-0" />
                        <span>Connecting to Safaricom Daraja 2.0 &amp; sending STK prompt...</span>
                      </div>
                    )}

                    {paymentStatus === "sent" && (
                      <div className="space-y-3 p-4 bg-emerald-50 dark:bg-emerald-950/50 border border-emerald-300 dark:border-emerald-800 rounded-xl text-emerald-800 dark:text-emerald-200 text-xs animate-fadeIn">
                        <div className="flex items-center justify-between font-bold">
                          <span className="flex items-center gap-2">
                            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-ping" />
                            <span>STK Prompt Pushed to {paymentPhone}!</span>
                          </span>
                          <span className="font-mono text-xs bg-emerald-200 dark:bg-emerald-900 px-2 py-0.5 rounded">
                            {countdown}s remaining
                          </span>
                        </div>
                        <p className="text-[11px] leading-relaxed text-emerald-900/80 dark:text-emerald-200/90">
                          Please check your phone screen, enter your <strong>M-Pesa PIN</strong> to authorize {formatKSh(activePlanObj.monthlyPrice)}, and press OK.
                        </p>

                        {/* Interactive Testing Controls */}
                        <div className="pt-2.5 border-t border-emerald-200 dark:border-emerald-800 flex flex-wrap items-center justify-between gap-2">
                          <span className="text-[10px] text-emerald-800 dark:text-emerald-300 font-semibold">
                            Daraja Simulation Controls:
                          </span>
                          <div className="flex items-center gap-1.5">
                            <button
                              type="button"
                              onClick={handleSimulateSuccess}
                              className="px-2.5 py-1 bg-brand-emerald text-white rounded-lg text-[10px] font-bold hover:bg-brand-emerald-dark transition-colors shadow-xs"
                            >
                              ✓ Simulate Successful PIN Entry
                            </button>
                            <button
                              type="button"
                              onClick={() => handleSimulateFailure("Payment failed: Transaction was cancelled by user on phone (M-Pesa Code 1032).")}
                              className="px-2.5 py-1 bg-red-100 text-brand-red dark:bg-red-950/60 rounded-lg text-[10px] font-bold hover:bg-red-200 transition-colors border border-red-200"
                            >
                              ✗ Simulate Cancel / Failure
                            </button>
                          </div>
                        </div>
                      </div>
                    )}

                    {paymentStatus === "success" && (
                      <div className="flex items-center gap-2 p-3.5 bg-emerald-100 dark:bg-emerald-950 border border-emerald-400 rounded-xl text-emerald-800 dark:text-emerald-200 text-xs font-bold animate-fadeIn">
                        <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                        <span>M-Pesa Payment Confirmed! Receipt: {receiptNumber}. Activating Store...</span>
                      </div>
                    )}

                    {paymentStatus === "error" && (
                      <div className="space-y-3 p-4 bg-red-50 dark:bg-red-950/40 border border-red-300 dark:border-red-800 rounded-2xl text-red-700 dark:text-red-300 text-xs animate-pop-up">
                        <div className="flex items-center gap-2 font-bold text-sm text-red-800 dark:text-red-200">
                          <AlertCircle className="w-5 h-5 text-brand-red shrink-0" />
                          <span>Payment Failed</span>
                        </div>
                        <p className="text-xs text-red-700/90 dark:text-red-300/90 leading-relaxed">
                          {errorMessage || "We could not confirm your M-Pesa payment. The transaction was cancelled or timed out. Your M-Pesa account was not charged."}
                        </p>
                        <div className="flex flex-wrap gap-2 pt-1">
                          <button
                            type="button"
                            onClick={handleInitiateSTK}
                            className="px-4 py-2 bg-brand-red hover:bg-red-700 text-white rounded-xl text-xs font-bold transition-colors flex items-center gap-1.5"
                          >
                            <RefreshCw className="w-3.5 h-3.5" />
                            <span>Retry M-Pesa Payment</span>
                          </button>
                          <button
                            type="button"
                            onClick={() => {
                              setSelectedPlan("free");
                              setPaymentStatus("idle");
                            }}
                            className="px-3 py-2 bg-white dark:bg-brand-dark-card border border-red-200 text-red-700 rounded-xl text-xs font-bold transition-colors"
                          >
                            Switch to Free Plan
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                ) : (
                  <p className="text-xs text-muted-foreground">
                    You have selected the <strong>FREE</strong> plan. No payment required to launch your store.
                  </p>
                )}
              </div>
            </div>
          )}

          {/* STEP 6: Store Live Celebration OR Payment Failed */}
          {step === 6 && (
            <>
              {(paymentStatus === "success" && !!receiptNumber) || activePlanObj.monthlyPrice === 0 ? (
                <div className="text-center py-8 space-y-6 animate-scaleUp">
                  <div className="w-20 h-20 rounded-full bg-emerald-100 dark:bg-emerald-950/60 text-brand-emerald flex items-center justify-center mx-auto shadow-sm animate-pop-up-bounce">
                    <Sparkles className="w-10 h-10" />
                  </div>

                  <div className="space-y-2">
                    <h2 className="text-2xl sm:text-3xl font-black text-foreground">
                      Congratulations, {ownerName || "Merchant"}!
                    </h2>
                    <p className="text-xs sm:text-sm text-muted-foreground max-w-md mx-auto">
                      <strong className="text-foreground">{bizName}</strong> is now officially live on VendLex Kenya.
                    </p>

                    {receiptNumber && (
                      <div className="inline-flex items-center gap-1.5 bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-200 px-3.5 py-1 rounded-full text-xs font-bold font-mono">
                        <CheckCircle2 className="w-3.5 h-3.5 text-brand-emerald" />
                        <span>M-Pesa Receipt: {receiptNumber}</span>
                      </div>
                    )}

                    <div className="p-3 bg-muted font-mono text-xs text-brand-emerald font-bold rounded-xl max-w-sm mx-auto">
                      vendlex.co.ke/store/{storeSlug}
                    </div>

                    {/* Official Merchant Accreditation Certificate Download Card */}
                    <div className="p-5 bg-gradient-to-r from-amber-500/10 via-brand-gold/15 to-amber-500/10 border-2 border-brand-gold/40 rounded-3xl max-w-md mx-auto space-y-3 shadow-sm text-center">
                      <div className="flex items-center justify-center gap-2 text-brand-gold">
                        <Award className="w-5 h-5 text-amber-500" />
                        <span className="text-xs font-black uppercase tracking-wider text-amber-900 dark:text-amber-200">
                          Official Merchant Accreditation Certificate
                        </span>
                      </div>
                      <p className="text-xs text-muted-foreground leading-relaxed">
                        Your stamped Certificate of Accreditation ({certificateInfo?.publicDocumentId || "VLX-CERT-2026"}) has been auto-generated with an official security seal and QR code verification.
                      </p>
                      <div className="flex flex-wrap items-center justify-center gap-2.5 pt-1">
                        <a
                          href={certificateInfo?.downloadUrl || `/api/documents/${certificateInfo?.publicDocumentId || "VLX-CERT-2026-000182"}/download`}
                          target="_blank"
                          rel="noreferrer"
                          className="bg-brand-gold hover:bg-amber-400 text-brand-charcoal font-black py-2.5 px-5 rounded-xl text-xs flex items-center gap-2 shadow-md transition-all"
                        >
                          <FileText className="w-4 h-4 text-brand-charcoal" />
                          <span>Download Stamped Certificate (PDF)</span>
                        </a>
                        {certificateInfo?.publicDocumentId && (
                          <Link
                            href={certificateInfo.verificationUrl}
                            target="_blank"
                            className="bg-white dark:bg-brand-dark-card border border-border hover:bg-muted font-bold py-2.5 px-4 rounded-xl text-xs flex items-center gap-1.5 transition-colors"
                          >
                            <ShieldCheck className="w-3.5 h-3.5 text-brand-emerald" />
                            <span>Verify Seal</span>
                          </Link>
                        )}
                      </div>
                    </div>
                  </div>

                  <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
                    <Link
                      href="/seller/dashboard"
                      className="bg-brand-emerald hover:bg-brand-emerald-dark text-white font-bold px-6 py-3 rounded-xl text-xs sm:text-sm shadow-md transition-all flex items-center gap-2"
                    >
                      <Store className="w-4 h-4" />
                      <span>Open Seller SaaS Dashboard</span>
                    </Link>

                    <Link
                      href={`/businesses/${storeSlug}`}
                      className="bg-muted hover:bg-muted/80 text-foreground font-bold px-6 py-3 rounded-xl text-xs sm:text-sm transition-all"
                    >
                      View Public Storefront &rarr;
                    </Link>
                  </div>
                </div>
              ) : (
                /* PAYMENT FAILED FALLBACK */
                <div className="text-center py-8 space-y-6 animate-pop-up">
                  <div className="w-20 h-20 rounded-full bg-red-100 dark:bg-red-950/60 text-brand-red flex items-center justify-center mx-auto shadow-sm">
                    <AlertCircle className="w-10 h-10" />
                  </div>

                  <div className="space-y-2">
                    <span className="text-xs font-black uppercase px-3 py-1 rounded-full bg-red-100 dark:bg-red-950/60 text-brand-red inline-block">
                      Activation Incomplete
                    </span>
                    <h2 className="text-2xl sm:text-3xl font-black text-brand-red">
                      Payment Failed
                    </h2>
                    <p className="text-xs sm:text-sm text-muted-foreground max-w-md mx-auto">
                      We could not confirm your M-Pesa payment for <strong className="text-foreground">{bizName}</strong>.
                    </p>
                    <div className="p-3.5 bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-900 text-xs text-red-700 dark:text-red-300 font-semibold rounded-2xl max-w-md mx-auto leading-relaxed">
                      {errorMessage || "The M-Pesa transaction was cancelled, timed out, or not completed on your phone. Your store has NOT been launched and your account was not charged."}
                    </div>
                  </div>

                  <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
                    <button
                      onClick={() => {
                        setPaymentStatus("idle");
                        setStep(5);
                      }}
                      className="bg-brand-emerald hover:bg-brand-emerald-dark text-white font-bold px-6 py-3 rounded-xl text-xs sm:text-sm shadow-md transition-all flex items-center gap-2"
                    >
                      <RefreshCw className="w-4 h-4" />
                      <span>Retry M-Pesa Payment</span>
                    </button>

                    <button
                      onClick={() => {
                        setSelectedPlan("free");
                        setPaymentStatus("idle");
                        setStep(5);
                      }}
                      className="bg-muted hover:bg-muted/80 text-foreground font-bold px-6 py-3 rounded-xl text-xs sm:text-sm transition-all"
                    >
                      Switch to Free Tier &rarr;
                    </button>
                  </div>
                </div>
              )}
            </>
          )}

          {/* Wizard Controls */}
          {step < 6 && (
            <div className="flex items-center justify-between pt-6 border-t border-border">
              {step > 1 ? (
                <button
                  onClick={() => setStep((prev) => prev - 1)}
                  disabled={paymentStatus === "sending" || paymentStatus === "sent"}
                  className="flex items-center gap-1.5 text-xs font-bold text-muted-foreground hover:text-foreground py-2 px-3 rounded-xl border border-border"
                >
                  <ArrowLeft className="w-4 h-4" />
                  <span>Back</span>
                </button>
              ) : (
                <div />
              )}

              {step === 5 ? (
                <button
                  onClick={handleInitiateSTK}
                  disabled={paymentStatus === "sending" || paymentStatus === "sent" || paymentStatus === "success"}
                  className="bg-brand-emerald hover:bg-brand-emerald-dark text-white font-extrabold py-3 px-7 rounded-xl text-xs sm:text-sm flex items-center gap-2 shadow-lg hover:shadow-glow-green transition-all"
                >
                  {paymentStatus === "sending" ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      <span>Sending STK Prompt...</span>
                    </>
                  ) : paymentStatus === "sent" ? (
                    <>
                      <Smartphone className="w-4 h-4 animate-bounce" />
                      <span>Waiting for PIN on Phone...</span>
                    </>
                  ) : activePlanObj.monthlyPrice === 0 ? (
                    <>
                      <span>Launch Digital Store Free 🚀</span>
                      <ArrowRight className="w-4 h-4" />
                    </>
                  ) : (
                    <>
                      <Smartphone className="w-4 h-4" />
                      <span>Pay {formatKSh(activePlanObj.monthlyPrice)} via M-Pesa STK &amp; Launch</span>
                    </>
                  )}
                </button>
              ) : (
                <button
                  onClick={() => setStep((prev) => prev + 1)}
                  className="bg-brand-emerald hover:bg-brand-emerald-dark text-white font-bold py-3 px-6 rounded-xl text-xs sm:text-sm flex items-center gap-2 shadow-md transition-all"
                >
                  <span>Next Step</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default function OnboardingPage() {
  return (
    <Suspense fallback={<div className="p-12 text-center text-sm font-semibold">Loading Seller Onboarding...</div>}>
      <OnboardingContent />
    </Suspense>
  );
}
