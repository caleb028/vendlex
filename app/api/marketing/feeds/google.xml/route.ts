import { NextRequest, NextResponse } from "next/server";
import { ProductFeedEngine } from "@/lib/marketing/feed-engine";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  try {
    const xml = ProductFeedEngine.generateGoogleFeed();
    return new NextResponse(xml, {
      status: 200,
      headers: {
        "Content-Type": "application/xml; charset=utf-8",
        "Cache-Control": "public, max-age=3600, s-maxage=3600",
      },
    });
  } catch (err: any) {
    console.error("[Google Feed Error]:", err);
    return new NextResponse(
      `<?xml version="1.0" encoding="UTF-8"?><error>Failed to generate Google Merchant feed.</error>`,
      { status: 500, headers: { "Content-Type": "application/xml" } }
    );
  }
}
