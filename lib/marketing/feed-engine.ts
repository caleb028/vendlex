import { serverDB } from "@/lib/server-db";
import { ProductFeedItem, ProductFeedSyncSummary } from "./types";
import { GoogleAdapter } from "./adapters/google";
import { MetaAdapter } from "./adapters/meta";

export class ProductFeedEngine {
  /**
   * Evaluate all products in the database against Google and Meta advertising eligibility rules
   */
  static getEligibleFeedItems(): {
    items: ProductFeedItem[];
    summary: ProductFeedSyncSummary;
  } {
    const products = serverDB.getProducts();
    const users = serverDB.getUsers();

    const items: ProductFeedItem[] = [];
    const errors: ProductFeedSyncSummary["errors"] = [];

    for (const p of products) {
      const rejections: string[] = [];

      // Rule 1: Price validation
      if (!p.price || p.price <= 0) {
        rejections.push("Product price must be greater than KSh 0.");
      }

      const primaryImage = (p.images && p.images.length > 0 && p.images[0]) || (p as any).image;

      // Rule 2: Image validation
      if (!primaryImage || !primaryImage.startsWith("http")) {
        rejections.push("Missing valid high-resolution HTTP/HTTPS product image.");
      }

      // Rule 3: Category validation
      if (!p.category) {
        rejections.push("Product missing standard category assignment.");
      }

      // Rule 4: Seller status
      const sellerId = p.businessId || (p as any).sellerId;
      const seller = sellerId ? users.find((u) => u.id === sellerId || u.businessId === sellerId) : undefined;
      if (seller && (seller.status === "SUSPENDED" || seller.status === "DISABLED")) {
        rejections.push(`Seller account (${seller.name}) is currently suspended.`);
      }

      const isEligible = rejections.length === 0;

      if (!isEligible) {
        errors.push({
          productId: p.id,
          productTitle: p.title,
          reason: rejections.join(" | "),
          timestamp: new Date().toISOString(),
        });
      }

      const isStockAvailable = p.stockCount === undefined || p.stockCount > 0;

      items.push({
        id: p.id,
        title: p.title,
        description: p.description || `${p.title} available on VendLex Kenya. Shop online with verified M-Pesa escrow protection.`,
        link: `/products/${p.slug || p.id}`,
        imageLink: primaryImage || "https://images.unsplash.com/photo-1523275335684-37898b6baf30?q=80&w=600",
        price: p.price,
        currency: "KES",
        availability: isStockAvailable ? "in_stock" : "out_of_stock",
        condition: "new",
        brand: (p as any).brand || "VendLex Merchant",
        category: p.category || "General Commerce",
        sellerId: p.businessId || (p as any).sellerId || "vendlex-direct",
        sellerName: p.businessName || (p as any).storeName || "Verified Kenyan Merchant",
        county: p.county || (p as any).location || "Nairobi",
        isEligible,
        rejectionReasons: rejections.length > 0 ? rejections : undefined,
      });
    }

    const eligibleCount = items.filter((i) => i.isEligible).length;
    const rejectedCount = items.length - eligibleCount;

    const googleStatus = GoogleAdapter.getConnectionStatus();
    const metaStatus = MetaAdapter.getConnectionStatus();

    const summary: ProductFeedSyncSummary = {
      lastSyncAt: new Date().toISOString(),
      totalProducts: items.length,
      eligibleProducts: eligibleCount,
      rejectedProducts: rejectedCount,
      googleSynced: googleStatus.status === "CONNECTED" ? eligibleCount : 0,
      metaSynced: metaStatus.status === "CONNECTED" ? eligibleCount : 0,
      status:
        rejectedCount === 0 && (googleStatus.status === "CONNECTED" || metaStatus.status === "CONNECTED")
          ? "CONNECTED"
          : "CONFIGURATION_REQUIRED",
      errors,
    };

    // Update serverDB sync state
    serverDB.updateProductFeedSync(summary);

    return { items, summary };
  }

  /**
   * Return cached or freshly computed product feed summary
   */
  static getFeedSummary(): ProductFeedSyncSummary {
    const existing = serverDB.getProductFeedSync();
    if (existing) {
      return existing;
    }
    const { summary } = this.getEligibleFeedItems();
    return summary;
  }

  /**
   * Generates Google Merchant Center RSS 2.0 XML string
   */
  static generateGoogleFeed(baseUrl?: string): string {
    const { items } = this.getEligibleFeedItems();
    return GoogleAdapter.generateMerchantFeedXML(items, baseUrl);
  }

  /**
   * Generates Meta Commerce Catalog CSV string
   */
  static generateMetaFeed(baseUrl?: string): string {
    const { items } = this.getEligibleFeedItems();
    return MetaAdapter.generateCatalogFeedCSV(items, baseUrl);
  }
}
