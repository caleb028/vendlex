import { NextRequest, NextResponse } from "next/server";
import fs from "fs";
import path from "path";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  try {
    const filePath = path.join(process.cwd(), "public", "vendlex.apk");

    if (!fs.existsSync(filePath)) {
      return NextResponse.json(
        { error: "APK file temporarily unavailable. Please try again shortly." },
        { status: 404 }
      );
    }

    const fileBuffer = fs.readFileSync(filePath);

    return new NextResponse(fileBuffer, {
      status: 200,
      headers: {
        "Content-Type": "application/vnd.android.package-archive",
        "Content-Disposition": 'attachment; filename="VendLex-Kenya.apk"',
        "Content-Length": fileBuffer.length.toString(),
        "Cache-Control": "public, max-age=86400, immutable",
      },
    });
  } catch (error: any) {
    console.error("[APK Download Error]:", error);
    return NextResponse.json({ error: "Failed to download APK" }, { status: 500 });
  }
}
