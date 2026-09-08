"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import {
  Mail,
  ArrowRight,
  CheckCircle2,
  ArrowLeft,
  Loader2,
  ExternalLink,
  Eye,
  Key,
  Copy,
  Check,
  Info,
  Sparkles,
  Inbox,
  Send,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

interface DevInfo {
  email?: string;
  name?: string;
  token?: string;
  resetUrl?: string;
  provider?: "SMTP" | "LOCAL_SPOOL";
  notice?: string;
  suggestedDemoAccounts?: Array<{ name: string; email: string; phone: string }>;
}

interface SentEmailRecord {
  id: string;
  to: string;
  subject: string;
  type: string;
  sentAt: string;
  provider: string;
  html: string;
  token?: string;
}

export default function ForgotPasswordPage() {
  const [identifier, setIdentifier] = useState("");
  const [sent, setSent] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");
  const [devInfo, setDevInfo] = useState<DevInfo | null>(null);
  const [copied, setCopied] = useState(false);
  const [showPreviewModal, setShowPreviewModal] = useState(false);
  const [recentEmails, setRecentEmails] = useState<SentEmailRecord[]>([]);
  const [selectedEmailPreview, setSelectedEmailPreview] = useState<SentEmailRecord | null>(null);
  const [showInbox, setShowInbox] = useState(false);

  const fetchRecentEmails = async () => {
    try {
      const res = await fetch("/api/admin/mail");
      const data = await res.json();
      if (data.success && Array.isArray(data.emails)) {
        setRecentEmails(data.emails);
      }
    } catch {
      // Ignore in background
    }
  };

  useEffect(() => {
    fetchRecentEmails();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setErrorMsg("");
    setDevInfo(null);

    try {
      const res = await fetch("/api/auth/forgot-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ identifier }),
      });
      const data = await res.json();

      if (!res.ok && data.error) {
        setErrorMsg(data.error);
        setIsLoading(false);
        return;
      }

      if (data.devInfo) {
        setDevInfo(data.devInfo);
      }

      setSent(true);
      fetchRecentEmails();
    } catch {
      setErrorMsg("Network error. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const selectDemoAccount = (email: string) => {
    setIdentifier(email);
    setErrorMsg("");
  };

  return (
    <div className="min-h-[85vh] bg-brand-off-white dark:bg-brand-dark-bg flex flex-col items-center justify-center p-4 py-8">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="max-w-lg w-full bg-white dark:bg-brand-dark-card border border-border dark:border-brand-dark-border rounded-3xl p-6 sm:p-8 shadow-xl space-y-6 text-center"
      >
        <Link href="/" className="inline-block bg-white p-2.5 rounded-2xl border border-gray-200/90 shadow-xs">
          <img src="/logo/vendlex-logo.png" alt="VendLex" className="h-12 w-auto mx-auto object-contain" />
        </Link>

        {sent ? (
          <div className="space-y-5 text-left">
            <div className="text-center space-y-2">
              <CheckCircle2 className="w-12 h-12 text-brand-emerald mx-auto" />
              <h2 className="text-xl font-bold text-foreground">Password Reset Dispatched</h2>
              <p className="text-xs text-muted-foreground">
                If an account matches <strong>{identifier}</strong>, you will receive password reset instructions.
              </p>
            </div>

            {/* Direct Reset Link Box (Instant Testing) */}
            {devInfo?.resetUrl && (
              <div className="bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800/60 rounded-2xl p-4 space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-1.5 text-xs font-bold text-emerald-800 dark:text-emerald-300">
                    <Sparkles className="w-4 h-4 text-emerald-600" />
                    <span>Instant Testing: Direct Reset Link</span>
                  </div>
                  <span className="text-[10px] uppercase font-mono px-2 py-0.5 rounded bg-emerald-200/70 dark:bg-emerald-800/60 text-emerald-900 dark:text-emerald-100 font-bold">
                    {devInfo.provider === "SMTP" ? "Sent via SMTP" : "Local Spool"}
                  </span>
                </div>

                <p className="text-[11px] text-emerald-700 dark:text-emerald-300 leading-relaxed">
                  A cryptographic reset token was generated for <strong>{devInfo.email}</strong>. You can click below to set a new password immediately:
                </p>

                <div className="flex flex-col sm:flex-row gap-2 pt-1">
                  <Link
                    href={devInfo.resetUrl}
                    className="flex-1 inline-flex items-center justify-center gap-2 bg-brand-emerald text-white text-xs font-bold px-4 py-2.5 rounded-xl hover:bg-brand-emerald-dark shadow-xs transition-colors"
                  >
                    <Key className="w-3.5 h-3.5" />
                    <span>Open Reset Password Page</span>
                    <ExternalLink className="w-3.5 h-3.5" />
                  </Link>

                  <button
                    onClick={() => copyToClipboard(devInfo.resetUrl || "")}
                    className="inline-flex items-center justify-center gap-1.5 bg-white dark:bg-brand-dark-bg border border-emerald-300 dark:border-emerald-700 text-emerald-800 dark:text-emerald-300 text-xs font-semibold px-3 py-2.5 rounded-xl hover:bg-emerald-100/50 transition-colors"
                    title="Copy reset link"
                  >
                    {copied ? <Check className="w-3.5 h-3.5 text-green-600" /> : <Copy className="w-3.5 h-3.5" />}
                    <span>{copied ? "Copied" : "Copy Link"}</span>
                  </button>
                </div>
              </div>
            )}

            {/* If Account Not Found Notice */}
            {devInfo?.suggestedDemoAccounts && (
              <div className="bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800/60 rounded-2xl p-4 space-y-2 text-xs">
                <div className="flex items-center gap-1.5 font-bold text-amber-800 dark:text-amber-300">
                  <Info className="w-4 h-4 text-amber-600" />
                  <span>Account Not Found in Database</span>
                </div>
                <p className="text-muted-foreground text-[11px]">
                  The entered identifier was not found in the database. You can test with one of the pre-seeded accounts:
                </p>
                <div className="flex flex-wrap gap-1.5 pt-1">
                  {devInfo.suggestedDemoAccounts.map((acc) => (
                    <button
                      key={acc.email}
                      onClick={() => {
                        setIdentifier(acc.email);
                        setSent(false);
                      }}
                      className="text-[11px] font-semibold px-2.5 py-1 rounded-lg bg-white dark:bg-brand-dark-card border border-amber-300 dark:border-amber-700 text-foreground hover:border-brand-emerald transition-colors"
                    >
                      {acc.name}: {acc.email}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Actions Row */}
            <div className="flex items-center justify-between pt-2 border-t border-border">
              <button
                onClick={() => {
                  setSent(false);
                  setDevInfo(null);
                }}
                className="text-xs text-brand-emerald font-bold hover:underline"
              >
                &larr; Try Another Email
              </button>
              <Link
                href="/login"
                className="inline-flex items-center gap-1.5 text-xs font-bold text-foreground hover:text-brand-emerald transition-colors"
              >
                <span>Back to Sign In</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>
          </div>
        ) : (
          <>
            <div className="space-y-1">
              <h2 className="text-xl font-bold text-foreground">Reset Your Password</h2>
              <p className="text-xs text-muted-foreground">
                Enter your registered email address or phone number to receive a secure password reset link.
              </p>
            </div>

            {/* One-click Demo Accounts */}
            <div className="bg-muted/30 dark:bg-brand-dark-bg/60 border border-border/80 rounded-2xl p-3 text-left space-y-1.5">
              <div className="text-[10px] font-bold uppercase text-muted-foreground tracking-wider">
                Quick Test Accounts (1-Click Fill)
              </div>
              <div className="flex flex-wrap gap-1.5">
                <button
                  type="button"
                  onClick={() => selectDemoAccount("kevin@nairobihub.co.ke")}
                  className="text-[11px] font-semibold px-2 py-1 rounded-lg bg-white dark:bg-brand-dark-card border border-border text-foreground hover:border-brand-emerald hover:text-brand-emerald transition-colors"
                >
                  Kevin (Seller): kevin@nairobihub.co.ke
                </button>
                <button
                  type="button"
                  onClick={() => selectDemoAccount("grace.wanjiku@gmail.com")}
                  className="text-[11px] font-semibold px-2 py-1 rounded-lg bg-white dark:bg-brand-dark-card border border-border text-foreground hover:border-brand-emerald hover:text-brand-emerald transition-colors"
                >
                  Grace (Buyer): grace.wanjiku@gmail.com
                </button>
                <button
                  type="button"
                  onClick={() => selectDemoAccount("admin@vendlex.vercel.app")}
                  className="text-[11px] font-semibold px-2 py-1 rounded-lg bg-white dark:bg-brand-dark-card border border-border text-foreground hover:border-brand-emerald hover:text-brand-emerald transition-colors"
                >
                  Admin: admin@vendlex.vercel.app
                </button>
              </div>
            </div>

            {errorMsg && (
              <div
                className="p-3 bg-red-50 dark:bg-red-950/50 border border-red-200 dark:border-red-900 rounded-xl text-xs text-red-600 dark:text-red-400 font-medium text-left"
                role="alert"
              >
                {errorMsg}
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4 text-left">
              <div>
                <label htmlFor="identifier" className="block text-xs font-bold text-foreground mb-1">
                  Email or Kenyan Phone Number
                </label>
                <div className="relative">
                  <Mail className="w-4 h-4 absolute left-3 top-3 text-muted-foreground" />
                  <input
                    id="identifier"
                    type="text"
                    required
                    autoComplete="username"
                    value={identifier}
                    onChange={(e) => setIdentifier(e.target.value)}
                    placeholder="e.g. kevin@nairobihub.co.ke or 0712 345 678"
                    className="w-full bg-muted/30 dark:bg-brand-dark-bg/60 border border-border rounded-xl pl-9 pr-3 py-3 text-xs text-foreground focus:outline-none focus:ring-2 focus:ring-brand-emerald/40 focus:border-brand-emerald transition-colors font-medium"
                    disabled={isLoading}
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={isLoading || !identifier.trim()}
                className="w-full bg-brand-emerald hover:bg-brand-emerald-dark disabled:opacity-60 text-white font-bold py-3 rounded-xl text-xs sm:text-sm flex items-center justify-center gap-2 shadow-sm transition-all cursor-pointer"
              >
                {isLoading ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>Dispatching Reset Email...</span>
                  </>
                ) : (
                  <>
                    <Send className="w-4 h-4" />
                    <span>Send Password Reset Email</span>
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>
            </form>

            <div className="text-xs text-muted-foreground pt-1">
              Remember your password?{" "}
              <Link href="/login" className="text-brand-emerald font-bold hover:underline">
                Back to Sign In
              </Link>
            </div>
          </>
        )}
      </motion.div>

      {/* In-App Live Sent Emails / Mail Spool Inspector */}
      <div className="max-w-lg w-full mt-6">
        <button
          onClick={() => setShowInbox(!showInbox)}
          className="w-full flex items-center justify-between p-3 rounded-2xl bg-white dark:bg-brand-dark-card border border-border text-xs font-semibold text-muted-foreground hover:text-foreground transition-colors shadow-xs"
        >
          <div className="flex items-center gap-2">
            <Inbox className="w-4 h-4 text-brand-emerald" />
            <span>In-App Email Inspector &amp; Test Inboxes ({recentEmails.length} sent)</span>
          </div>
          <span className="text-[11px] text-brand-emerald font-bold">
            {showInbox ? "Hide" : "View Spool"}
          </span>
        </button>

        {showInbox && (
          <div className="mt-2 bg-white dark:bg-brand-dark-card border border-border rounded-2xl p-4 shadow-lg space-y-3 animate-fadeIn">
            <div className="flex items-center justify-between border-b border-border pb-2">
              <span className="text-xs font-bold text-foreground">Recent Dispatched Emails</span>
              <button
                onClick={fetchRecentEmails}
                className="text-[11px] text-brand-emerald font-bold hover:underline"
              >
                Refresh
              </button>
            </div>

            {recentEmails.length === 0 ? (
              <p className="text-xs text-muted-foreground text-center py-4">No emails sent yet in this session.</p>
            ) : (
              <div className="space-y-2 max-h-64 overflow-y-auto pr-1">
                {recentEmails.slice(0, 8).map((email) => (
                  <div
                    key={email.id}
                    className="p-2.5 rounded-xl border border-border/80 bg-muted/20 dark:bg-brand-dark-bg/40 flex items-center justify-between gap-2"
                  >
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-1.5">
                        <span className="text-[9px] uppercase font-bold px-1.5 py-0.5 rounded bg-brand-emerald/10 text-brand-emerald font-mono">
                          {email.type}
                        </span>
                        <span className="text-xs font-bold text-foreground truncate">{email.to}</span>
                      </div>
                      <div className="text-[11px] text-muted-foreground truncate">{email.subject}</div>
                      <div className="text-[10px] text-muted-foreground/80">{new Date(email.sentAt).toLocaleTimeString()}</div>
                    </div>

                    <div className="flex items-center gap-1 shrink-0">
                      {email.token && (
                        <Link
                          href={`/reset-password?token=${encodeURIComponent(email.token)}`}
                          className="px-2 py-1 rounded-lg bg-brand-emerald text-white text-[11px] font-bold hover:bg-brand-emerald-dark"
                          title="Open Reset Link"
                        >
                          Reset
                        </Link>
                      )}
                      <button
                        onClick={() => setSelectedEmailPreview(email)}
                        className="p-1.5 rounded-lg border border-border hover:bg-muted text-muted-foreground hover:text-foreground"
                        title="View Email HTML"
                      >
                        <Eye className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>

      {/* Rendered Email HTML Preview Modal */}
      {selectedEmailPreview && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="max-w-2xl w-full max-h-[90vh] bg-white dark:bg-brand-dark-card border border-border rounded-3xl overflow-hidden shadow-2xl flex flex-col animate-scaleUp">
            <div className="p-4 border-b border-border flex items-center justify-between bg-muted/30">
              <div>
                <h3 className="text-xs font-bold text-foreground">{selectedEmailPreview.subject}</h3>
                <p className="text-[11px] text-muted-foreground">To: {selectedEmailPreview.to} &bull; {new Date(selectedEmailPreview.sentAt).toLocaleString()}</p>
              </div>
              <button
                onClick={() => setSelectedEmailPreview(null)}
                className="text-xs font-bold px-3 py-1.5 rounded-xl border border-border bg-white dark:bg-brand-dark-card hover:bg-muted text-foreground"
              >
                Close
              </button>
            </div>
            <div className="p-4 overflow-y-auto flex-1 bg-white">
              <iframe
                srcDoc={selectedEmailPreview.html}
                title="Email Preview"
                className="w-full min-h-[450px] border-0 rounded-xl"
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
