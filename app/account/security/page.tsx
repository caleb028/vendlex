"use client";

import React, { useState, useEffect } from "react";
import { useAuth } from "@/lib/store/auth-store";
import { Shield, Monitor, Smartphone, LogOut, Loader2, RefreshCw, CheckCircle2 } from "lucide-react";
import { motion } from "framer-motion";

interface SessionInfo {
  id: string;
  isCurrent: boolean;
  createdAt: string;
  lastActivityAt: string;
  expiresAt: string;
  userAgent: string;
  rememberMe: boolean;
}

function parseDevice(ua: string): { name: string; isMobile: boolean } {
  if (!ua || ua === "Unknown device") return { name: "Unknown device", isMobile: false };
  const isMobile = /mobile|android|iphone|ipad/i.test(ua);
  const isChrome = /chrome/i.test(ua) && !/edg/i.test(ua);
  const isFirefox = /firefox/i.test(ua);
  const isSafari = /safari/i.test(ua) && !isChrome;
  const isEdge = /edg/i.test(ua);
  const browser = isEdge ? "Edge" : isChrome ? "Chrome" : isFirefox ? "Firefox" : isSafari ? "Safari" : "Browser";
  return { name: `${browser} on ${isMobile ? "Mobile" : "Desktop"}`, isMobile };
}

export default function AccountSecurityPage() {
  const { user, isAuthenticated, isLoading: authLoading } = useAuth();
  const [sessions, setSessions] = useState<SessionInfo[]>([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState<string | null>(null);
  const [message, setMessage] = useState("");

  const fetchSessions = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/auth/sessions");
      const data = await res.json();
      if (data.success) setSessions(data.sessions || []);
    } catch {}
    setLoading(false);
  };

  useEffect(() => {
    if (isAuthenticated) fetchSessions();
  }, [isAuthenticated]);

  const revokeSession = async (id: string) => {
    setActionLoading(id);
    try {
      const res = await fetch(`/api/auth/sessions?id=${id}`, { method: "DELETE" });
      const data = await res.json();
      if (data.success) {
        setMessage("Session revoked.");
        fetchSessions();
      }
    } catch {}
    setActionLoading(null);
    setTimeout(() => setMessage(""), 3000);
  };

  const revokeAllOthers = async () => {
    setActionLoading("all");
    try {
      const res = await fetch("/api/auth/sessions?all=true", { method: "DELETE" });
      const data = await res.json();
      if (data.success) {
        setMessage("All other sessions revoked.");
        fetchSessions();
      }
    } catch {}
    setActionLoading(null);
    setTimeout(() => setMessage(""), 3000);
  };

  if (authLoading) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-brand-emerald" />
      </div>
    );
  }

  if (!isAuthenticated || !user) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <p className="text-sm text-muted-foreground">Please sign in to access security settings.</p>
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto p-4 sm:p-8 space-y-6">
      <div className="flex items-center gap-3">
        <Shield className="w-6 h-6 text-brand-emerald" />
        <div>
          <h1 className="text-lg font-bold text-foreground">Security &amp; Sessions</h1>
          <p className="text-xs text-muted-foreground">Manage your active sessions and security settings.</p>
        </div>
      </div>

      {message && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="p-3 bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-900 rounded-xl text-xs text-brand-emerald font-medium flex items-center gap-2"
        >
          <CheckCircle2 className="w-4 h-4" /> {message}
        </motion.div>
      )}

      <div className="bg-white dark:bg-brand-dark-card border border-border dark:border-brand-dark-border rounded-2xl overflow-hidden">
        <div className="p-4 border-b border-border dark:border-brand-dark-border flex items-center justify-between">
          <h2 className="text-sm font-bold text-foreground">Active Sessions</h2>
          <div className="flex items-center gap-2">
            <button
              onClick={fetchSessions}
              disabled={loading}
              className="text-xs text-muted-foreground hover:text-foreground flex items-center gap-1 transition-colors"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${loading ? "animate-spin" : ""}`} /> Refresh
            </button>
            {sessions.filter((s) => !s.isCurrent).length > 0 && (
              <button
                onClick={revokeAllOthers}
                disabled={actionLoading === "all"}
                className="text-xs text-red-500 hover:text-red-600 font-semibold flex items-center gap-1 transition-colors"
              >
                {actionLoading === "all" ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <LogOut className="w-3.5 h-3.5" />}
                Sign out all others
              </button>
            )}
          </div>
        </div>

        {loading ? (
          <div className="p-8 flex items-center justify-center">
            <Loader2 className="w-6 h-6 animate-spin text-brand-emerald" />
          </div>
        ) : sessions.length === 0 ? (
          <div className="p-8 text-center text-xs text-muted-foreground">No active sessions found.</div>
        ) : (
          <div className="divide-y divide-border dark:divide-brand-dark-border">
            {sessions.sort((a, b) => (b.isCurrent ? 1 : 0) - (a.isCurrent ? 1 : 0)).map((session) => {
              const device = parseDevice(session.userAgent);
              const DeviceIcon = device.isMobile ? Smartphone : Monitor;
              return (
                <div key={session.id} className="p-4 flex items-center gap-3">
                  <DeviceIcon className="w-5 h-5 text-muted-foreground shrink-0" />
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-bold text-foreground truncate">{device.name}</span>
                      {session.isCurrent && (
                        <span className="text-[10px] font-bold text-brand-emerald bg-brand-emerald-soft px-1.5 py-0.5 rounded-full">Current</span>
                      )}
                      {session.rememberMe && (
                        <span className="text-[10px] text-muted-foreground">🔒 Remembered</span>
                      )}
                    </div>
                    <p className="text-[10px] text-muted-foreground">
                      Last active: {new Date(session.lastActivityAt).toLocaleString()}
                    </p>
                  </div>
                  {!session.isCurrent && (
                    <button
                      onClick={() => revokeSession(session.id)}
                      disabled={actionLoading === session.id}
                      className="text-xs text-red-500 hover:text-red-600 font-semibold flex items-center gap-1 shrink-0 transition-colors"
                    >
                      {actionLoading === session.id ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <LogOut className="w-3.5 h-3.5" />}
                      Revoke
                    </button>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
