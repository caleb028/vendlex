export type MarketingProvider = "GOOGLE" | "META" | "INTERNAL";

export type EventDeliveryStatus = "PENDING" | "DELIVERED" | "FAILED" | "SKIPPED_CONSENT" | "SKIPPED_UNCONFIGURED";

export type ConnectionStatus =
  | "CONNECTED"
  | "DISCONNECTED"
  | "CONFIGURATION_REQUIRED"
  | "TOKEN_EXPIRED"
  | "PERMISSION_DENIED"
  | "SYNCING"
  | "SYNC_FAILED";

export type CampaignStatus =
  | "DRAFT"
  | "READY_FOR_SUBMISSION"
  | "SUBMITTED"
  | "ACTIVE"
  | "PAUSED"
  | "COMPLETED"
  | "FAILED";

export type CampaignObjective = "SALES" | "TRAFFIC" | "LEADS" | "BRAND_AWARENESS";

export type MarketingEventType =
  | "page_view"
  | "search"
  | "sign_up"
  | "login"
  | "view_item"
  | "view_category"
  | "add_to_cart"
  | "remove_from_cart"
  | "view_cart"
  | "begin_checkout"
  | "purchase"
  | "refund"
  | "cancel_order"
  | "seller_signup"
  | "seller_onboarding_complete"
  | "product_created"
  | "product_published"
  | "service_view"
  | "service_request"
  | "business_view"
  | "promotion_view"
  | "promotion_click"
  | "campaign_conversion";

export interface MarketingConsent {
  essential: true;
  analytics: boolean;
  marketing: boolean;
  updatedAt: string;
  ipAddress?: string;
  userAgent?: string;
}

export interface AttributionTouch {
  source: string;
  medium: string;
  campaign?: string;
  term?: string;
  content?: string;
  clickId?: string; // gclid or fbclid
  landingPage: string;
  referrer: string;
  timestamp: string;
}

export interface AttributionData {
  utmSource?: string;
  utmMedium?: string;
  utmCampaign?: string;
  utmTerm?: string;
  utmContent?: string;
  gclid?: string;
  fbclid?: string;
  landingPage?: string;
  referrer?: string;
  county?: string;
  firstTouch?: AttributionTouch;
  lastTouch?: AttributionTouch;
  capturedAt: string;
}

export interface MarketingEventItem {
  itemId: string;
  itemName: string;
  itemCategory?: string;
  itemBrand?: string;
  price: number;
  quantity: number;
  sellerId?: string;
  sellerName?: string;
}

export interface ProviderDeliveryRecord {
  provider: MarketingProvider;
  status: EventDeliveryStatus;
  attempts: number;
  lastAttemptAt?: string;
  responseId?: string;
  error?: string;
}

export interface MarketingEvent {
  id: string; // e.g. evt_178892019
  eventId: string; // Idempotent deduplication key (e.g. ord_ORD-9842_purchase_v1)
  eventType: MarketingEventType;
  timestamp: string;
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
  currency: "KES";
  value?: number;
  items?: MarketingEventItem[];
  attribution?: AttributionData;
  consent?: MarketingConsent;
  destinations: ProviderDeliveryRecord[];
  metadata?: Record<string, any>;
}

export interface AdvertisingConnection {
  provider: "GOOGLE" | "META";
  status: ConnectionStatus;
  accountId?: string;
  accountName?: string;
  merchantCenterId?: string;
  pixelId?: string;
  catalogId?: string;
  lastSyncAt?: string;
  lastError?: string;
  config: {
    conversionTrackingEnabled: boolean;
    serverEventsEnabled: boolean;
    productFeedEnabled: boolean;
    autoSyncCatalog: boolean;
  };
  updatedAt: string;
}

export interface CampaignMetrics {
  impressions: number;
  clicks: number;
  spend: number;
  conversions: number;
  attributedRevenue: number;
  ctr: number; // Click-through rate %
  cpc: number; // Cost per click KES
  cpa: number; // Cost per acquisition KES
  roas: number; // Return on Ad Spend
}

export interface MarketingCampaign {
  id: string; // cmp_xxx
  sellerId?: string; // If owned by a seller, or 'PLATFORM' for admin
  sellerName?: string;
  name: string;
  platform: "GOOGLE" | "META" | "CROSS_PLATFORM";
  objective: CampaignObjective;
  productId?: string;
  productTitle?: string;
  productImage?: string;
  targetCounties: string[]; // Kenyan counties, e.g. ["Nairobi", "Kiambu", "Mombasa"]
  budgetAmount: number; // Total budget in KES
  dailyBudget?: number; // Daily budget in KES
  currency: "KES";
  startDate: string;
  endDate?: string;
  status: CampaignStatus;
  externalCampaignId?: string;
  metrics: CampaignMetrics;
  createdAt: string;
  updatedAt: string;
}

export interface ProductFeedItem {
  id: string;
  title: string;
  description: string;
  link: string;
  imageLink: string;
  price: number;
  currency: "KES";
  availability: "in_stock" | "out_of_stock";
  condition: "new";
  brand: string;
  category: string;
  sellerId: string;
  sellerName: string;
  county: string;
  isEligible: boolean;
  rejectionReasons?: string[];
}

export interface ProductFeedSyncSummary {
  lastSyncAt: string;
  totalProducts: number;
  eligibleProducts: number;
  rejectedProducts: number;
  googleSynced: number;
  metaSynced: number;
  status: ConnectionStatus;
  errors: Array<{
    productId?: string;
    productTitle?: string;
    reason: string;
    timestamp: string;
  }>;
}

export interface MarketingAnalyticsSummary {
  totalSpend: number;
  totalImpressions: number;
  totalClicks: number;
  avgCtr: number;
  avgCpc: number;
  totalConversions: number;
  attributedRevenue: number;
  blendedRoas: number;
  blendedCpa: number;
  googleStats: {
    spend: number;
    conversions: number;
    revenue: number;
    roas: number;
    connected: boolean;
  };
  metaStats: {
    spend: number;
    conversions: number;
    revenue: number;
    roas: number;
    connected: boolean;
  };
  organicStats: {
    conversions: number;
    revenue: number;
  };
  countyPerformance: Array<{
    county: string;
    orders: number;
    revenue: number;
    topChannel: string;
  }>;
}
