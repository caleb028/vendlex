"use client";

import React from "react";
import Link from "next/link";
import { useAuth } from "@/lib/store/auth-store";
import { ShieldAlert, ShieldCheck, Lock, ArrowLeft, LogIn, Loader2 } from "lucide-react";

export default function AdminRootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { user, role, isAuthenticated, isLoading } = useAuth();

  const isSuperAdmin = isAuthenticated && user && (role === "ADMIN" || role === "SUPER_ADMIN");

  // Show loading shield state while verifying session
  if (isLoading) {
    return (
      <div className="min-h-screen bg-brand-off-white dark:bg-brand-dark-bg flex flex-col items-center justify-center p-4">
        <div className="flex flex-col items-center space-y-4 max-w-sm text-center">
          <div className="w-16 h-16 rounded-3xl bg-brand-emerald/10 border border-brand-emerald/20 flex items-center justify-center text-brand-emerald animate-pulse shadow-inner">
            <ShieldCheck className="w-8 h-8" />
          </div>
          <div className="space-y-1">
            <h3 className="text-sm font-black text-foreground">Verifying Administrator Privileges</h3>
            <p className="text-xs text-muted-foreground">Authenticating secure multi-factor session...</p>
          </div>
          <Loader2 className="w-5 h-5 text-brand-emerald animate-spin" />
        </div>
      </div>
    );
  }

  // Strictly block unauthorized access with 403 Security Screen
  if (!isSuperAdmin) {
    return (
      <div className="min-h-screen bg-brand-off-white dark:bg-brand-dark-bg flex items-center justify-center p-4 sm:p-6">
        <div className="max-w-md w-full bg-white dark:bg-brand-dark-card border border-red-200 dark:border-red-950/80 rounded-3xl p-8 shadow-2xl space-y-6 text-center animate-pop-up">
          <div className="w-16 h-16 rounded-3xl bg-red-50 dark:bg-red-950/60 text-brand-red flex items-center justify-center mx-auto shadow-inner border border-red-200 dark:border-red-900/60">
            <Lock className="w-8 h-8" />
          </div>

          <div className="space-y-2">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-red-100 dark:bg-red-950/80 text-brand-red text-[11px] font-black uppercase tracking-wider border border-red-200 dark:border-red-900">
              <ShieldAlert className="w-3.5 h-3.5" />
              <span>403 Restricted Administrator Area</span>
            </div>
            <h2 className="text-xl font-black text-foreground">
              Private Admin Command Center
            </h2>
            <p className="text-xs text-muted-foreground leading-relaxed">
              This secured portal is exclusively restricted to the Platform Administrator (<strong>Caleb Ngiciri</strong>). Public visitors, customers, and standard sellers cannot view or access this system.
            </p>
          </div>

          <div className="p-4 bg-muted/40 dark:bg-brand-dark-bg/60 border border-border rounded-2xl text-left space-y-2 text-xs">
            <div className="flex items-center justify-between text-muted-foreground">
              <span>Security Level:</span>
              <span className="font-bold text-red-600 dark:text-red-400">Restricted / Isolated</span>
            </div>
            <div className="flex items-center justify-between text-muted-foreground">
              <span>Current Role:</span>
              <span className="font-bold text-foreground">{user?.role || "GUEST"}</span>
            </div>
            <div className="flex items-center justify-between text-muted-foreground">
              <span>Access Policy:</span>
              <span className="font-bold text-brand-emerald">Zero-Trust Admin Lock</span>
            </div>
          </div>

          <div className="space-y-2.5 pt-2">
            <Link
              href="/login?redirect=/admin"
              className="w-full bg-brand-emerald hover:bg-brand-emerald-dark text-white font-bold py-3 px-4 rounded-xl text-xs flex items-center justify-center gap-2 shadow-md transition-all"
            >
              <LogIn className="w-4 h-4" />
              <span>Sign In with Admin Account</span>
            </Link>

            <Link
              href="/"
              className="w-full bg-muted/60 hover:bg-muted text-foreground font-semibold py-2.5 px-4 rounded-xl text-xs flex items-center justify-center gap-2 transition-colors"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>Return to Public Marketplace</span>
            </Link>
          </div>
        </div>
      </div>
    );
  }

  // Render purely secured admin content for verified administrator
  return <div className="admin-portal-secure-wrapper">{children}</div>;
}
