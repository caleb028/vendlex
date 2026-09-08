import { NextRequest, NextResponse } from "next/server";
import { serverDB } from "@/lib/server-db";
import { requireAuth } from "@/lib/auth/session";
import { sanitizeInput } from "@/lib/security";
import { Product } from "@/lib/data/kenya-data";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const query = searchParams.get("q") || searchParams.get("query") || "";
    const category = searchParams.get("category") || "";
    const county = searchParams.get("county") || "";
    const town = searchParams.get("town") || "";
    const sellerId = searchParams.get("sellerId") || "";
    const minPrice = searchParams.get("minPrice") ? parseFloat(searchParams.get("minPrice")!) : undefined;
    const maxPrice = searchParams.get("maxPrice") ? parseFloat(searchParams.get("maxPrice")!) : undefined;
    const minRating = searchParams.get("minRating") ? parseFloat(searchParams.get("minRating")!) : undefined;
    const verifiedOnly = searchParams.get("verifiedOnly") === "true";
    const inStockOnly = searchParams.get("inStockOnly") === "true";
    const dealOnly = searchParams.get("dealOnly") === "true";
    const limit = parseInt(searchParams.get("limit") || "50", 10);
    const offset = parseInt(searchParams.get("offset") || "0", 10);

    let products = serverDB.getProducts();

    if (query.trim()) {
      const q = query.toLowerCase().trim();
      products = products.filter(
        (p) =>
          p.title.toLowerCase().includes(q) ||
          p.category.toLowerCase().includes(q) ||
          p.businessName.toLowerCase().includes(q) ||
          p.tags?.some((t) => t.toLowerCase().includes(q))
      );
    }

    if (category && category !== "all") {
      products = products.filter((p) => p.category.toLowerCase() === category.toLowerCase());
    }

    if (county && county !== "all") {
      products = products.filter((p) => p.county.toLowerCase() === county.toLowerCase());
    }

    if (town && town !== "all") {
      products = products.filter((p) => p.town.toLowerCase() === town.toLowerCase());
    }

    if (sellerId) {
      products = products.filter((p) => p.businessId === sellerId || p.businessSlug === sellerId);
    }

    if (typeof minPrice === "number") {
      products = products.filter((p) => p.price >= minPrice);
    }

    if (typeof maxPrice === "number") {
      products = products.filter((p) => p.price <= maxPrice);
    }

    if (typeof minRating === "number") {
      products = products.filter((p) => p.rating >= minRating);
    }

    if (verifiedOnly) {
      products = products.filter((p) => p.businessVerified);
    }

    if (inStockOnly) {
      products = products.filter((p) => p.inStock && p.stockCount > 0);
    }

    if (dealOnly) {
      products = products.filter((p) => p.isDeal);
    }

    const totalCount = products.length;
    const paginated = products.slice(offset, offset + limit);

    return NextResponse.json({
      success: true,
      total: totalCount,
      limit,
      offset,
      products: paginated,
    });
  } catch (err: any) {
    console.error("[Products API Error]:", err);
    return NextResponse.json({ success: false, error: "Failed to query product catalog." }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const auth = requireAuth(req);
    if (auth instanceof NextResponse) return auth;

    const { user } = auth;
    if (user.role !== "SELLER" && user.role !== "BUSINESS_OWNER" && user.role !== "ADMIN" && user.role !== "SUPER_ADMIN") {
      return NextResponse.json(
        { success: false, error: "Forbidden: Only verified merchants and admins can list products." },
        { status: 403 }
      );
    }

    const body = await req.json();
    const title = sanitizeInput(body.title || "", 120);
    const category = sanitizeInput(body.category || "General Merchandise", 60);
    const description = sanitizeInput(body.description || "", 1000);
    const price = parseFloat(body.price);
    const originalPrice = body.originalPrice ? parseFloat(body.originalPrice) : undefined;
    const stockCount = parseInt(body.stockCount || "1", 10);
    const county = sanitizeInput(body.county || "Nairobi", 40);
    const town = sanitizeInput(body.town || "Central", 40);
    const sku = sanitizeInput(body.sku || `SKU-${Math.floor(1000 + Math.random() * 9000)}`, 30);
    const images = Array.isArray(body.images) && body.images.length > 0 ? body.images : [
      "https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?q=80&w=800&auto=format&fit=crop"
    ];

    if (!title || title.length < 3) {
      return NextResponse.json({ success: false, error: "Product title must be at least 3 characters." }, { status: 400 });
    }

    if (isNaN(price) || price <= 0) {
      return NextResponse.json({ success: false, error: "A valid positive price is required." }, { status: 400 });
    }

    // Assign seller details authoritatively from user session (preventing seller ID spoofing!)
    const businessId = user.businessId || `biz-${user.id}`;
    const businessName = user.businessName || user.name;
    const businessSlug = user.businessSlug || user.name.toLowerCase().replace(/\s+/g, "-");

    const slug = `${title.toLowerCase().replace(/\s+/g, "-").replace(/[^a-z0-9-]/g, "")}-${Math.floor(100 + Math.random() * 900)}`;

    const discountPercentage =
      originalPrice && originalPrice > price
        ? Math.round(((originalPrice - price) / originalPrice) * 100)
        : undefined;

    const newProduct: Omit<Product, "id"> = {
      slug,
      title,
      sku,
      description,
      category,
      price,
      originalPrice,
      discountPercentage,
      inStock: stockCount > 0,
      stockCount: Math.max(0, stockCount),
      lowStockThreshold: 3,
      images,
      businessId,
      businessName,
      businessSlug,
      businessVerified: user.isVerified || false,
      county,
      town,
      rating: 5.0,
      reviewCount: 0,
      deliveryInfo: `Direct from ${town}, ${county} • Standard Courier 24-48h`,
      specifications: body.specifications || {},
      tags: [category.toLowerCase(), county.toLowerCase()],
    };

    const created = serverDB.createProduct(newProduct);

    serverDB.logAction({
      userId: user.id,
      userRole: user.role,
      action: "PRODUCT_CREATED",
      resource: "PRODUCT",
      resourceId: created.id,
      details: `Seller ${user.name} created product ${created.title} (${created.sku})`,
      status: "SUCCESS",
    });

    return NextResponse.json({
      success: true,
      message: "Product listed successfully.",
      product: created,
    }, { status: 201 });
  } catch (err: any) {
    console.error("[Product Create Error]:", err);
    return NextResponse.json({ success: false, error: "Failed to create product." }, { status: 500 });
  }
}
