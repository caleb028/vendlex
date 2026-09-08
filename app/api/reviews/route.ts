import { NextRequest, NextResponse } from "next/server";
import { serverDB } from "@/lib/server-db";
import { requireAuth } from "@/lib/auth/session";
import { sanitizeInput } from "@/lib/security";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const productId = searchParams.get("productId");

    if (!productId) {
      return NextResponse.json({ success: false, error: "productId parameter is required." }, { status: 400 });
    }

    const reviews = serverDB.getProductReviews(productId);
    return NextResponse.json({ success: true, reviews, count: reviews.length });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: "Failed to fetch reviews." }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const auth = requireAuth(req);
    if (auth instanceof NextResponse) return auth;

    const { user } = auth;
    const body = await req.json();

    const productId = sanitizeInput(body.productId || "", 60);
    const rating = Math.max(1, Math.min(parseInt(body.rating || "5", 10), 5));
    const title = sanitizeInput(body.title || "Customer Review", 100);
    const comment = sanitizeInput(body.comment || "", 600);
    const orderId = sanitizeInput(body.orderId || "", 60);

    if (!productId) {
      return NextResponse.json({ success: false, error: "Product ID is required." }, { status: 400 });
    }

    if (!comment || comment.length < 5) {
      return NextResponse.json({ success: false, error: "Review comment must be at least 5 characters." }, { status: 400 });
    }

    // Strict Trust & Integrity Rule (Section 13):
    // Only users who have purchased this product can leave a verified review!
    const hasPurchased = serverDB.hasUserPurchasedProduct(user.id, productId);
    const isAdmin = user.role === "ADMIN" || user.role === "SUPER_ADMIN";

    if (!hasPurchased && !isAdmin) {
      return NextResponse.json(
        {
          success: false,
          error: "Unverified review blocked: You can only review products you have purchased and received on VendLex.",
        },
        { status: 403 }
      );
    }

    const res = serverDB.addReview({
      productId,
      orderId: orderId || `ord-ref-${Date.now()}`,
      userId: user.id,
      userName: user.name,
      userAvatar: user.avatar,
      rating,
      title,
      comment,
      isVerifiedPurchase: true,
    });

    if (!res.success || !res.review) {
      return NextResponse.json({ success: false, error: res.error || "Failed to submit review." }, { status: 400 });
    }

    serverDB.logAction({
      userId: user.id,
      userRole: user.role,
      action: "VERIFIED_REVIEW_SUBMITTED",
      resource: "PRODUCT",
      resourceId: productId,
      details: `User ${user.name} submitted ${rating}-star verified review for product ${productId}`,
      status: "SUCCESS",
    });

    return NextResponse.json({
      success: true,
      message: "Verified review submitted successfully.",
      review: res.review,
    }, { status: 201 });
  } catch (err: any) {
    console.error("[Review Create Error]:", err);
    return NextResponse.json({ success: false, error: "Failed to submit review." }, { status: 500 });
  }
}
