"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useAuth } from "@/lib/store/auth-store";
import { User, Mail, Lock, Phone, ArrowRight, Store, ShieldCheck } from "lucide-react";

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
    setIsLoading(false);

    if (!res.success) {
      setErrorMsg(res.error || "Failed to create account.");
      return;
    }

    if (roleType === "SELLER") {
      router.push("/seller/onboarding");
    } else {
      router.push("/marketplace");
    }
  };

  return (
    <div className="min-h-[85vh] bg-brand-off-white dark:bg-brand-dark-bg flex items-center justify-center p-4 sm:p-6">
      <div className="max-w-xl w-full bg-white dark:bg-brand-dark-card border border-border dark:border-brand-dark-border rounded-3xl p-6 sm:p-10 shadow-xl space-y-6">
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

        {errorMsg && (
          <div className="p-3 bg-red-50 dark:bg-red-950/50 border border-red-200 dark:border-red-900 rounded-xl text-xs text-brand-red font-medium">
            {errorMsg}
          </div>
        )}

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
            />
          </div>

          <button
            type="submit"
            className="w-full bg-brand-emerald hover:bg-brand-emerald-dark text-white font-bold py-3 rounded-xl text-xs sm:text-sm flex items-center justify-center gap-2 shadow-md transition-all"
          >
            <span>{roleType === "SELLER" ? "Continue to Business Setup" : "Create Shopper Account"}</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </form>

        <div className="text-center text-xs text-muted-foreground">
          Already have an account?{" "}
          <Link href="/login" className="text-brand-emerald font-bold hover:underline">
            Sign In Here
          </Link>
        </div>
      </div>
    </div>
  );
}
