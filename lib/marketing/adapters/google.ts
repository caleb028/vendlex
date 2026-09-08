import { MarketingEvent, ProductFeedItem, ConnectionStatus } from "../types";

export interface GoogleConfig {
  adsCustomerId?: string;
  adsDeveloperToken?: string;
  merchantCenterId?: string;
  conversionId?: string;
  conversionLabel?: string;
  analyticsMeasurementId?: string;
  analyticsApiSecret?: string;
}

export class GoogleAdapter {
  private static getConfig(): GoogleConfig {
    return {
      adsCustomerId: process.env.GOOGLE_ADS_CUSTOMER_ID,
      adsDeveloperToken: process.env.GOOGLE_ADS_DEVELOPER_TOKEN,
      merchantCenterId: process.env.GOOGLE_MERCHANT_CENTER_ID,
      conversionId: process.env.GOOGLE_ADS_CONVERSION_ID || process.env.NEXT_PUBLIC_GOOGLE_ADS_CONVERSION_ID,
      conversionLabel: process.env.GOOGLE_ADS_CONVERSION_LABEL || process.env.NEXT_PUBLIC_GOOGLE_ADS_CONVERSION_LABEL,
      analyticsMeasurementId: process.env.GOOGLE_ANALYTICS_MEASUREMENT_ID || process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID,
      analyticsApiSecret: process.env.GOOGLE_ANALYTICS_API_SECRET,
    };
  }

  /**
   * Check connection status of Google integration
   */
  static getConnectionStatus(): {
    status: ConnectionStatus;
    accountId?: string;
    merchantCenterId?: string;
    details: string;
  } {
    const config = this.getConfig();
    const hasAds = !!(config.adsCustomerId || config.conversionId);
    const hasMerchant = !!config.merchantCenterId;
    const hasGA = !!config.analyticsMeasurementId;

    if (hasAds || hasMerchant || hasGA) {
      return {
        status: "CONNECTED",
        accountId: config.adsCustomerId || config.conversionId || config.analyticsMeasurementId,
        merchantCenterId: config.merchantCenterId,
        details: `Connected to Google Ads (${config.adsCustomerId ? "API" : "GTAG"}) and Analytics`,
      };
    }

    return {
      status: "CONFIGURATION_REQUIRED",
      details: "Google Ads & Merchant Center credentials not configured in environment.",
    };
  }

  /**
   * Send verified server-side conversion event to Google (GA4 Measurement Protocol / Ads)
   */
  static async sendConversion(event: MarketingEvent): Promise<{
    success: boolean;
    responseId?: string;
    error?: string;
    skipped?: boolean;
  }> {
    const config = this.getConfig();

    // Check if GA4 Measurement Protocol is configured
    if (!config.analyticsMeasurementId || !config.analyticsApiSecret) {
      return {
        success: false,
        skipped: true,
        error: "Google Analytics Measurement Protocol not configured in environment.",
      };
    }

    try {
      const url = `https://www.google-analytics.com/mp/collect?measurement_id=${config.analyticsMeasurementId}&api_secret=${config.analyticsApiSecret}`;

      const gaEventName = this.mapToGAEventName(event.eventType);
      const payload = {
        client_id: event.sessionId || `vlx_${event.userId || "anon"}`,
        user_id: event.userId,
        timestamp_micros: String(new Date(event.timestamp).getTime() * 1000),
        events: [
          {
            name: gaEventName,
            params: {
              transaction_id: event.orderNumber || event.orderId || event.eventId,
              value: event.value || 0,
              currency: event.currency || "KES",
              county: event.county || "Nairobi",
              items: event.items?.map((i) => ({
                item_id: i.itemId,
                item_name: i.itemName,
                item_category: i.itemCategory,
                price: i.price,
                quantity: i.quantity,
              })),
            },
          },
        ],
      };

      const res = await fetch(url, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (res.ok || res.status === 204) {
        return {
          success: true,
          responseId: `ga_${Date.now()}`,
        };
      }

      return {
        success: false,
        error: `Google API returned HTTP ${res.status}`,
      };
    } catch (err: any) {
      return {
        success: false,
        error: err?.message || "Google conversion dispatch network failure",
      };
    }
  }

  private static mapToGAEventName(eventType: string): string {
    switch (eventType) {
      case "purchase":
        return "purchase";
      case "add_to_cart":
        return "add_to_cart";
      case "view_item":
        return "view_item";
      case "begin_checkout":
        return "begin_checkout";
      case "sign_up":
        return "sign_up";
      case "login":
        return "login";
      case "seller_onboarding_complete":
        return "generate_lead";
      default:
        return eventType;
    }
  }

  /**
   * Generate official Google Merchant Center XML (RSS 2.0 Product Feed)
   */
  static generateMerchantFeedXML(
    items: ProductFeedItem[],
    baseUrl = process.env.NEXT_PUBLIC_APP_URL || "https://vendlex.co.ke"
  ): string {
    const escapeXml = (unsafe: string) =>
      (unsafe || "")
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&apos;");

    const xmlItems = items
      .filter((i) => i.isEligible)
      .map((item) => {
        const fullLink = item.link.startsWith("http") ? item.link : `${baseUrl}${item.link}`;
        const fullImg = item.imageLink.startsWith("http") ? item.imageLink : `${baseUrl}${item.imageLink}`;

        return `    <item>
      <g:id>${escapeXml(item.id)}</g:id>
      <g:title>${escapeXml(item.title)}</g:title>
      <g:description>${escapeXml(item.description)}</g:description>
      <g:link>${escapeXml(fullLink)}</g:link>
      <g:image_link>${escapeXml(fullImg)}</g:image_link>
      <g:condition>new</g:condition>
      <g:availability>${item.availability}</g:availability>
      <g:price>${item.price.toFixed(2)} KES</g:price>
      <g:brand>${escapeXml(item.brand || "VendLex")}</g:brand>
      <g:google_product_category>${escapeXml(item.category || "General")}</g:google_product_category>
      <g:identifier_exists>no</g:identifier_exists>
      <g:shipping>
        <g:country>KE</g:country>
        <g:service>Standard Delivery</g:service>
        <g:price>250.00 KES</g:price>
      </g:shipping>
      <g:custom_label_0>${escapeXml(item.county || "Kenya")}</g:custom_label_0>
      <g:custom_label_1>${escapeXml(item.sellerName || "Verified Merchant")}</g:custom_label_1>
    </item>`;
      })
      .join("\n");

    return `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0" xmlns:g="http://base.google.com/ns/1.0">
  <channel>
    <title>VendLex Kenya - Official National Merchant Catalog</title>
    <link>${baseUrl}</link>
    <description>Verified Kenyan Products, Electronics, Fashion, Hardware and General Commerce</description>
${xmlItems}
  </channel>
</rss>`;
  }
}
