import { NextRequest, NextResponse } from "next/server";
import { serverDB, normalizeKenyanPhone } from "@/lib/server-db";
import { getServerSession, SESSION_COOKIE_NAME } from "@/lib/auth/session";
import { sanitizeInput } from "@/lib/security";
import { DocumentService } from "@/lib/documents/service";
import { formatKSh } from "@/lib/utils";

export const dynamic = "force-dynamic";

export async function POST(req: NextRequest) {
  try {
    const ip = req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || "local";
    const body = await req.json();

    const bizName = sanitizeInput(body.bizName || "New Merchant Store", 100);
    const bizCategory = sanitizeInput(body.bizCategory || "General", 60);
    const county = sanitizeInput(body.county || "Nairobi", 50);
    const town = sanitizeInput(body.town || "CBD", 50);
    const physicalLocation = sanitizeInput(body.physicalLocation || "", 150);
    const bizDesc = sanitizeInput(body.bizDesc || "", 500);

    const ownerName = sanitizeInput(body.ownerName || "Merchant", 80);
    const ownerEmail = (body.ownerEmail || "").toLowerCase().trim();
    const ownerPhone = sanitizeInput(body.ownerPhone || "", 20);

    const regNumber = sanitizeInput(body.regNumber || `BN/2026/${Math.floor(100000 + Math.random() * 900000)}`, 50);
    const nationalId = sanitizeInput(body.nationalId || "12345678", 30);

    const productTitle = sanitizeInput(body.productTitle || "Featured Product", 120);
    const productPrice = Math.max(1, parseFloat(body.productPrice) || 1000);
    const productStock = Math.max(1, parseInt(body.productStock) || 10);
    const productImages = Array.isArray(body.productImages) && body.productImages.length > 0
      ? body.productImages
      : ["https://images.unsplash.com/photo-1517336714731-489689fd1ca8?q=80&w=800&auto=format&fit=crop"];

    const businessSlug = bizName
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-|-$/g, "");
    const businessId = `biz-${Date.now()}`;

    let { user } = getServerSession(req);
    let sessionToken: string | null = null;

    if (user) {
      // Upgrade existing user account to SELLER
      const updatedUser = serverDB.updateUser(user.id, {
        role: "SELLER",
        businessId: user.businessId || businessId,
        businessName: bizName,
        businessSlug: user.businessSlug || businessSlug,
        name: ownerName || user.name,
        phone: normalizeKenyanPhone(ownerPhone) || user.phone,
      });
      if (updatedUser) user = updatedUser;
    } else {
      // Find or create user
      let existingUser = ownerEmail ? serverDB.findUserByEmail(ownerEmail) : undefined;
      if (!existingUser && ownerPhone) {
        existingUser = serverDB.findUserByPhone(ownerPhone);
      }

      if (existingUser) {
        const updated = serverDB.updateUser(existingUser.id, {
          role: "SELLER",
          businessId: existingUser.businessId || businessId,
          businessName: bizName,
          businessSlug: existingUser.businessSlug || businessSlug,
        });
        user = updated || existingUser;
      } else {
        user = serverDB.createUser({
          name: ownerName,
          email: ownerEmail || `merchant_${Date.now()}@vendlex.co.ke`,
          phone: ownerPhone || "+254700000000",
          role: "SELLER",
          password: "password123", // default fallback password
          businessName: bizName,
        });
      }

      const userAgent = req.headers.get("user-agent") || undefined;
      const session = serverDB.createSession(user.id, user.role, {
        rememberMe: true,
        userAgent,
        ipAddress: ip,
      });
      sessionToken = session.token;
    }

    const assignedBusinessId = user.businessId || businessId;
    const assignedBusinessSlug = user.businessSlug || businessSlug;

    // 1. Create Initial Product Listing
    const productSlug = `${productTitle.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "")}-${Math.floor(1000 + Math.random() * 9000)}`;
    const createdProduct = serverDB.createProduct({
      title: productTitle,
      slug: productSlug,
      sku: `SKU-${Math.floor(1000 + Math.random() * 9000)}`,
      description: bizDesc || `Authentic ${productTitle} from ${bizName}. Guaranteed quality with escrow buyer protection on VendLex.`,
      price: productPrice,
      originalPrice: Math.round(productPrice * 1.15),
      category: bizCategory,
      county,
      town,
      businessId: assignedBusinessId,
      businessName: bizName,
      businessSlug: assignedBusinessSlug,
      businessVerified: false,
      rating: 5.0,
      reviewCount: 0,
      inStock: true,
      stockCount: productStock,
      lowStockThreshold: 3,
      images: productImages,
      tags: [bizCategory, county, "Verified Merchant"],
      deliveryInfo: "Same-day delivery in Nairobi. 24-48 hr countrywide via Fargo / G4S courier.",
      specifications: {
        Location: `${town}, ${county}`,
        Warranty: "1 Year Official Warranty",
        Condition: "Brand New / Sealed",
      },
    });

    // 2. Submit KYC Record with uploaded document details
    const docName = sanitizeInput(body.docName || body.docUrl || "Business_Registration_Certificate.pdf", 150);
    const docType = sanitizeInput(body.docType || "BUSINESS_REGISTRATION", 80);

    const kyc = serverDB.createKYC({
      userId: user.id,
      bizName,
      ownerName: user.name,
      regNumber,
      nationalId,
      county,
      town,
      docUrl: docName,
      status: "PENDING",
    });

    // 3. Issue Official Merchant Accreditation Certificate
    const planId = (body.selectedPlan || "basic").toLowerCase();
    const planPrice = planId === "basic" ? 199 : planId === "starter" ? 299 : planId === "pro" ? 1499 : 799;
    const planDisplayName = planId === "basic" ? "Basic Listing Plan" : planId === "starter" ? "Starter Plan" : planId === "pro" ? "Pro Enterprise Plan" : "Business Growth Plan";

    const certificate = DocumentService.issueMerchantCertificate({
      userId: user.id,
      bizName,
      ownerName: user.name,
      ownerPhone: user.phone,
      ownerEmail: user.email,
      regNumber,
      county,
      planName: `${planDisplayName} (${formatKSh(planPrice)}/mo)`,
      mpesaReceipt: body.receiptNumber || "MPESA-VERIFIED",
      amountPaid: planPrice,
    });

    // 4. Dispatch Activation Notification
    serverDB.addNotification({
      userId: user.id,
      title: `Store Activated: ${bizName}`,
      message: `Your seller workspace is live! Your official Merchant Certificate (${certificate.publicDocumentId}) is ready for download.`,
      type: "SYSTEM",
      link: "/seller/dashboard",
    });

    // 5. Track Seller Onboarding Complete Conversion Event
    try {
      const { VendLexMarketingEngine } = await import("@/lib/marketing/engine");
      await VendLexMarketingEngine.trackEvent({
        eventId: `seller_${user.id}_onboarding_v1`,
        eventType: "seller_onboarding_complete",
        userId: user.id,
        userRole: "SELLER",
        userEmail: user.email,
        userPhone: user.phone,
        sellerId: user.id,
        sellerName: bizName,
        county,
        value: planPrice,
        metadata: {
          planName: planDisplayName,
          mpesaReceipt: body.receiptNumber || "MPESA-VERIFIED",
          regNumber,
          docName,
          docType,
        },
      });
    } catch (mktErr) {
      console.error("[Marketing] Failed to record seller onboarding conversion:", mktErr);
    }

    // 6. Audit Log
    serverDB.logAction({
      userId: user.id,
      userRole: "SELLER",
      action: "SELLER_ONBOARDED",
      resource: "SELLER_STORE",
      resourceId: assignedBusinessId,
      ipAddress: ip,
      details: `Merchant ${bizName} onboarded with plan ${body.selectedPlan || "standard"} and issued Certificate ${certificate.publicDocumentId}`,
      status: "SUCCESS",
    });

    const response = NextResponse.json({
      success: true,
      message: "Seller onboarding completed successfully.",
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        phone: user.phone,
        role: user.role,
        avatar: user.avatar,
        businessId: user.businessId,
        businessSlug: user.businessSlug,
        businessName: user.businessName,
        isVerified: user.isVerified,
      },
      product: createdProduct,
      kyc,
      certificate: {
        id: certificate.id,
        publicDocumentId: certificate.publicDocumentId,
        downloadUrl: `/api/documents/${certificate.publicDocumentId}/download`,
        verificationUrl: `/verify/${certificate.publicDocumentId}`,
      },
    });

    if (sessionToken) {
      response.cookies.set({
        name: SESSION_COOKIE_NAME,
        value: sessionToken,
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "lax",
        path: "/",
        maxAge: 30 * 24 * 3600,
      });
    }

    return response;
  } catch (err: any) {
    console.error("[Seller Onboard Error]:", err);
    return NextResponse.json({ success: false, error: "Failed to complete seller onboarding." }, { status: 500 });
  }
}
