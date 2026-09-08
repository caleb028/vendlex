"use client";

import React, { useEffect, useRef } from "react";
import { usePathname, useSearchParams } from "next/navigation";
import { AttributionData, MarketingEventType } from "@/lib/marketing/types";
import { parseAttributionFromUrl, buildAttributionSummary } from "@/lib/marketing/attribution";

const FIRST_TOUCH_STORAGE_KEY = "vendlex_first_touch_attribution";
const LAST_TOUCH_STORAGE_KEY = "vendlex_last_touch_attribution";

/**
 * Reads first-touch attribution from browser storage
 */
export function getStoredFirstTouch(): Partial<AttributionData> | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = localStorage.getItem(FIRST_TOUCH_STORAGE_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

/**
 * Reads last-touch attribution from browser storage
 */
export function getStoredLastTouch(): Partial<AttributionData> | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = sessionStorage.getItem(LAST_TOUCH_STORAGE_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

/**
 * Dispatches client-side marketing events (page_view, view_item, add_to_cart, etc.)
 * Strictly blocks client-initiated purchase conversions.
 */
export async function trackMarketingEvent(
  eventName: MarketingEventType,
  data?: {
    sellerId?: string;
    campaignId?: string;
    productIds?: string[];
    valueKes?: number;
    metadata?: Record<string, any>;
  }
) {
  if (typeof window === "undefined") return;

  if (eventName === "purchase") {
    console.warn(
      "[VendLex Security] Client-side purchase conversions are strictly prohibited. Conversions must originate from verified M-Pesa backend callbacks."
    );
    return;
  }

  const currentUrl = window.location.href;
  const currentTouch = parseAttributionFromUrl(currentUrl, document.referrer);
  const firstTouch = getStoredFirstTouch() || currentTouch;
  const combinedAttribution = buildAttributionSummary(firstTouch, currentTouch);

  // Check consent from localStorage
  let consent = { essential: true, analytics: true, marketing: true };
  try {
    const savedConsent = localStorage.getItem("vendlex_marketing_consent");
    if (savedConsent) {
      consent = JSON.parse(savedConsent);
    }
  } catch {}

  const payload = {
    event_name: eventName,
    seller_id: data?.sellerId,
    campaign_id: data?.campaignId,
    product_ids: data?.productIds,
    value_kes: data?.valueKes || 0,
    currency: "KES",
    attribution: combinedAttribution,
    consent,
    metadata: {
      ...data?.metadata,
      page_title: document.title,
      page_location: currentUrl,
      screen_resolution: `${window.screen.width}x${window.screen.height}`,
    },
  };

  try {
    const bodyStr = JSON.stringify(payload);
    if (navigator.sendBeacon) {
      navigator.sendBeacon("/api/marketing/events", bodyStr);
    } else {
      fetch("/api/marketing/events", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: bodyStr,
        keepalive: true,
      }).catch(() => {});
    }
  } catch (err) {
    console.error("[Marketing Tracker] Failed to dispatch event", err);
  }
}

export function MarketingTracker() {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const lastTrackedUrl = useRef<string>("");

  useEffect(() => {
    if (typeof window === "undefined") return;

    const fullUrl = window.location.href;
    const referrer = document.referrer;

    // Capture Attribution
    const extracted = parseAttributionFromUrl(fullUrl, referrer);

    // 1. Store First-Touch Attribution if not already stored
    try {
      const existingFirstTouch = localStorage.getItem(FIRST_TOUCH_STORAGE_KEY);
      if (!existingFirstTouch && (extracted.utmSource || extracted.gclid || extracted.fbclid || referrer)) {
        localStorage.setItem(FIRST_TOUCH_STORAGE_KEY, JSON.stringify(extracted));
      }
    } catch {}

    // 2. Always update Last-Touch Attribution for current browsing session
    try {
      if (extracted.utmSource || extracted.gclid || extracted.fbclid || !sessionStorage.getItem(LAST_TOUCH_STORAGE_KEY)) {
        sessionStorage.setItem(LAST_TOUCH_STORAGE_KEY, JSON.stringify(extracted));
      }
    } catch {}

    // 3. Track Page View if URL changed
    if (lastTrackedUrl.current !== fullUrl) {
      lastTrackedUrl.current = fullUrl;
      trackMarketingEvent("page_view");
    }

    // 4. Listen for custom window event dispatches
    const handleCustomTrack = (e: Event) => {
      const customEvent = e as CustomEvent;
      if (customEvent.detail && customEvent.detail.eventName) {
        trackMarketingEvent(customEvent.detail.eventName, customEvent.detail.data);
      }
    };

    window.addEventListener("vendlex_track_event", handleCustomTrack);
    return () => {
      window.removeEventListener("vendlex_track_event", handleCustomTrack);
    };
  }, [pathname, searchParams]);

  return null;
}
