import { NextRequest, NextResponse } from "next/server";
import { serverDB } from "@/lib/server-db";
import { getServerSession } from "@/lib/auth/session";
import { sanitizeInput } from "@/lib/security";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  try {
    const { user, isAuthenticated } = getServerSession(req);
    if (!isAuthenticated || !user || (user.role !== "ADMIN" && user.role !== "SUPER_ADMIN")) {
      return NextResponse.json({ success: false, error: "Unauthorized." }, { status: 403 });
    }

    const { searchParams } = new URL(req.url);
    const search = (searchParams.get("search") || "").toLowerCase().trim();
    const category = searchParams.get("category") || "All";
    const county = searchParams.get("county") || "All";

    let products = serverDB.getProducts();

    if (search) {
      products = products.filter(
        (p) =>
          p.title.toLowerCase().includes(search) ||
          p.businessName.toLowerCase().includes(search) ||
          p.category.toLowerCase().includes(search) ||
          p.county.toLowerCase().includes(search)
      );
    }

    if (category !== "All") {
      products = products.filter((p) => p.category.toLowerCase() === category.toLowerCase());
    }

    if (county !== "All") {
      products = products.filter((p) => p.county.toLowerCase() === county.toLowerCase());
    }

    return NextResponse.json({
      success: true,
      products,
      total: products.length,
    });
  } catch (err: any) {
    console.error("[Admin Products GET Error]:", err?.message);
    return NextResponse.json({ success: false, error: "Internal server error." }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const { user, isAuthenticated } = getServerSession(req);
    if (!isAuthenticated || !user || (user.role !== "ADMIN" && user.role !== "SUPER_ADMIN")) {
      return NextResponse.json({ success: false, error: "Unauthorized." }, { status: 403 });
    }

    const body = await req.json();
    const title = sanitizeInput(body.title || "", 120);
    const businessName = sanitizeInput(body.businessName || "VendLex Direct Store", 100);
    const category = sanitizeInput(body.category || "Electronics & Computing", 60);
    const county = sanitizeInput(body.county || "Nairobi", 40);
    const town = sanitizeInput(body.town || "Nairobi CBD", 40);
    const price = Number(body.price) || 0;
    const stock = Number(body.stock ?? 10);
    const description = sanitizeInput(body.description || `Official verified item from ${businessName}.`, 500);
    const image = body.image || "https://images.unsplash.com/photo-1523275335684-37898b6baf30?q=80&w=800&auto=format&fit=crop";
    const badge = body.badge ? sanitizeInput(body.badge, 30) : "VERIFIED";

    if (!title || price <= 0) {
      return NextResponse.json(
        { success: false, error: "Product title and a valid positive price are required." },
        { status: 400 }
      );
    }

    const businessSlug = businessName.toLowerCase().replace(/[^a-z0-9]+/g, "-");
    const slug = `${title.toLowerCase().replace(/[^a-z0-9]+/g, "-")}-${Date.now().toString().slice(-4)}`;

    const newProduct = serverDB.createProduct({
      title,
      slug,
      sku: `SKU-${Date.now().toString().slice(-6)}`,
      description,
      category,
      price,
      inStock: stock > 0,
      stockCount: stock,
      lowStockThreshold: 5,
      images: [image],
      businessId: body.businessId || `biz-${businessSlug}`,
      businessName,
      businessSlug,
      businessVerified: true,
      county,
      town,
      rating: 5.0,
      reviewCount: 0,
      deliveryInfo: "Same-Day Dispatch",
      specifications: {
        "Origin": "Kenya Verified Merchant",
        "Warranty": "1-Year Official Warranty",
        "Escrow Protection": "Secured by Lipa na M-Pesa",
      },
      tags: [category, county, "Verified"],
    });

    serverDB.logAction({
      userId: user.id,
      userRole: user.role,
      action: "PRODUCT_CREATED",
      resource: "PRODUCT",
      resourceId: newProduct.id,
      details: `Admin added product "${title}" (KSh ${price.toLocaleString()}, stock: ${stock}) for ${businessName}`,
      status: "SUCCESS",
    });

    return NextResponse.json({
      success: true,
      message: `Product "${title}" added to marketplace.`,
      product: newProduct,
    });
  } catch (err: any) {
    console.error("[Admin Products POST Error]:", err?.message);
    return NextResponse.json({ success: false, error: "Internal server error." }, { status: 500 });
  }
}

export async function PUT(req: NextRequest) {
  try {
    const { user, isAuthenticated } = getServerSession(req);
    if (!isAuthenticated || !user || (user.role !== "ADMIN" && user.role !== "SUPER_ADMIN")) {
      return NextResponse.json({ success: false, error: "Unauthorized." }, { status: 403 });
    }

    const body = await req.json();
    const id = body.id;
    if (!id) {
      return NextResponse.json({ success: false, error: "Product ID is required." }, { status: 400 });
    }

    const updates: Record<string, any> = {};
    if (body.title !== undefined) updates.title = sanitizeInput(body.title, 120);
    if (body.price !== undefined) updates.price = Number(body.price);
    if (body.stock !== undefined) {
      updates.stock = Number(body.stock);
      updates.inStock = updates.stock > 0;
    }
    if (body.category !== undefined) updates.category = sanitizeInput(body.category, 60);
    if (body.county !== undefined) updates.county = sanitizeInput(body.county, 40);
    if (body.town !== undefined) updates.town = sanitizeInput(body.town, 40);
    if (body.badge !== undefined) updates.badge = body.badge ? sanitizeInput(body.badge, 30) : undefined;
    if (body.image !== undefined) updates.image = body.image;
    if (body.description !== undefined) updates.description = sanitizeInput(body.description, 500);

    const updated = serverDB.updateProduct(id, updates);
    if (!updated) {
      return NextResponse.json({ success: false, error: "Product not found." }, { status: 404 });
    }

    serverDB.logAction({
      userId: user.id,
      userRole: user.role,
      action: "PRODUCT_UPDATED",
      resource: "PRODUCT",
      resourceId: id,
      details: `Admin updated product "${updated.title}"`,
      status: "SUCCESS",
    });

    return NextResponse.json({
      success: true,
      message: `Product "${updated.title}" updated successfully.`,
      product: updated,
    });
  } catch (err: any) {
    console.error("[Admin Products PUT Error]:", err?.message);
    return NextResponse.json({ success: false, error: "Internal server error." }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest) {
  try {
    const { user, isAuthenticated } = getServerSession(req);
    if (!isAuthenticated || !user || (user.role !== "ADMIN" && user.role !== "SUPER_ADMIN")) {
      return NextResponse.json({ success: false, error: "Unauthorized." }, { status: 403 });
    }

    const { searchParams } = new URL(req.url);
    const id = searchParams.get("id");
    if (!id) {
      return NextResponse.json({ success: false, error: "Product ID is required." }, { status: 400 });
    }

    const product = serverDB.getProductById(id);
    const success = serverDB.deleteProduct(id);
    if (!success) {
      return NextResponse.json({ success: false, error: "Product not found or could not be removed." }, { status: 404 });
    }

    serverDB.logAction({
      userId: user.id,
      userRole: user.role,
      action: "PRODUCT_DELETED",
      resource: "PRODUCT",
      resourceId: id,
      details: `Admin deleted product "${product?.title || id}" from catalog`,
      status: "SUCCESS",
    });

    return NextResponse.json({
      success: true,
      message: `Product "${product?.title || id}" removed successfully.`,
    });
  } catch (err: any) {
    console.error("[Admin Products DELETE Error]:", err?.message);
    return NextResponse.json({ success: false, error: "Internal server error." }, { status: 500 });
  }
}
