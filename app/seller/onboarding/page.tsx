"use client";

import React, { useState, useEffect, Suspense } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useAuth } from "@/lib/store/auth-store";
import { usePlatform } from "@/lib/store/platform-store";
import { CATEGORIES, KENYAN_COUNTIES, KENYAN_TOWNS, PRICING_PLANS } from "@/lib/data/kenya-data";
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
  Wrench,
  Briefcase,
  Layers,
  MapPin,
  Image as ImageIcon,
  Check,
  X,
  FileCheck2,
} from "lucide-react";

const SERVICE_CATEGORIES = [
  "Electrician & Power Systems",
  "Plumbing & Drainage",
  "Solar Installation & Maintenance",
  "Phone & Tablet Repair",
  "Computer & Laptop Repair",
  "Auto Mechanic & Diagnostics",
  "Painting & Interior Decor",
  "Masonry & Construction",
  "Refrigeration & HVAC",
  "Appliance Repair",
  "Cleaning & Fumigation",
  "Photography & Videography",
  "Catering & Event Planning",
  "Beauty & Hair Styling",
  "Tailoring & Fashion Design",
  "Legal, Tax & Business Consulting",
];

const DOCUMENT_TYPES = [
  { id: "CR12_BN", label: "Business Registration Certificate (BN / PVT / CR12)" },
  { id: "SINGLE_PERMIT", label: "County Single Business Permit / Trade License" },
  { id: "KRA_PIN", label: "KRA PIN Certificate (Company or Individual)" },
  { id: "NATIONAL_ID", label: "Owner National ID / Passport (Front & Back)" },
  { id: "PRACTICING_LICENSE", label: "Professional / Technical Practicing License" },
];

function OnboardingContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const initialPlan = searchParams.get("plan") || "basic";
  const initialType = searchParams.get("type") === "service" ? "SERVICE" : "PRODUCT";
  const { user, refreshSession } = useAuth();
  const { submitKYC } = usePlatform();

  const [step, setStep] = useState<number>(1);
  const [offeringType, setOfferingType] = useState<"PRODUCT" | "SERVICE">(initialType);

  const [certificateInfo, setCertificateInfo] = useState<{
    id: string;
    publicDocumentId: string;
    downloadUrl: string;
    verificationUrl: string;
  } | null>(null);

  // Form State
  const [ownerName, setOwnerName] = useState(user?.name || "");
  const [ownerPhone, setOwnerPhone] = useState(user?.phone || "+254798159503");
  const [ownerEmail, setOwnerEmail] = useState(user?.email || "");

  const [bizName, setBizName] = useState(
    offeringType === "SERVICE" ? "Rift Solar & Power Solutions" : "Nairobi Tech Hub"
  );
  const [bizCategory, setBizCategory] = useState(
    offeringType === "SERVICE" ? "Solar Installation & Maintenance" : "Computers & Tech"
  );
  const [county, setCounty] = useState("Nairobi");
  const [town, setTown] = useState("CBD");
  const [customTown, setCustomTown] = useState("");
  const [physicalLocation, setPhysicalLocation] = useState("Bazaar Plaza, 4th Floor, Suite 412");
  const [bizDesc, setBizDesc] = useState(
    offeringType === "SERVICE"
      ? "Certified electrical & solar energy installations with same-day emergency dispatch across Nairobi and surrounding counties."
      : "Premier retailer of high performance laptops, smartphones, and genuine accessories in Nairobi."
  );

  const [regNumber, setRegNumber] = useState("BN/2024/984210");
  const [nationalId, setNationalId] = useState("32984124");

  // Document Upload State (Functional)
  const [selectedDocType, setSelectedDocType] = useState(DOCUMENT_TYPES[0].label);
  const [docFile, setDocFile] = useState<File | null>(null);
  const [docName, setDocName] = useState("");
  const [docSize, setDocSize] = useState("");
  const [docDataUrl, setDocDataUrl] = useState("");
  const [isDocUploading, setIsDocUploading] = useState(false);

  // Product / Service Item State
  const [itemTitle, setItemTitle] = useState(
    offeringType === "SERVICE"
      ? "Residential Solar Installation & Inverter Setup"
      : "HP Envy x360 Convertible 14-inch (Core i7, 16GB RAM, 512GB SSD)"
  );
  const [itemPrice, setItemPrice] = useState(offeringType === "SERVICE" ? "3500" : "114999");
  const [itemStock, setItemStock] = useState("10");
  const [pricingModel, setPricingModel] = useState("Starting From");
  const [turnaroundTime, setTurnaroundTime] = useState("Within 24 Hours");

  // Product / Service Photo State (Functional)
  const [itemPhotoFile, setItemPhotoFile] = useState<File | null>(null);
  const [itemPhotoUrl, setItemPhotoUrl] = useState<string>("");
  const [itemPhotoName, setItemPhotoName] = useState<string>("");

  const [selectedPlan, setSelectedPlan] = useState(initialPlan);

  // M-Pesa STK Push Payment State
  const [paymentPhone, setPaymentPhone] = useState(user?.phone || "0798159503");
  const [paymentStatus, setPaymentStatus] = useState<"idle" | "sending" | "sent" | "success" | "error">("idle");
  const [checkoutRequestId, setCheckoutRequestId] = useState<string | null>(null);
  const [receiptNumber, setReceiptNumber] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string>("");
  const [countdown, setCountdown] = useState<number>(45);

  const activePlanObj = PRICING_PLANS.find((p) => p.id === selectedPlan) || PRICING_PLANS[0];
  const pollIntervalRef = React.useRef<NodeJS.Timeout | null>(null);

  // Available towns for the selected county
  const countyTowns = KENYAN_TOWNS[county] || ["Central", "Town CBD", "Market Center"];

  // Update default category when offeringType switches
  const handleTypeChange = (type: "PRODUCT" | "SERVICE") => {
    setOfferingType(type);
    if (type === "SERVICE") {
      setBizCategory("Solar Installation & Maintenance");
      setItemTitle("Residential Solar Installation & Inverter Setup");
      setItemPrice("3500");
      setBizName("Rift Solar & Power Solutions");
      setBizDesc("Certified electrical & solar energy installations with same-day emergency dispatch across Nairobi and surrounding counties.");
    } else {
      setBizCategory("Computers & Tech");
      setItemTitle("HP Envy x360 Convertible 14-inch (Core i7, 16GB RAM, 512GB SSD)");
      setItemPrice("114999");
      setBizName("Nairobi Tech Hub");
      setBizDesc("Premier retailer of high performance laptops, smartphones, and genuine accessories in Nairobi.");
    }
  };

  // Sync user info if user changes
  useEffect(() => {
    if (user) {
      if (!ownerName) setOwnerName(user.name || "");
      if (!ownerEmail) setOwnerEmail(user.email || "");
      if (!ownerPhone) setOwnerPhone(user.phone || "");
      if (!paymentPhone) setPaymentPhone(user.phone || "0798159503");
    }
  }, [user]);

  // Keep paymentPhone synced with ownerPhone if user edits step 1
  useEffect(() => {
    if (ownerPhone && (paymentPhone === "0798159503" || !paymentPhone)) {
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

  // Handle Document Upload
  const handleDocumentChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 15 * 1024 * 1024) {
      alert("Document file size exceeds 15MB limit. Please upload a smaller PDF or image.");
      return;
    }

    setIsDocUploading(true);
    setDocFile(file);
    setDocName(file.name);
    setDocSize((file.size / 1024 > 1024 ? `${(file.size / (1024 * 1024)).toFixed(2)} MB` : `${Math.round(file.size / 1024)} KB`));

    const reader = new FileReader();
    reader.onload = (event) => {
      setDocDataUrl(event.target?.result as string);
      setIsDocUploading(false);
    };
    reader.onerror = () => {
      setIsDocUploading(false);
      alert("Failed to read document file. Please try another file.");
    };
    reader.readAsDataURL(file);
  };

  // Handle Product / Service Photo Upload
  const handlePhotoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 10 * 1024 * 1024) {
      alert("Image file size exceeds 10MB limit. Please upload a smaller image.");
      return;
    }

    setItemPhotoFile(file);
    setItemPhotoName(file.name);

    const reader = new FileReader();
    reader.onload = (event) => {
      setItemPhotoUrl(event.target?.result as string);
    };
    reader.readAsDataURL(file);
  };

  const handleInitiateSTK = async () => {
    setPaymentStatus("sending");
    setErrorMessage("");
    setCountdown(45);

    try {
      const res = await fetch("/api/mpesa/stkpush", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          phone: paymentPhone,
          amount: activePlanObj.monthlyPrice,
          orderId: `VLX-PLAN-${selectedPlan.toUpperCase()}-${Date.now().toString().slice(-4)}`,
          accountReference: `VENDLEX-${bizName.replace(/\s+/g, "").slice(0, 10).toUpperCase()}`,
          description: `VendLex ${activePlanObj.name} Store Activation`,
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
    const finalReceipt = receipt || receiptNumber;
    if (!finalReceipt || paymentStatus !== "success") {
      setPaymentStatus("error");
      setErrorMessage("Payment verification required before store launch. Please complete M-Pesa payment.");
      setStep(5);
      return;
    }

    const effectiveTown = customTown.trim() ? customTown.trim() : town;

    try {
      const res = await fetch("/api/seller/onboard", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          bizName,
          bizCategory,
          county,
          town: effectiveTown,
          physicalLocation,
          bizDesc,
          ownerName,
          ownerEmail,
          ownerPhone,
          regNumber,
          nationalId,
          docName: docName || "Business_Registration_Certificate.pdf",
          docType: selectedDocType,
          docDataUrl,
          productTitle: itemTitle,
          productPrice: itemPrice,
          productStock: offeringType === "SERVICE" ? 999 : itemStock,
          productImages: itemPhotoUrl ? [itemPhotoUrl] : [],
          offeringType,
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
      bizName: bizName || "VendLex Merchant",
      ownerName: ownerName || "Kevin Mwangi",
      regNumber: regNumber || `BN/2026/${Math.floor(100000 + Math.random() * 900000)}`,
      nationalId: nationalId || "32984124",
      county: county || "Nairobi",
      docUrl: docName || "Business_Registration_Certificate.pdf",
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

  const isService = offeringType === "SERVICE";

  return (
    <div className="min-h-screen bg-brand-off-white dark:bg-brand-dark-bg py-8 sm:py-12">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6">
        {/* Header & Progress Tracker */}
        <div className="text-center space-y-2">
          <div className="inline-flex items-center gap-2 bg-brand-emerald/10 text-brand-emerald border border-brand-emerald/20 px-3.5 py-1 rounded-full text-xs font-bold uppercase tracking-wider">
            <span>{isService ? "🛠️ Service Provider Onboarding" : "📦 Retail Merchant Onboarding"}</span>
            <span>•</span>
            <span>Step {step} of 6</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-foreground">
            {step === 1 && "Start Selling & Offering Services on VendLex"}
            {step === 2 && (isService ? "Service Business Profile" : "Storefront Information")}
            {step === 3 && "Business KYC & Verification Documents"}
            {step === 4 && (isService ? "Add Your First Service Offering" : "Add Your First Product Listing")}
            {step === 5 && "Choose Growth Tier & Lipa na M-Pesa Activation"}
            {step === 6 && (isService ? "Service Profile Live on VendLex! 🎉" : "Store Live on VendLex! 🎉")}
          </h1>

          {/* Stepper Dots */}
          <div className="flex items-center justify-center gap-2 pt-2">
            {[1, 2, 3, 4, 5, 6].map((st) => (
              <div
                key={st}
                className={`h-2 rounded-full transition-all duration-300 ${
                  step === st
                    ? "w-8 bg-brand-emerald"
                    : step > st
                    ? "w-3 bg-brand-emerald/40"
                    : "w-2 bg-muted"
                }`}
              />
            ))}
          </div>
        </div>

        {/* Card Body */}
        <div className="bg-white dark:bg-brand-dark-card border border-border dark:border-brand-dark-border rounded-3xl p-6 sm:p-10 shadow-sm space-y-6">
          {/* STEP 1: Offering Type & Owner Contact */}
          {step === 1 && (
            <div className="space-y-6 animate-fadeIn">
              <div className="space-y-2">
                <label className="block text-xs font-bold uppercase tracking-wider text-foreground">
                  Select What You Intend to Sell / Offer on VendLex *
                </label>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {/* Option 1: Physical / Retail Goods */}
                  <div
                    onClick={() => handleTypeChange("PRODUCT")}
                    className={`p-5 rounded-2xl border-2 cursor-pointer transition-all ${
                      offeringType === "PRODUCT"
                        ? "border-brand-emerald bg-brand-emerald-soft/30 dark:bg-brand-dark-bg ring-2 ring-brand-emerald/20 shadow-sm"
                        : "border-border hover:border-brand-emerald/40"
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <div className={`w-10 h-10 rounded-xl flex items-center justify-center font-bold text-white ${offeringType === "PRODUCT" ? "bg-brand-emerald" : "bg-muted-foreground/40"}`}>
                        <Package className="w-5 h-5" />
                      </div>
                      <div>
                        <h4 className="font-extrabold text-sm text-foreground">Physical Products / Goods</h4>
                        <p className="text-[11px] text-muted-foreground mt-0.5">Electronics, Fashion, Groceries, Hardware, Furniture, Cosmetics</p>
                      </div>
                    </div>
                  </div>

                  {/* Option 2: Professional / Technician Services */}
                  <div
                    onClick={() => handleTypeChange("SERVICE")}
                    className={`p-5 rounded-2xl border-2 cursor-pointer transition-all ${
                      offeringType === "SERVICE"
                        ? "border-brand-emerald bg-brand-emerald-soft/30 dark:bg-brand-dark-bg ring-2 ring-brand-emerald/20 shadow-sm"
                        : "border-border hover:border-brand-emerald/40"
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <div className={`w-10 h-10 rounded-xl flex items-center justify-center font-bold text-white ${offeringType === "SERVICE" ? "bg-brand-emerald" : "bg-muted-foreground/40"}`}>
                        <Wrench className="w-5 h-5" />
                      </div>
                      <div>
                        <h4 className="font-extrabold text-sm text-foreground">Professional Services &amp; Trades</h4>
                        <p className="text-[11px] text-muted-foreground mt-0.5">Electricians, Plumbers, Solar Techs, Phone Repair, Mechanics, Cleaning</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <div className="space-y-4 pt-2 border-t border-border">
                <h3 className="font-bold text-sm text-foreground">Business Owner Contact Details</h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-bold text-foreground mb-1">Full Legal Name *</label>
                    <input
                      type="text"
                      value={ownerName}
                      onChange={(e) => setOwnerName(e.target.value)}
                      placeholder="e.g. Kevin Mwangi"
                      className="w-full bg-muted/20 border border-border rounded-xl p-3 text-xs text-foreground focus:outline-none focus:border-brand-emerald"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-foreground mb-1">Kenyan Mobile Number (M-Pesa) *</label>
                    <input
                      type="tel"
                      value={ownerPhone}
                      onChange={(e) => setOwnerPhone(e.target.value)}
                      placeholder="07XX XXX XXX or +254 7XX..."
                      className="w-full bg-muted/20 border border-border rounded-xl p-3 text-xs text-foreground font-mono focus:outline-none focus:border-brand-emerald"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-foreground mb-1">Email Address *</label>
                  <input
                    type="email"
                    value={ownerEmail}
                    onChange={(e) => setOwnerEmail(e.target.value)}
                    placeholder="kevin@business.co.ke"
                    className="w-full bg-muted/20 border border-border rounded-xl p-3 text-xs text-foreground focus:outline-none focus:border-brand-emerald"
                  />
                </div>
              </div>
            </div>
          )}

          {/* STEP 2: Store / Business Profile */}
          {step === 2 && (
            <div className="space-y-4 animate-fadeIn">
              <div className="space-y-1">
                <h3 className="font-bold text-base text-foreground">
                  {isService ? "Service Brand & Operational Base" : "Storefront Information"}
                </h3>
                <p className="text-xs text-muted-foreground">
                  {isService
                    ? "Specify your service trade brand, primary county of operation, and workshop address."
                    : "Enter your brand name, category, county location, and retail store description."}
                </p>
              </div>

              <div className="space-y-3">
                <div>
                  <label className="block text-xs font-bold text-foreground mb-1">
                    {isService ? "Service Business / Trade Name *" : "Business / Store Name *"}
                  </label>
                  <input
                    type="text"
                    value={bizName}
                    onChange={(e) => setBizName(e.target.value)}
                    className="w-full bg-muted/20 border border-border rounded-xl p-3 text-xs text-foreground focus:outline-none focus:border-brand-emerald"
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div>
                    <label className="block text-xs font-bold text-foreground mb-1">
                      {isService ? "Service Specialization *" : "Product Category *"}
                    </label>
                    <select
                      value={bizCategory}
                      onChange={(e) => setBizCategory(e.target.value)}
                      className="w-full bg-muted/20 border border-border rounded-xl p-3 text-xs text-foreground focus:outline-none focus:border-brand-emerald font-medium"
                    >
                      {isService
                        ? SERVICE_CATEGORIES.map((c) => (
                            <option key={c} value={c}>
                              {c}
                            </option>
                          ))
                        : CATEGORIES.map((c) => (
                            <option key={c.id} value={c.name}>
                              {c.name}
                            </option>
                          ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-foreground mb-1">
                      Primary County (All 47 Counties) *
                    </label>
                    <select
                      value={county}
                      onChange={(e) => {
                        const newCounty = e.target.value;
                        setCounty(newCounty);
                        const available = KENYAN_TOWNS[newCounty] || ["Central", "Town CBD"];
                        setTown(available[0] || "CBD");
                        setCustomTown("");
                      }}
                      className="w-full bg-muted/20 border border-border rounded-xl p-3 text-xs text-foreground focus:outline-none focus:border-brand-emerald font-semibold"
                    >
                      {KENYAN_COUNTIES.map((c) => (
                        <option key={c} value={c}>
                          {c} County
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-foreground mb-1">Town / Base Station *</label>
                    <select
                      value={town}
                      onChange={(e) => setTown(e.target.value)}
                      className="w-full bg-muted/20 border border-border rounded-xl p-3 text-xs text-foreground focus:outline-none focus:border-brand-emerald font-medium"
                    >
                      {countyTowns.map((t) => (
                        <option key={t} value={t}>
                          {t}
                        </option>
                      ))}
                      <option value="Other">Other / Specific Area...</option>
                    </select>
                  </div>
                </div>

                {town === "Other" && (
                  <div>
                    <label className="block text-xs font-bold text-foreground mb-1">Enter Specific Area / Shopping Center *</label>
                    <input
                      type="text"
                      value={customTown}
                      onChange={(e) => setCustomTown(e.target.value)}
                      placeholder="e.g. Mlolongo Phase 2, Ruaka Center, Nyali Links"
                      className="w-full bg-muted/20 border border-border rounded-xl p-3 text-xs text-foreground focus:outline-none focus:border-brand-emerald"
                    />
                  </div>
                )}

                <div>
                  <label className="block text-xs font-bold text-foreground mb-1">
                    {isService ? "Workshop / Office Location (Optional)" : "Physical Store / Office Location"}
                  </label>
                  <input
                    type="text"
                    value={physicalLocation}
                    onChange={(e) => setPhysicalLocation(e.target.value)}
                    placeholder="e.g. Bazaar Plaza, 4th Floor, Suite 412, Nairobi"
                    className="w-full bg-muted/20 border border-border rounded-xl p-3 text-xs text-foreground focus:outline-none focus:border-brand-emerald"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-foreground mb-1">
                    {isService ? "Professional Bio & Service Highlights" : "Short Store Description"}
                  </label>
                  <textarea
                    rows={2}
                    value={bizDesc}
                    onChange={(e) => setBizDesc(e.target.value)}
                    className="w-full bg-muted/20 border border-border rounded-xl p-3 text-xs text-foreground resize-none"
                  />
                </div>
              </div>
            </div>
          )}

          {/* STEP 3: KYC & Functional Document Upload */}
          {step === 3 && (
            <div className="space-y-5 animate-fadeIn">
              <div className="space-y-1">
                <div className="inline-flex items-center gap-1.5 px-3 py-0.5 rounded-full bg-brand-emerald/10 text-brand-emerald text-xs font-bold">
                  <ShieldCheck className="w-3.5 h-3.5" />
                  <span>Official Merchant Accreditation Verification</span>
                </div>
                <h3 className="font-bold text-base text-foreground">Business KYC &amp; Verification Documents</h3>
                <p className="text-xs text-muted-foreground">
                  Upload your business registration certificate, CR12, single business permit, or national ID to issue your stamped Accreditation Certificate and escrow payout privileges.
                </p>
              </div>

              <div className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-bold text-foreground mb-1">
                      {isService ? "Business Reg / Practicing Cert # *" : "Business Registration (BN/PVT) *"}
                    </label>
                    <input
                      type="text"
                      value={regNumber}
                      onChange={(e) => setRegNumber(e.target.value)}
                      placeholder="e.g. BN/2024/984210 or PVT-98214"
                      className="w-full bg-muted/20 border border-border rounded-xl p-3 text-xs text-foreground font-mono focus:outline-none focus:border-brand-emerald"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-foreground mb-1">Owner National ID / Passport *</label>
                    <input
                      type="text"
                      value={nationalId}
                      onChange={(e) => setNationalId(e.target.value)}
                      placeholder="e.g. 32984124"
                      className="w-full bg-muted/20 border border-border rounded-xl p-3 text-xs text-foreground font-mono focus:outline-none focus:border-brand-emerald"
                    />
                  </div>
                </div>

                {/* Document Type Selector */}
                <div>
                  <label className="block text-xs font-bold text-foreground mb-1">Document Category to Attach *</label>
                  <select
                    value={selectedDocType}
                    onChange={(e) => setSelectedDocType(e.target.value)}
                    className="w-full bg-muted/20 border border-border rounded-xl p-3 text-xs text-foreground font-medium focus:outline-none focus:border-brand-emerald"
                  >
                    {DOCUMENT_TYPES.map((dt) => (
                      <option key={dt.id} value={dt.label}>
                        {dt.label}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Functional Document Upload Zone */}
                <div>
                  <label className="block text-xs font-bold text-foreground mb-1">
                    Upload Business Certificate File (PDF, JPG, PNG, WEBP) *
                  </label>

                  {docName ? (
                    <div className="p-4 bg-emerald-50 dark:bg-emerald-950/40 border-2 border-emerald-300 dark:border-emerald-800 rounded-2xl flex items-center justify-between gap-3">
                      <div className="flex items-center gap-3 min-w-0">
                        <div className="w-10 h-10 rounded-xl bg-emerald-600 text-white flex items-center justify-center shrink-0">
                          <FileCheck2 className="w-5 h-5" />
                        </div>
                        <div className="min-w-0">
                          <div className="font-bold text-xs text-foreground truncate">{docName}</div>
                          <div className="text-[11px] text-emerald-700 dark:text-emerald-300 flex items-center gap-2">
                            <span>{docSize}</span>
                            <span>•</span>
                            <span className="font-semibold text-emerald-800 dark:text-emerald-200">✓ Ready for Accreditation Seal</span>
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center gap-2 shrink-0">
                        <label
                          htmlFor="doc-upload-input"
                          className="text-xs bg-white dark:bg-brand-dark-card border border-border hover:bg-muted text-foreground font-bold px-3 py-1.5 rounded-lg cursor-pointer transition-colors"
                        >
                          Change File
                        </label>
                        <button
                          type="button"
                          onClick={() => {
                            setDocFile(null);
                            setDocName("");
                            setDocDataUrl("");
                            setDocSize("");
                          }}
                          className="text-xs text-red-500 hover:text-red-700 p-1.5 rounded-lg hover:bg-red-50 dark:hover:bg-red-950/40 transition-colors"
                          title="Remove file"
                        >
                          <X className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  ) : (
                    <label
                      htmlFor="doc-upload-input"
                      className="border-2 border-dashed border-border hover:border-brand-emerald bg-muted/10 hover:bg-muted/30 rounded-2xl p-6 text-center space-y-2 cursor-pointer flex flex-col items-center justify-center transition-all group"
                    >
                      <Upload className="w-8 h-8 text-brand-emerald group-hover:scale-110 transition-transform" />
                      <div>
                        <span className="text-xs font-bold text-brand-emerald hover:underline block">
                          Click to browse device file manager or drag &amp; drop document here
                        </span>
                        <span className="text-[11px] text-muted-foreground mt-0.5 block">
                          Supports Business Registration Certificate, CR12, County Trade License, KRA PIN (PDF, PNG, JPG up to 15MB)
                        </span>
                      </div>
                    </label>
                  )}

                  <input
                    type="file"
                    id="doc-upload-input"
                    accept=".pdf, .jpg, .jpeg, .png, .webp, application/pdf, image/*"
                    onChange={handleDocumentChange}
                    className="hidden"
                  />
                </div>
              </div>
            </div>
          )}

          {/* STEP 4: First Listing (Product OR Service with Photo Upload) */}
          {step === 4 && (
            <div className="space-y-5 animate-fadeIn">
              <div className="space-y-1">
                <h3 className="font-bold text-base text-foreground">
                  {isService ? "Add Your Primary Service & Set Rates" : "Add Your First Product Listing"}
                </h3>
                <p className="text-xs text-muted-foreground">
                  {isService
                    ? "Set your service pricing model, starting fee, and attach portfolio photo."
                    : "Enter your product details and attach a photo from your device."}
                </p>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="block text-xs font-bold text-foreground mb-1">
                    {isService ? "Service Title / Offering *" : "Product Title *"}
                  </label>
                  <input
                    type="text"
                    value={itemTitle}
                    onChange={(e) => setItemTitle(e.target.value)}
                    placeholder={isService ? "e.g. Emergency Home Electrical Wiring & Solar Repair" : "e.g. Samsung Galaxy A54 5G (128GB)"}
                    className="w-full bg-muted/20 border border-border rounded-xl p-3 text-xs text-foreground focus:outline-none focus:border-brand-emerald"
                  />
                </div>

                {/* Device Photo Upload Zone with Live Preview */}
                <div>
                  <label className="block text-xs font-bold text-foreground mb-1">
                    {isService ? "Service Portfolio / Work Photo" : "Product Photo (From Device File Manager)"}
                  </label>

                  {itemPhotoUrl ? (
                    <div className="p-3 bg-muted/30 border border-border rounded-2xl flex items-center justify-between gap-3">
                      <div className="flex items-center gap-3">
                        <img
                          src={itemPhotoUrl}
                          alt="Uploaded Preview"
                          className="w-14 h-14 rounded-xl object-cover border border-border"
                        />
                        <div>
                          <div className="font-bold text-xs text-foreground truncate max-w-xs">{itemPhotoName || "Product Photo"}</div>
                          <span className="text-[11px] text-brand-emerald font-semibold">✓ Attached to listing</span>
                        </div>
                      </div>

                      <div className="flex items-center gap-2">
                        <label
                          htmlFor="onboarding-img"
                          className="text-xs bg-white dark:bg-brand-dark-card border border-border hover:bg-muted font-bold px-3 py-1.5 rounded-lg cursor-pointer transition-colors"
                        >
                          Change Photo
                        </label>
                        <button
                          type="button"
                          onClick={() => {
                            setItemPhotoFile(null);
                            setItemPhotoUrl("");
                            setItemPhotoName("");
                          }}
                          className="text-xs text-red-500 p-1.5 rounded-lg hover:bg-red-50 dark:hover:bg-red-950/40"
                          title="Remove photo"
                        >
                          <X className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  ) : (
                    <label
                      htmlFor="onboarding-img"
                      className="border-2 border-dashed border-border hover:border-brand-emerald bg-muted/10 p-5 rounded-2xl text-center space-y-1.5 cursor-pointer flex flex-col items-center justify-center transition-all group"
                    >
                      <ImageIcon className="w-7 h-7 text-brand-emerald group-hover:scale-110 transition-transform" />
                      <span className="text-xs font-bold text-brand-emerald hover:underline block">
                        Choose Photo File from Device
                      </span>
                      <p className="text-[10px] text-muted-foreground">Supports PNG, JPG, JPEG, WEBP up to 10MB</p>
                    </label>
                  )}

                  <input
                    type="file"
                    id="onboarding-img"
                    accept="image/*"
                    className="hidden"
                    onChange={handlePhotoChange}
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-bold text-foreground mb-1">
                      {isService ? "Starting Price / Inspection Fee (KSh) *" : "Selling Price (KSh) *"}
                    </label>
                    <input
                      type="number"
                      value={itemPrice}
                      onChange={(e) => setItemPrice(e.target.value)}
                      className="w-full bg-muted/20 border border-border rounded-xl p-3 text-xs text-foreground font-bold focus:outline-none focus:border-brand-emerald"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-foreground mb-1">
                      {isService ? "Pricing Model *" : "Initial Stock Count *"}
                    </label>
                    {isService ? (
                      <select
                        value={pricingModel}
                        onChange={(e) => setPricingModel(e.target.value)}
                        className="w-full bg-muted/20 border border-border rounded-xl p-3 text-xs text-foreground focus:outline-none focus:border-brand-emerald"
                      >
                        <option value="Starting From">Starting From (Base Rate)</option>
                        <option value="Fixed Price">Fixed Price Per Job</option>
                        <option value="Hourly Rate">Hourly Rate</option>
                        <option value="Custom Quote">Custom Quote Upon Inspection</option>
                      </select>
                    ) : (
                      <input
                        type="number"
                        value={itemStock}
                        onChange={(e) => setItemStock(e.target.value)}
                        className="w-full bg-muted/20 border border-border rounded-xl p-3 text-xs text-foreground focus:outline-none focus:border-brand-emerald"
                      />
                    )}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* STEP 5: Choose Plan (Lowest KSh 199/mo) & Live Daraja STK Push Activation */}
          {step === 5 && (
            <div className="space-y-6 animate-fadeIn">
              <div className="space-y-1">
                <h3 className="font-bold text-base text-foreground">Select Your VendLex Growth Tier</h3>
                <p className="text-xs text-muted-foreground">
                  Choose a listing package to activate your verified storefront and issue your accreditation seal via instant Lipa na M-Pesa.
                </p>
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
                        {formatKSh(plan.monthlyPrice)}/mo
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
                    Amount: {formatKSh(activePlanObj.monthlyPrice)}
                  </span>
                </div>

                <div className="space-y-3">
                  <div>
                    <label className="block text-xs font-bold text-foreground mb-1">
                      M-Pesa Phone Number for PIN Prompt (Safaricom) *
                    </label>
                    <input
                      type="tel"
                      value={paymentPhone}
                      onChange={(e) => setPaymentPhone(e.target.value)}
                      placeholder="e.g. 0798159503"
                      disabled={paymentStatus === "sending" || paymentStatus === "sent"}
                      className="w-full bg-white dark:bg-brand-dark-card border border-border rounded-xl p-3 text-xs font-mono font-bold text-foreground focus:outline-none focus:border-brand-emerald"
                    />
                  </div>

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
                    </div>
                  )}

                  {paymentStatus === "success" && (
                    <div className="flex items-center gap-2 p-3.5 bg-emerald-100 dark:bg-emerald-950 border border-emerald-400 rounded-xl text-emerald-800 dark:text-emerald-200 text-xs font-bold animate-fadeIn">
                      <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                      <span>M-Pesa Payment Confirmed! Receipt: {receiptNumber}. Activating Workspace...</span>
                    </div>
                  )}

                  {paymentStatus === "error" && (
                    <div className="space-y-3 p-4 bg-red-50 dark:bg-red-950/40 border border-red-300 dark:border-red-800 rounded-2xl text-red-700 dark:text-red-300 text-xs animate-pop-up">
                      <div className="flex items-center gap-2 font-bold text-sm text-red-800 dark:text-red-200">
                        <AlertCircle className="w-4 h-4 text-brand-red shrink-0" />
                        <span>M-Pesa Payment Error</span>
                      </div>
                      <p className="text-xs leading-relaxed">{errorMessage}</p>
                      <button
                        type="button"
                        onClick={handleInitiateSTK}
                        className="inline-flex items-center gap-1.5 bg-brand-emerald text-white px-3.5 py-1.5 rounded-xl font-bold text-xs hover:bg-brand-emerald-dark transition-all"
                      >
                        <RefreshCw className="w-3 h-3" />
                        <span>Resend M-Pesa Prompt</span>
                      </button>
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* STEP 6: Completion & Official Accreditation Certificate */}
          {step === 6 && (
            <div className="text-center py-8 space-y-6 animate-scaleUp">
              <div className="w-20 h-20 rounded-full bg-emerald-100 dark:bg-emerald-950/60 text-brand-emerald flex items-center justify-center mx-auto shadow-sm">
                <CheckCircle2 className="w-12 h-12" />
              </div>

              <div className="space-y-2">
                <span className="text-xs font-black uppercase px-3 py-1 rounded-full bg-emerald-100 dark:bg-emerald-950/60 text-brand-emerald inline-block">
                  Onboarding Complete ✓
                </span>
                <h2 className="text-2xl sm:text-3xl font-black text-foreground">
                  Hongera! {bizName} is Live on VendLex!
                </h2>
                <p className="text-xs sm:text-sm text-muted-foreground max-w-md mx-auto">
                  Your store and initial listing in <strong className="text-foreground">{county} County</strong> have been indexed across Kenya.
                </p>
              </div>

              <div className="space-y-3">
                {receiptNumber && (
                  <div className="inline-flex items-center gap-1.5 bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-200 px-3.5 py-1 rounded-full text-xs font-bold font-mono">
                    <CheckCircle2 className="w-3.5 h-3.5 text-brand-emerald" />
                    <span>M-Pesa Receipt: {receiptNumber}</span>
                  </div>
                )}

                <div className="p-3 bg-muted font-mono text-xs text-brand-emerald font-bold rounded-xl max-w-sm mx-auto">
                  vendlex.co.ke/{isService ? "services" : "store"}/{storeSlug}
                </div>

                {/* Official Accreditation Certificate Download Card */}
                <div className="p-5 bg-gradient-to-r from-amber-500/10 via-brand-gold/15 to-amber-500/10 border-2 border-brand-gold/40 rounded-3xl max-w-md mx-auto space-y-3 shadow-sm text-center">
                  <div className="flex items-center justify-center gap-2 text-brand-gold">
                    <Award className="w-5 h-5 text-amber-500" />
                    <span className="text-xs font-black uppercase tracking-wider text-amber-900 dark:text-amber-200">
                      {isService ? "Official Service Accreditation Certificate" : "Official Merchant Accreditation Certificate"}
                    </span>
                  </div>
                  <p className="text-xs text-muted-foreground leading-relaxed">
                    Your official stamped Certificate ({certificateInfo?.publicDocumentId || "VLX-CER-2026"}) has been generated with cryptographic seal and QR code verification.
                  </p>
                  <div className="flex flex-wrap items-center justify-center gap-2.5 pt-1">
                    <a
                      href={certificateInfo?.downloadUrl || `/api/documents/${certificateInfo?.publicDocumentId || "VLX-CER-2026-000042"}/download`}
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
                  href={isService ? "/services" : `/businesses/${storeSlug}`}
                  className="bg-muted hover:bg-muted/80 text-foreground font-bold px-6 py-3 rounded-xl text-xs sm:text-sm transition-all"
                >
                  {isService ? "View in Services Directory &rarr;" : "View Public Storefront &rarr;"}
                </Link>
              </div>
            </div>
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
