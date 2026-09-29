"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useAuth } from "@/lib/store/auth-store";
import {
  ShieldAlert,
  ShieldCheck,
  Lock,
  ArrowLeft,
  LogIn,
  Loader2,
  Mail,
  KeyRound,
  Eye,
  EyeOff,
  Sparkles,
  CheckCircle2,
} from "lucide-react";

export default function AdminRootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { user, role, isAuthenticated, isLoading, login } = useAuth();
  const [email, setEmail] = useState("calebngiciri075@gmail.com");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [authError, setAuthError] = useState<string | null>(null);

  const isSuperAdmin = isAuthenticated && user && (role === "ADMIN" || role === "SUPER_ADMIN");

  const handleAdminSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim() || !password.trim()) {
      setAuthError("Please provide both your administrator email and password.");
      return;
    }

    try {
      setIsSubmitting(true);
      setAuthError(null);
      const res = await login(email.trim(), password);
      if (!res.success) {
        setAuthError(res.error || "Invalid administrator email or password.");
      } else if (res.user?.role !== "ADMIN" && res.user?.role !== "SUPER_ADMIN") {
        setAuthError("Access denied. This account does not possess platform administrator privileges.");
      }
    } catch (err: any) {
      setAuthError(err?.message || "Authentication error. Please check your credentials.");
    } finally {
      setIsSubmitting(false);
    }
  };

  // Show loading state while verifying session
  if (isLoading) {
    return (
      <div className="min-h-screen bg-brand-charcoal text-white flex flex-col items-center justify-center p-4">
        <div className="flex flex-col items-center space-y-4 max-w-sm text-center">
          <div className="w-16 h-16 rounded-3xl bg-brand-emerald/20 border border-brand-emerald/40 flex items-center justify-center text-brand-emerald animate-pulse shadow-2xl">
            <ShieldCheck className="w-8 h-8 text-amber-300" />
          </div>
          <div className="space-y-1">
            <h3 className="text-base font-black text-white">Verifying Command Privileges</h3>
            <p className="text-xs text-emerald-100">Authenticating encrypted multi-factor session...</p>
          </div>
          <Loader2 className="w-5 h-5 text-amber-300 animate-spin" />
        </div>
      </div>
    );
  }

  // Dedicated In-Place Administrator Login Portal (Accessed directly via vendlex.vercel.app/admin)
  if (!isSuperAdmin) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-brand-charcoal via-[#071F17] to-brand-charcoal text-white flex flex-col items-center justify-center p-4 sm:p-6 selection:bg-brand-emerald selection:text-white">
        {/* Ambient background glow */}
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-96 h-96 bg-brand-emerald/15 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 max-w-md w-full bg-white/5 backdrop-blur-xl border border-white/10 rounded-3xl p-6 sm:p-9 shadow-2xl space-y-6">
          {/* Header with 3D Horizontal Logo */}
          <div className="text-center space-y-3">
            <div className="bg-white p-2.5 rounded-2xl inline-block shadow-lg border border-white/80">
              <img
                src="/logo/vendlex-horizontal.png"
                alt="VendLex Official"
                className="h-10 sm:h-12 w-auto max-w-[240px] object-contain"
              />
            </div>

            <div className="space-y-1 pt-1">
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-950/80 border border-emerald-500/40 text-amber-300 text-[11px] font-black uppercase tracking-wider">
                <ShieldCheck className="w-3.5 h-3.5 text-brand-emerald" />
                <span>Private Admin Command Center</span>
              </div>
              <h2 className="text-2xl font-black text-white tracking-tight">
                Administrator Sign In
              </h2>
              <p className="text-xs text-gray-300 leading-relaxed">
                Enter your master website email and password to manage all live operations.
              </p>
            </div>
          </div>

          {/* Error Banner */}
          {authError && (
            <div className="p-3.5 rounded-2xl bg-red-500/20 border border-red-500/40 text-red-200 text-xs flex items-start gap-2.5 animate-shake">
              <ShieldAlert className="w-4 h-4 text-red-400 shrink-0 mt-0.5" />
              <p className="leading-snug">{authError}</p>
            </div>
          )}

          {/* Sign In Form */}
          <form onSubmit={handleAdminSignIn} className="space-y-4">
            <div className="space-y-1.5 text-left">
              <label className="text-xs font-bold text-gray-200 flex items-center gap-1.5">
                <Mail className="w-3.5 h-3.5 text-amber-300" />
                <span>Admin Email Address</span>
              </label>
              <div className="relative">
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="admin@vendlex.co.ke"
                  required
                  className="w-full bg-white/10 border border-white/20 rounded-xl px-4 py-3 text-sm text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-brand-emerald focus:border-transparent transition-all"
                />
              </div>
            </div>

            <div className="space-y-1.5 text-left">
              <label className="text-xs font-bold text-gray-200 flex items-center justify-between">
                <span className="flex items-center gap-1.5">
                  <KeyRound className="w-3.5 h-3.5 text-amber-300" />
                  <span>Admin Password</span>
                </span>
              </label>
              <div className="relative">
                <input
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••••••"
                  required
                  className="w-full bg-white/10 border border-white/20 rounded-xl pl-4 pr-11 py-3 text-sm text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-brand-emerald focus:border-transparent transition-all"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-white transition-colors"
                  aria-label={showPassword ? "Hide password" : "Show password"}
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full bg-gradient-to-r from-brand-emerald to-emerald-600 hover:from-emerald-600 hover:to-emerald-700 active:scale-[0.98] text-white font-extrabold py-3.5 px-4 rounded-xl text-sm flex items-center justify-center gap-2 shadow-xl hover:shadow-emerald-900/40 transition-all cursor-pointer disabled:opacity-50"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin text-amber-300" />
                  <span>Authenticating Command Terminal...</span>
                </>
              ) : (
                <>
                  <LogIn className="w-4 h-4 text-amber-300" />
                  <span>Access Admin Command Hub</span>
                </>
              )}
            </button>
          </form>

          {/* Quick Return Link */}
          <div className="pt-2 border-t border-white/10 text-center">
            <Link
              href="/"
              className="inline-flex items-center gap-1.5 text-xs text-gray-300 hover:text-white transition-colors"
            >
              <ArrowLeft className="w-3.5 h-3.5 text-amber-300" />
              <span>Return to Public Marketplace</span>
            </Link>
          </div>
        </div>
      </div>
    );
  }

  // Render purely secured admin content for verified administrator
  return <div className="admin-portal-secure-wrapper min-h-screen bg-brand-off-white dark:bg-brand-dark-bg">{children}</div>;
}
