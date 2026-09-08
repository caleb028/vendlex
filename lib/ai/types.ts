import { UserRole } from "@/lib/store/auth-store";
import { Product, Business, Service } from "@/lib/data/kenya-data";
import { PlatformOrder } from "@/lib/store/platform-store";

export interface AIUserContext {
  userId?: string;
  name?: string;
  phone?: string;
  email?: string;
  role?: UserRole;
  businessId?: string;
  businessName?: string;
  businessSlug?: string;
  currentPage?: string;
  county?: string;
}

export type AIResponseCategory =
  | "text"
  | "product_results"
  | "product_comparison"
  | "order_status"
  | "seller_analytics"
  | "service_results"
  | "business_results"
  | "navigation"
  | "action_confirmation"
  | "knowledge"
  | "error";

export interface AIToolCallRecord {
  toolName: string;
  displayName: string;
  status: "success" | "denied" | "failed";
  durationMs: number;
  summary?: string;
}

export interface SellerAnalyticsData {
  storeName: string;
  totalRevenue: number;
  orderCount: number;
  averageOrderValue: number;
  dispatchedOrders: number;
  deliveredOrders: number;
  escrowPendingOrders: number;
  topProducts: { title: string; unitsSold: number; revenue: number }[];
  lowStockCount: number;
  periodDescription: string;
}

export interface ProductComparisonData {
  products: Product[];
  comparisonPoints: {
    feature: string;
    values: Record<string, string | number>;
  }[];
  recommendation?: string;
}

export interface AIStructuredResponse {
  type: AIResponseCategory;
  message: string;
  sources: string[];
  toolsExecuted: AIToolCallRecord[];
  data?: {
    products?: Product[];
    orders?: PlatformOrder[];
    analytics?: SellerAnalyticsData;
    services?: Service[];
    businesses?: Business[];
    comparison?: ProductComparisonData;
    navigationRoute?: string;
    navigationLabel?: string;
  };
  suggestedActions?: {
    label: string;
    actionType: "prompt" | "navigate" | "cart_add";
    payload: string;
  }[];
  confidence: "VERIFIED" | "INFERRED" | "UNKNOWN";
}

export interface ChatMessagePayload {
  id: string;
  sender: "user" | "bot";
  text: string;
  timestamp: string;
  structuredData?: AIStructuredResponse;
  toolsExecuted?: AIToolCallRecord[];
}

export interface AIConversationState {
  conversationId: string;
  userId?: string;
  lastSearchCategory?: string;
  lastSearchBrand?: string;
  lastMaxPrice?: number;
  lastLocation?: string;
  lastViewedProductId?: string;
  lastQueriedOrderNumber?: string;
}
