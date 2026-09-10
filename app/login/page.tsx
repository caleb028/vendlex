"use client";

import React, { useState, useEffect, Suspense } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useAuth } from "@/lib/store/auth-store";
import { Lock, Mail, Phone, ArrowRight, Eye, EyeOff, ShieldCheck, Store, Loader2 } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

const DISALLOWED_REDIRECTS = ["/login", "/register", "/forgot-password", "/reset-password", "/verify-email"];
const SAFE_REDIRECT_PREFIXES = [
  "/admin",
  "/seller",
  "/customer",
  "/account",
  "/marketplace",
  "/checkout",
  "/services",
  "/products",
  "/deals",
  "/businesses",
  "/advertise",
  "/pricing",
  "/community",
  "/help",
  "/verify",
];

function isValidRedirect(url: string | null): boolean {
  if (!url) return false;
  const trimmed = url.trim();
  if (trimmed.includes("//") || trimmed.includes("\\")) return false;
  if (DISALLOWED_REDIRECTS.some((disallowed) => trimmed === disallowed || trimmed.startsWith(disallowed + "?") || trimmed.startsWith(disallowed + "/"))) {
    return false;
  }
  return SAFE_REDIRECT_PREFIXES.some((prefix) => trimmed.startsWith(prefix));
}

function getDefaultRedirect(role: string): string {
  switch (role) {
    case "ADMIN":
    case "SUPER_ADMIN":
      return "/admin";
    case "SELLER":
    case "BUSINESS_OWNER":
      return "/seller/dashboard";
    case "CUSTOMER":
    case "SERVICE_PROVIDER":
    default:
      return "/customer/dashboard";
  }
}

function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { login, isAuthenticated, user } = useAuth();
  const [identifier, setIdentifier] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isRedirecting, setIsRedirecting] = useState(false);

  const redirectTo = searchParams.get("redirect") || "";

  // If already authenticated, immediately take user to their respective dashboard
  useEffect(() => {
    if (isAuthenticated && user) {
      setIsRedirecting(true);
      const target = redirectTo && isValidRedirect(redirectTo) ? redirectTo : getDefaultRedirect(user.role);
      window.location.href = target;
    }
  }, [isAuthenticated, user, redirectTo]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setErrorMsg("");

    const res = await login(identifier, password, rememberMe);

    if (!res.success) {
      setIsLoading(false);
      setErrorMsg(res.error || "Invalid email/phone or password.");
      return;
    }

    if (res.user) {
      setIsRedirecting(true);
      const target = redirectTo && isValidRedirect(redirectTo) ? redirectTo : getDefaultRedirect(res.user.role);
      // Hard navigation ensures session cookies and server layout components sync immediately
      window.location.href = target;
    } else {
      setIsLoading(false);
    }
  };

  const isPhone = /^[0-9+]/.test(identifier) && !identifier.includes("@");

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      className="max-w-4xl w-full bg-white dark:bg-brand-dark-card border border-border dark:border-brand-dark-border rounded-3xl shadow-xl overflow-hidden grid grid-cols-1 md:grid-cols-12"
    >
      {/* Left: Brand Banner */}
      <div className="md:col-span-5 bg-gradient-to-br from-brand-emerald-dark to-brand-emerald p-8 text-white flex flex-col justify-between space-y-8">
        <div className="space-y-4">
          <div className="bg-white p-3 rounded-2xl inline-block shadow-md">
            <img src="/logo/vendlex-logo.png" alt="VendLex" className="h-16 sm:h-20 w-auto max-w-[280px] object-contain" />
          </div>
          <div className="space-y-1">
            <h3 className="text-xl font-extrabold text-white">Karibu VendLex</h3>
            <p className="text-xs text-emerald-100 leading-relaxed">
              Log into Kenya&apos;s digital marketplace and SaaS business management ecosystem.
            </p>
          </div>
        </div>
        <div className="space-y-3 text-xs text-emerald-50">
          <div className="flex items-center gap-2">
            <ShieldCheck className="w-4 h-4 text-amber-300 shrink-0" />
            <span>Verified merchant credentials &amp; escrow</span>
          </div>
          <div className="flex items-center gap-2">
            <Store className="w-4 h-4 text-amber-300 shrink-0" />
            <span>Real-time inventory, orders &amp; M-Pesa sales</span>
          </div>
        </div>
        <div className="text-[11px] text-emerald-200">&copy; 2026 VendLex Technologies KE 🇰🇪</div>
      </div>

      {/* Right: Login Form */}
      <div className="md:col-span-7 p-6 sm:p-10 space-y-6">
        <div>
          <h2 className="text-xl font-bold text-foreground">Sign In to Your Account</h2>
          <p className="text-xs text-muted-foreground mt-0.5">
            Enter your email or phone number and password.
          </p>
        </div>

        <AnimatePresence mode="wait">
          {errorMsg && (
            <motion.div
              key="error"
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              className="p-3 bg-red-50 dark:bg-red-950/50 border border-red-200 dark:border-red-900 rounded-xl text-xs text-red-600 dark:text-red-400 font-medium"
              role="alert"
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
              <span>Sign-in successful! Redirecting to your dashboard...</span>
            </motion.div>
          )}
        </AnimatePresence>

        <form onSubmit={handleSubmit} className="space-y-4" noValidate>
          <div>
            <label htmlFor="identifier" className="block text-xs font-bold text-foreground mb-1">
              Email or Phone Number
            </label>
            <div className="relative">
              {isPhone ? (
                <Phone className="w-4 h-4 absolute left-3 top-3 text-muted-foreground" />
              ) : (
                <Mail className="w-4 h-4 absolute left-3 top-3 text-muted-foreground" />
              )}
              <input
                id="identifier"
                type={isPhone ? "tel" : "email"}
                autoComplete={isPhone ? "tel" : "username"}
                required
                value={identifier}
                onChange={(e) => setIdentifier(e.target.value)}
                placeholder="name@business.co.ke or 0712 345 678"
                className="w-full bg-muted/30 dark:bg-brand-dark-bg/60 border border-border rounded-xl pl-9 pr-3 py-2.5 text-xs text-foreground focus:outline-none focus:ring-2 focus:ring-brand-emerald/40 focus:border-brand-emerald transition-colors"
                disabled={isLoading || isRedirecting}
              />
            </div>
          </div>

          <div>
            <div className="flex items-center justify-between mb-1">
              <label htmlFor="password" className="text-xs font-bold text-foreground">Password</label>
              <Link href="/forgot-password" className="text-[11px] text-brand-emerald hover:underline font-semibold" tabIndex={-1}>
                Forgot Password?
              </Link>
            </div>
            <div className="relative">
              <Lock className="w-4 h-4 absolute left-3 top-3 text-muted-foreground" />
              <input
                id="password"
                type={showPassword ? "text" : "password"}
                autoComplete="current-password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full bg-muted/30 dark:bg-brand-dark-bg/60 border border-border rounded-xl pl-9 pr-10 py-2.5 text-xs text-foreground focus:outline-none focus:ring-2 focus:ring-brand-emerald/40 focus:border-brand-emerald transition-colors"
                disabled={isLoading || isRedirecting}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-2.5 text-muted-foreground hover:text-foreground transition-colors"
                aria-label={showPassword ? "Hide password" : "Show password"}
                tabIndex={-1}
              >
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <input
              id="remember"
              type="checkbox"
              checked={rememberMe}
              onChange={(e) => setRememberMe(e.target.checked)}
              className="w-3.5 h-3.5 rounded border-border text-brand-emerald focus:ring-brand-emerald"
              disabled={isLoading || isRedirecting}
            />
            <label htmlFor="remember" className="text-xs text-muted-foreground cursor-pointer select-none">
              Remember me for 30 days
            </label>
          </div>

          <button
            type="submit"
            disabled={isLoading || isRedirecting || !identifier || !password}
            className="w-full bg-brand-emerald hover:bg-brand-emerald-dark disabled:opacity-60 disabled:cursor-not-allowed text-white font-bold py-3 rounded-xl text-xs sm:text-sm flex items-center justify-center gap-2 shadow-md transition-all"
          >
            {isLoading || isRedirecting ? (
              <div className="flex items-center gap-2">
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>{isRedirecting ? "Taking you to dashboard..." : "Signing in..."}</span>
              </div>
            ) : (
              <>
                <span>Sign In</span>
                <ArrowRight className="w-4 h-4" />
              </>
            )}
          </button>
        </form>

        <div className="text-center text-xs text-muted-foreground pt-2">
          Don&apos;t have an account yet?{" "}
          <Link href="/register" className="text-brand-emerald font-bold hover:underline">
            Create Account
          </Link>
        </div>
      </div>
    </motion.div>
  );
}

export default function LoginPage() {
  return (
    <div className="min-h-[85vh] bg-brand-off-white dark:bg-brand-dark-bg flex items-center justify-center p-4 sm:p-6">
      <Suspense fallback={<Loader2 className="w-8 h-8 text-brand-emerald animate-spin" />}>
        <LoginForm />
      </Suspense>
    </div>
  );
}
