"use client";

import React, { useEffect, useState, Suspense } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { CheckCircle2, XCircle, Loader2 } from "lucide-react";
import { motion } from "framer-motion";

function VerifyEmailContent() {
  const searchParams = useSearchParams();
  const token = searchParams.get("token") || "";
  const [status, setStatus] = useState<"loading" | "success" | "error">(token ? "loading" : "error");
  const [errorMsg, setErrorMsg] = useState(token ? "" : "Missing verification token.");

  useEffect(() => {
    if (!token) return;

    fetch("/api/auth/verify-email", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ token }),
    })
      .then((res) => res.json())
      .then((data) => {
        if (data.success) {
          setStatus("success");
        } else {
          setStatus("error");
          setErrorMsg(data.error || "Verification failed.");
        }
      })
      .catch(() => {
        setStatus("error");
        setErrorMsg("Network error. Please try again.");
      });
  }, [token]);

  if (status === "loading") {
    return (
      <div className="text-center space-y-4">
        <Loader2 className="w-12 h-12 text-brand-emerald mx-auto animate-spin" />
        <h2 className="text-xl font-bold text-foreground">Verifying Email...</h2>
        <p className="text-xs text-muted-foreground">Please wait while we verify your email address.</p>
      </div>
    );
  }

  if (status === "success") {
    return (
      <div className="text-center space-y-4">
        <CheckCircle2 className="w-12 h-12 text-brand-emerald mx-auto" />
        <h2 className="text-xl font-bold text-foreground">Email Verified!</h2>
        <p className="text-xs text-muted-foreground">Your email has been verified successfully.</p>
        <Link href="/login" className="inline-block bg-brand-emerald text-white text-xs font-bold px-6 py-2.5 rounded-xl hover:bg-brand-emerald-dark transition-colors">
          Continue to Sign In
        </Link>
      </div>
    );
  }

  return (
    <div className="text-center space-y-4">
      <XCircle className="w-12 h-12 text-red-500 mx-auto" />
      <h2 className="text-xl font-bold text-foreground">Verification Failed</h2>
      <p className="text-xs text-muted-foreground">{errorMsg}</p>
      <Link href="/login" className="inline-block bg-brand-emerald text-white text-xs font-bold px-6 py-2.5 rounded-xl hover:bg-brand-emerald-dark transition-colors">
        Back to Sign In
      </Link>
    </div>
  );
}

export default function VerifyEmailPage() {
  return (
    <div className="min-h-[80vh] bg-brand-off-white dark:bg-brand-dark-bg flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="max-w-md w-full bg-white dark:bg-brand-dark-card border border-border dark:border-brand-dark-border rounded-3xl p-8 shadow-xl space-y-6"
      >
        <Link href="/" className="inline-block mx-auto">
          <img src="/logo/vendlex-logo.png" alt="VendLex" className="h-14 w-auto mx-auto object-contain" />
        </Link>
        <Suspense fallback={<Loader2 className="w-6 h-6 animate-spin mx-auto text-brand-emerald" />}>
          <VerifyEmailContent />
        </Suspense>
      </motion.div>
    </div>
  );
}
