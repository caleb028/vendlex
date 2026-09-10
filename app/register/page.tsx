"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useAuth } from "@/lib/store/auth-store";
import { User, Mail, Lock, Phone, ArrowRight, Store, ShieldCheck, Loader2 } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

export default function RegisterPage() {
  const router = useRouter();
  const { register } = useAuth();

  const [roleType, setRoleType] = useState<"CUSTOMER" | "SELLER">("SELLER");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");
  const [errorMsg, setErrorMsg] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isRedirecting, setIsRedirecting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setErrorMsg("");

    const res = await register({
      name,
      email,
      phone,
      role: roleType,
      password,
    });

    if (!res.success) {
      setIsLoading(false);
      setErrorMsg(res.error || "Failed to create account.");
      return;
    }

    setIsRedirecting(true);
    if (roleType === "SELLER") {
      window.location.href = "/seller/onboarding";
    } else {
      window.location.href = "/customer/dashboard";
    }
  };

  return (
    <div className="min-h-[85vh] bg-brand-off-white dark:bg-brand-dark-bg flex items-center justify-center p-4 sm:p-6">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="max-w-xl w-full bg-white dark:bg-brand-dark-card border border-border dark:border-brand-dark-border rounded-3xl p-6 sm:p-10 shadow-xl space-y-6"
      >
        <div className="text-center space-y-2">
          <Link href="/" className="inline-block bg-white p-3 rounded-2xl border border-gray-200/90 shadow-md">
            <img src="/logo/vendlex-logo.png" alt="VendLex" className="h-16 sm:h-20 md:h-24 w-auto mx-auto object-contain max-w-[320px]" />
          </Link>
          <h2 className="text-2xl font-black text-foreground">Create Your Account</h2>
          <p className="text-xs text-muted-foreground">Join Kenya&apos;s fastest growing digital commerce platform.</p>
        </div>

        {/* Account Role Picker */}
        <div className="grid grid-cols-2 gap-3">
          <button
            type="button"
            onClick={() => setRoleType("SELLER")}
            className={`p-3.5 rounded-2xl border text-center transition-all ${
              roleType === "SELLER"
                ? "border-brand-emerald bg-brand-emerald-soft text-brand-emerald font-bold"
                : "border-border text-muted-foreground hover:text-foreground"
            }`}
          >
            <Store className="w-5 h-5 mx-auto mb-1" />
            <span className="text-xs block">Business / Seller</span>
          </button>

          <button
            type="button"
            onClick={() => setRoleType("CUSTOMER")}
            className={`p-3.5 rounded-2xl border text-center transition-all ${
              roleType === "CUSTOMER"
                ? "border-brand-emerald bg-brand-emerald-soft text-brand-emerald font-bold"
                : "border-border text-muted-foreground hover:text-foreground"
            }`}
          >
            <User className="w-5 h-5 mx-auto mb-1" />
            <span className="text-xs block">Customer / Shopper</span>
          </button>
        </div>

        <AnimatePresence mode="wait">
          {errorMsg && (
            <motion.div
              key="error"
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              className="p-3 bg-red-50 dark:bg-red-950/50 border border-red-200 dark:border-red-900 rounded-xl text-xs text-brand-red font-medium"
            >
              {errorMsg}
            </motion.div>
          )}
          {isRedirecting && (
            <motion.div
              key="redirecting"
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              className="p-3 bg-emerald-50 dark:bg-emerald-950/50 border border-emerald-200 dark:border-emerald-900 rounded-xl text-xs text-brand-emerald dark:text-emerald-300 font-bold flex items-center gap-2"
            >
              <Loader2 className="w-4 h-4 animate-spin text-brand-emerald shrink-0" />
              <span>Account created! Redirecting to your dashboard...</span>
            </motion.div>
          )}
        </AnimatePresence>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-bold text-foreground mb-1">Full Legal Name *</label>
            <input
              type="text"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. Grace Wanjiku"
              className="w-full bg-muted/30 border border-border rounded-xl p-3 text-xs text-foreground focus:outline-none focus:border-brand-emerald"
              disabled={isLoading || isRedirecting}
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-foreground mb-1">Email Address *</label>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="name@gmail.com"
                className="w-full bg-muted/30 border border-border rounded-xl p-3 text-xs text-foreground focus:outline-none focus:border-brand-emerald"
                disabled={isLoading || isRedirecting}
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-foreground mb-1">Phone (+254 M-Pesa) *</label>
              <input
                type="tel"
                required
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="07XX XXX XXX"
                className="w-full bg-muted/30 border border-border rounded-xl p-3 text-xs text-foreground font-mono focus:outline-none focus:border-brand-emerald"
                disabled={isLoading || isRedirecting}
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-foreground mb-1">Create Password *</label>
            <input
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              className="w-full bg-muted/30 border border-border rounded-xl p-3 text-xs text-foreground focus:outline-none focus:border-brand-emerald"
              disabled={isLoading || isRedirecting}
            />
          </div>

          <button
            type="submit"
            disabled={isLoading || isRedirecting}
            className="w-full bg-brand-emerald hover:bg-brand-emerald-dark disabled:opacity-60 text-white font-bold py-3 rounded-xl text-xs sm:text-sm flex items-center justify-center gap-2 shadow-md transition-all"
          >
            {isLoading || isRedirecting ? (
              <div className="flex items-center gap-2">
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>{isRedirecting ? "Setting up dashboard..." : "Creating account..."}</span>
              </div>
            ) : (
              <>
                <span>{roleType === "SELLER" ? "Continue to Business Setup" : "Create Shopper Account"}</span>
                <ArrowRight className="w-4 h-4" />
              </>
            )}
          </button>
        </form>

        <div className="text-center text-xs text-muted-foreground">
          Already have an account?{" "}
          <Link href="/login" className="text-brand-emerald font-bold hover:underline">
            Sign In Here
          </Link>
        </div>
      </motion.div>
    </div>
  );
}
