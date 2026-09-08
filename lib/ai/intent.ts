export type IntentType =
  | "PRODUCT_SEARCH"
  | "PRODUCT_COMPARISON"
  | "ORDER_STATUS"
  | "DELIVERY_STATUS"
  | "SELLER_ANALYTICS"
  | "INVENTORY_ANALYSIS"
  | "SERVICE_SEARCH"
  | "BUSINESS_SEARCH"
  | "DOCUMENT_LOOKUP"
  | "DOCUMENT_VERIFY"
  | "PLATFORM_KNOWLEDGE"
  | "CONTENT_GENERATION"
  | "NAVIGATION"
  | "GENERAL_QUERY";

export interface ParsedSearchFilters {
  category?: string;
  brand?: string;
  minPrice?: number;
  maxPrice?: number;
  county?: string;
  orderNumber?: string;
  serviceCategory?: string;
  navigationTarget?: string;
  isKiswahili?: boolean;
}

export interface IntentDetectionResult {
  intent: IntentType;
  confidence: number;
  filters: ParsedSearchFilters;
  extractedKeywords: string[];
}

export class IntentEngine {
  /**
   * Parse user natural language text and extract intent + structured filters
   */
  static detectIntent(query: string): IntentDetectionResult {
    const text = query.toLowerCase().trim();
    const filters: ParsedSearchFilters = {};

    // 1. Detect Kiswahili / Sheng markers
    const swahiliMarkers = [
      "habari", "jambo", "natafuta", "nataka", "wapi", "chini ya", "zaidi ya",
      "pesa", "shilingi", "fundi", "kuuza", "nunua", "simu", "stima", "yangu", "duka"
    ];
    filters.isKiswahili = swahiliMarkers.some((m) => text.includes(m));

    // 2. Extract Specific Order Number (e.g. ORD-9842 or VL-28491)
    const orderMatch = text.match(/(ORD-\d{4,5}|VL-\d{4,5}|[A-Z]{3}-\d{4,5})/i);
    if (orderMatch) {
      filters.orderNumber = orderMatch[1].toUpperCase();
    }

    // 3. Extract Max Price (e.g. "under 30k", "below 80,000", "chini ya 40k", "< 50000")
    const priceKMatch = text.match(/(under|below|chini ya|less than|max)\s*(?:ksh|kes)?\s*(\d+)(?:\s*)k/i);
    if (priceKMatch) {
      filters.maxPrice = parseInt(priceKMatch[2], 10) * 1000;
    } else {
      const priceNumMatch = text.match(/(under|below|chini ya|less than|max)\s*(?:ksh|kes)?\s*(\d{1,3}(?:,\d{3})+|\d+)/i);
      if (priceNumMatch) {
        filters.maxPrice = parseInt(priceNumMatch[2].replace(/,/g, ""), 10);
      }
    }

    // 4. Extract Brands
    const KNOWN_BRANDS = [
      "samsung", "apple", "iphone", "macbook", "sony", "hp", "dell",
      "lenovo", "nutricook", "sunking", "huawei", "infinix", "tecno", "oppo"
    ];
    for (const b of KNOWN_BRANDS) {
      if (text.includes(b)) {
        filters.brand = b;
        break;
      }
    }

    // 5. Extract County Location
    const KNOWN_COUNTIES = [
      "nairobi", "mombasa", "kiambu", "nakuru", "kisumu", "uasin gishu",
      "eldoret", "thika", "machakos", "kilifi", "meru", "kajiado", "nyeri"
    ];
    for (const c of KNOWN_COUNTIES) {
      if (text.includes(c)) {
        filters.county = c === "eldoret" ? "Uasin Gishu" : c === "thika" ? "Kiambu" : c.charAt(0).toUpperCase() + c.slice(1);
        break;
      }
    }

    // 6. Extract Categories (matching kenya-data.ts CATEGORIES exactly)
    if (text.includes("phone") || text.includes("simu") || text.includes("smartphone")) {
      filters.category = "Phones & Accessories";
    } else if (text.includes("laptop") || text.includes("computer") || text.includes("macbook")) {
      filters.category = "Computers & Tech";
    } else if (text.includes("tv") || text.includes("television") || text.includes("audio") || text.includes("speaker")) {
      filters.category = "TV, Audio & Video";
    } else if (text.includes("solar") || text.includes("inverter") || text.includes("battery")) {
      filters.category = "Solar & Renewable Energy";
    } else if (text.includes("shoe") || text.includes("sneaker")) {
      filters.category = "Shoes & Footwear";
    } else if (text.includes("dress") || text.includes("clothing") || text.includes("kitenge")) {
      filters.category = "Fashion & Clothing";
    } else if (text.includes("kitchen") || text.includes("cook") || text.includes("furniture") || text.includes("home")) {
      filters.category = "Home & Kitchen";
    }

    // 7. Intent Classification
    // A. Navigation
    if (text.includes("take me to") || text.includes("navigate to") || text.includes("open my") || text.includes("go to")) {
      const target = text.replace(/take me to|navigate to|open my|go to/g, "").trim();
      filters.navigationTarget = target;
      return { intent: "NAVIGATION", confidence: 0.95, filters, extractedKeywords: [target] };
    }

    // B. Product Comparison
    if (text.includes("compare") || text.includes("vs") || text.includes("difference between")) {
      return { intent: "PRODUCT_COMPARISON", confidence: 0.9, filters, extractedKeywords: ["compare"] };
    }

    // C. Document Verification & Lookup
    const docIdMatch = text.match(/(VLX-[A-Z]{3}-\d{4}-\d+|VLX-[A-Z0-9-]+)/i);
    if (docIdMatch || text.includes("verify document") || text.includes("check document")) {
      return {
        intent: "DOCUMENT_VERIFY",
        confidence: 0.95,
        filters,
        extractedKeywords: [docIdMatch ? docIdMatch[1].toUpperCase() : "document"],
      };
    }

    if (text.includes("receipt") || text.includes("invoice") || text.includes("statement") || text.includes("my documents") || text.includes("warranty document")) {
      return {
        intent: "DOCUMENT_LOOKUP",
        confidence: 0.9,
        filters,
        extractedKeywords: ["document"],
      };
    }

    // D. Order or Delivery Status
    if (filters.orderNumber || text.includes("where is my order") || text.includes("track my") || text.includes("order yangu") || text.includes("order status") || text.includes("delivery status")) {
      if (text.includes("delivery") || text.includes("fargo") || text.includes("tracking")) {
        return { intent: "DELIVERY_STATUS", confidence: 0.95, filters, extractedKeywords: ["delivery", filters.orderNumber || ""] };
      }
      return { intent: "ORDER_STATUS", confidence: 0.95, filters, extractedKeywords: ["order", filters.orderNumber || ""] };
    }

    // E. Seller Analytics & Store Performance
    if (text.includes("sales") || text.includes("revenue") || text.includes("how much did i make") || text.includes("best selling") || text.includes("my orders") && text.includes("received")) {
      return { intent: "SELLER_ANALYTICS", confidence: 0.9, filters, extractedKeywords: ["sales", "analytics"] };
    }

    // E. Low Stock & Inventory
    if (text.includes("low stock") || text.includes("out of stock") || text.includes("restock") || text.includes("inventory")) {
      return { intent: "INVENTORY_ANALYSIS", confidence: 0.9, filters, extractedKeywords: ["inventory", "stock"] };
    }

    // F. Service Provider Discovery
    if (text.includes("plumber") || text.includes("electrician") || text.includes("technician") || text.includes("fundi") || text.includes("repair") || text.includes("mechanic")) {
      filters.serviceCategory = text.includes("plumber") ? "Plumbing" : text.includes("electrician") || text.includes("stima") ? "Electrical" : "Technician";
      return { intent: "SERVICE_SEARCH", confidence: 0.9, filters, extractedKeywords: ["service", filters.serviceCategory] };
    }

    // G. Business Directory
    if (text.includes("business") || text.includes("store") || text.includes("shop near") || text.includes("duka")) {
      return { intent: "BUSINESS_SEARCH", confidence: 0.85, filters, extractedKeywords: ["business"] };
    }

    // H. Content Generation for sellers
    if (text.includes("write description") || text.includes("generate ad") || text.includes("create promo") || text.includes("translate")) {
      return { intent: "CONTENT_GENERATION", confidence: 0.9, filters, extractedKeywords: ["content"] };
    }

    // I. Product Search (default for product queries)
    if (filters.category || filters.brand || filters.maxPrice || text.includes("find") || text.includes("show me") || text.includes("buy") || text.includes("price of") || text.includes("natafuta")) {
      return { intent: "PRODUCT_SEARCH", confidence: 0.85, filters, extractedKeywords: [filters.category || "", filters.brand || ""].filter(Boolean) };
    }

    // J. Platform Knowledge (how to, escrow, refund, returns, policies)
    if (text.includes("how to") || text.includes("how do i") || text.includes("refund") || text.includes("policy") || text.includes("escrow") || text.includes("verified") || text.includes("b2b") || text.includes("fees")) {
      return { intent: "PLATFORM_KNOWLEDGE", confidence: 0.9, filters, extractedKeywords: ["knowledge", text] };
    }

    return { intent: "GENERAL_QUERY", confidence: 0.6, filters, extractedKeywords: [text] };
  }
}
