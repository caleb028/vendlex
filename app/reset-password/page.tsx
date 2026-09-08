"use client";

import React, { useState, Suspense } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { Lock, CheckCircle2, XCircle, ArrowRight, Eye, EyeOff, Loader2 } from "lucide-react";
import { motion } from "framer-motion";

function ResetPasswordForm() {
  const searchParams = useSearchParams();
  const token = searchParams.get("token") || "";
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [status, setStatus] = useState<"idle" | "success" | "error">("idle");
  const [errorMsg, setErrorMsg] = useState("");

  const passwordStrength = password.length >= 12 ? "Strong" : password.length >= 8 ? "Good" : password.length > 0 ? "Weak" : "";
  const strengthColor = password.length >= 12 ? "bg-green-500" : password.length >= 8 ? "bg-amber-500" : "bg-red-500";

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (password !== confirm) {
      setErrorMsg("Passwords do not match.");
      return;
    }
    if (password.length < 8) {
      setErrorMsg("Password must be at least 8 characters.");
      return;
    }

    setIsLoading(true);
    setErrorMsg("");

    try {
      const res = await fetch("/api/auth/reset-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token, password }),
      });
      const data = await res.json();

      if (!res.ok || !data.success) {
        setErrorMsg(data.error || "Failed to reset password.");
        if (res.status === 400 && data.error?.includes("expired")) {
          setStatus("error");
        }
        setIsLoading(false);
        return;
      }

      setStatus("success");
    } catch {
      setErrorMsg("Network error. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  if (!token) {
    return (
      <div className="text-center space-y-4">
        <XCircle className="w-12 h-12 text-red-500 mx-auto" />
        <h2 className="text-xl font-bold text-foreground">Invalid Reset Link</h2>
        <p className="text-xs text-muted-foreground">This password reset link is missing or invalid.</p>
        <Link href="/forgot-password" className="inline-block bg-brand-emerald text-white text-xs font-bold px-6 py-2.5 rounded-xl">
          Request New Reset Link
        </Link>
      </div>
    );
  }

  if (status === "success") {
    return (
      <div className="text-center space-y-4">
        <CheckCircle2 className="w-12 h-12 text-brand-emerald mx-auto" />
        <h2 className="text-xl font-bold text-foreground">Password Reset Successful</h2>
        <p className="text-xs text-muted-foreground">Your password has been updated. Please sign in with your new password.</p>
        <Link href="/login" className="inline-flex items-center gap-2 bg-brand-emerald text-white text-xs font-bold px-6 py-2.5 rounded-xl">
          Sign In <ArrowRight className="w-3.5 h-3.5" />
        </Link>
      </div>
    );
  }

  if (status === "error") {
    return (
      <div className="text-center space-y-4">
        <XCircle className="w-12 h-12 text-red-500 mx-auto" />
        <h2 className="text-xl font-bold text-foreground">Link Expired</h2>
        <p className="text-xs text-muted-foreground">{errorMsg || "This reset link has expired. Please request a new one."}</p>
        <Link href="/forgot-password" className="inline-block bg-brand-emerald text-white text-xs font-bold px-6 py-2.5 rounded-xl">
          Request New Reset Link
        </Link>
      </div>
    );
  }

  return (
    <>
      <div className="space-y-1">
        <h2 className="text-xl font-bold text-foreground">Set New Password</h2>
        <p className="text-xs text-muted-foreground">Choose a strong password for your VendLex account.</p>
      </div>

      {errorMsg && (
        <div className="p-3 bg-red-50 dark:bg-red-950/50 border border-red-200 dark:border-red-900 rounded-xl text-xs text-red-600 dark:text-red-400 font-medium" role="alert">
          {errorMsg}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4 text-left">
        <div>
          <label htmlFor="new-password" className="block text-xs font-bold text-foreground mb-1">New Password</label>
          <div className="relative">
            <Lock className="w-4 h-4 absolute left-3 top-3 text-muted-foreground" />
            <input
              id="new-password"
              type={showPassword ? "text" : "password"}
              autoComplete="new-password"
              required
              minLength={8}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Minimum 8 characters"
              className="w-full bg-muted/30 dark:bg-brand-dark-bg/60 border border-border rounded-xl pl-9 pr-10 py-3 text-xs text-foreground focus:outline-none focus:ring-2 focus:ring-brand-emerald/40 focus:border-brand-emerald"
              disabled={isLoading}
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-3 top-2.5 text-muted-foreground hover:text-foreground"
              aria-label={showPassword ? "Hide password" : "Show password"}
              tabIndex={-1}
            >
              {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
            </button>
          </div>
          {password && (
            <div className="mt-1.5 flex items-center gap-2">
              <div className="flex-1 h-1 rounded-full bg-muted overflow-hidden">
                <div className={`h-full rounded-full transition-all ${strengthColor}`} style={{ width: password.length >= 12 ? "100%" : password.length >= 8 ? "66%" : "33%" }} />
              </div>
              <span className="text-[10px] font-bold text-muted-foreground">{passwordStrength}</span>
            </div>
          )}
        </div>

        <div>
          <label htmlFor="confirm-password" className="block text-xs font-bold text-foreground mb-1">Confirm Password</label>
          <div className="relative">
            <Lock className="w-4 h-4 absolute left-3 top-3 text-muted-foreground" />
            <input
              id="confirm-password"
              type={showPassword ? "text" : "password"}
              autoComplete="new-password"
              required
              value={confirm}
              onChange={(e) => setConfirm(e.target.value)}
              placeholder="Re-enter your password"
              className="w-full bg-muted/30 dark:bg-brand-dark-bg/60 border border-border rounded-xl pl-9 pr-3 py-3 text-xs text-foreground focus:outline-none focus:ring-2 focus:ring-brand-emerald/40 focus:border-brand-emerald"
              disabled={isLoading}
            />
          </div>
          {confirm && password !== confirm && (
            <p className="text-[10px] text-red-500 mt-1">Passwords do not match</p>
          )}
        </div>

        <button
          type="submit"
          disabled={isLoading || !password || !confirm || password !== confirm}
          className="w-full bg-brand-emerald hover:bg-brand-emerald-dark disabled:opacity-60 text-white font-bold py-3 rounded-xl text-xs flex items-center justify-center gap-2 shadow-sm transition-all"
        >
          {isLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : (
            <>
              <span>Reset Password</span>
              <ArrowRight className="w-4 h-4" />
            </>
          )}
        </button>
      </form>
    </>
  );
}

export default function ResetPasswordPage() {
  return (
    <div className="min-h-[80vh] bg-brand-off-white dark:bg-brand-dark-bg flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="max-w-md w-full bg-white dark:bg-brand-dark-card border border-border dark:border-brand-dark-border rounded-3xl p-8 shadow-xl space-y-6 text-center"
      >
        <Link href="/" className="inline-block">
          <img src="/logo/vendlex-logo.png" alt="VendLex" className="h-14 w-auto mx-auto object-contain" />
        </Link>
        <Suspense fallback={<Loader2 className="w-6 h-6 animate-spin mx-auto text-brand-emerald" />}>
          <ResetPasswordForm />
        </Suspense>
      </motion.div>
    </div>
  );
}
