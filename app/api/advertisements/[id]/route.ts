import { NextRequest, NextResponse } from "next/server";
import { serverDB } from "@/lib/server-db";
import { getServerSession } from "@/lib/auth/session";
import { sanitizeInput } from "@/lib/security";

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
    const isAdmin = user && (user.role === "ADMIN" || user.role === "SUPER_ADMIN");
    const isOwner = user && user.id === ad.advertiserId;

    if (!isAdmin && !isOwner) {
      return NextResponse.json({ success: false, error: "Unauthorized to update this advertisement." }, { status: 403 });
    }

    const body = await req.json();
    const updates: Record<string, any> = {};

    if (body.title) updates.title = sanitizeInput(body.title, 120);
    if (body.description) updates.description = sanitizeInput(body.description, 1000);
    if (body.contactPhone) updates.contactPhone = sanitizeInput(body.contactPhone, 20);
    if (body.contactWhatsapp) updates.contactWhatsapp = sanitizeInput(body.contactWhatsapp, 20);
    if (body.websiteUrl) updates.websiteUrl = sanitizeInput(body.websiteUrl, 250);
    if (body.physicalAddress) updates.physicalAddress = sanitizeInput(body.physicalAddress, 150);
    if (body.ctaLabel) updates.ctaLabel = sanitizeInput(body.ctaLabel, 40);
    if (body.ctaUrl) updates.ctaUrl = sanitizeInput(body.ctaUrl, 250);
    if (body.mpesaReceipt) updates.mpesaReceipt = sanitizeInput(body.mpesaReceipt, 30);
    if (body.checkoutRequestId) updates.checkoutRequestId = sanitizeInput(body.checkoutRequestId, 60);

    // If payment just completed:
    if (body.paymentStatus === "PAID") {
      updates.paymentStatus = "PAID";
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
