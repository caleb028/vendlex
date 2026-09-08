import { AttributionData, AttributionTouch } from "./types";

export class AttributionEngine {
  /**
   * Parse UTM parameters & click IDs from URL search params or referrer
   */
  static parseAttribution(
    searchParams: Record<string, string | string[] | undefined> | URLSearchParams,
    referrer?: string,
    landingPage?: string,
    existingAttribution?: AttributionData
  ): AttributionData {
    const getParam = (key: string): string | undefined => {
      if (searchParams instanceof URLSearchParams) {
        return searchParams.get(key) || undefined;
      }
      const val = searchParams[key];
      if (Array.isArray(val)) return val[0];
      return val || undefined;
    };

    const utmSource = getParam("utm_source");
    const utmMedium = getParam("utm_medium");
    const utmCampaign = getParam("utm_campaign");
    const utmTerm = getParam("utm_term");
    const utmContent = getParam("utm_content");
    const gclid = getParam("gclid");
    const fbclid = getParam("fbclid");
    const county = getParam("county");

    // Determine current touch source
    let source = utmSource;
    let medium = utmMedium;

    if (gclid) {
      source = source || "google";
      medium = medium || "cpc";
    } else if (fbclid) {
      source = source || "meta";
      medium = medium || "paid_social";
    } else if (!source && referrer) {
      try {
        const refUrl = new URL(referrer);
        if (refUrl.hostname.includes("google")) {
          source = "google";
          medium = "organic";
        } else if (refUrl.hostname.includes("facebook") || refUrl.hostname.includes("instagram")) {
          source = "meta";
          medium = "social";
        } else if (!refUrl.hostname.includes("vendlex.co.ke") && !refUrl.hostname.includes("localhost")) {
          source = refUrl.hostname;
          medium = "referral";
        }
      } catch {
        // Invalid URL referrer, ignore
      }
    }

    const currentTouch: AttributionTouch | undefined =
      source || landingPage || referrer
        ? {
            source: source || "direct",
            medium: medium || "none",
            campaign: utmCampaign,
            term: utmTerm,
            content: utmContent,
            clickId: gclid || fbclid,
            landingPage: landingPage || "/",
            referrer: referrer || "",
            timestamp: new Date().toISOString(),
          }
        : undefined;

    const now = new Date().toISOString();

    const firstTouch: AttributionTouch =
      existingAttribution?.firstTouch || currentTouch || {
        source: "direct",
        medium: "none",
        landingPage: landingPage || "/",
        referrer: referrer || "",
        timestamp: now,
      };

    const lastTouch: AttributionTouch =
      currentTouch || existingAttribution?.lastTouch || firstTouch;

    return {
      utmSource: utmSource || existingAttribution?.utmSource,
      utmMedium: utmMedium || existingAttribution?.utmMedium,
      utmCampaign: utmCampaign || existingAttribution?.utmCampaign,
      utmTerm: utmTerm || existingAttribution?.utmTerm,
      utmContent: utmContent || existingAttribution?.utmContent,
      gclid: gclid || existingAttribution?.gclid,
      fbclid: fbclid || existingAttribution?.fbclid,
      landingPage: landingPage || existingAttribution?.landingPage || "/",
      referrer: referrer || existingAttribution?.referrer || "",
      county: county || existingAttribution?.county,
      firstTouch,
      lastTouch,
      capturedAt: now,
    };
  }

  /**
   * Determine the attributed marketing channel for reporting
   */
  static getPrimaryChannel(attribution?: AttributionData): "Google" | "Meta" | "Organic Search" | "Social" | "Direct" | "Referral" {
    if (!attribution) return "Direct";
    const touch = attribution.lastTouch || attribution.firstTouch;
    const src = (touch?.source || attribution.utmSource || "").toLowerCase();
    const med = (touch?.medium || attribution.utmMedium || "").toLowerCase();

    if (src.includes("meta") || src.includes("facebook") || src.includes("instagram") || (touch?.clickId && touch.clickId === attribution.fbclid)) {
      return "Meta";
    }
    if (src.includes("google") || src.includes("adwords") || med === "cpc" || (touch?.clickId && touch.clickId === attribution.gclid)) {
      return "Google";
    }
    if (med === "organic" || src.includes("bing") || src.includes("duckduckgo")) {
      return "Organic Search";
    }
    if (med === "social" || src.includes("twitter") || src.includes("tiktok") || src.includes("whatsapp")) {
      return "Social";
    }
    if (src && src !== "direct") {
      return "Referral";
    }
    return "Direct";
  }
}

/**
 * Convenience helper to parse attribution from a full URL string
 */
export function parseAttributionFromUrl(
  urlStr: string,
  referrer?: string,
  existingAttribution?: AttributionData
): AttributionData {
  try {
    const url = new URL(urlStr, "https://vendlex.co.ke");
    return AttributionEngine.parseAttribution(
      url.searchParams,
      referrer,
      url.pathname,
      existingAttribution
    );
  } catch {
    return AttributionEngine.parseAttribution({}, referrer, "/", existingAttribution);
  }
}

/**
 * Convenience helper to build attribution summary from touches
 */
export function buildAttributionSummary(
  firstTouch?: Partial<AttributionData> | null,
  lastTouch?: Partial<AttributionData> | null
): AttributionData {
  const now = new Date().toISOString();
  return {
    utmSource: lastTouch?.utmSource || firstTouch?.utmSource,
    utmMedium: lastTouch?.utmMedium || firstTouch?.utmMedium,
    utmCampaign: lastTouch?.utmCampaign || firstTouch?.utmCampaign,
    utmTerm: lastTouch?.utmTerm || firstTouch?.utmTerm,
    utmContent: lastTouch?.utmContent || firstTouch?.utmContent,
    gclid: lastTouch?.gclid || firstTouch?.gclid,
    fbclid: lastTouch?.fbclid || firstTouch?.fbclid,
    landingPage: lastTouch?.landingPage || firstTouch?.landingPage || "/",
    referrer: lastTouch?.referrer || firstTouch?.referrer || "",
    county: lastTouch?.county || firstTouch?.county,
    firstTouch: firstTouch?.firstTouch || (firstTouch as any) || {
      source: "direct",
      medium: "none",
      landingPage: "/",
      referrer: "",
      timestamp: now,
    },
    lastTouch: lastTouch?.lastTouch || (lastTouch as any) || {
      source: "direct",
      medium: "none",
      landingPage: "/",
      referrer: "",
      timestamp: now,
    },
    capturedAt: now,
  };
}
