import crypto from "crypto";
import { MarketingEvent, ProductFeedItem, ConnectionStatus } from "../types";

export interface MetaConfig {
  pixelId?: string;
  accessToken?: string;
  catalogId?: string;
  businessAccountId?: string;
  testEventCode?: string;
}

export class MetaAdapter {
  private static getConfig(): MetaConfig {
    return {
      pixelId: process.env.META_PIXEL_ID || process.env.NEXT_PUBLIC_META_PIXEL_ID,
      accessToken: process.env.META_ACCESS_TOKEN,
      catalogId: process.env.META_CATALOG_ID,
      businessAccountId: process.env.META_BUSINESS_ACCOUNT_ID,
      testEventCode: process.env.META_TEST_EVENT_CODE,
    };
  }

  /**
   * Check connection status of Meta integration
   */
  static getConnectionStatus(): {
    status: ConnectionStatus;
    pixelId?: string;
    catalogId?: string;
    details: string;
  } {
    const config = this.getConfig();
    const hasPixel = !!config.pixelId;
    const hasToken = !!config.accessToken;
    const hasCatalog = !!config.catalogId;

    if (hasPixel && hasToken) {
      return {
        status: "CONNECTED",
        pixelId: config.pixelId,
        catalogId: config.catalogId,
        details: `Connected to Meta Pixel (${config.pixelId}) and Conversions API (CAPI)`,
      };
    } else if (hasPixel) {
      return {
        status: "CONNECTED",
        pixelId: config.pixelId,
        catalogId: config.catalogId,
        details: `Connected to Meta Pixel (${config.pixelId}) via Browser Tag`,
      };
    }

    return {
      status: "CONFIGURATION_REQUIRED",
      details: "Meta Pixel ID and Access Token not configured in environment.",
    };
  }

  private static sha256(val: string): string {
    return crypto
      .createHash("sha256")
      .update(val.trim().toLowerCase())
      .digest("hex");
  }

  /**
   * Send verified server-side conversion event to Meta Conversions API (CAPI)
   */
  static async sendConversion(
    event: MarketingEvent,
    requestMeta?: { ipAddress?: string; userAgent?: string }
  ): Promise<{
    success: boolean;
    responseId?: string;
    error?: string;
    skipped?: boolean;
  }> {
    const config = this.getConfig();

    if (!config.pixelId || !config.accessToken) {
      return {
        success: false,
        skipped: true,
        error: "Meta Pixel ID or Access Token not configured in environment.",
      };
    }

    try {
      const url = `https://graph.facebook.com/v19.0/${config.pixelId}/events?access_token=${config.accessToken}`;

      const metaEventName = this.mapToMetaEventName(event.eventType);

      const userData: Record<string, any> = {};
      if (event.userEmail) {
        userData.em = [this.sha256(event.userEmail)];
      }
      if (event.userPhone) {
        userData.ph = [this.sha256(event.userPhone.replace(/\D/g, ""))];
      }
      if (requestMeta?.ipAddress) {
        userData.client_ip_address = requestMeta.ipAddress;
      }
      if (requestMeta?.userAgent) {
        userData.client_user_agent = requestMeta.userAgent;
      }
      if (event.attribution?.fbclid) {
        userData.fbc = `fb.1.${Date.now()}.${event.attribution.fbclid}`;
      }

      const customData: Record<string, any> = {
        currency: event.currency || "KES",
        value: event.value || 0,
      };

      if (event.items && event.items.length > 0) {
        customData.contents = event.items.map((i) => ({
          id: i.itemId,
          quantity: i.quantity,
          item_price: i.price,
        }));
        customData.content_type = "product";
      }

      const payload: Record<string, any> = {
        data: [
          {
            event_name: metaEventName,
            event_time: Math.floor(new Date(event.timestamp).getTime() / 1000),
            event_id: event.eventId, // Shared deduplication key with browser pixel
            event_source_url: event.attribution?.landingPage || "https://vendlex.co.ke",
            action_source: "website",
            user_data: userData,
            custom_data: customData,
          },
        ],
      };

      if (config.testEventCode) {
        payload.test_event_code = config.testEventCode;
      }

      const res = await fetch(url, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const resData = await res.json().catch(() => ({}));

      if (res.ok && resData.events_received) {
        return {
          success: true,
          responseId: `meta_${resData.fbtrace_id || Date.now()}`,
        };
      }

      return {
        success: false,
        error: resData.error?.message || `Meta API error HTTP ${res.status}`,
      };
    } catch (err: any) {
      return {
        success: false,
        error: err?.message || "Meta CAPI dispatch network failure",
      };
    }
  }

  private static mapToMetaEventName(eventType: string): string {
    switch (eventType) {
      case "purchase":
        return "Purchase";
      case "add_to_cart":
        return "AddToCart";
      case "view_item":
        return "ViewContent";
      case "begin_checkout":
        return "InitiateCheckout";
      case "search":
        return "Search";
      case "sign_up":
        return "CompleteRegistration";
      case "seller_onboarding_complete":
        return "Lead";
      default:
        return "CustomEvent";
    }
  }

  /**
   * Generate official Meta Product Catalog CSV format
   */
  static generateCatalogFeedCSV(
    items: ProductFeedItem[],
    baseUrl = process.env.NEXT_PUBLIC_APP_URL || "https://vendlex.co.ke"
  ): string {
    const headers = [
      "id",
      "title",
      "description",
      "availability",
      "condition",
      "price",
      "link",
      "image_link",
      "brand",
      "google_product_category",
      "custom_label_0", // County
    ];

    const escapeCsv = (str: string) => `"${(str || "").replace(/"/g, '""').replace(/\n/g, " ")}"`;

    const rows = items
      .filter((i) => i.isEligible)
      .map((item) => {
        const fullLink = item.link.startsWith("http") ? item.link : `${baseUrl}${item.link}`;
        const fullImg = item.imageLink.startsWith("http") ? item.imageLink : `${baseUrl}${item.imageLink}`;

        return [
          escapeCsv(item.id),
          escapeCsv(item.title),
          escapeCsv(item.description),
          escapeCsv(item.availability),
          escapeCsv("new"),
          escapeCsv(`${item.price.toFixed(2)} KES`),
          escapeCsv(fullLink),
          escapeCsv(fullImg),
          escapeCsv(item.brand || "VendLex"),
          escapeCsv(item.category || "General"),
          escapeCsv(item.county || "Nairobi"),
        ].join(",");
      });

    return [headers.join(","), ...rows].join("\n");
  }
}
