import { NextRequest, NextResponse } from "next/server";
import { serverDB } from "@/lib/server-db";
import { getServerSession } from "@/lib/auth/session";
import { sanitizeInput } from "@/lib/security";
import { mpesaTransactionsStore } from "@/lib/mpesa/transaction-store";

export const dynamic = "force-dynamic";

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const ad = serverDB.getAdvertisementById(id);

    if (!ad) {
      return NextResponse.json({ success: false, error: "Advertisement not found." }, { status: 404 });
    }

    return NextResponse.json({ success: true, advertisement: ad });
  } catch (err: any) {
    console.error("[Advertisement GET ID error]:", err?.message);
    return NextResponse.json({ success: false, error: "Failed to fetch advertisement." }, { status: 500 });
  }
}

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const ad = serverDB.getAdvertisementById(id);

    if (!ad) {
      return NextResponse.json({ success: false, error: "Advertisement not found." }, { status: 404 });
    }

    const { user } = getServerSession(req);
    const body = await req.json();
    const isAdmin = Boolean(user && (user.role === "ADMIN" || user.role === "SUPER_ADMIN"));
    const isOwner = Boolean(user && user.id === ad.advertiserId);

    const checkoutReqId = body.checkoutRequestId ? sanitizeInput(body.checkoutRequestId, 60) : undefined;
    const verifiedTxn = checkoutReqId ? mpesaTransactionsStore.getByCheckoutId(checkoutReqId) : undefined;
    const isVerifiedGuestPayment = Boolean(
      ad.advertiserId.startsWith("guest-") &&
        verifiedTxn &&
        verifiedTxn.status === "COMPLETED" &&
        verifiedTxn.purpose === "ADVERTISEMENT"
    );

    if (!isAdmin && !isOwner && !isVerifiedGuestPayment) {
      return NextResponse.json({ success: false, error: "Unauthorized to update this advertisement." }, { status: 403 });
    }

    const updates: Record<string, any> = {};

    if (isAdmin || isOwner) {
      if (body.title) updates.title = sanitizeInput(body.title, 120);
      if (body.description) updates.description = sanitizeInput(body.description, 1000);
      if (body.contactPhone) updates.contactPhone = sanitizeInput(body.contactPhone, 20);
      if (body.contactWhatsapp) updates.contactWhatsapp = sanitizeInput(body.contactWhatsapp, 20);
      if (body.websiteUrl) updates.websiteUrl = sanitizeInput(body.websiteUrl, 250);
      if (body.physicalAddress) updates.physicalAddress = sanitizeInput(body.physicalAddress, 150);
      if (body.ctaLabel) updates.ctaLabel = sanitizeInput(body.ctaLabel, 40);
      if (body.ctaUrl) updates.ctaUrl = sanitizeInput(body.ctaUrl, 250);
    }

    if (checkoutReqId) updates.checkoutRequestId = checkoutReqId;

    // If payment just completed, require either admin or a verified M-Pesa transaction
    if (body.paymentStatus === "PAID") {
      if (!isAdmin && (!verifiedTxn || verifiedTxn.status !== "COMPLETED")) {
        return NextResponse.json(
          { success: false, error: "Cannot mark advertisement as paid without a confirmed M-Pesa transaction." },
          { status: 400 }
        );
      }
      updates.paymentStatus = "PAID";
      updates.mpesaReceipt =
        verifiedTxn?.mpesaReceiptNumber ||
        (body.mpesaReceipt ? sanitizeInput(body.mpesaReceipt, 30) : undefined);
      // Once paid, ad moves to PENDING_REVIEW if currently UNPAID
      if (ad.status === "PENDING_REVIEW" || !ad.status) {
        updates.status = "PENDING_REVIEW";
      }
    }

    const updated = serverDB.updateAdvertisement(id, updates);

    return NextResponse.json({
      success: true,
      message: "Advertisement updated successfully.",
      advertisement: updated,
    });
  } catch (err: any) {
    console.error("[Advertisement PATCH ID error]:", err?.message);
    return NextResponse.json({ success: false, error: "Failed to update advertisement." }, { status: 500 });
  }
}
