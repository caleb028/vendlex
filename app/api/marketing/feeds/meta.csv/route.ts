import { NextRequest, NextResponse } from "next/server";
import { ProductFeedEngine } from "@/lib/marketing/feed-engine";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  try {
    const csv = ProductFeedEngine.generateMetaFeed();
    return new NextResponse(csv, {
      status: 200,
      headers: {
        "Content-Type": "text/csv; charset=utf-8",
        "Content-Disposition": 'inline; filename="vendlex-meta-catalog.csv"',
        "Cache-Control": "public, max-age=3600, s-maxage=3600",
      },
    });
  } catch (err: any) {
    console.error("[Meta Feed Error]:", err);
    return new NextResponse("error\nFailed to generate Meta catalog feed", {
      status: 500,
      headers: { "Content-Type": "text/plain" },
    });
  }
}
