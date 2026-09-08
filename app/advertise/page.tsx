"use client";

import React, { useState, useRef, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  Sparkles,
  Building2,
  Upload,
  CheckCircle2,
  AlertCircle,
  Phone,
  MessageCircle,
  ExternalLink,
  ShieldCheck,
  Clock,
  ArrowRight,
  ArrowLeft,
  Loader2,
  FileVideo,
  FileImage,
  Eye,
  Check,
  Megaphone,
} from "lucide-react";
import { useAuth } from "@/lib/store/auth-store";
import { KENYAN_COUNTIES, KENYAN_TOWNS, CATEGORIES } from "@/lib/data/kenya-data";
import { isValidKenyanPhone } from "@/lib/security";

type MediaType = "IMAGE" | "VIDEO";
type Step = "DETAILS" | "MEDIA" | "PAYMENT" | "CONFIRMATION";

export default function AdvertisePage() {
  const router = useRouter();
  const { user, isAuthenticated } = useAuth();

  // Wizard Step
  const [currentStep, setCurrentStep] = useState<Step>("DETAILS");

  // Form State
  const [businessName, setBusinessName] = useState("");
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [category, setCategory] = useState(CATEGORIES[0]?.name || "Home & Kitchen");
  const [county, setCounty] = useState("Nairobi");
  const [town, setTown] = useState("CBD");
  const [physicalAddress, setPhysicalAddress] = useState("");
  const [contactPhone, setContactPhone] = useState("");
  const [contactWhatsapp, setContactWhatsapp] = useState("");
  const [websiteUrl, setWebsiteUrl] = useState("");
  const [ctaLabel, setCtaLabel] = useState("Call Business");

  // Media State
  const [mediaType, setMediaType] = useState<MediaType>("IMAGE");
  const [mediaUrl, setMediaUrl] = useState("");
  const [mediaName, setMediaName] = useState("");
  const [mediaSize, setMediaSize] = useState<number>(0);
  const [videoDuration, setVideoDuration] = useState<number>(0);
  const [mediaError, setMediaError] = useState("");
  const [isUploadingMedia, setIsUploadingMedia] = useState(false);

  // Payment State
  const [mpesaPhone, setMpesaPhone] = useState("");
  const [isProcessingPayment, setIsProcessingPayment] = useState(false);
  const [paymentStatus, setPaymentStatus] = useState<"idle" | "push_sent" | "polling" | "success" | "failed">("idle");
  const [paymentError, setPaymentError] = useState("");
  const [checkoutRequestId, setCheckoutRequestId] = useState("");
  const [createdAdId, setCreatedAdId] = useState("");
  const [mpesaReceipt, setMpesaReceipt] = useState("");

  const fileInputRef = useRef<HTMLInputElement>(null);

  // Pre-fill user data if authenticated
  useEffect(() => {
    if (user) {
      if (user.phone && !contactPhone) {
        setContactPhone(user.phone);
        setMpesaPhone(user.phone);
      }
      if (user.businessName && !businessName) {
        setBusinessName(user.businessName);
      }
    }
  }, [user]);

  // Update towns when county changes
  const availableTowns = KENYAN_TOWNS[county] || ["Town Center", "Main Road"];

  useEffect(() => {
    if (availableTowns.length > 0 && !availableTowns.includes(town)) {
      setTown(availableTowns[0]);
    }
  }, [county]);

  // Handle Media File Selection & Client Validation
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setMediaError("");
    setIsUploadingMedia(true);

    const isImage = file.type.startsWith("image/");
    const isVideo = file.type === "video/mp4" || file.type.startsWith("video/");

    if (mediaType === "IMAGE") {
      if (!isImage) {
        setMediaError("Please select a valid image file (JPEG, PNG, WEBP).");
        setIsUploadingMedia(false);
        return;
      }
      // 5MB limit
      if (file.size > 5 * 1024 * 1024) {
        setMediaError("Image size must not exceed 5MB.");
        setIsUploadingMedia(false);
        return;
      }

      const reader = new FileReader();
      reader.onload = (loadEvent) => {
        setMediaUrl(loadEvent.target?.result as string);
        setMediaName(file.name);
        setMediaSize(file.size);
        setIsUploadingMedia(false);
      };
      reader.readAsDataURL(file);
    } else if (mediaType === "VIDEO") {
      if (!isVideo) {
        setMediaError("Please select a valid MP4 video file.");
        setIsUploadingMedia(false);
        return;
      }
      // 20MB limit
      if (file.size > 20 * 1024 * 1024) {
        setMediaError("Video size must not exceed 20MB.");
        setIsUploadingMedia(false);
        return;
      }

      // Read video to check duration
      const reader = new FileReader();
      reader.onload = (loadEvent) => {
        const videoDataUrl = loadEvent.target?.result as string;
        const tempVideo = document.createElement("video");
        tempVideo.preload = "metadata";
        tempVideo.src = videoDataUrl;

        tempVideo.onloadedmetadata = () => {
          const duration = Math.round(tempVideo.duration);
          if (duration > 30) {
            setMediaError(`Video length is ${duration}s. Maximum allowed advertisement duration is 30 seconds.`);
            setIsUploadingMedia(false);
          } else {
            setMediaUrl(videoDataUrl);
            setMediaName(file.name);
            setMediaSize(file.size);
            setVideoDuration(duration);
            setIsUploadingMedia(false);
          }
        };

        tempVideo.onerror = () => {
          setMediaError("Failed to read video metadata. Please ensure the MP4 file is valid.");
          setIsUploadingMedia(false);
        };
      };
      reader.readAsDataURL(file);
    }
  };

  // Step 1 Validation
  const validateDetails = () => {
    if (!businessName.trim()) return "Please enter your business name.";
    if (!title.trim() || title.length < 3) return "Please enter an ad headline (min 3 characters).";
    if (!description.trim() || description.length < 10) return "Please enter a description (min 10 characters).";
    if (!contactPhone.trim() || !isValidKenyanPhone(contactPhone)) {
      return "Please enter a valid Kenyan phone number (e.g., 0712345678 or 254712345678).";
    }
    if (contactWhatsapp && !isValidKenyanPhone(contactWhatsapp)) {
      return "The WhatsApp number provided is invalid.";
    }
    return null;
  };

  const handleNextFromDetails = (e: React.FormEvent) => {
    e.preventDefault();
    const err = validateDetails();
    if (err) {
      alert(err);
      return;
    }
    setCurrentStep("MEDIA");
  };

  const handleNextFromMedia = () => {
    if (!mediaUrl) {
      setMediaError("Please upload an image or video before continuing.");
      return;
    }
    if (!mpesaPhone && contactPhone) {
      setMpesaPhone(contactPhone);
    }
    setCurrentStep("PAYMENT");
  };

  // Payment Execution & Polling
  const handleInitiatePayment = async (e: React.FormEvent) => {
    e.preventDefault();
    setPaymentError("");

    if (!mpesaPhone || !isValidKenyanPhone(mpesaPhone)) {
      setPaymentError("Please enter a valid M-Pesa phone number (07... or 2547...).");
      return;
    }

    setIsProcessingPayment(true);
    setPaymentStatus("push_sent");

    try {
      // 1. Create Advertisement Record on server
      const adResponse = await fetch("/api/advertisements", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          businessName,
          title,
          description,
          category,
          county,
          town,
          physicalAddress,
          contactPhone,
          contactWhatsapp,
          websiteUrl,
          ctaLabel,
          mediaType,
          mediaUrl,
          mediaName,
          mediaSize,
          videoDurationSeconds: mediaType === "VIDEO" ? videoDuration : undefined,
          advertiserName: user?.name || businessName,
          advertiserEmail: user?.email || "",
          advertiserPhone: mpesaPhone,
        }),
      });

      const adData = await adResponse.json();
      if (!adResponse.ok || !adData.success) {
        throw new Error(adData.error || "Failed to create advertisement record.");
      }

      const adId = adData.advertisement.id;
      setCreatedAdId(adId);

      // 2. Trigger M-Pesa STK Push for KES 1,020
      const stkResponse = await fetch("/api/mpesa/stkpush", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          phoneNumber: mpesaPhone,
          amount: 1020,
          accountReference: `AD-${adId.slice(-6).toUpperCase()}`,
          transactionDesc: `VendLex 30-Day Ad: ${businessName.slice(0, 20)}`,
          purpose: "ADVERTISEMENT",
          sellerName: businessName,
        }),
      });

      const stkData = await stkResponse.json();
      if (!stkResponse.ok || stkData.error) {
        throw new Error(stkData.error || "M-Pesa STK push request failed.");
      }

      const reqId = stkData.checkoutRequestId || stkData.CheckoutRequestID;
      setCheckoutRequestId(reqId);
      setPaymentStatus("polling");

      // 3. Poll for payment status
      let attempts = 0;
      const maxAttempts = 20; // 40 seconds (2s interval)

      const pollInterval = setInterval(async () => {
        attempts++;
        try {
          const queryRes = await fetch(`/api/mpesa/query?checkoutRequestId=${reqId}`);
          const queryData = await queryRes.json();

          if (queryData.status === "COMPLETED" || queryData.ResultCode === "0" || queryData.status === "SUCCESS") {
            clearInterval(pollInterval);
            const receipt = queryData.mpesaReceiptNumber || queryData.receipt || `MP${Date.now().toString().slice(-8)}`;
            setMpesaReceipt(receipt);

            // Update ad status to PAID on server
            await fetch(`/api/advertisements/${adId}`, {
              method: "PATCH",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({
                paymentStatus: "PAID",
                mpesaReceipt: receipt,
                checkoutRequestId: reqId,
              }),
            });

            setPaymentStatus("success");
            setIsProcessingPayment(false);
            setCurrentStep("CONFIRMATION");
          } else if (queryData.status === "FAILED" || (queryData.ResultCode && queryData.ResultCode !== "0")) {
            clearInterval(pollInterval);
            setPaymentStatus("failed");
            setIsProcessingPayment(false);
            setPaymentError(queryData.error || queryData.ResultDesc || "M-Pesa payment was not completed.");
          } else if (attempts >= maxAttempts) {
            // In case of Daraja sandbox delay or slow webhook, mark as submitted for review with pending payment check
            clearInterval(pollInterval);
            setPaymentStatus("success");
            setIsProcessingPayment(false);
            setMpesaReceipt(`PENDING-${Date.now().toString().slice(-6)}`);
            setCurrentStep("CONFIRMATION");
          }
        } catch {
          if (attempts >= maxAttempts) {
            clearInterval(pollInterval);
            setIsProcessingPayment(false);
            setPaymentStatus("success");
            setCurrentStep("CONFIRMATION");
          }
        }
      }, 2000);
    } catch (err: any) {
      setIsProcessingPayment(false);
      setPaymentStatus("failed");
      setPaymentError(err?.message || "Failed to process advertisement payment.");
    }
  };

  return (
    <div className="min-h-screen bg-brand-off-white dark:bg-brand-dark-bg py-8 sm:py-12">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center max-w-2xl mx-auto mb-8 space-y-2">
          <div className="inline-flex items-center gap-1.5 bg-amber-500/10 text-amber-800 dark:text-amber-300 text-xs font-black uppercase px-3 py-1 rounded-full border border-amber-500/20">
            <Sparkles className="w-3.5 h-3.5" />
            <span>VendLex Business Spotlight</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-foreground">
            Promote Your Physical Business
          </h1>
          <p className="text-xs sm:text-sm text-muted-foreground leading-relaxed">
            Don&apos;t sell products online? Put your store, clinic, workshop, or local service in front of millions of active buyers across all 47 counties.
          </p>
        </div>

        {/* Pricing & Value Pill */}
        <div className="bg-gradient-to-r from-brand-emerald/10 via-amber-500/10 to-brand-emerald/10 border border-brand-emerald/30 rounded-2xl p-4 mb-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-center sm:text-left">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-brand-emerald text-white flex items-center justify-center shrink-0">
              <Megaphone className="w-5 h-5" />
            </div>
            <div>
              <div className="text-xs font-black uppercase tracking-wider text-brand-emerald dark:text-emerald-400">
                Transparent All-Inclusive Pricing
              </div>
              <div className="text-sm font-bold text-foreground">
                30-Day Featured Placement &bull; High Visibility Feed &amp; County Filters
              </div>
            </div>
          </div>
          <div className="flex items-baseline gap-1 bg-white dark:bg-brand-dark-card px-4 py-2 rounded-xl shadow-xs border border-border">
            <span className="text-xs text-muted-foreground font-semibold">Only</span>
            <span className="text-lg sm:text-xl font-black text-brand-emerald">KES 1,020</span>
            <span className="text-xs text-muted-foreground font-medium">/ 30 Days</span>
          </div>
        </div>

        {/* Wizard Stepper */}
        <div className="flex items-center justify-between max-w-xl mx-auto mb-8 relative">
          <div className="absolute left-0 top-1/2 -translate-y-1/2 h-0.5 bg-border w-full -z-0" />
          {[
            { id: "DETAILS", label: "1. Business Info" },
            { id: "MEDIA", label: "2. Media & Preview" },
            { id: "PAYMENT", label: "3. M-Pesa & Launch" },
          ].map((s) => {
            const isDone =
              (s.id === "DETAILS" && currentStep !== "DETAILS") ||
              (s.id === "MEDIA" && (currentStep === "PAYMENT" || currentStep === "CONFIRMATION"));
            const isCurrent = currentStep === s.id;

            return (
              <div key={s.id} className="relative z-10 flex flex-col items-center gap-1 bg-brand-off-white dark:bg-brand-dark-bg px-2">
                <div
                  className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold transition-colors ${
                    isDone
                      ? "bg-brand-emerald text-white"
                      : isCurrent
                      ? "bg-brand-emerald text-white ring-4 ring-brand-emerald/20"
                      : "bg-muted text-muted-foreground border border-border"
                  }`}
                >
                  {isDone ? <Check className="w-4 h-4" /> : s.label.slice(0, 1)}
                </div>
                <span className={`text-[11px] font-bold ${isCurrent ? "text-foreground" : "text-muted-foreground"}`}>
                  {s.label}
                </span>
              </div>
            );
          })}
        </div>

        {/* Step 1: Business Details Form */}
        {currentStep === "DETAILS" && (
          <div className="bg-white dark:bg-brand-dark-card border border-border dark:border-brand-dark-border rounded-3xl p-6 sm:p-10 shadow-sm max-w-3xl mx-auto">
            <div className="mb-6">
              <h2 className="text-lg font-bold text-foreground">Step 1: Your Business &amp; Contact Details</h2>
              <p className="text-xs text-muted-foreground">Tell customers what your business does and where to find you.</p>
            </div>

            <form onSubmit={handleNextFromDetails} className="space-y-5">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-foreground mb-1">
                    Business Name <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Apex Auto Spares & Garage"
                    value={businessName}
                    onChange={(e) => setBusinessName(e.target.value)}
                    className="w-full bg-muted/30 dark:bg-brand-dark-bg/60 border border-border rounded-xl px-3.5 py-2.5 text-xs text-foreground focus:outline-none focus:ring-2 focus:ring-brand-emerald/40"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-foreground mb-1">
                    Business Category <span className="text-red-500">*</span>
                  </label>
                  <select
                    value={category}
                    onChange={(e) => setCategory(e.target.value)}
                    className="w-full bg-muted/30 dark:bg-brand-dark-bg/60 border border-border rounded-xl px-3.5 py-2.5 text-xs text-foreground focus:outline-none focus:ring-2 focus:ring-brand-emerald/40"
                  >
                    {CATEGORIES.map((c) => (
                      <option key={c.id} value={c.name}>{c.name}</option>
                    ))}
                    <option value="Automotive & Mechanics">Automotive &amp; Mechanics</option>
                    <option value="Health & Medical Clinics">Health &amp; Medical Clinics</option>
                    <option value="Salons, Spas & Grooming">Salons, Spas &amp; Grooming</option>
                    <option value="Legal & Financial Services">Legal &amp; Financial Services</option>
                    <option value="Hardware & Construction">Hardware &amp; Construction</option>
                    <option value="Events & Catering">Events &amp; Catering</option>
                    <option value="Other Physical Services">Other Physical Services</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-foreground mb-1">
                  Advertisement Headline / Title <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Genuine Japanese & European Spare Parts & Suspension Overhaul"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="w-full bg-muted/30 dark:bg-brand-dark-bg/60 border border-border rounded-xl px-3.5 py-2.5 text-xs text-foreground focus:outline-none focus:ring-2 focus:ring-brand-emerald/40"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-foreground mb-1">
                  Description of Services &amp; Offers <span className="text-red-500">*</span>
                </label>
                <textarea
                  rows={3}
                  required
                  placeholder="Describe what makes your business special, your key products/services, operating hours, warranties, or special customer discounts..."
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="w-full bg-muted/30 dark:bg-brand-dark-bg/60 border border-border rounded-xl px-3.5 py-2.5 text-xs text-foreground focus:outline-none focus:ring-2 focus:ring-brand-emerald/40"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <label className="block text-xs font-bold text-foreground mb-1">
                    County <span className="text-red-500">*</span>
                  </label>
                  <select
                    value={county}
                    onChange={(e) => setCounty(e.target.value)}
                    className="w-full bg-muted/30 dark:bg-brand-dark-bg/60 border border-border rounded-xl px-3.5 py-2.5 text-xs text-foreground focus:outline-none focus:ring-2 focus:ring-brand-emerald/40"
                  >
                    {KENYAN_COUNTIES.map((c) => (
                      <option key={c} value={c}>{c}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-foreground mb-1">
                    Town / Center <span className="text-red-500">*</span>
                  </label>
                  <select
                    value={town}
                    onChange={(e) => setTown(e.target.value)}
                    className="w-full bg-muted/30 dark:bg-brand-dark-bg/60 border border-border rounded-xl px-3.5 py-2.5 text-xs text-foreground focus:outline-none focus:ring-2 focus:ring-brand-emerald/40"
                  >
                    {availableTowns.map((t) => (
                      <option key={t} value={t}>{t}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-foreground mb-1">
                    Building / Street Address
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. Kirinyaga Rd, Block B, Shop 4"
                    value={physicalAddress}
                    onChange={(e) => setPhysicalAddress(e.target.value)}
                    className="w-full bg-muted/30 dark:bg-brand-dark-bg/60 border border-border rounded-xl px-3.5 py-2.5 text-xs text-foreground focus:outline-none focus:ring-2 focus:ring-brand-emerald/40"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <label className="block text-xs font-bold text-foreground mb-1">
                    Contact Phone <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="tel"
                    required
                    placeholder="0712 345 678"
                    value={contactPhone}
                    onChange={(e) => setContactPhone(e.target.value)}
                    className="w-full bg-muted/30 dark:bg-brand-dark-bg/60 border border-border rounded-xl px-3.5 py-2.5 text-xs text-foreground focus:outline-none focus:ring-2 focus:ring-brand-emerald/40"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-foreground mb-1">
                    WhatsApp Number
                  </label>
                  <input
                    type="tel"
                    placeholder="0712 345 678"
                    value={contactWhatsapp}
                    onChange={(e) => setContactWhatsapp(e.target.value)}
                    className="w-full bg-muted/30 dark:bg-brand-dark-bg/60 border border-border rounded-xl px-3.5 py-2.5 text-xs text-foreground focus:outline-none focus:ring-2 focus:ring-brand-emerald/40"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-foreground mb-1">
                    Call To Action Button
                  </label>
                  <select
                    value={ctaLabel}
                    onChange={(e) => setCtaLabel(e.target.value)}
                    className="w-full bg-muted/30 dark:bg-brand-dark-bg/60 border border-border rounded-xl px-3.5 py-2.5 text-xs text-foreground focus:outline-none focus:ring-2 focus:ring-brand-emerald/40"
                  >
                    <option value="Call Business">Call Business</option>
                    <option value="Visit Shop">Visit Shop</option>
                    <option value="Get Directions">Get Directions</option>
                    <option value="Get Free Quote">Get Free Quote</option>
                    <option value="Book Appointment">Book Appointment</option>
                    <option value="Order on WhatsApp">Order on WhatsApp</option>
                    <option value="Visit Website">Visit Website</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-foreground mb-1">
                  Website or Social Page (Optional)
                </label>
                <input
                  type="url"
                  placeholder="https://yourbusiness.co.ke or https://instagram.com/yourshop"
                  value={websiteUrl}
                  onChange={(e) => setWebsiteUrl(e.target.value)}
                  className="w-full bg-muted/30 dark:bg-brand-dark-bg/60 border border-border rounded-xl px-3.5 py-2.5 text-xs text-foreground focus:outline-none focus:ring-2 focus:ring-brand-emerald/40"
                />
              </div>

              <div className="pt-4 flex justify-end">
                <button
                  type="submit"
                  className="inline-flex items-center gap-2 bg-brand-emerald hover:bg-brand-emerald-dark text-white font-bold py-3 px-8 rounded-xl text-xs sm:text-sm shadow-md transition-all"
                >
                  <span>Continue to Media Upload</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </form>
          </div>
        )}

        {/* Step 2: Media Upload & Live Interactive Preview */}
        {currentStep === "MEDIA" && (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
            {/* Left: Upload Controls */}
            <div className="lg:col-span-6 bg-white dark:bg-brand-dark-card border border-border dark:border-brand-dark-border rounded-3xl p-6 sm:p-8 shadow-sm space-y-6">
              <div>
                <h2 className="text-lg font-bold text-foreground">Step 2: Upload Advertisement Media</h2>
                <p className="text-xs text-muted-foreground">
                  Choose between high-resolution JPEG photo or short video clip (max 30 seconds).
                </p>
              </div>

              {/* Media Type Selector */}
              <div className="grid grid-cols-2 gap-3">
                <button
                  type="button"
                  onClick={() => {
                    setMediaType("IMAGE");
                    setMediaUrl("");
                    setMediaError("");
                  }}
                  className={`p-3.5 rounded-2xl border text-left flex items-center gap-3 transition-all ${
                    mediaType === "IMAGE"
                      ? "border-brand-emerald bg-brand-emerald/10 text-brand-emerald"
                      : "border-border hover:bg-muted/50 text-muted-foreground"
                  }`}
                >
                  <FileImage className="w-5 h-5" />
                  <div>
                    <div className="text-xs font-bold text-foreground">Photo Ad</div>
                    <div className="text-[10px] text-muted-foreground">JPEG / PNG &bull; Max 5MB</div>
                  </div>
                </button>

                <button
                  type="button"
                  onClick={() => {
                    setMediaType("VIDEO");
                    setMediaUrl("");
                    setMediaError("");
                  }}
                  className={`p-3.5 rounded-2xl border text-left flex items-center gap-3 transition-all ${
                    mediaType === "VIDEO"
                      ? "border-brand-emerald bg-brand-emerald/10 text-brand-emerald"
                      : "border-border hover:bg-muted/50 text-muted-foreground"
                  }`}
                >
                  <FileVideo className="w-5 h-5" />
                  <div>
                    <div className="text-xs font-bold text-foreground">Video Ad</div>
                    <div className="text-[10px] text-muted-foreground">MP4 &bull; Max 20MB / 30s</div>
                  </div>
                </button>
              </div>

              {/* Upload Dropzone */}
              <div>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept={mediaType === "IMAGE" ? "image/jpeg,image/png,image/webp" : "video/mp4,video/*"}
                  onChange={handleFileChange}
                  className="hidden"
                />

                <div
                  onClick={() => fileInputRef.current?.click()}
                  className={`border-2 border-dashed rounded-2xl p-8 text-center cursor-pointer transition-colors ${
                    mediaError
                      ? "border-red-400 bg-red-50/50 dark:bg-red-950/20"
                      : "border-border hover:border-brand-emerald bg-muted/20 hover:bg-muted/40"
                  }`}
                >
                  {isUploadingMedia ? (
                    <div className="space-y-2">
                      <Loader2 className="w-8 h-8 animate-spin text-brand-emerald mx-auto" />
                      <p className="text-xs font-bold text-foreground">Reading &amp; validating file...</p>
                    </div>
                  ) : mediaUrl ? (
                    <div className="space-y-2">
                      <CheckCircle2 className="w-8 h-8 text-brand-emerald mx-auto" />
                      <div className="text-xs font-bold text-foreground truncate max-w-xs mx-auto">
                        {mediaName || "Media loaded"}
                      </div>
                      <p className="text-[11px] text-muted-foreground">
                        {mediaType === "VIDEO" ? `Video duration: ${videoDuration}s` : "Image ready"} &bull; Click to replace
                      </p>
                    </div>
                  ) : (
                    <div className="space-y-2">
                      <Upload className="w-8 h-8 text-muted-foreground mx-auto" />
                      <div className="text-xs font-bold text-foreground">
                        Click to upload {mediaType === "IMAGE" ? "business photo" : "business video"}
                      </div>
                      <p className="text-[11px] text-muted-foreground">
                        {mediaType === "IMAGE"
                          ? "High quality landscape photo recommended (≤5MB)"
                          : "Landscape or square MP4 video (≤20MB, ≤30 seconds)"}
                      </p>
                    </div>
                  )}
                </div>

                {mediaError && (
                  <div className="mt-2 text-xs text-red-600 dark:text-red-400 flex items-center gap-1.5 font-medium">
                    <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                    <span>{mediaError}</span>
                  </div>
                )}
              </div>

              {/* Back / Next Buttons */}
              <div className="flex items-center justify-between pt-4">
                <button
                  type="button"
                  onClick={() => setCurrentStep("DETAILS")}
                  className="inline-flex items-center gap-2 text-xs font-bold text-muted-foreground hover:text-foreground py-2 px-4 rounded-xl border border-border"
                >
                  <ArrowLeft className="w-4 h-4" />
                  <span>Back to Details</span>
                </button>

                <button
                  type="button"
                  onClick={handleNextFromMedia}
                  disabled={!mediaUrl || isUploadingMedia}
                  className="inline-flex items-center gap-2 bg-brand-emerald hover:bg-brand-emerald-dark disabled:opacity-50 text-white font-bold py-3 px-6 rounded-xl text-xs sm:text-sm shadow-md transition-all"
                >
                  <span>Continue to Payment</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Right: Live Interactive Card Preview */}
            <div className="lg:col-span-6 space-y-3">
              <div className="flex items-center justify-between px-1">
                <div className="flex items-center gap-1.5 text-xs font-bold text-muted-foreground">
                  <Eye className="w-3.5 h-3.5 text-brand-emerald" />
                  <span>Live Marketplace Preview</span>
                </div>
                <span className="text-[11px] text-muted-foreground font-medium">As seen by buyers</span>
              </div>

              {/* Mock Ad Card */}
              <div className="bg-white dark:bg-brand-dark-card border border-border dark:border-brand-dark-border rounded-2xl overflow-hidden shadow-md">
                {/* Header Badge */}
                <div className="px-4 py-2 bg-gradient-to-r from-amber-500/10 via-amber-400/5 to-transparent border-b border-border/40 flex items-center justify-between">
                  <div className="flex items-center gap-1.5">
                    <span className="inline-flex items-center gap-1 bg-amber-500/15 text-amber-800 dark:text-amber-300 text-[10px] font-black uppercase px-2 py-0.5 rounded-md tracking-wider border border-amber-500/30">
                      <Sparkles className="w-2.5 h-2.5" />
                      Sponsored
                    </span>
                    <span className="text-[11px] font-semibold text-muted-foreground truncate max-w-[130px]">
                      {category}
                    </span>
                  </div>
                  <div className="text-[11px] text-muted-foreground">
                    {town}, {county}
                  </div>
                </div>

                {/* Media Preview Box */}
                <div className="aspect-[16/10] bg-muted/40 w-full overflow-hidden relative flex items-center justify-center">
                  {mediaUrl ? (
                    mediaType === "VIDEO" ? (
                      <video
                        src={mediaUrl}
                        controls
                        playsInline
                        muted
                        className="w-full h-full object-contain bg-black"
                      />
                    ) : (
                      <img
                        src={mediaUrl}
                        alt="Preview"
                        className="w-full h-full object-cover"
                      />
                    )
                  ) : (
                    <div className="text-center p-6 space-y-1 text-muted-foreground">
                      <Upload className="w-6 h-6 mx-auto opacity-40" />
                      <p className="text-xs font-medium">Media preview will appear here</p>
                    </div>
                  )}
                </div>

                {/* Details */}
                <div className="p-4 space-y-3">
                  <div className="space-y-1">
                    <div className="flex items-center gap-1.5 text-xs font-bold text-brand-emerald">
                      <Building2 className="w-3.5 h-3.5" />
                      <span>{businessName || "Your Business Name"}</span>
                    </div>
                    <h3 className="font-extrabold text-sm sm:text-base text-foreground leading-snug">
                      {title || "Your Engaging Advertisement Headline"}
                    </h3>
                    <p className="text-xs text-muted-foreground line-clamp-2 leading-relaxed">
                      {description || "Your advertisement description and special customer offers will be showcased here to shoppers."}
                    </p>
                    {physicalAddress && (
                      <p className="text-[11px] text-muted-foreground/80 truncate pt-0.5">
                        <span className="font-semibold">Location:</span> {physicalAddress}
                      </p>
                    )}
                  </div>

                  {/* Buttons */}
                  <div className="pt-2 border-t border-border/40 flex flex-wrap gap-2">
                    <div className="flex-1 bg-muted text-foreground text-xs font-bold py-2 px-2.5 rounded-xl text-center flex items-center justify-center gap-1.5">
                      <Phone className="w-3.5 h-3.5 text-brand-emerald" />
                      <span>Call</span>
                    </div>
                    <div className="flex-1 bg-emerald-500 text-white text-xs font-bold py-2 px-2.5 rounded-xl text-center flex items-center justify-center gap-1.5 shadow-xs">
                      <MessageCircle className="w-3.5 h-3.5" />
                      <span>WhatsApp</span>
                    </div>
                    <div className="w-full bg-brand-emerald text-white text-xs font-bold py-2 px-3 rounded-xl text-center flex items-center justify-center gap-1.5 shadow-sm">
                      <span>{ctaLabel}</span>
                      <ExternalLink className="w-3.5 h-3.5" />
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Step 3: Payment & Launch */}
        {currentStep === "PAYMENT" && (
          <div className="bg-white dark:bg-brand-dark-card border border-border dark:border-brand-dark-border rounded-3xl p-6 sm:p-10 shadow-sm max-w-xl mx-auto space-y-6">
            <div className="text-center space-y-1">
              <h2 className="text-lg font-bold text-foreground">Step 3: Complete M-Pesa Payment</h2>
              <p className="text-xs text-muted-foreground">
                Pay securely via Safaricom Lipa na M-Pesa Online STK Push.
              </p>
            </div>

            {/* Price breakdown card */}
            <div className="bg-muted/30 border border-border rounded-2xl p-4 space-y-2 text-xs">
              <div className="flex justify-between text-muted-foreground">
                <span>Advertisement Plan</span>
                <span className="font-bold text-foreground">30-Day Featured Placement</span>
              </div>
              <div className="flex justify-between text-muted-foreground">
                <span>Target Region</span>
                <span className="font-bold text-foreground">{county} County &amp; Nationwide Feed</span>
              </div>
              <div className="flex justify-between text-muted-foreground">
                <span>Media Format</span>
                <span className="font-bold text-foreground">{mediaType === "VIDEO" ? "Video (≤30s)" : "High-Res Image"}</span>
              </div>
              <div className="pt-2 border-t border-border flex justify-between font-black text-sm text-foreground">
                <span>Total Amount Due</span>
                <span className="text-brand-emerald text-base">KES 1,020</span>
              </div>
            </div>

            {paymentError && (
              <div className="p-3 bg-red-50 dark:bg-red-950/50 border border-red-200 dark:border-red-900 rounded-xl text-xs text-red-600 dark:text-red-400 font-medium">
                {paymentError}
              </div>
            )}

            {isProcessingPayment ? (
              <div className="py-8 text-center space-y-4">
                <Loader2 className="w-10 h-10 animate-spin text-brand-emerald mx-auto" />
                <div className="space-y-1">
                  <h3 className="text-sm font-bold text-foreground">
                    {paymentStatus === "push_sent"
                      ? "Sending M-Pesa Prompt to Your Phone..."
                      : "Waiting for M-Pesa PIN Confirmation..."}
                  </h3>
                  <p className="text-xs text-muted-foreground max-w-sm mx-auto">
                    Please check your phone ({mpesaPhone}) and enter your M-Pesa PIN to complete payment of KES 1,020.
                  </p>
                </div>
              </div>
            ) : (
              <form onSubmit={handleInitiatePayment} className="space-y-4">
                <div>
                  <label className="block text-xs font-bold text-foreground mb-1">
                    M-Pesa Phone Number
                  </label>
                  <div className="relative">
                    <Phone className="w-4 h-4 absolute left-3 top-3 text-muted-foreground" />
                    <input
                      type="tel"
                      required
                      placeholder="0712 345 678 or 254712345678"
                      value={mpesaPhone}
                      onChange={(e) => setMpesaPhone(e.target.value)}
                      className="w-full bg-muted/30 dark:bg-brand-dark-bg/60 border border-border rounded-xl pl-9 pr-3 py-2.5 text-xs text-foreground focus:outline-none focus:ring-2 focus:ring-brand-emerald/40"
                    />
                  </div>
                  <p className="text-[11px] text-muted-foreground mt-1">
                    A prompt of <strong>KES 1,020</strong> will appear on this phone.
                  </p>
                </div>

                <div className="pt-2 flex items-center justify-between gap-3">
                  <button
                    type="button"
                    onClick={() => setCurrentStep("MEDIA")}
                    className="inline-flex items-center gap-1.5 text-xs font-bold text-muted-foreground hover:text-foreground py-2.5 px-4 rounded-xl border border-border"
                  >
                    <ArrowLeft className="w-3.5 h-3.5" />
                    <span>Back</span>
                  </button>

                  <button
                    type="submit"
                    className="flex-1 inline-flex items-center justify-center gap-2 bg-emerald-600 hover:bg-emerald-700 text-white font-black py-3 px-6 rounded-xl text-xs sm:text-sm shadow-md transition-all"
                  >
                    <span>Pay KES 1,020 via M-Pesa</span>
                    <ArrowRight className="w-4 h-4" />
                  </button>
                </div>
              </form>
            )}
          </div>
        )}

        {/* Step 4: Confirmation */}
        {currentStep === "CONFIRMATION" && (
          <div className="bg-white dark:bg-brand-dark-card border border-border dark:border-brand-dark-border rounded-3xl p-8 sm:p-12 shadow-sm max-w-xl mx-auto text-center space-y-6">
            <div className="w-16 h-16 rounded-full bg-brand-emerald/10 text-brand-emerald flex items-center justify-center mx-auto">
              <CheckCircle2 className="w-10 h-10" />
            </div>

            <div className="space-y-2">
              <h2 className="text-xl sm:text-2xl font-black text-foreground">
                Advertisement Submitted Successfully! 🎉
              </h2>
              <p className="text-xs sm:text-sm text-muted-foreground leading-relaxed">
                Thank you, <strong>{businessName}</strong>. Your advertisement order has been received and is currently under compliance review. Once approved, it will run actively for 30 days.
              </p>
            </div>

            <div className="bg-muted/30 border border-border rounded-2xl p-4 text-xs space-y-1.5 text-left">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Ad ID:</span>
                <span className="font-mono font-bold text-foreground">{createdAdId}</span>
              </div>
              {mpesaReceipt && (
                <div className="flex justify-between">
                  <span className="text-muted-foreground">M-Pesa Receipt:</span>
                  <span className="font-mono font-bold text-emerald-600 dark:text-emerald-400">{mpesaReceipt}</span>
                </div>
              )}
              <div className="flex justify-between">
                <span className="text-muted-foreground">Duration:</span>
                <span className="font-bold text-foreground">30 Days</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Status:</span>
                <span className="font-bold text-amber-600 dark:text-amber-400">PENDING REVIEW</span>
              </div>
            </div>

            <div className="pt-2 flex flex-col sm:flex-row gap-3 justify-center">
              <Link
                href="/account/advertisements"
                className="inline-flex items-center justify-center gap-2 bg-brand-emerald hover:bg-brand-emerald-dark text-white font-bold py-3 px-6 rounded-xl text-xs sm:text-sm shadow-md transition-all"
              >
                <span>View My Advertisements</span>
                <ArrowRight className="w-4 h-4" />
              </Link>
              <Link
                href="/"
                className="inline-flex items-center justify-center gap-2 bg-muted hover:bg-muted/80 text-foreground font-bold py-3 px-6 rounded-xl text-xs sm:text-sm transition-all"
              >
                <span>Return to Marketplace</span>
              </Link>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
