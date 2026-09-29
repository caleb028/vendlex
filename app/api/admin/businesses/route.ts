import { NextRequest, NextResponse } from "next/server";
import { serverDB, hashPassword, normalizeKenyanPhone } from "@/lib/server-db";
import { getServerSession } from "@/lib/auth/session";
import { sanitizeInput } from "@/lib/security";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  try {
    const { user, isAuthenticated } = getServerSession(req);
    if (!isAuthenticated || !user || (user.role !== "ADMIN" && user.role !== "SUPER_ADMIN")) {
      return NextResponse.json({ success: false, error: "Unauthorized." }, { status: 403 });
    }

    const allUsers = serverDB.getUsers();
    const allProducts = serverDB.getProducts();
    const allOrders = serverDB.getOrders();
    const allKycs = serverDB.getKYCs();

    // Filter sellers & business owners
    const businesses = allUsers
      .filter((u) => u.role === "SELLER" || u.role === "BUSINESS_OWNER" || u.businessName)
      .map((u) => {
        const sellerProducts = allProducts.filter(
          (p) => p.businessId === u.businessId || (p as any).sellerId === u.id || (u.businessSlug && p.businessSlug === u.businessSlug)
        );
        const sellerOrders = allOrders.filter(
          (o) => o.sellerId === u.id || o.sellerId === u.businessId
        );
        const totalRevenue = sellerOrders
          .filter((o) => o.status === "PAID" || o.status === "PROCESSING" || o.status === "READY_FOR_DISPATCH" || o.status === "DISPATCHED" || o.status === "DELIVERED")
          .reduce((sum, o) => sum + (o.totalAmount || 0), 0);
        
        const kycRecord = allKycs.find((k) => k.userId === u.id);

        return {
          id: u.id,
          name: u.name,
          email: u.email,
          phone: u.phone,
          role: u.role,
          status: u.status,
          businessId: u.businessId || `biz-${u.id}`,
          businessName: u.businessName || u.name,
          businessSlug: u.businessSlug || (u.businessName ? u.businessName.toLowerCase().replace(/[^a-z0-9]+/g, "-") : `biz-${u.id}`),
          category: u.businessCategory || "General Retail & Marketplace",
          county: u.county || "Nairobi",
          town: u.town || "Nairobi CBD",
          isVerified: u.isVerified || false,
          kycStatus: kycRecord ? kycRecord.status : u.isVerified ? "APPROVED" : "NOT_SUBMITTED",
          productsCount: sellerProducts.length,
          ordersCount: sellerOrders.length,
          totalRevenue,
          avatar: u.avatar || "/placeholder.png",
          createdAt: u.createdAt,
          updatedAt: u.updatedAt,
        };
      });

    return NextResponse.json({ success: true, businesses });
  } catch (err: any) {
    console.error("[Admin Businesses GET Error]:", err?.message);
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
    const name = sanitizeInput(body.name || "", 80);
    const businessName = sanitizeInput(body.businessName || name, 100);
    const email = (body.email || "").toLowerCase().trim();
    const phone = sanitizeInput(body.phone || "", 25);
    const category = sanitizeInput(body.category || "General Retail", 60);
    const county = sanitizeInput(body.county || "Nairobi", 40);
    const town = sanitizeInput(body.town || "Nairobi CBD", 40);
    const isVerified = body.isVerified === true;
    const initialPassword = body.password || "Vendor@2026";

    if (!name || !businessName || !email || !phone) {
      return NextResponse.json(
        { success: false, error: "Legal name, business name, email, and phone number are required." },
        { status: 400 }
      );
    }

    // Check existing email
    if (serverDB.findUserByEmail(email)) {
      return NextResponse.json(
        { success: false, error: "A business or user with this email already exists." },
        { status: 409 }
      );
    }

    const businessSlug = businessName.toLowerCase().replace(/[^a-z0-9]+/g, "-");
    const newBusiness = serverDB.createUser({
      name,
      email,
      phone,
      role: "BUSINESS_OWNER",
      password: initialPassword,
      businessName,
    });

    serverDB.updateUser(newBusiness.id, {
      businessSlug,
      businessCategory: category,
      county,
      town,
      isVerified,
      status: "ACTIVE",
    });

    serverDB.logAction({
      userId: user.id,
      userRole: user.role,
      action: "BUSINESS_CREATED",
      resource: "BUSINESS",
      resourceId: newBusiness.id,
      details: `Admin created business "${businessName}" (${category}, ${county})`,
      status: "SUCCESS",
    });

    return NextResponse.json({
      success: true,
      message: `Business "${businessName}" created successfully.`,
      business: {
        id: newBusiness.id,
        businessName,
        businessSlug,
        email,
        phone,
        category,
        county,
        town,
        isVerified,
      },
    });
  } catch (err: any) {
    console.error("[Admin Businesses POST Error]:", err?.message);
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
      return NextResponse.json({ success: false, error: "Business / user ID is required." }, { status: 400 });
    }

    const dbUser = serverDB.findUserById(id);
    if (!dbUser) {
      return NextResponse.json({ success: false, error: "Business not found." }, { status: 404 });
    }

    const updates: Record<string, any> = {};
    if (body.name !== undefined) updates.name = sanitizeInput(body.name, 80);
    if (body.businessName !== undefined) {
      updates.businessName = sanitizeInput(body.businessName, 100);
      updates.businessSlug = updates.businessName.toLowerCase().replace(/[^a-z0-9]+/g, "-");
    }
    if (body.phone !== undefined) updates.phone = sanitizeInput(body.phone, 25);
    if (body.email !== undefined) updates.email = (body.email || "").toLowerCase().trim();
    if (body.category !== undefined) updates.businessCategory = sanitizeInput(body.category, 60);
    if (body.county !== undefined) updates.county = sanitizeInput(body.county, 40);
    if (body.town !== undefined) updates.town = sanitizeInput(body.town, 40);
    if (body.isVerified !== undefined) updates.isVerified = body.isVerified === true;
    if (body.status !== undefined) updates.status = body.status;

    const updated = serverDB.updateUser(id, updates);

    serverDB.logAction({
      userId: user.id,
      userRole: user.role,
      action: "BUSINESS_UPDATED",
      resource: "BUSINESS",
      resourceId: id,
      details: `Admin updated business "${updated?.businessName || dbUser.businessName}"`,
      status: "SUCCESS",
    });

    return NextResponse.json({
      success: true,
      message: `Business "${updated?.businessName || dbUser.businessName}" updated successfully.`,
      business: updated,
    });
  } catch (err: any) {
    console.error("[Admin Businesses PUT Error]:", err?.message);
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
      return NextResponse.json({ success: false, error: "Business ID is required." }, { status: 400 });
    }

    const dbUser = serverDB.findUserById(id);
    if (!dbUser) {
      return NextResponse.json({ success: false, error: "Business not found." }, { status: 404 });
    }

    // Set status to DISABLED or remove from database
    serverDB.updateUser(id, { status: "DISABLED" });

    serverDB.logAction({
      userId: user.id,
      userRole: user.role,
      action: "BUSINESS_DELETED",
      resource: "BUSINESS",
      resourceId: id,
      details: `Admin disabled / removed business "${dbUser.businessName || dbUser.name}"`,
      status: "SUCCESS",
    });

    return NextResponse.json({
      success: true,
      message: `Business "${dbUser.businessName || dbUser.name}" has been removed.`,
    });
  } catch (err: any) {
    console.error("[Admin Businesses DELETE Error]:", err?.message);
    return NextResponse.json({ success: false, error: "Internal server error." }, { status: 500 });
  }
}
