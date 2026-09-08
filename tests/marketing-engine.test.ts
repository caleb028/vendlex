import {
  parseAttributionFromUrl,
  buildAttributionSummary,
  AttributionEngine,
} from "../lib/marketing/attribution";
import { VendLexMarketingEngine } from "../lib/marketing/engine";
import { GoogleAdapter } from "../lib/marketing/adapters/google";
import { MetaAdapter } from "../lib/marketing/adapters/meta";
import { ProductFeedEngine } from "../lib/marketing/feed-engine";
import { serverDB } from "../lib/server-db";
import { PermissionGuard } from "../lib/ai/permissions/guard";
import { VendLexTools } from "../lib/ai/tools";

let passedCount = 0;
let failedCount = 0;

function assert(condition: boolean, testName: string, detail?: string) {
  if (condition) {
    console.log(`  ✓ PASS: ${testName}`);
    passedCount++;
  } else {
    console.error(`  ✗ FAIL: ${testName}${detail ? ` -> ${detail}` : ""}`);
    failedCount++;
  }
}

async function runMarketingEngineTestSuite() {
  console.log("\n=================================================================");
  console.log("🚀 STARTING VENDLEX GOOGLE & META MARKETING ENGINE AUTOMATED TEST SUITE");
  console.log("=================================================================\n");

  // SUITE 1: MULTI-TOUCH ATTRIBUTION ENGINE
  console.log("1. Attribution & Channel Resolution Tests:");
  const googleAdsUrl =
    "https://vendlex.co.ke/marketplace/prod-101?utm_source=google&utm_medium=cpc&utm_campaign=nairobi_tech_promo&gclid=Cj0KCQjwiM_test_gclid_123&county=Nairobi";
  const parsedGoogle = parseAttributionFromUrl(googleAdsUrl);

  assert(parsedGoogle.utmSource === "google", "Parses utmSource correctly");
  assert(parsedGoogle.utmMedium === "cpc", "Parses utmMedium correctly");
  assert(parsedGoogle.gclid === "Cj0KCQjwiM_test_gclid_123", "Parses Google Click ID (gclid)");
  assert(parsedGoogle.county === "Nairobi", "Extracts Kenyan county attribution");
  assert(
    AttributionEngine.getPrimaryChannel(parsedGoogle) === "Google",
    "Resolves Google Channel"
  );

  const metaAdsUrl =
    "https://vendlex.co.ke/marketplace/prod-102?utm_source=facebook&utm_medium=paid_social&utm_campaign=rift_solar_sale&fbclid=IwAR2_test_fbclid_456&county=Nakuru";
  const parsedMeta = parseAttributionFromUrl(metaAdsUrl);
  assert(parsedMeta.fbclid === "IwAR2_test_fbclid_456", "Parses Meta Click ID (fbclid)");
  assert(
    AttributionEngine.getPrimaryChannel(parsedMeta) === "Meta",
    "Resolves Meta Ads channel"
  );

  const organicUrl = "https://vendlex.co.ke/marketplace";
  const parsedOrganic = parseAttributionFromUrl(organicUrl, "https://www.google.com");
  assert(
    AttributionEngine.getPrimaryChannel(parsedOrganic) === "Google",
    "Resolves Organic Google search referral"
  );

  const directUrl = "https://vendlex.co.ke/deals";
  const parsedDirect = parseAttributionFromUrl(directUrl);
  assert(
    AttributionEngine.getPrimaryChannel(parsedDirect) === "Direct",
    "Resolves Direct navigation"
  );

  // First-touch and Last-touch attribution merging
  const combined = buildAttributionSummary(parsedGoogle, parsedMeta);
  assert(combined.firstTouch?.source === "google", "Preserves First-Touch attribution");
  assert(combined.lastTouch?.source === "facebook", "Preserves Last-Touch attribution");
  assert(
    AttributionEngine.getPrimaryChannel(combined) === "Meta",
    "Applies last-touch as primary channel"
  );

  // SUITE 2: IDEMPOTENCY & EVENT DEDUPLICATION
  console.log("\n2. Event Tracking & Idempotency Deduplication Tests:");
  const testIdempotencyKey = `test_ev_${Date.now()}_dedup`;
  const event1 = await VendLexMarketingEngine.trackEvent({
    eventType: "page_view",
    eventId: testIdempotencyKey,
    attribution: parsedGoogle,
    consent: { essential: true, analytics: true, marketing: true, updatedAt: new Date().toISOString() },
  });

  assert(event1.id && event1.eventId === testIdempotencyKey, "First event recorded successfully in DB");

  const event2 = await VendLexMarketingEngine.trackEvent({
    eventType: "page_view",
    eventId: testIdempotencyKey, // Duplicate key
    attribution: parsedGoogle,
    consent: { essential: true, analytics: true, marketing: true, updatedAt: new Date().toISOString() },
  });

  assert(event2.id === event1.id, "Duplicate event with identical eventId returns existing record without duplicate insertion");

  // SUITE 3: PRIVACY & USER CONSENT ENFORCEMENT
  console.log("\n3. Privacy & Cookie Consent Enforcement Tests:");
  const noMarketingConsentKey = `test_ev_no_marketing_${Date.now()}`;
  const noConsentEvent = await VendLexMarketingEngine.trackEvent({
    eventType: "view_item",
    eventId: noMarketingConsentKey,
    value: 15000,
    consent: { essential: true, analytics: true, marketing: false, updatedAt: new Date().toISOString() }, // Marketing consent revoked
  });

  const metaDest = noConsentEvent.destinations.find((d) => d.provider === "META");
  assert(
    metaDest?.status === "SKIPPED_CONSENT",
    "Meta CAPI dispatch skipped when marketing consent is revoked"
  );

  // SUITE 4: ZERO-SPOOFED VERIFIED PURCHASE CONVERSIONS (M-PESA ESCROW)
  console.log("\n4. Verified Purchase Conversion Tests (Daraja M-Pesa Backend):");
  const testOrderId = `ORD-TEST-${Date.now()}`;
  const purchaseEvent = await VendLexMarketingEngine.trackVerifiedPurchase({
    id: testOrderId,
    orderNumber: testOrderId,
    totalAmount: 48500,
    customerEmail: "kenyan.buyer@gmail.com",
    customerPhone: "0722123456",
    customerName: "Kamau Njoroge",
    county: "Kiambu",
    items: [
      { productId: "prod-101", productTitle: "Apple iPhone 15 Pro", unitPrice: 48500, quantity: 1, sellerId: "seller-101" },
    ],
    attribution: parsedGoogle,
  });

  assert(purchaseEvent.eventType === "purchase", "Event type is strictly 'purchase'");
  assert(purchaseEvent.value === 48500, "Purchase value matches exact order amount KSh 48,500");
  assert(purchaseEvent.eventId === `ord_${testOrderId}_purchase_v1`, "Uses standardized deterministic purchase eventId");

  // Replay test (e.g. Safaricom daraja webhook retry)
  const purchaseReplay = await VendLexMarketingEngine.trackVerifiedPurchase({
    id: testOrderId,
    orderNumber: testOrderId,
    totalAmount: 48500,
    customerEmail: "kenyan.buyer@gmail.com",
    customerPhone: "0722123456",
    customerName: "Kamau Njoroge",
    county: "Kiambu",
    items: [],
  });
  assert(purchaseReplay.id === purchaseEvent.id, "M-Pesa callback replay is deduplicated and not double-counted");

  // SUITE 5: PRODUCT FEED GENERATION (GOOGLE & META)
  console.log("\n5. Product Feed Syndication Tests:");
  const { items: feedItems, summary: feedSummary } = ProductFeedEngine.getEligibleFeedItems();
  assert(feedItems.length > 0, `Generated ${feedItems.length} product feed items`);
  assert(feedSummary.totalProducts >= feedSummary.eligibleProducts, "Total products >= eligible products count");

  const eligibleItems = feedItems.filter((i) => i.isEligible);
  if (eligibleItems.length > 0) {
    const firstItem = eligibleItems[0];
    assert(firstItem.price > 0, "Eligible item price is greater than 0");
    assert(firstItem.link.startsWith("/"), "Item link exists");
    assert(firstItem.imageLink.startsWith("http"), "Item image link is valid HTTP/HTTPS");
    assert(firstItem.availability === "in_stock", "Eligible item reports in_stock");

    // Google Shopping XML
    const googleXml = GoogleAdapter.generateMerchantFeedXML(eligibleItems);
    assert(googleXml.includes('<?xml version="1.0" encoding="UTF-8"?>'), "Google feed has valid XML declaration");
    assert(googleXml.includes("<rss version=\"2.0\" xmlns:g=\"http://base.google.com/ns/1.0\">"), "Google feed includes Google Base namespace");
    assert(googleXml.includes("<g:price>"), "Google feed contains g:price elements");
    assert(googleXml.includes("KES"), "Google feed prices include KES currency code");

    // Meta Catalog CSV
    const metaCsv = MetaAdapter.generateCatalogFeedCSV(eligibleItems);
    assert(metaCsv.startsWith("id,title,description,availability,condition,price,link,image_link,brand,google_product_category,custom_label_0"), "Meta CSV has standard Facebook catalog headers");
    assert(metaCsv.includes("KES"), "Meta CSV contains KES formatted prices");
  }

  // SUITE 6: IDOR & SELLER CAMPAIGN ISOLATION
  console.log("\n6. IDOR Security & Seller Data Isolation Tests:");
  const campaigns = serverDB.getCampaigns();
  assert(campaigns.length >= 2, `Pre-seeded platform & merchant campaigns exist (${campaigns.length} campaigns)`);

  const sellerAContext = {
    userId: "usr_seller_101",
    role: "SELLER" as const,
    businessId: "seller-101",
    businessName: "Nairobi Tech Hub",
  };

  const sellerBContext = {
    userId: "usr_seller_102",
    role: "SELLER" as const,
    businessId: "seller-102",
    businessName: "Rift Solar & Power",
  };

  const customerContext = {
    userId: "usr_cust_001",
    role: "CUSTOMER" as const,
    name: "Regular Buyer",
  };

  const adminContext = {
    userId: "usr_admin_001",
    role: "ADMIN" as const,
    name: "Super Administrator",
  };

  // Permission Guard checks
  const permCust = PermissionGuard.canAccessMarketingData(customerContext);
  assert(permCust.allowed === false, "Customer role is denied access to marketing data");

  const permAdmin = PermissionGuard.canAccessMarketingData(adminContext);
  assert(permAdmin.allowed === true, "Admin role is granted access to all marketing data");

  const permSellerA_Own = PermissionGuard.canAccessMarketingData(sellerAContext, "seller-101");
  assert(permSellerA_Own.allowed === true, "Seller A is permitted to access own campaigns");

  const permSellerA_Other = PermissionGuard.canAccessMarketingData(sellerAContext, "seller-102");
  assert(permSellerA_Other.allowed === false, "Seller A is blocked from inspecting Seller B's campaigns (IDOR prevention)");

  // SUITE 7: AI COPILOT MARKETING TOOLS
  console.log("\n7. AI Copilot Marketing Tools Integration Tests:");
  const aiCustRes = VendLexTools.getMarketingAnalytics(customerContext);
  assert(aiCustRes.success === false, "AI marketing tool rejects customer inquiries");

  const aiSellerRes = VendLexTools.getMarketingAnalytics(sellerAContext, "30d");
  assert(aiSellerRes.success === true, "AI marketing tool succeeds for authenticated seller");
  assert(aiSellerRes.scope === "SELLER_ISOLATED", "Seller AI query is strictly isolated to merchant scope");

  const aiAdminRes = VendLexTools.getMarketingAnalytics(adminContext, "30d");
  assert(aiAdminRes.success === true && aiAdminRes.scope === "PLATFORM_WIDE", "Admin AI query accesses platform-wide KPIs");

  const sellerCampaignsRes = VendLexTools.getSellerCampaigns(sellerAContext);
  assert(sellerCampaignsRes.success === true, "AI tool retrieves seller campaigns");
  assert(sellerCampaignsRes.campaigns.every((c: any) => c.seller_id === "seller-101" || c.sellerId === "seller-101"), "AI campaigns result contains only Seller A's campaigns");

  // SUITE 8: ADAPTER HEALTH & CONNECTION STATUS
  console.log("\n8. Ad Network Adapter Health & Status Tests:");
  const googleStatus = GoogleAdapter.getConnectionStatus();
  assert(["CONNECTED", "CONFIGURATION_REQUIRED"].includes(googleStatus.status), "Google adapter reports valid connection status");

  const metaStatus = MetaAdapter.getConnectionStatus();
  assert(["CONNECTED", "CONFIGURATION_REQUIRED"].includes(metaStatus.status), "Meta adapter reports valid connection status");

  console.log("\n=================================================================");
  console.log(`📊 TEST SUITE SUMMARY: ${passedCount} PASSED | ${failedCount} FAILED`);
  console.log("=================================================================\n");

  if (failedCount > 0) {
    process.exit(1);
  }
}

runMarketingEngineTestSuite().catch((err) => {
  console.error("Test runner encountered an unhandled error:", err);
  process.exit(1);
});
