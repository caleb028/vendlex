import { NextRequest, NextResponse } from "next/server";
import { serverDB } from "@/lib/server-db";
import { requireAuth } from "@/lib/auth/session";
import { sanitizeInput } from "@/lib/security";

export const dynamic = "force-dynamic";

export async function GET(
  req: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await context.params;
    let product = serverDB.getProductById(id);
    if (!product) {
      product = serverDB.getProductBySlug(id);
    }

    if (!product) {
      return NextResponse.json({ success: false, error: "Product not found." }, { status: 404 });
    }

    return NextResponse.json({ success: true, product });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: "Internal server error." }, { status: 500 });
  }
}

export async function PUT(
  req: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const auth = requireAuth(req);
    if (auth instanceof NextResponse) return auth;

    const { user } = auth;
    const { id } = await context.params;
    const product = serverDB.getProductById(id);

    if (!product) {
      return NextResponse.json({ success: false, error: "Product not found." }, { status: 404 });
    }

    // Resource-Level Ownership Check (Anti-IDOR)
    const isOwner =
      product.businessId === user.businessId ||
      product.businessSlug === user.businessSlug ||
      (user.businessName && product.businessName.toLowerCase() === user.businessName.toLowerCase());
    const isAdmin = user.role === "ADMIN" || user.role === "SUPER_ADMIN";

    if (!isOwner && !isAdmin) {
      serverDB.logAction({
        userId: user.id,
        userRole: user.role,
        action: "IDOR_VIOLATION_ATTEMPT",
        resource: "PRODUCT",
        resourceId: id,
        details: `User ${user.name} attempted unauthorized edit of product ${product.id} owned by ${product.businessName}`,
        status: "DENIED",
      });

      return NextResponse.json(
        { success: false, error: "Forbidden: You do not have permission to modify this product." },
        { status: 403 }
      );
    }

    const body = await req.json();
    const updates: any = {};

    if (body.title) updates.title = sanitizeInput(body.title, 120);
    if (body.description) updates.description = sanitizeInput(body.description, 1000);
    if (typeof body.price === "number" && body.price > 0) updates.price = body.price;
    if (typeof body.stockCount === "number") {
      updates.stockCount = Math.max(0, body.stockCount);
      updates.inStock = updates.stockCount > 0;
    }
    if (body.category) updates.category = sanitizeInput(body.category, 60);
    if (Array.isArray(body.images) && body.images.length > 0) updates.images = body.images;

    const updated = serverDB.updateProduct(id, updates);

    serverDB.logAction({
      userId: user.id,
      userRole: user.role,
      action: "PRODUCT_UPDATED",
      resource: "PRODUCT",
      resourceId: id,
      details: `Product ${product.title} updated by ${user.name}`,
      status: "SUCCESS",
    });

    return NextResponse.json({ success: true, product: updated });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: "Failed to update product." }, { status: 500 });
  }
}

export async function DELETE(
  req: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const auth = requireAuth(req);
    if (auth instanceof NextResponse) return auth;

    const { user } = auth;
    const { id } = await context.params;
    const product = serverDB.getProductById(id);

    if (!product) {
      return NextResponse.json({ success: false, error: "Product not found." }, { status: 404 });
    }

    // Ownership check
    const isOwner =
      product.businessId === user.businessId ||
      product.businessSlug === user.businessSlug ||
      (user.businessName && product.businessName.toLowerCase() === user.businessName.toLowerCase());
    const isAdmin = user.role === "ADMIN" || user.role === "SUPER_ADMIN";

    if (!isOwner && !isAdmin) {
      serverDB.logAction({
        userId: user.id,
        userRole: user.role,
        action: "IDOR_DELETE_ATTEMPT",
        resource: "PRODUCT",
        resourceId: id,
        details: `User ${user.name} attempted unauthorized deletion of product ${product.id}`,
        status: "DENIED",
      });

      return NextResponse.json(
        { success: false, error: "Forbidden: You do not have permission to delete this product." },
        { status: 403 }
      );
    }

    serverDB.deleteProduct(id);

    serverDB.logAction({
      userId: user.id,
      userRole: user.role,
      action: "PRODUCT_DELETED",
      resource: "PRODUCT",
      resourceId: id,
      details: `Product ${product.title} deleted by ${user.name}`,
      status: "SUCCESS",
    });

    return NextResponse.json({ success: true, message: "Product deleted successfully." });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: "Failed to delete product." }, { status: 500 });
  }
}
