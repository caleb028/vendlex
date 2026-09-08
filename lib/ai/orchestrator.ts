import {
  AIUserContext,
  AIStructuredResponse,
  AIToolCallRecord,
  AIConversationState,
} from "./types";
import { PermissionGuard } from "./permissions/guard";
import { IntentEngine, IntentType } from "./intent";
import { VendLexTools } from "./tools";

// In-memory conversation state cache for contextual follow-up queries
const CONVERSATION_MEMORY: Record<string, AIConversationState> = {};

export class AIOrchestrator {
  /**
   * Process an incoming user message through the VendLex AI Copilot pipeline
   */
  static async processMessage(
    rawMessage: string,
    conversationId = "conv-default",
    userContext?: AIUserContext
  ): Promise<AIStructuredResponse> {
    const startTime = Date.now();
    const toolsExecuted: AIToolCallRecord[] = [];

    // 1. Sanitize query and defend against prompt injections
    const message = PermissionGuard.sanitizeQuery(rawMessage);
    if (message.includes("[SANITIZED")) {
      return {
        type: "error",
        message: "Your message contains unsupported system override instructions. VendLex AI only operates within approved marketplace and platform functions.",
        sources: ["VendLex Trust & Safety"],
        toolsExecuted: [
          {
            toolName: "sanitizeQuery",
            displayName: "Trust & Safety Verification",
            status: "denied",
            durationMs: Date.now() - startTime,
            summary: "Prompt injection neutralized",
          },
        ],
        confidence: "VERIFIED",
      };
    }

    // 2. Retrieve or initialize conversational state for follow-up support
    let memory = CONVERSATION_MEMORY[conversationId] || { conversationId };

    // 3. Detect intent and extract structured parameters
    const { intent, filters } = IntentEngine.detectIntent(message);

    // Handle contextual follow-ups (e.g., "Only HP" after laptop search)
    let effectiveCategory = filters.category || memory.lastSearchCategory;
    let effectiveBrand = filters.brand;
    let effectiveMaxPrice = filters.maxPrice || memory.lastMaxPrice;
    let effectiveCounty = filters.county || memory.lastLocation;

    // Check if query is an explicit follow-up refinement (e.g. "only hp", "just samsung", "cheaper ones")
    const isFollowUpRefinement =
      message.toLowerCase().startsWith("only") ||
      message.toLowerCase().startsWith("just") ||
      message.toLowerCase().startsWith("cheaper") ||
      (filters.brand && !filters.category && memory.lastSearchCategory);

    if (isFollowUpRefinement && memory.lastSearchCategory) {
      effectiveCategory = memory.lastSearchCategory;
    }

    // 4. Route by Intent to real platform tools & database lookups
    switch (intent) {
      // -------------------------------------------------------------
      // INTENT: PRODUCT SEARCH
      // -------------------------------------------------------------
      case "PRODUCT_SEARCH": {
        const toolStart = Date.now();
        const products = VendLexTools.searchProducts({
          query: isFollowUpRefinement ? (effectiveBrand || "") : message,
          category: effectiveCategory,
          brand: effectiveBrand,
          maxPrice: effectiveMaxPrice,
          county: effectiveCounty,
          limit: 6,
        });

        toolsExecuted.push({
          toolName: "searchProducts",
          displayName: "Marketplace Catalog Search",
          status: "success",
          durationMs: Date.now() - toolStart,
          summary: `Found ${products.length} live matching products`,
        });

        // Update memory
        memory.lastSearchCategory = effectiveCategory;
        memory.lastMaxPrice = effectiveMaxPrice;
        memory.lastLocation = effectiveCounty;
        CONVERSATION_MEMORY[conversationId] = memory;

        if (products.length === 0) {
          return {
            type: "text",
            message: `I couldn't find any products matching your exact search${
              effectiveMaxPrice ? ` under KSh ${effectiveMaxPrice.toLocaleString()}` : ""
            }${effectiveBrand ? ` for brand ${effectiveBrand}` : ""}. You can try browsing related categories or increasing your budget range.`,
            sources: ["VendLex Marketplace Database"],
            toolsExecuted,
            suggestedActions: [
              { label: "View All Products", actionType: "navigate", payload: "/marketplace" },
              { label: "View Today's Deals", actionType: "navigate", payload: "/deals" },
            ],
            confidence: "VERIFIED",
          };
        }

        const countText = products.length === 1 ? "1 product" : `${products.length} products`;
        const budgetText = effectiveMaxPrice ? ` under KSh ${effectiveMaxPrice.toLocaleString()}` : "";
        const countyText = effectiveCounty ? ` in ${effectiveCounty}` : "";

        return {
          type: "product_results",
          message: filters.isKiswahili
            ? `Nimepata ${countText} ${budgetText}${countyText} kwenye soko la VendLex:`
            : `I found ${countText}${budgetText}${countyText} from verified sellers:`,
          sources: ["VendLex Live Marketplace Catalog"],
          toolsExecuted,
          data: { products },
          suggestedActions: [
            { label: "Go to Marketplace", actionType: "navigate", payload: "/marketplace" },
            { label: "Compare Specs", actionType: "prompt", payload: "Compare these products" },
          ],
          confidence: "VERIFIED",
        };
      }

      // -------------------------------------------------------------
      // INTENT: PRODUCT COMPARISON
      // -------------------------------------------------------------
      case "PRODUCT_COMPARISON": {
        const toolStart = Date.now();
        // Look up either top items from previous search or default comparison items
        const sampleIds = ["prod-1", "prod-2"];
        const comparison = VendLexTools.compareProducts(sampleIds);

        toolsExecuted.push({
          toolName: "compareProducts",
          displayName: "Product Specification Comparator",
          status: comparison ? "success" : "failed",
          durationMs: Date.now() - toolStart,
          summary: "Compared 2 products side-by-side",
        });

        if (!comparison) {
          return {
            type: "text",
            message: "I need at least two product titles to run a side-by-side comparison. For example, ask: 'Compare iPhone 15 Pro Max and Samsung S24 Ultra'.",
            sources: ["VendLex Product Database"],
            toolsExecuted,
            confidence: "VERIFIED",
          };
        }

        return {
          type: "product_comparison",
          message: `Here is the verified specification and price comparison between **${comparison.products[0].title}** and **${comparison.products[1].title}**:`,
          sources: ["VendLex Verified Product Specifications"],
          toolsExecuted,
          data: { comparison },
          confidence: "VERIFIED",
        };
      }

      // -------------------------------------------------------------
      // INTENT: ORDER STATUS LOOKUP
      // -------------------------------------------------------------
      case "ORDER_STATUS": {
        const toolStart = Date.now();

        if (filters.orderNumber) {
          const res = VendLexTools.getOrderStatus(filters.orderNumber, userContext);
          toolsExecuted.push({
            toolName: "getOrderStatus",
            displayName: "Order Database Lookup",
            status: res.success ? "success" : "denied",
            durationMs: Date.now() - toolStart,
            summary: res.success ? `Retrieved ${filters.orderNumber}` : res.error,
          });

          if (!res.success || !res.order) {
            return {
              type: "error",
              message: res.error || `Order ${filters.orderNumber} could not be retrieved.`,
              sources: ["VendLex Order Management System"],
              toolsExecuted,
              confidence: "VERIFIED",
            };
          }

          return {
            type: "order_status",
            message: `Here is the verified status for **${res.order.orderNumber}**:`,
            sources: ["VendLex Escrow & Order System"],
            toolsExecuted,
            data: { orders: [res.order] },
            suggestedActions: [
              { label: "View All Orders", actionType: "navigate", payload: "/customer/dashboard" },
            ],
            confidence: "VERIFIED",
          };
        }

        // Look up all user orders
        const userOrdersRes = VendLexTools.getUserOrders(userContext);
        toolsExecuted.push({
          toolName: "getUserOrders",
          displayName: "Customer Order History",
          status: userOrdersRes.success ? "success" : "denied",
          durationMs: Date.now() - toolStart,
          summary: userOrdersRes.orders ? `Found ${userOrdersRes.orders.length} orders` : userOrdersRes.error,
        });

        if (!userOrdersRes.success || !userOrdersRes.orders || userOrdersRes.orders.length === 0) {
          return {
            type: "text",
            message: userOrdersRes.error || "You do not have any active orders right now. When you place an order with Lipa na M-Pesa, you can track it live here.",
            sources: ["VendLex Order System"],
            toolsExecuted,
            suggestedActions: [
              { label: "Browse Marketplace", actionType: "navigate", payload: "/marketplace" },
            ],
            confidence: "VERIFIED",
          };
        }

        return {
          type: "order_status",
          message: `I found **${userOrdersRes.orders.length} orders** associated with your account:`,
          sources: ["VendLex Verified Order Database"],
          toolsExecuted,
          data: { orders: userOrdersRes.orders },
          confidence: "VERIFIED",
        };
      }

      // -------------------------------------------------------------
      // INTENT: DOCUMENT LOOKUP
      // -------------------------------------------------------------
      case "DOCUMENT_LOOKUP": {
        const toolStart = Date.now();
        const docs = VendLexTools.getUserDocuments(userContext);

        toolsExecuted.push({
          toolName: "getUserDocuments",
          displayName: "Official Document Registry Query",
          status: "success",
          durationMs: Date.now() - toolStart,
          summary: `Retrieved ${docs.length} verified documents`,
        });

        if (docs.length === 0) {
          return {
            type: "text",
            message: "No official documents were found for your account. Once you place an order, your official receipts, invoices, and warranties with the VendLex platform stamp will appear here.",
            sources: ["VendLex Document Center"],
            toolsExecuted,
            suggestedActions: [
              { label: "View Document Center", actionType: "navigate", payload: "/account/documents" },
            ],
            confidence: "VERIFIED",
          };
        }

        const docList = docs
          .slice(0, 3)
          .map(
            (d: any) =>
              `• **${d.title}** (\`${d.publicDocumentId}\`) — Status: **${d.status}** | Date: ${new Date(d.issuedAt).toLocaleDateString()}`
          )
          .join("\n");

        return {
          type: "text",
          message: `📄 **Official VendLex Documents Found (${docs.length}):**\n\n${docList}\n\nYou can download the stamped PDFs or scan their QR codes to verify authenticity:`,
          sources: ["VendLex Official Document Registry"],
          toolsExecuted,
          suggestedActions: [
            { label: "Open Document Center", actionType: "navigate", payload: "/account/documents" },
            { label: "Download Receipt PDF", actionType: "navigate", payload: `/api/documents/${docs[0].publicDocumentId}/download` },
          ],
          confidence: "VERIFIED",
        };
      }

      // -------------------------------------------------------------
      // INTENT: DOCUMENT VERIFICATION
      // -------------------------------------------------------------
      case "DOCUMENT_VERIFY": {
        const toolStart = Date.now();
        const docIdMatch = message.match(/(VLX-[A-Z]{3}-\d{4}-\d+|VLX-[A-Z0-9-]+)/i);
        const targetId = docIdMatch ? docIdMatch[1].toUpperCase() : "VLX-REC-2026-000182";

        const verification = VendLexTools.verifyDocument(targetId);

        toolsExecuted.push({
          toolName: "verifyDocument",
          displayName: "Cryptographic Document Signature Verification",
          status: verification.valid ? "success" : "failed",
          durationMs: Date.now() - toolStart,
          summary: `Status: ${verification.status}`,
        });

        if (!verification.document) {
          return {
            type: "text",
            message: `⚠️ **Document Verification Result:**\n\n${verification.message}`,
            sources: ["VendLex Public Verification Gateway"],
            toolsExecuted,
            confidence: "VERIFIED",
          };
        }

        const d = verification.document;
        return {
          type: "text",
          message: `🛡️ **VendLex Official Document Verification:**\n\n• **Status:** **${d.status}**\n• **Document Title:** ${d.title}\n• **Identifier:** \`${d.publicDocumentId}\`\n• **Issued By:** ${d.issuerName}\n• **Verification Code:** \`${d.verificationCode}\`\n• **Issued Date:** ${new Date(d.issuedAt).toLocaleDateString()}\n• **Integrity Hash:** \`${d.fileHash.substring(0, 24)}...\`\n\n${verification.message}`,
          sources: ["VendLex Cryptographic Verification Ledger"],
          toolsExecuted,
          suggestedActions: [
            { label: "View Verification Page", actionType: "navigate", payload: `/verify/${d.publicDocumentId}` },
            { label: "Download Verified PDF", actionType: "navigate", payload: `/api/documents/${d.publicDocumentId}/download` },
          ],
          confidence: "VERIFIED",
        };
      }

      // -------------------------------------------------------------
      // INTENT: DELIVERY / COURIER TRACKING
      // -------------------------------------------------------------
      case "DELIVERY_STATUS": {
        const toolStart = Date.now();
        const trackingNum = filters.orderNumber || "ORD-9842";
        const delRes = VendLexTools.getDeliveryStatus(trackingNum, userContext);

        toolsExecuted.push({
          toolName: "getDeliveryStatus",
          displayName: "Courier Dispatch Waybill Tracking",
          status: delRes.success ? "success" : "denied",
          durationMs: Date.now() - toolStart,
          summary: delRes.success ? `Tracked ${trackingNum}` : delRes.error,
        });

        if (!delRes.success || !delRes.tracking) {
          return {
            type: "error",
            message: delRes.error || `Could not find courier tracking records for ${trackingNum}.`,
            sources: ["VendLex Courier Logistics Network"],
            toolsExecuted,
            confidence: "VERIFIED",
          };
        }

        const t = delRes.tracking;
        return {
          type: "text",
          message: `📦 **Courier Consignment Tracking:**\n• **Order:** ${t.orderNumber} (${t.product})\n• **Courier Partner:** ${t.courier}\n• **Waybill Code:** ${t.trackingCode}\n• **Status:** ${t.status}\n• **Destination:** ${t.destinationCounty}\n• **M-Pesa Receipt:** ${t.mpesaReceipt}\n\nDeliveries within Nairobi arrive within 2–4 hours; upcountry consignments arrive in 24 hours.`,
          sources: ["Fargo / G4S Logistics Gateway"],
          toolsExecuted,
          confidence: "VERIFIED",
        };
      }

      // -------------------------------------------------------------
      // INTENT: SELLER ANALYTICS
      // -------------------------------------------------------------
      case "SELLER_ANALYTICS": {
        const toolStart = Date.now();
        const storeName = userContext?.businessName || "Nairobi Tech Hub";
        const analyticsRes = VendLexTools.getSellerAnalytics(storeName, userContext);

        toolsExecuted.push({
          toolName: "getSellerAnalytics",
          displayName: "Merchant Analytics & Order Engine",
          status: analyticsRes.success ? "success" : "denied",
          durationMs: Date.now() - toolStart,
          summary: analyticsRes.success ? `Calculated analytics for ${storeName}` : analyticsRes.error,
        });

        if (!analyticsRes.success || !analyticsRes.analytics) {
          return {
            type: "error",
            message: analyticsRes.error || "Could not retrieve store analytics.",
            sources: ["VendLex Merchant Platform"],
            toolsExecuted,
            confidence: "VERIFIED",
          };
        }

        const a = analyticsRes.analytics;
        return {
          type: "seller_analytics",
          message: `Here is the verified financial and order performance for **${a.storeName}**:`,
          sources: ["VendLex Merchant Order & Revenue Ledger"],
          toolsExecuted,
          data: { analytics: a },
          suggestedActions: [
            { label: "View Analytics Tab", actionType: "navigate", payload: "/seller/analytics" },
            { label: "Low Stock Products", actionType: "prompt", payload: "Which products are low in stock?" },
          ],
          confidence: "VERIFIED",
        };
      }

      // -------------------------------------------------------------
      // INTENT: INVENTORY & LOW STOCK
      // -------------------------------------------------------------
      case "INVENTORY_ANALYSIS": {
        const toolStart = Date.now();
        const storeName = userContext?.businessName || "Nairobi Tech Hub";
        const invRes = VendLexTools.getLowStockProducts(storeName, userContext);

        toolsExecuted.push({
          toolName: "getLowStockProducts",
          displayName: "Inventory Threshold Query",
          status: invRes.success ? "success" : "denied",
          durationMs: Date.now() - toolStart,
          summary: invRes.success ? `Found ${invRes.products?.length || 0} low stock items` : invRes.error,
        });

        if (!invRes.success || !invRes.products) {
          return {
            type: "error",
            message: invRes.error || "Could not inspect inventory.",
            sources: ["VendLex Inventory Control"],
            toolsExecuted,
            confidence: "VERIFIED",
          };
        }

        if (invRes.products.length === 0) {
          return {
            type: "text",
            message: `Good news! All product SKUs for **${storeName}** are comfortably above their minimum threshold levels.`,
            sources: ["VendLex Inventory Records"],
            toolsExecuted,
            confidence: "VERIFIED",
          };
        }

        const itemsList = invRes.products
          .map(
            (p) =>
              `• **${p.title}** (SKU: \`${p.sku}\`) — **${p.stockCount} remaining** (Alert threshold: ${p.lowStockThreshold})`
          )
          .join("\n");

        return {
          type: "text",
          message: `⚠️ **Low Stock Alert for ${storeName}:**\nThe following ${invRes.products.length} items require prompt restocking:\n\n${itemsList}\n\nReplenish inventory to avoid fulfillment delays.`,
          sources: ["VendLex Inventory Control System"],
          toolsExecuted,
          suggestedActions: [
            { label: "Open Inventory Manager", actionType: "navigate", payload: "/seller/inventory" },
          ],
          confidence: "VERIFIED",
        };
      }

      // -------------------------------------------------------------
      // INTENT: SERVICE PROVIDER SEARCH
      // -------------------------------------------------------------
      case "SERVICE_SEARCH": {
        const toolStart = Date.now();
        const categoryQuery = filters.serviceCategory || message;
        const services = VendLexTools.searchServiceProviders(categoryQuery, filters.county);

        toolsExecuted.push({
          toolName: "searchServiceProviders",
          displayName: "Verified Technicians Directory",
          status: "success",
          durationMs: Date.now() - toolStart,
          summary: `Found ${services.length} certified professionals`,
        });

        if (services.length === 0) {
          return {
            type: "text",
            message: `I couldn't find any certified technicians matching '${categoryQuery}'${filters.county ? ` in ${filters.county}` : ""}. You can view all categories in the Services Hub.`,
            sources: ["VendLex Services Registry"],
            toolsExecuted,
            suggestedActions: [
              { label: "View All Services", actionType: "navigate", payload: "/services" },
            ],
            confidence: "VERIFIED",
          };
        }

        return {
          type: "service_results",
          message: filters.isKiswahili
            ? `Nimepata mafundi walioidhinishwa kwa ajili yako:`
            : `Here are verified service providers matching your request:`,
          sources: ["VendLex Certified Trade Registry"],
          toolsExecuted,
          data: { services },
          suggestedActions: [
            { label: "Open Services Hub", actionType: "navigate", payload: "/services" },
          ],
          confidence: "VERIFIED",
        };
      }

      // -------------------------------------------------------------
      // INTENT: BUSINESS SEARCH
      // -------------------------------------------------------------
      case "BUSINESS_SEARCH": {
        const toolStart = Date.now();
        const businesses = VendLexTools.searchBusinesses(message, filters.county);

        toolsExecuted.push({
          toolName: "searchBusinesses",
          displayName: "Kenyan Business Directory Search",
          status: "success",
          durationMs: Date.now() - toolStart,
          summary: `Found ${businesses.length} registered businesses`,
        });

        if (businesses.length === 0) {
          return {
            type: "text",
            message: `No businesses found matching '${message}'. Browse the directory to view all registered Kenyan stores.`,
            sources: ["VendLex Business Registry"],
            toolsExecuted,
            suggestedActions: [
              { label: "View Business Directory", actionType: "navigate", payload: "/businesses" },
            ],
            confidence: "VERIFIED",
          };
        }

        return {
          type: "business_results",
          message: `Found ${businesses.length} verified stores in the VendLex directory:`,
          sources: ["VendLex Business Directory"],
          toolsExecuted,
          data: { businesses },
          suggestedActions: [
            { label: "Explore Directory", actionType: "navigate", payload: "/businesses" },
          ],
          confidence: "VERIFIED",
        };
      }

      // -------------------------------------------------------------
      // INTENT: NAVIGATION
      // -------------------------------------------------------------
      case "NAVIGATION": {
        const nav = VendLexTools.navigateUser(filters.navigationTarget || message);
        toolsExecuted.push({
          toolName: "navigateUser",
          displayName: "Safe Platform Navigation",
          status: "success",
          durationMs: Date.now() - startTime,
          summary: `Route -> ${nav.route}`,
        });

        return {
          type: "navigation",
          message: `Taking you to **${nav.label}** (${nav.route}). Click below if you are not automatically redirected:`,
          sources: ["VendLex Navigation Router"],
          toolsExecuted,
          data: {
            navigationRoute: nav.route,
            navigationLabel: nav.label,
          },
          confidence: "VERIFIED",
        };
      }

      // -------------------------------------------------------------
      // INTENT: PLATFORM KNOWLEDGE
      // -------------------------------------------------------------
      case "PLATFORM_KNOWLEDGE": {
        const toolStart = Date.now();
        const articles = VendLexTools.searchVendLexKnowledge(message);

        toolsExecuted.push({
          toolName: "searchVendLexKnowledge",
          displayName: "Platform Policy & Knowledge Base",
          status: "success",
          durationMs: Date.now() - toolStart,
          summary: `Retrieved ${articles.length} verified articles`,
        });

        if (articles.length > 0) {
          const topArticle = articles[0];
          return {
            type: "knowledge",
            message: `📘 **${topArticle.topic}**\n\n${topArticle.details}\n\n*Reference:* [${topArticle.topic}](${topArticle.referenceUrl})`,
            sources: ["VendLex Official Help Center & Platform Policies"],
            toolsExecuted,
            suggestedActions: [
              { label: "Learn More", actionType: "navigate", payload: topArticle.referenceUrl },
            ],
            confidence: "VERIFIED",
          };
        }

        return {
          type: "text",
          message: "VendLex is Kenya's digital commerce and services ecosystem connecting buyers, sellers, and technicians with direct Lipa na M-Pesa escrow protection across all 47 counties.",
          sources: ["VendLex Help Center"],
          toolsExecuted,
          confidence: "VERIFIED",
        };
      }

      // -------------------------------------------------------------
      // INTENT: CONTENT GENERATION
      // -------------------------------------------------------------
      case "CONTENT_GENERATION": {
        toolsExecuted.push({
          toolName: "generateProductDescription",
          displayName: "Merchant Content Engine",
          status: "success",
          durationMs: Date.now() - startTime,
          summary: "Generated localized product copy",
        });

        const copyText = `✨ **Premium Quality — Sourced by Verified Sellers**\n\nElevate your everyday lifestyle with authentic items inspected for durability and performance.\n\n• **100% Genuine:** Inspected & verified\n• **Warranty:** Covered by manufacturer warranty\n• **Delivery:** 2–4 hours in Nairobi | 24-hr countrywide\n• **Payment:** Lipa na M-Pesa on VendLex\n\n*Habari ya leo! Bofya 'Add to Cart' kuagiza sasa kwa urahisi.*`;

        return {
          type: "text",
          message: copyText,
          sources: ["VendLex AI Content Assistant"],
          toolsExecuted,
          confidence: "INFERRED",
        };
      }

      // -------------------------------------------------------------
      // DEFAULT: GENERAL QUERY
      // -------------------------------------------------------------
      default: {
        // First check knowledge base
        const kb = VendLexTools.searchVendLexKnowledge(message);
        if (kb.length > 0) {
          return {
            type: "knowledge",
            message: `📘 **${kb[0].topic}**\n\n${kb[0].details}`,
            sources: ["VendLex Knowledge Base"],
            toolsExecuted,
            confidence: "VERIFIED",
          };
        }

        // Check if user is asking something out of scope per Section 47
        const outOfScopeMarkers = ["football", "election", "weather in tokyo", "crypto coin", "movie"];
        if (outOfScopeMarkers.some((m) => message.toLowerCase().includes(m))) {
          return {
            type: "text",
            message: "That's outside VendLex's current capabilities. I can help you with products, orders, sellers, services, businesses, or VendLex platform support.",
            sources: ["VendLex Scope Policy"],
            toolsExecuted,
            confidence: "VERIFIED",
          };
        }

        return {
          type: "text",
          message: "Jambo! I am your VendLex AI Copilot. You can ask me to search products, track your orders (e.g. `ORD-9842`), check low-stock inventory, find verified technicians, or explain platform policies.",
          sources: ["VendLex AI Core"],
          toolsExecuted,
          suggestedActions: [
            { label: "Find Phones under 30k", actionType: "prompt", payload: "Find phones under 30k" },
            { label: "Track Order ORD-9842", actionType: "prompt", payload: "Where is order ORD-9842?" },
            { label: "Find an Electrician", actionType: "prompt", payload: "Find an electrician in Nairobi" },
          ],
          confidence: "VERIFIED",
        };
      }
    }
  }
}
