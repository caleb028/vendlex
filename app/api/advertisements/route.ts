import { NextRequest, NextResponse } from "next/server";
import { serverDB } from "@/lib/server-db";
import { getServerSession } from "@/lib/auth/session";
import { isValidKenyanPhone, sanitizeInput, checkRateLimit } from "@/lib/security";
import { AdvertisementMediaType } from "@/lib/server-db/types";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const category = searchParams.get("category") || undefined;
    const county = searchParams.get("county") || undefined;
    const town = searchParams.get("town") || undefined;
    const advertiserId = searchParams.get("advertiserId") || undefined;
    const limit = searchParams.get("limit") ? parseInt(searchParams.get("limit")!, 10) : 10;
    const offset = searchParams.get("offset") ? parseInt(searchParams.get("offset")!, 10) : 0;

    const result = serverDB.getAdvertisements({
      category,
      county,
      town,
      advertiserId,
      status: advertiserId ? undefined : "ACTIVE", // Only active ads for public feed unless querying own ads
      limit,
      offset,
    });

    return NextResponse.json({
      success: true,
      advertisements: result.advertisements,
      total: result.total,
      limit,
      offset,
    });
  } catch (err: any) {
    console.error("[Advertisements GET error]:", err?.message);
    return NextResponse.json(
      { success: false, error: "Failed to retrieve advertisements" },
      { status: 500 }
    );
  }
}

export async function POST(req: NextRequest) {
  try {
    const ip = req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || "local";
    const rateCheck = checkRateLimit(`ad-create:${ip}`, 10, 60 * 1000);
    if (!rateCheck.allowed) {
      return NextResponse.json(
        { success: false, error: "Too many advertisement submissions. Please wait a moment." },
        { status: 429 }
      );
    }

    const body = await req.json();
    const { user } = getServerSession(req);

    // Business details
    const businessName = sanitizeInput(body.businessName || "", 100);
    const title = sanitizeInput(body.title || "", 120);
    const description = sanitizeInput(body.description || "", 1000);
    const category = sanitizeInput(body.category || "", 60);
    const county = sanitizeInput(body.county || "", 60);
    const town = sanitizeInput(body.town || "", 60);
    const physicalAddress = body.physicalAddress ? sanitizeInput(body.physicalAddress, 150) : undefined;
    const contactPhone = sanitizeInput(body.contactPhone || "", 20);
    const contactWhatsapp = body.contactWhatsapp ? sanitizeInput(body.contactWhatsapp, 20) : undefined;
    const websiteUrl = body.websiteUrl ? sanitizeInput(body.websiteUrl, 250) : undefined;
    const ctaLabel = sanitizeInput(body.ctaLabel || "Contact Business", 40);
    const ctaUrl = body.ctaUrl ? sanitizeInput(body.ctaUrl, 250) : undefined;

    // Media
    const mediaType = (body.mediaType as AdvertisementMediaType) || "IMAGE";
    const mediaUrl = body.mediaUrl || "";
    const posterUrl = body.posterUrl || undefined;
    const mediaName = body.mediaName ? sanitizeInput(body.mediaName, 100) : undefined;
    const mediaSize = typeof body.mediaSize === "number" ? body.mediaSize : undefined;
    const videoDurationSeconds = typeof body.videoDurationSeconds === "number" ? body.videoDurationSeconds : undefined;

    // Advertiser identity
    const advertiserId = user?.id || `guest-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`;
    const advertiserName = user?.name || sanitizeInput(body.advertiserName || businessName, 80);
    const advertiserEmail = user?.email || (body.advertiserEmail ? sanitizeInput(body.advertiserEmail, 100) : "");
    const advertiserPhone = user?.phone || sanitizeInput(body.advertiserPhone || contactPhone, 20);

    // Validation
    if (!businessName || businessName.length < 2) {
      return NextResponse.json({ success: false, error: "Business name is required." }, { status: 400 });
    }
    if (!title || title.length < 3) {
      return NextResponse.json({ success: false, error: "Advertisement headline/title is required (min 3 characters)." }, { status: 400 });
    }
    if (!description || description.length < 10) {
      return NextResponse.json({ success: false, error: "Advertisement description is required (min 10 characters)." }, { status: 400 });
    }
    if (!category) {
      return NextResponse.json({ success: false, error: "Please select a business category." }, { status: 400 });
    }
    if (!county) {
      return NextResponse.json({ success: false, error: "Please select a Kenyan county." }, { status: 400 });
    }
    if (!town) {
      return NextResponse.json({ success: false, error: "Please specify a town or area." }, { status: 400 });
    }
    if (!contactPhone || !isValidKenyanPhone(contactPhone)) {
      return NextResponse.json(
        { success: false, error: "A valid Kenyan contact phone number is required (07XX... or 254...)." },
        { status: 400 }
      );
    }
    if (contactWhatsapp && !isValidKenyanPhone(contactWhatsapp)) {
      return NextResponse.json(
        { success: false, error: "The WhatsApp number format is invalid." },
        { status: 400 }
      );
    }
    if (!mediaUrl) {
      return NextResponse.json({ success: false, error: "Please upload an advertisement image or video." }, { status: 400 });
    }

    // Media constraints
    if (mediaType === "IMAGE") {
      // 5MB limit
      if (mediaSize && mediaSize > 5 * 1024 * 1024) {
        return NextResponse.json({ success: false, error: "Image file size exceeds the 5MB limit." }, { status: 400 });
      }
    } else if (mediaType === "VIDEO") {
      // 20MB limit
      if (mediaSize && mediaSize > 20 * 1024 * 1024) {
        return NextResponse.json({ success: false, error: "Video file size exceeds the 20MB limit." }, { status: 400 });
      }
      // 30 seconds limit
      if (videoDurationSeconds && videoDurationSeconds > 30) {
        return NextResponse.json({ success: false, error: "Video duration exceeds the 30-second maximum limit." }, { status: 400 });
      }
    } else {
      return NextResponse.json({ success: false, error: "Invalid media type. Allowed: IMAGE or VIDEO." }, { status: 400 });
    }

    // Create ad record with strict KES 1,020 server pricing
    const newAd = serverDB.createAdvertisement({
      advertiserId,
      advertiserName,
      advertiserEmail,
      advertiserPhone,
      businessName,
      title,
      description,
      category,
      county,
      town,
      physicalAddress,
      contactPhone,
      contactWhatsapp,
      websiteUrl,
      ctaLabel,
      ctaUrl,
      mediaType,
      mediaUrl,
      posterUrl,
      mediaName,
      mediaSize,
      videoDurationSeconds,
      paymentStatus: "UNPAID",
    });

    return NextResponse.json({
      success: true,
      message: "Advertisement created successfully. Please complete payment of KES 1,020 to submit for review.",
      advertisement: newAd,
      pricing: {
        amount: 1020,
        currency: "KES",
        durationDays: 30,
      },
    });
  } catch (err: any) {
    console.error("[Advertisement POST error]:", err?.message);
    return NextResponse.json(
      { success: false, error: "Internal server error creating advertisement." },
      { status: 500 }
    );
  }
}
