import { serverDB } from "@/lib/server-db";
import {
  MarketingEvent,
  MarketingEventType,
  MarketingEventItem,
  AttributionData,
  MarketingConsent,
  MarketingAnalyticsSummary,
} from "./types";
import { GoogleAdapter } from "./adapters/google";
import { MetaAdapter } from "./adapters/meta";
import { AttributionEngine } from "./attribution";

export interface TrackEventInput {
  eventId?: string; // Optional custom idempotency key
  eventType: MarketingEventType;
  userId?: string;
  userRole?: string;
  userEmail?: string;
  userPhone?: string;
  sessionId?: string;
  orderId?: string;
  orderNumber?: string;
  sellerId?: string;
  sellerName?: string;
  county?: string;
  value?: number;
  items?: MarketingEventItem[];
  attribution?: AttributionData;
  consent?: MarketingConsent;
  metadata?: Record<string, any>;
  requestMeta?: {
    ipAddress?: string;
    userAgent?: string;
  };
}

export class VendLexMarketingEngine {
  /**
   * Main entry point for ingesting and processing all marketing events
   */
  static async trackEvent(input: TrackEventInput): Promise<MarketingEvent> {
    // 1. Generate or validate idempotent eventId
    const eventId =
      input.eventId ||
      (input.orderId
        ? `ord_${input.orderId}_${input.eventType}_v1`
        : `evt_${Date.now()}_${Math.random().toString(36).substring(2, 8)}`);

    // Check if event already exists (Idempotency deduplication)
    const existing = serverDB.findMarketingEventByEventId(eventId);
    if (existing) {
      return existing;
    }

    // 2. Resolve consent
    const consent =
      input.consent ||
      (input.sessionId ? serverDB.getConsent(input.sessionId) : undefined) ||
      (input.userId ? serverDB.getConsent(input.userId) : undefined) || {
        essential: true,
        analytics: true,
        marketing: true,
        updatedAt: new Date().toISOString(),
      };

    // 3. Resolve attribution
    const attribution =
      input.attribution ||
      (input.sessionId ? serverDB.getAttribution(input.sessionId) : undefined);

    const newEvent: Omit<MarketingEvent, "id"> = {
      eventId,
      eventType: input.eventType,
      timestamp: new Date().toISOString(),
      userId: input.userId,
      userRole: input.userRole,
      userEmail: input.userEmail,
      userPhone: input.userPhone,
      sessionId: input.sessionId,
      orderId: input.orderId,
      orderNumber: input.orderNumber,
      sellerId: input.sellerId,
      sellerName: input.sellerName,
      county: input.county || attribution?.county || "Nairobi",
      currency: "KES",
      value: input.value,
      items: input.items,
      attribution,
      consent,
      destinations: [
        { provider: "INTERNAL", status: "DELIVERED", attempts: 1, lastAttemptAt: new Date().toISOString() },
        {
          provider: "GOOGLE",
          status: !consent.marketing ? "SKIPPED_CONSENT" : "PENDING",
          attempts: 0,
        },
        {
          provider: "META",
          status: !consent.marketing ? "SKIPPED_CONSENT" : "PENDING",
          attempts: 0,
        },
      ],
      metadata: input.metadata,
    };

    const savedEvent = serverDB.createMarketingEvent(newEvent);

    // 4. Asynchronously dispatch to eligible providers without blocking execution
    if (consent.marketing) {
      this.dispatchToProviders(savedEvent, input.requestMeta).catch((err) => {
        console.error("[MarketingEngine] Async dispatch failure:", err);
      });
    }

    return savedEvent;
  }

  /**
   * Internal asynchronous dispatch pipeline
   */
  private static async dispatchToProviders(
    event: MarketingEvent,
    requestMeta?: { ipAddress?: string; userAgent?: string }
  ): Promise<void> {
    // 1. Google Adapter Dispatch
    try {
      const googleRes = await GoogleAdapter.sendConversion(event);
      serverDB.updateMarketingEventDelivery(event.id, "GOOGLE", {
        status: googleRes.success
          ? "DELIVERED"
          : googleRes.skipped
          ? "SKIPPED_UNCONFIGURED"
          : "FAILED",
        responseId: googleRes.responseId,
        error: googleRes.error,
      });
    } catch (err: any) {
      serverDB.updateMarketingEventDelivery(event.id, "GOOGLE", {
        status: "FAILED",
        error: err?.message || "Google dispatch failed",
      });
    }

    // 2. Meta Adapter Dispatch
    try {
      const metaRes = await MetaAdapter.sendConversion(event, requestMeta);
      serverDB.updateMarketingEventDelivery(event.id, "META", {
        status: metaRes.success
          ? "DELIVERED"
          : metaRes.skipped
          ? "SKIPPED_UNCONFIGURED"
          : "FAILED",
        responseId: metaRes.responseId,
        error: metaRes.error,
      });
    } catch (err: any) {
      serverDB.updateMarketingEventDelivery(event.id, "META", {
        status: "FAILED",
        error: err?.message || "Meta dispatch failed",
      });
    }
  }

  /**
   * Record a verified purchase conversion strictly from confirmed backend state
   */
  static async trackVerifiedPurchase(order: {
    id: string;
    orderNumber: string;
    customerId?: string;
    customerName?: string;
    customerEmail?: string;
    customerPhone?: string;
    sellerId?: string;
    sellerName?: string;
    county?: string;
    totalAmount: number;
    items: Array<{
      productId: string;
      productTitle: string;
      unitPrice: number;
      quantity: number;
      sellerId?: string;
      sellerName?: string;
    }>;
    attribution?: AttributionData;
  }): Promise<MarketingEvent> {
    return this.trackEvent({
      eventId: `ord_${order.id}_purchase_v1`,
      eventType: "purchase",
      userId: order.customerId,
      userRole: "CUSTOMER",
      userEmail: order.customerEmail,
      userPhone: order.customerPhone,
      orderId: order.id,
      orderNumber: order.orderNumber,
      sellerId: order.sellerId,
      sellerName: order.sellerName,
      county: order.county,
      value: order.totalAmount,
      items: order.items.map((i) => ({
        itemId: i.productId,
        itemName: i.productTitle,
        price: i.unitPrice,
        quantity: i.quantity,
        sellerId: i.sellerId,
        sellerName: i.sellerName,
      })),
      attribution: order.attribution,
    });
  }

  /**
   * Compute authoritative analytics summary based on stored campaigns and verified orders
   */
  static getAnalyticsSummary(filter?: { sellerId?: string }): MarketingAnalyticsSummary {
    const campaigns = serverDB.getCampaigns(filter);
    const orders = serverDB.getOrders();
    const googleConn = serverDB.getAdvertisingConnection("GOOGLE");
    const metaConn = serverDB.getAdvertisingConnection("META");

    let totalSpend = 0;
    let totalImpressions = 0;
    let totalClicks = 0;
    let googleSpend = 0;
    let metaSpend = 0;
    let googleConversions = 0;
    let metaConversions = 0;
    let googleRevenue = 0;
    let metaRevenue = 0;

    for (const c of campaigns) {
      totalSpend += c.metrics.spend;
      totalImpressions += c.metrics.impressions;
      totalClicks += c.metrics.clicks;

      if (c.platform === "GOOGLE") {
        googleSpend += c.metrics.spend;
        googleConversions += c.metrics.conversions;
        googleRevenue += c.metrics.attributedRevenue;
      } else if (c.platform === "META") {
        metaSpend += c.metrics.spend;
        metaConversions += c.metrics.conversions;
        metaRevenue += c.metrics.attributedRevenue;
      }
    }

    // Filter orders if sellerId is specified
    const targetOrders = filter?.sellerId
      ? orders.filter((o) => o.sellerId === filter.sellerId && (o.status === "PAID" || o.status === "PROCESSING" || o.status === "READY_FOR_DISPATCH" || o.status === "DISPATCHED" || o.status === "DELIVERED"))
      : orders.filter((o) => o.status === "PAID" || o.status === "PROCESSING" || o.status === "READY_FOR_DISPATCH" || o.status === "DISPATCHED" || o.status === "DELIVERED");

    let totalConversions = targetOrders.length;
    let totalRevenue = targetOrders.reduce((sum, o) => sum + (o.totalAmount || 0), 0);

    // Channel aggregation by county
    const countyMap: Record<string, { orders: number; revenue: number; channels: Record<string, number> }> = {};

    let organicConversions = 0;
    let organicRevenue = 0;

    for (const ord of targetOrders) {
      const ch = AttributionEngine.getPrimaryChannel(ord.attribution);
      const county = ord.county || "Nairobi";

      if (!countyMap[county]) {
        countyMap[county] = { orders: 0, revenue: 0, channels: {} };
      }
      countyMap[county].orders += 1;
      countyMap[county].revenue += ord.totalAmount || 0;
      countyMap[county].channels[ch] = (countyMap[county].channels[ch] || 0) + 1;

      if (ch === "Organic Search" || ch === "Direct" || ch === "Referral") {
        organicConversions += 1;
        organicRevenue += ord.totalAmount || 0;
      }
    }

    const countyPerformance = Object.entries(countyMap).map(([county, data]) => {
      const topChannel = Object.entries(data.channels).sort((a, b) => b[1] - a[1])[0]?.[0] || "Direct";
      return {
        county,
        orders: data.orders,
        revenue: data.revenue,
        topChannel,
      };
    }).sort((a, b) => b.revenue - a.revenue);

    const avgCtr = totalImpressions > 0 ? Number(((totalClicks / totalImpressions) * 100).toFixed(2)) : 0;
    const avgCpc = totalClicks > 0 ? Number((totalSpend / totalClicks).toFixed(2)) : 0;
    const blendedCpa = totalConversions > 0 ? Number((totalSpend / totalConversions).toFixed(2)) : 0;
    const blendedRoas = totalSpend > 0 ? Number((totalRevenue / totalSpend).toFixed(2)) : 0;

    return {
      totalSpend,
      totalImpressions,
      totalClicks,
      avgCtr,
      avgCpc,
      totalConversions,
      attributedRevenue: totalRevenue,
      blendedRoas,
      blendedCpa,
      googleStats: {
        spend: googleSpend,
        conversions: googleConversions,
        revenue: googleRevenue,
        roas: googleSpend > 0 ? Number((googleRevenue / googleSpend).toFixed(2)) : 0,
        connected: googleConn?.status === "CONNECTED",
      },
      metaStats: {
        spend: metaSpend,
        conversions: metaConversions,
        revenue: metaRevenue,
        roas: metaSpend > 0 ? Number((metaRevenue / metaSpend).toFixed(2)) : 0,
        connected: metaConn?.status === "CONNECTED",
      },
      organicStats: {
        conversions: organicConversions,
        revenue: organicRevenue,
      },
      countyPerformance,
    };
  }
}
