import {
  MOCK_PRODUCTS,
  MOCK_BUSINESSES,
  MOCK_SERVICES,
  PRICING_PLANS,
  Product,
  Business,
  Service,
} from "@/lib/data/kenya-data";
import { PlatformOrder } from "@/lib/store/platform-store";
import { AIUserContext, SellerAnalyticsData, ProductComparisonData } from "../types";
import { PermissionGuard } from "../permissions/guard";
import { searchKnowledgeBase, KnowledgeArticle } from "../knowledge";

// Live seeded orders (matching platform default orders)
export const LIVE_ORDERS: PlatformOrder[] = [
  {
    id: "ord-101",
    orderNumber: "ORD-9842",
    customerName: "David Ochieng",
    customerPhone: "0722 123 456",
    county: "Nairobi",
    productTitle: "Apple iPhone 15 Pro Max 256GB Titanium",
    storeName: "Nairobi Tech Hub",
    amount: 185000,
    mpesaReceipt: "QKH89421A",
    orderDate: "August 31, 2026",
    courierTracking: "FARGO-89421",
    status: "PAID_ESCROW",
  },
  {
    id: "ord-102",
    orderNumber: "ORD-9843",
    customerName: "Grace Wanjiku",
    customerPhone: "0711 987 654",
    county: "Kiambu",
    productTitle: "SunKing Home 500X Complete Solar System with 32\" TV",
    storeName: "Rift Solar & Power KE",
    amount: 38500,
    mpesaReceipt: "QKH91022B",
    orderDate: "August 31, 2026",
    courierTracking: "G4S-19204",
    status: "DISPATCHED",
  },
  {
    id: "ord-103",
    orderNumber: "ORD-9844",
    customerName: "Brian Otieno",
    customerPhone: "0733 111 222",
    county: "Mombasa",
    productTitle: "Sony Bravia 55-inch 4K Google TV",
    storeName: "Nairobi Tech Hub",
    amount: 68999,
    mpesaReceipt: "QKH93144C",
    orderDate: "September 1, 2026",
    courierTracking: "FARGO-90112",
    status: "DELIVERED",
  },
  {
    id: "ord-104",
    orderNumber: "ORD-9845",
    customerName: "Grace Wanjiku",
    customerPhone: "0711 987 654",
    county: "Kiambu",
    productTitle: "NutriCook 8.5L Dual Air Fryer",
    storeName: "Savanna Kitchen Ware",
    amount: 16499,
    mpesaReceipt: "QKH94581D",
    orderDate: "September 2, 2026",
    courierTracking: "FARGO-91283",
    status: "DISPATCHED",
  },
];

export interface SearchProductsParams {
  query?: string;
  category?: string;
  brand?: string;
  minPrice?: number;
  maxPrice?: number;
  county?: string;
  verifiedOnly?: boolean;
  limit?: number;
}

export class VendLexTools {
  /**
   * 1. searchProducts()
   * Retrieves matching products strictly from MOCK_PRODUCTS database
   */
  static searchProducts(params: SearchProductsParams): Product[] {
    const {
      query,
      category,
      brand,
      minPrice,
      maxPrice,
      county,
      verifiedOnly,
      limit = 6,
    } = params;

    // Clean conversational filler tokens from query
    let searchTokens: string[] = [];
    if (query && query.trim()) {
      const STOP_WORDS = new Set([
        "find", "show", "me", "buy", "i", "need", "looking", "for", "natafuta", "nataka",
        "simu", "phone", "phones", "laptop", "laptops", "under", "below", "chini", "ya",
        "less", "than", "only", "just", "in", "at", "the", "a", "an", "with", "ksh", "kes"
      ]);

      searchTokens = query
        .toLowerCase()
        .replace(/[\d,]+k?/gi, "") // remove price mentions like 40k, 300,000
        .split(/[^a-z0-9]+/i)
        .filter((t) => t.length > 1 && !STOP_WORDS.has(t));
    }

    return MOCK_PRODUCTS.filter((product) => {
      // Token-based keyword search if specific keywords remain
      if (searchTokens.length > 0) {
        const prodText = `${product.title} ${product.category} ${product.businessName} ${product.description} ${product.tags?.join(" ") || ""}`.toLowerCase();
        const matchesAnyToken = searchTokens.some((token) => prodText.includes(token));
        if (!matchesAnyToken) return false;
      }

      // Category search
      if (category && category !== "all") {
        if (!product.category.toLowerCase().includes(category.toLowerCase())) {
          return false;
        }
      }

      // Brand search
      if (brand && brand.trim()) {
        const b = brand.toLowerCase().trim();
        if (!product.title.toLowerCase().includes(b) && !product.description.toLowerCase().includes(b)) {
          return false;
        }
      }

      // Price filter
      if (minPrice !== undefined && product.price < minPrice) return false;
      if (maxPrice !== undefined && product.price > maxPrice) return false;

      // County filter
      if (county && county !== "all") {
        if (product.county.toLowerCase() !== county.toLowerCase()) return false;
      }

      // Verified only
      if (verifiedOnly && !product.businessVerified) return false;

      return true;
    }).slice(0, limit);
  }

  /**
   * 2. getProductDetails()
   */
  static getProductDetails(slugOrId: string): Product | null {
    const term = slugOrId.toLowerCase().trim();
    return (
      MOCK_PRODUCTS.find(
        (p) => p.id === term || p.slug === term || p.title.toLowerCase().includes(term)
      ) || null
    );
  }

  /**
   * 3. compareProducts()
   */
  static compareProducts(slugsOrIds: string[]): ProductComparisonData | null {
    const found: Product[] = [];
    for (const id of slugsOrIds) {
      const p = this.getProductDetails(id);
      if (p && !found.some((x) => x.id === p.id)) {
        found.push(p);
      }
    }

    if (found.length < 2) return null;

    const valuesPrice: Record<string, string | number> = {};
    const valuesRating: Record<string, string | number> = {};
    const valuesSeller: Record<string, string | number> = {};
    const valuesDelivery: Record<string, string | number> = {};

    found.forEach((p) => {
      valuesPrice[p.title] = `KSh ${p.price.toLocaleString()}`;
      valuesRating[p.title] = `${p.rating} ⭐ (${p.reviewCount} reviews)`;
      valuesSeller[p.title] = `${p.businessName} (${p.county})`;
      valuesDelivery[p.title] = p.deliveryInfo;
    });

    return {
      products: found,
      comparisonPoints: [
        { feature: "Price", values: valuesPrice },
        { feature: "Rating", values: valuesRating },
        { feature: "Seller & County", values: valuesSeller },
        { feature: "Delivery Speed", values: valuesDelivery },
      ],
      recommendation:
        found[0].price < found[1].price
          ? `'${found[0].title}' offers the lower price point at KSh ${found[0].price.toLocaleString()}.`
          : `'${found[1].title}' offers the lower price point at KSh ${found[1].price.toLocaleString()}.`,
    };
  }

  /**
   * 4. getUserOrders()
   * Retrieves orders for authenticated user with strict permission verification
   */
  static getUserOrders(user: AIUserContext | undefined): { success: boolean; orders?: PlatformOrder[]; error?: string } {
    if (!user || !user.role) {
      return {
        success: false,
        error: "Please sign in to inspect your order history.",
      };
    }

    if (user.role === "ADMIN") {
      return { success: true, orders: LIVE_ORDERS };
    }

    // Filter orders belonging to this user
    const matched = LIVE_ORDERS.filter((ord) => {
      const check = PermissionGuard.canAccessOrder(user, ord.customerPhone, ord.customerName);
      return check.allowed;
    });

    return { success: true, orders: matched };
  }

  /**
   * 5. getOrderStatus()
   */
  static getOrderStatus(orderNumber: string, user: AIUserContext | undefined): { success: boolean; order?: PlatformOrder; error?: string } {
    const cleanNum = orderNumber.toUpperCase().trim();
    const order = LIVE_ORDERS.find((o) => o.orderNumber === cleanNum || o.id === cleanNum);

    if (!order) {
      return {
        success: false,
        error: `Order '${orderNumber}' was not found in the VendLex database. Please check the order code (e.g. ORD-9842).`,
      };
    }

    const check = PermissionGuard.canAccessOrder(user, order.customerPhone, order.customerName);
    if (!check.allowed) {
      return { success: false, error: check.reason };
    }

    return { success: true, order };
  }

  /**
   * 6. getDeliveryStatus()
   */
  static getDeliveryStatus(trackingOrOrderNum: string, user: AIUserContext | undefined): { success: boolean; tracking?: any; error?: string } {
    const term = trackingOrOrderNum.toUpperCase().trim();
    const order = LIVE_ORDERS.find(
      (o) => o.courierTracking === term || o.orderNumber === term
    );

    if (!order) {
      return {
        success: false,
        error: `No courier consignment found for reference '${trackingOrOrderNum}'.`,
      };
    }

    const check = PermissionGuard.canAccessOrder(user, order.customerPhone, order.customerName);
    if (!check.allowed) {
      return { success: false, error: check.reason };
    }

    return {
      success: true,
      tracking: {
        orderNumber: order.orderNumber,
        product: order.productTitle,
        courier: order.courierTracking?.startsWith("FARGO") ? "Fargo Courier Kenya" : "G4S Security Express",
        trackingCode: order.courierTracking,
        status: order.status,
        destinationCounty: order.county,
        mpesaReceipt: order.mpesaReceipt,
      },
    };
  }

  /**
   * 7. getSellerAnalytics()
   * Aggregates real metrics from LIVE_ORDERS and MOCK_PRODUCTS for verified store
   */
  static getSellerAnalytics(storeName: string, user: AIUserContext | undefined): { success: boolean; analytics?: SellerAnalyticsData; error?: string } {
    const check = PermissionGuard.canAccessSellerData(user, storeName);
    if (!check.allowed) {
      return { success: false, error: check.reason };
    }

    const storeOrders = LIVE_ORDERS.filter((o) =>
      o.storeName.toLowerCase().includes(storeName.toLowerCase())
    );

    const storeProducts = MOCK_PRODUCTS.filter((p) =>
      p.businessName.toLowerCase().includes(storeName.toLowerCase())
    );

    const totalRevenue = storeOrders.reduce((acc, curr) => acc + curr.amount, 0);
    const orderCount = storeOrders.length;
    const averageOrderValue = orderCount > 0 ? Math.round(totalRevenue / orderCount) : 0;
    const dispatched = storeOrders.filter((o) => o.status === "DISPATCHED").length;
    const delivered = storeOrders.filter((o) => o.status === "DELIVERED").length;
    const escrowPending = storeOrders.filter((o) => o.status === "PAID_ESCROW").length;
    const lowStock = storeProducts.filter((p) => p.stockCount <= p.lowStockThreshold).length;

    // Top products
    const productFrequency: Record<string, { count: number; rev: number }> = {};
    storeOrders.forEach((o) => {
      if (!productFrequency[o.productTitle]) {
        productFrequency[o.productTitle] = { count: 0, rev: 0 };
      }
      productFrequency[o.productTitle].count += 1;
      productFrequency[o.productTitle].rev += o.amount;
    });

    const topProducts = Object.entries(productFrequency).map(([title, val]) => ({
      title,
      unitsSold: val.count,
      revenue: val.rev,
    }));

    return {
      success: true,
      analytics: {
        storeName,
        totalRevenue,
        orderCount,
        averageOrderValue,
        dispatchedOrders: dispatched,
        deliveredOrders: delivered,
        escrowPendingOrders: escrowPending,
        topProducts,
        lowStockCount: lowStock,
        periodDescription: "Verified store performance across active orders",
      },
    };
  }

  /**
   * 8. getSellerOrders()
   */
  static getSellerOrders(storeName: string, user: AIUserContext | undefined): { success: boolean; orders?: PlatformOrder[]; error?: string } {
    const check = PermissionGuard.canAccessSellerData(user, storeName);
    if (!check.allowed) {
      return { success: false, error: check.reason };
    }

    const matched = LIVE_ORDERS.filter((o) =>
      o.storeName.toLowerCase().includes(storeName.toLowerCase())
    );

    return { success: true, orders: matched };
  }

  /**
   * 9. getLowStockProducts()
   */
  static getLowStockProducts(storeName: string, user: AIUserContext | undefined): { success: boolean; products?: Product[]; error?: string } {
    const check = PermissionGuard.canAccessSellerData(user, storeName);
    if (!check.allowed) {
      return { success: false, error: check.reason };
    }

    const lowStock = MOCK_PRODUCTS.filter(
      (p) =>
        p.businessName.toLowerCase().includes(storeName.toLowerCase()) &&
        p.stockCount <= p.lowStockThreshold
    );

    return { success: true, products: lowStock };
  }

  /**
   * 10. searchServiceProviders()
   */
  static searchServiceProviders(categoryOrQuery?: string, county?: string): Service[] {
    return MOCK_SERVICES.filter((service) => {
      if (categoryOrQuery && categoryOrQuery.trim()) {
        const q = categoryOrQuery.toLowerCase().trim();
        const mTitle = service.title.toLowerCase().includes(q);
        const mCat = service.category.toLowerCase().includes(q);
        const mProv = service.providerName.toLowerCase().includes(q);
        if (!mTitle && !mCat && !mProv) return false;
      }
      if (county && county !== "all") {
        if (service.county.toLowerCase() !== county.toLowerCase()) return false;
      }
      return true;
    }).slice(0, 4);
  }

  /**
   * 11. searchBusinesses()
   */
  static searchBusinesses(query?: string, county?: string): Business[] {
    return MOCK_BUSINESSES.filter((biz) => {
      if (query && query.trim()) {
        const q = query.toLowerCase().trim();
        const mName = biz.name.toLowerCase().includes(q);
        const mCat = biz.category.toLowerCase().includes(q);
        const mDesc = biz.description.toLowerCase().includes(q);
        if (!mName && !mCat && !mDesc) return false;
      }
      if (county && county !== "all") {
        if (biz.county.toLowerCase() !== county.toLowerCase()) return false;
      }
      return true;
    }).slice(0, 4);
  }

  /**
   * 12. searchVendLexKnowledge()
   */
  static searchVendLexKnowledge(query: string): KnowledgeArticle[] {
    return searchKnowledgeBase(query, 3);
  }

  /**
   * 13. navigateUser()
   * Strictly validates against approved internal routes to prevent arbitrary redirect attacks.
   */
  static navigateUser(target: string): { allowed: boolean; route: string; label: string } {
    const APPROVED_ROUTES: Record<string, string> = {
      marketplace: "/marketplace",
      shop: "/marketplace",
      orders: "/customer/dashboard",
      "my orders": "/customer/dashboard",
      wishlist: "/customer/wishlist",
      cart: "/cart",
      checkout: "/checkout",
      deals: "/deals",
      services: "/services",
      businesses: "/businesses",
      "seller onboarding": "/seller/onboarding",
      "start selling": "/seller/onboarding",
      "seller dashboard": "/seller/dashboard",
      inventory: "/seller/inventory",
      analytics: "/seller/analytics",
      counties: "/counties",
      disputes: "/customer/disputes",
      rewards: "/customer/dashboard",
      b2b: "/b2b",
    };

    const clean = target.toLowerCase().trim();
    for (const [key, route] of Object.entries(APPROVED_ROUTES)) {
      if (clean.includes(key)) {
        return { allowed: true, route, label: `Go to ${key.toUpperCase()}` };
      }
    }

    return { allowed: true, route: "/marketplace", label: "Go to Marketplace" };
  }

  /**
   * 14. getSubscriptionStatus()
   */
  static getSubscriptionStatus(tierName = "STARTER") {
    const plan = PRICING_PLANS.find((p) => p.name.toLowerCase().includes(tierName.toLowerCase())) || PRICING_PLANS[1];
    return plan;
  }

  /**
   * 15. getUserDocuments()
   */
  static getUserDocuments(user: AIUserContext | undefined, type?: string) {
    const { DocumentService } = require("@/lib/documents/service");
    const docs = DocumentService.listDocuments(
      {
        role: user?.role || "CUSTOMER",
        userId: user?.userId,
        name: user?.name,
        phone: user?.phone,
        businessName: user?.businessName,
      },
      { type }
    );
    return docs;
  }

  /**
   * 16. verifyDocument()
   */
  static verifyDocument(documentId: string) {
    const { DocumentService } = require("@/lib/documents/service");
    return DocumentService.verifyDocument(documentId);
  }

  /**
   * 17. getMarketingAnalytics()
   * Retrieves marketing KPIs and conversion metrics guarded by user role.
   */
  static getMarketingAnalytics(user: AIUserContext | undefined, timeframe: "7d" | "30d" | "all" = "30d") {
    const perm = PermissionGuard.canAccessMarketingData(user);
    if (!perm.allowed) {
      return { success: false, error: perm.reason };
    }

    const { VendLexMarketingEngine } = require("@/lib/marketing/engine");
    const sellerId = user?.role === "ADMIN" ? undefined : (user?.businessId || user?.userId);
    const summary = VendLexMarketingEngine.getAnalyticsSummary({
      sellerId,
      timeframe,
    });

    return {
      success: true,
      timeframe,
      scope: user?.role === "ADMIN" ? "PLATFORM_WIDE" : "SELLER_ISOLATED",
      metrics: summary,
    };
  }

  /**
   * 18. getSellerCampaigns()
   * Retrieves active advertising campaigns for the authenticated seller or all campaigns for admin.
   */
  static getSellerCampaigns(user: AIUserContext | undefined) {
    const perm = PermissionGuard.canAccessMarketingData(user);
    if (!perm.allowed) {
      return { success: false, error: perm.reason };
    }

    const { serverDB } = require("@/lib/server-db");
    const allCampaigns = serverDB.getCampaigns();

    if (user?.role === "ADMIN") {
      return { success: true, campaigns: allCampaigns };
    }

    const sellerId = user?.businessId || user?.userId;
    const sellerCampaigns = allCampaigns.filter((c: any) => c.seller_id === sellerId);
    return { success: true, campaigns: sellerCampaigns };
  }

  /**
   * 19. getTopMarketingChannels()
   * Retrieves highest ROI channels for the merchant.
   */
  static getTopMarketingChannels(user: AIUserContext | undefined) {
    const perm = PermissionGuard.canAccessMarketingData(user);
    if (!perm.allowed) {
      return { success: false, error: perm.reason };
    }

    const { VendLexMarketingEngine } = require("@/lib/marketing/engine");
    const sellerId = user?.role === "ADMIN" ? undefined : (user?.businessId || user?.userId);
    const summary = VendLexMarketingEngine.getAnalyticsSummary({
      sellerId,
      timeframe: "all",
    });

    return {
      success: true,
      channels: summary.channels,
    };
  }
}
