"use client";

import React, { useState, useEffect } from "react";
import { AdminMarketingNav } from "@/components/admin/marketing-nav";
import {
  Activity,
  Filter,
  RefreshCw,
  CheckCircle2,
  AlertTriangle,
  Send,
  Eye,
  Check,
  RotateCcw,
} from "lucide-react";
import { formatKSh } from "@/lib/utils";
import { MarketingEvent } from "@/lib/marketing/types";
import { AttributionEngine } from "@/lib/marketing/attribution";

export default function AdminMarketingEventsPage() {
  const [events, setEvents] = useState<MarketingEvent[]>([]);
  const [loading, setLoading] = useState(true);
  const [filterName, setFilterName] = useState<string>("ALL");
  const [selectedEvent, setSelectedEvent] = useState<MarketingEvent | null>(null);
  const [retryingId, setRetryingId] = useState<string | null>(null);
  const [actionSuccess, setActionSuccess] = useState<string | null>(null);

  const fetchEvents = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/admin/marketing/events");
      const data = await res.json();
      if (data.success && data.events) {
        setEvents(data.events);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchEvents();
  }, []);

  const handleRetryEvent = async (id: string) => {
    setRetryingId(id);
    try {
      const res = await fetch("/api/admin/marketing/events", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ event_id: id }),
      });
      const data = await res.json();
      if (data.success) {
        setActionSuccess(`Event ${id} re-dispatched to ad networks successfully!`);
        setTimeout(() => setActionSuccess(null), 3000);
        fetchEvents();
      }
    } catch (err) {
      console.error(err);
    } finally {
      setRetryingId(null);
    }
  };

  const filteredEvents = events.filter((ev) => {
    if (filterName !== "ALL" && ev.eventType !== filterName) return false;
    return true;
  });

  return (
    <div className="min-h-screen bg-brand-off-white dark:bg-brand-dark-bg py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6">
        <AdminMarketingNav />

        {/* Top Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white dark:bg-brand-dark-card border border-border p-5 rounded-2xl shadow-sm">
          <div>
            <h2 className="text-sm font-bold text-foreground flex items-center gap-2">
              <Activity className="w-4 h-4 text-brand-emerald" />
              Marketing Event Ledger &amp; Conversion Audit Trail
            </h2>
            <p className="text-xs text-muted-foreground mt-0.5">
              Live audit log of all tracked customer touchpoints, conversions, and server-side ad network dispatches.
            </p>
          </div>

          <button
            type="button"
            onClick={fetchEvents}
            disabled={loading}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-border bg-white dark:bg-brand-dark-card hover:bg-muted text-xs font-bold text-foreground transition-colors"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? "animate-spin" : ""}`} />
            <span>Refresh Events</span>
          </button>
        </div>

        {actionSuccess && (
          <div className="p-4 rounded-xl text-xs font-semibold bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-300 text-brand-emerald flex items-center gap-2 animate-fadeIn">
            <CheckCircle2 className="w-4 h-4 shrink-0" />
            <span>{actionSuccess}</span>
          </div>
        )}

        {/* Filter Bar */}
        <div className="flex items-center gap-3 bg-white dark:bg-brand-dark-card border border-border p-3 rounded-2xl text-xs">
          <div className="flex items-center gap-1.5 text-muted-foreground font-semibold px-2">
            <Filter className="w-3.5 h-3.5" />
            <span>Filter Event Type:</span>
          </div>

          <select
            aria-label="Filter by event type"
            value={filterName}
            onChange={(e) => setFilterName(e.target.value)}
            className="bg-muted/40 border border-border rounded-lg px-2.5 py-1.5 text-xs text-foreground focus:outline-none focus:ring-1 focus:ring-brand-emerald"
          >
            <option value="ALL">All Event Types</option>
            <option value="purchase">Purchase (M-Pesa Verified)</option>
            <option value="seller_onboarding_complete">Seller Onboarding Complete</option>
            <option value="page_view">Page View</option>
            <option value="view_item">View Item</option>
            <option value="add_to_cart">Add to Cart</option>
            <option value="begin_checkout">Begin Checkout</option>
            <option value="search">Search</option>
          </select>
        </div>

        {/* Events Table */}
        <div className="bg-white dark:bg-brand-dark-card border border-border rounded-2xl shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-xs text-left">
              <thead className="text-[11px] uppercase tracking-wider text-muted-foreground bg-muted/30 border-b border-border">
                <tr>
                  <th className="py-3 px-4">Event ID &amp; Type</th>
                  <th className="py-3 px-3">Primary Channel</th>
                  <th className="py-3 px-3">Value (KES)</th>
                  <th className="py-3 px-3">Google Ads</th>
                  <th className="py-3 px-3">Meta CAPI</th>
                  <th className="py-3 px-3">Timestamp</th>
                  <th className="py-3 px-4 text-right">Inspect</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border/60">
                {filteredEvents.length > 0 ? (
                  filteredEvents.map((ev) => {
                    const isPurchase = ev.eventType === "purchase";
                    const googleDest = ev.destinations?.find((d) => d.provider === "GOOGLE");
                    const metaDest = ev.destinations?.find((d) => d.provider === "META");
                    const googleDelivered = googleDest?.status === "DELIVERED";
                    const metaDelivered = metaDest?.status === "DELIVERED";
                    const channel = AttributionEngine.getPrimaryChannel(ev.attribution);

                    return (
                      <tr key={ev.id} className="hover:bg-muted/20 transition-colors">
                        <td className="py-3.5 px-4 space-y-0.5">
                          <div className="flex items-center gap-1.5">
                            <span
                              className={`px-2 py-0.5 rounded-md text-[10px] font-bold ${
                                isPurchase
                                  ? "bg-emerald-100 text-brand-emerald"
                                  : "bg-muted text-foreground"
                              }`}
                            >
                              {ev.eventType.toUpperCase()}
                            </span>
                            {isPurchase && (
                              <span className="text-[10px] bg-emerald-500 text-white px-1 rounded font-bold">
                                VERIFIED
                              </span>
                            )}
                          </div>
                          <div className="font-mono text-[10px] text-muted-foreground truncate max-w-[180px]">
                            {ev.eventId}
                          </div>
                        </td>
                        <td className="py-3.5 px-3">
                          <span className="px-2 py-0.5 bg-muted/60 rounded text-[10px] font-bold text-foreground">
                            {channel}
                          </span>
                        </td>
                        <td className="py-3.5 px-3 font-bold text-foreground">
                          {ev.value && ev.value > 0 ? formatKSh(ev.value) : "—"}
                        </td>
                        <td className="py-3.5 px-3">
                          <span
                            className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                              googleDelivered
                                ? "bg-emerald-100 text-brand-emerald"
                                : "bg-muted text-muted-foreground"
                            }`}
                          >
                            {googleDest?.status || "PENDING"}
                          </span>
                        </td>
                        <td className="py-3.5 px-3">
                          <span
                            className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                              metaDelivered
                                ? "bg-emerald-100 text-brand-emerald"
                                : "bg-muted text-muted-foreground"
                            }`}
                          >
                            {metaDest?.status || "PENDING"}
                          </span>
                        </td>
                        <td className="py-3.5 px-3 text-muted-foreground">
                          {new Date(ev.timestamp).toLocaleTimeString("en-KE")}
                        </td>
                        <td className="py-3.5 px-4 text-right space-x-1">
                          <button
                            type="button"
                            onClick={() => setSelectedEvent(ev)}
                            className="p-1.5 hover:bg-muted rounded-lg text-muted-foreground hover:text-foreground"
                            title="Inspect Payload"
                          >
                            <Eye className="w-3.5 h-3.5" />
                          </button>
                          {(!googleDelivered || !metaDelivered) && (
                            <button
                              type="button"
                              onClick={() => handleRetryEvent(ev.id)}
                              disabled={retryingId === ev.id}
                              className="p-1.5 hover:bg-muted rounded-lg text-brand-emerald"
                              title="Retry Dispatch"
                            >
                              <RotateCcw
                                className={`w-3.5 h-3.5 ${
                                  retryingId === ev.id ? "animate-spin" : ""
                                }`}
                              />
                            </button>
                          )}
                        </td>
                      </tr>
                    );
                  })
                ) : (
                  <tr>
                    <td colSpan={7} className="py-8 text-center text-muted-foreground">
                      No events found for this filter.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Payload Inspector Modal */}
        {selectedEvent && (
          <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
            <div className="bg-white dark:bg-brand-dark-card border border-border rounded-3xl max-w-2xl w-full p-6 shadow-2xl space-y-4 max-h-[85vh] flex flex-col">
              <div className="flex items-center justify-between pb-3 border-b border-border shrink-0">
                <h3 className="text-sm font-bold text-foreground font-mono">
                  Event: {selectedEvent.id}
                </h3>
                <button
                  type="button"
                  onClick={() => setSelectedEvent(null)}
                  className="text-muted-foreground hover:text-foreground text-sm"
                >
                  ✕
                </button>
              </div>

              <div className="overflow-y-auto flex-1 font-mono text-xs p-4 bg-muted/40 rounded-xl border border-border">
                <pre>{JSON.stringify(selectedEvent, null, 2)}</pre>
              </div>

              <div className="flex items-center justify-end gap-2 pt-2 border-t border-border shrink-0">
                <button
                  type="button"
                  onClick={() => setSelectedEvent(null)}
                  className="px-4 py-1.5 rounded-xl bg-brand-emerald text-white text-xs font-bold"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
