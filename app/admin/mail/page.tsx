"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import {
  Mail,
  Send,
  RefreshCw,
  CheckCircle2,
  XCircle,
  AlertTriangle,
  Server,
  Trash2,
  Eye,
  ExternalLink,
  Loader2,
  ShieldCheck,
  Inbox,
} from "lucide-react";

interface SentEmailRecord {
  id: string;
  to: string;
  subject: string;
  type: string;
  sentAt: string;
  provider: "SMTP" | "LOCAL_SPOOL";
  text: string;
  html: string;
  token?: string;
}

interface SmtpStatus {
  configured: boolean;
  connected: boolean;
  host?: string;
  port?: number;
  secure?: boolean;
  user?: string;
  error?: string;
}

export default function AdminMailPage() {
  const [emails, setEmails] = useState<SentEmailRecord[]>([]);
  const [smtpStatus, setSmtpStatus] = useState<SmtpStatus | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSending, setIsSending] = useState(false);
  const [testEmailTo, setTestEmailTo] = useState("");
  const [testSubject, setTestSubject] = useState("");
  const [feedback, setFeedback] = useState<{ type: "success" | "error"; message: string } | null>(null);
  const [selectedPreview, setSelectedPreview] = useState<SentEmailRecord | null>(null);

  const fetchMailData = async () => {
    setIsLoading(true);
    try {
      const res = await fetch("/api/admin/mail?checkSmtp=true");
      const data = await res.json();
      if (data.success) {
        setEmails(data.emails || []);
        setSmtpStatus(data.smtpStatus || null);
      }
    } catch {
      setFeedback({ type: "error", message: "Failed to connect to mail API." });
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchMailData();
  }, []);

  const handleSendTestEmail = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!testEmailTo) return;

    setIsSending(true);
    setFeedback(null);

    try {
      const res = await fetch("/api/admin/mail", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          to: testEmailTo,
          subject: testSubject || undefined,
          isTest: true,
        }),
      });
      const data = await res.json();

      if (data.success) {
        setFeedback({
          type: "success",
          message: `Test email dispatched to ${testEmailTo} via ${data.result?.provider || "spool"}.`,
        });
        setTestEmailTo("");
        setTestSubject("");
        fetchMailData();
      } else {
        setFeedback({ type: "error", message: data.error || "Failed to dispatch test email." });
      }
    } catch {
      setFeedback({ type: "error", message: "Network error sending test email." });
    } finally {
      setIsSending(false);
    }
  };

  const handleClearSpool = async () => {
    if (!confirm("Are you sure you want to clear all sent email records from the local spool?")) return;
    try {
      const res = await fetch("/api/admin/mail", { method: "DELETE" });
      const data = await res.json();
      if (data.success) {
        setEmails([]);
        setFeedback({ type: "success", message: "Mail spool cleared successfully." });
      }
    } catch {
      setFeedback({ type: "error", message: "Failed to clear spool." });
    }
  };

  return (
    <div className="min-h-screen bg-brand-off-white dark:bg-brand-dark-bg p-4 sm:p-8">
      <div className="max-w-6xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white dark:bg-brand-dark-card border border-border p-6 rounded-3xl shadow-sm">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <div className="p-2 rounded-xl bg-brand-emerald-soft text-brand-emerald">
                <Mail className="w-5 h-5" />
              </div>
              <h1 className="text-xl font-black text-foreground">Transactional Email Control Center</h1>
            </div>
            <p className="text-xs text-muted-foreground">
              Monitor email dispatches, verify SMTP connections, and test password reset delivery.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={fetchMailData}
              disabled={isLoading}
              className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl border border-border text-xs font-bold text-foreground hover:bg-muted transition-colors"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${isLoading ? "animate-spin" : ""}`} />
              <span>Refresh</span>
            </button>
            <Link
              href="/forgot-password"
              className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl bg-brand-emerald text-white text-xs font-bold hover:bg-brand-emerald-dark transition-colors"
            >
              <span>Forgot Password UI</span>
              <ExternalLink className="w-3.5 h-3.5" />
            </Link>
          </div>
        </div>

        {feedback && (
          <div
            className={`p-4 rounded-2xl border text-xs font-semibold flex items-center justify-between ${
              feedback.type === "success"
                ? "bg-emerald-50 dark:bg-emerald-950/40 border-emerald-200 text-emerald-800 dark:text-emerald-300"
                : "bg-red-50 dark:bg-red-950/40 border-red-200 text-red-800 dark:text-red-300"
            }`}
          >
            <div className="flex items-center gap-2">
              {feedback.type === "success" ? <CheckCircle2 className="w-4 h-4" /> : <XCircle className="w-4 h-4" />}
              <span>{feedback.message}</span>
            </div>
            <button onClick={() => setFeedback(null)} className="text-xs font-bold opacity-60 hover:opacity-100">
              Dismiss
            </button>
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Left Column: SMTP Diagnostics & Test Dispatcher */}
          <div className="lg:col-span-5 space-y-6">
            {/* SMTP Status Card */}
            <div className="bg-white dark:bg-brand-dark-card border border-border p-6 rounded-3xl shadow-sm space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Server className="w-4 h-4 text-brand-emerald" />
                  <h2 className="text-sm font-bold text-foreground">SMTP Transport Status</h2>
                </div>
                <span
                  className={`text-[10px] uppercase font-mono px-2 py-0.5 rounded-full font-bold ${
                    smtpStatus?.connected
                      ? "bg-green-100 dark:bg-green-950/60 text-green-800 dark:text-green-300"
                      : smtpStatus?.configured
                      ? "bg-amber-100 dark:bg-amber-950/60 text-amber-800 dark:text-amber-300"
                      : "bg-blue-100 dark:bg-blue-950/60 text-blue-800 dark:text-blue-300"
                  }`}
                >
                  {smtpStatus?.connected ? "Connected" : smtpStatus?.configured ? "Conn Failed" : "Local Spool"}
                </span>
              </div>

              <div className="space-y-2 text-xs">
                <div className="flex justify-between py-1 border-b border-border/60">
                  <span className="text-muted-foreground">Provider Mode</span>
                  <span className="font-bold text-foreground">{smtpStatus?.configured ? "Live SMTP" : "Local File Spooler"}</span>
                </div>
                {smtpStatus?.host && (
                  <div className="flex justify-between py-1 border-b border-border/60">
                    <span className="text-muted-foreground">SMTP Host</span>
                    <span className="font-mono text-foreground">{smtpStatus.host}:{smtpStatus.port}</span>
                  </div>
                )}
                {smtpStatus?.user && (
                  <div className="flex justify-between py-1 border-b border-border/60">
                    <span className="text-muted-foreground">Auth User</span>
                    <span className="font-mono text-foreground">{smtpStatus.user}</span>
                  </div>
                )}
              </div>

              {smtpStatus?.error && (
                <div className="p-3 bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-900 rounded-xl text-[11px] text-amber-800 dark:text-amber-300">
                  <div className="font-bold mb-0.5">Configuration Notice:</div>
                  <div>{smtpStatus.error}</div>
                </div>
              )}
            </div>

            {/* Test Email Dispatcher */}
            <div className="bg-white dark:bg-brand-dark-card border border-border p-6 rounded-3xl shadow-sm space-y-4">
              <div className="flex items-center gap-2">
                <Send className="w-4 h-4 text-brand-emerald" />
                <h2 className="text-sm font-bold text-foreground">Send Test Email</h2>
              </div>
              <p className="text-xs text-muted-foreground">
                Dispatch an immediate test message to any email address to test real-world delivery.
              </p>

              <form onSubmit={handleSendTestEmail} className="space-y-3 text-left">
                <div>
                  <label className="block text-xs font-bold text-foreground mb-1">Recipient Email *</label>
                  <input
                    type="email"
                    required
                    value={testEmailTo}
                    onChange={(e) => setTestEmailTo(e.target.value)}
                    placeholder="e.g. test@yourdomain.com"
                    className="w-full bg-muted/30 border border-border rounded-xl px-3 py-2.5 text-xs text-foreground focus:outline-none focus:border-brand-emerald"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-foreground mb-1">Subject (Optional)</label>
                  <input
                    type="text"
                    value={testSubject}
                    onChange={(e) => setTestSubject(e.target.value)}
                    placeholder="Custom test subject..."
                    className="w-full bg-muted/30 border border-border rounded-xl px-3 py-2.5 text-xs text-foreground focus:outline-none focus:border-brand-emerald"
                  />
                </div>

                <button
                  type="submit"
                  disabled={isSending || !testEmailTo}
                  className="w-full bg-brand-emerald hover:bg-brand-emerald-dark disabled:opacity-60 text-white font-bold py-2.5 rounded-xl text-xs flex items-center justify-center gap-2 shadow-xs transition-all cursor-pointer"
                >
                  {isSending ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-3.5 h-3.5" />}
                  <span>{isSending ? "Dispatching..." : "Send Test Email"}</span>
                </button>
              </form>
            </div>
          </div>

          {/* Right Column: Sent Emails Log & Inspector */}
          <div className="lg:col-span-7 space-y-4">
            <div className="bg-white dark:bg-brand-dark-card border border-border p-6 rounded-3xl shadow-sm space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Inbox className="w-4 h-4 text-brand-emerald" />
                  <h2 className="text-sm font-bold text-foreground">Dispatched Emails Log ({emails.length})</h2>
                </div>
                {emails.length > 0 && (
                  <button
                    onClick={handleClearSpool}
                    className="text-xs text-red-600 hover:text-red-700 font-bold flex items-center gap-1"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                    <span>Clear Spool</span>
                  </button>
                )}
              </div>

              {emails.length === 0 ? (
                <div className="text-center py-12 text-muted-foreground space-y-2">
                  <Mail className="w-8 h-8 mx-auto opacity-30" />
                  <p className="text-xs">No transactional emails in the local spool yet.</p>
                  <p className="text-[11px]">Submit a password reset or use the test dispatcher on the left.</p>
                </div>
              ) : (
                <div className="space-y-3 max-h-[600px] overflow-y-auto pr-1">
                  {emails.map((email) => (
                    <div
                      key={email.id}
                      className="p-4 rounded-2xl border border-border bg-muted/20 dark:bg-brand-dark-bg/40 space-y-2"
                    >
                      <div className="flex items-start justify-between gap-2">
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="text-[10px] uppercase font-bold px-2 py-0.5 rounded bg-brand-emerald/15 text-brand-emerald font-mono">
                              {email.type}
                            </span>
                            <span className="text-xs font-bold text-foreground">{email.to}</span>
                          </div>
                          <h4 className="text-xs font-semibold text-foreground mt-1">{email.subject}</h4>
                        </div>
                        <span className="text-[10px] text-muted-foreground whitespace-nowrap">
                          {new Date(email.sentAt).toLocaleTimeString()}
                        </span>
                      </div>

                      <p className="text-[11px] text-muted-foreground line-clamp-2 bg-white dark:bg-brand-dark-card p-2 rounded-xl border border-border/60">
                        {email.text}
                      </p>

                      <div className="flex items-center justify-between pt-1">
                        <span className="text-[10px] text-muted-foreground font-mono">
                          Provider: {email.provider} &bull; ID: {email.id.slice(0, 16)}
                        </span>
                        <div className="flex items-center gap-2">
                          {email.token && (
                            <Link
                              href={`/reset-password?token=${encodeURIComponent(email.token)}`}
                              className="px-2.5 py-1 rounded-lg bg-brand-emerald text-white text-[11px] font-bold hover:bg-brand-emerald-dark"
                            >
                              Reset Password Link &rarr;
                            </Link>
                          )}
                          <button
                            onClick={() => setSelectedPreview(email)}
                            className="px-2.5 py-1 rounded-lg border border-border bg-white dark:bg-brand-dark-card text-foreground hover:bg-muted text-[11px] font-semibold flex items-center gap-1"
                          >
                            <Eye className="w-3 h-3" />
                            <span>Preview HTML</span>
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Rendered Email Preview Modal */}
      {selectedPreview && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="max-w-2xl w-full max-h-[90vh] bg-white dark:bg-brand-dark-card border border-border rounded-3xl overflow-hidden shadow-2xl flex flex-col animate-scaleUp">
            <div className="p-4 border-b border-border flex items-center justify-between bg-muted/30">
              <div>
                <h3 className="text-xs font-bold text-foreground">{selectedPreview.subject}</h3>
                <p className="text-[11px] text-muted-foreground">To: {selectedPreview.to} &bull; {new Date(selectedPreview.sentAt).toLocaleString()}</p>
              </div>
              <button
                onClick={() => setSelectedPreview(null)}
                className="text-xs font-bold px-3 py-1.5 rounded-xl border border-border bg-white dark:bg-brand-dark-card hover:bg-muted text-foreground"
              >
                Close
              </button>
            </div>
            <div className="p-4 overflow-y-auto flex-1 bg-white">
              <iframe
                srcDoc={selectedPreview.html}
                title="Email Preview"
                className="w-full min-h-[480px] border-0 rounded-xl"
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
